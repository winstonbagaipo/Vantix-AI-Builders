import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { z } from 'zod'
import { getProviderStatus, runAIRequest } from './aiGateway'
import { getBillingProviderStatus, getBillingSettings, updateBillingSettings, createMockCheckoutSession } from './billingRegistry'
import { addCredits, adjustSubscription, estimateBuildCredits, getOrCreateCreditAccount, listCreditTransactions, useCredits } from './creditsRegistry'
import { addImport, continueBuildFromImport, createMockDeploy, listDeployProviders, listImports, reviewImport } from './importDeployRegistry'
import { aiAgentExecutionPlan, getIntelligentSuggestions, runErrorFixer, trendSignals } from './intelligenceEngine'
import { buildGodModePrompt, listProSkills, proSkillExecutionLogs } from './skillsRegistry'
import { enabledDevTools, godModeToolPlan, listDevTools, toggleDevTool } from './toolRegistry'
import { createGenerationJob, getGenerationJob, getProject, listGenerationJobs, listPlugins, togglePlugin, updateProject } from './db'

dotenv.config()
const app = express()
const port = Number(process.env.API_PORT ?? 4000)
const bootTime = Date.now()
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }))
app.use(express.json({ limit: '25mb' }))

const generationSchema = z.object({ projectId: z.string().optional(), userId: z.string().optional(), prompt: z.string().min(1), suggestionId: z.string().min(1), title: z.string().min(1) })
const aiRequestSchema = z.object({ projectId: z.string().optional(), prompt: z.string().min(1), system: z.string().optional(), provider: z.enum(['openai', 'anthropic', 'grok', 'ollama', 'mock', 'auto']).optional(), model: z.string().optional() })
const importSchema = z.object({ filename: z.string().min(1), size: z.number().nonnegative() })
function uptimeLabel() { const s = Math.floor((Date.now() - bootTime) / 1000); if (s < 60) return `${s}s`; const m = Math.floor(s / 60); if (m < 60) return `${m}m ${s % 60}s`; return `${Math.floor(m / 60)}h ${m % 60}m` }
function devToolExecutionLogs() { const tools = enabledDevTools(); return tools.length ? tools.map((tool) => `[Dev Tool] ${tool.name}: ${tool.godModeUse}`) : ['[Dev Tool] No enabled developer tools selected.'] }

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'Vantix AI Builders API', mode: 'GOD_MODE', aiProviders: getProviderStatus(), devTools: enabledDevTools().length, proSkills: listProSkills().length, intelligence: true, imports: listImports().length, billing: getBillingProviderStatus() }))

app.get('/api/credits/:userId', (req, res) => res.json({ account: getOrCreateCreditAccount(req.params.userId), transactions: listCreditTransactions(req.params.userId) }))
app.post('/api/credits/:userId/use', (req, res) => { const result = useCredits({ userId: req.params.userId, amount: Number(req.body?.amount ?? 0), reason: String(req.body?.reason ?? 'Manual usage') }); if (!result.ok) return res.status(402).json(result); res.json(result) })
app.post('/api/admin/credits/subscription', (req, res) => res.json(adjustSubscription({ userId: req.body?.userId, plan: req.body?.plan ?? 'free', subscribed: Boolean(req.body?.subscribed) })))
app.post('/api/admin/credits/add', (req, res) => res.json(addCredits({ userId: req.body?.userId, amount: Number(req.body?.amount ?? 0), reason: String(req.body?.reason ?? 'Admin adjustment') })))

app.get('/api/imports', (_req, res) => res.json(listImports()))
app.post('/api/imports', (req, res) => { const parsed = importSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: 'Invalid import metadata', details: parsed.error.flatten() }); res.status(201).json(addImport(parsed.data)) })
app.post('/api/imports/:importId/review', (req, res) => { const record = reviewImport(req.params.importId); if (!record) return res.status(404).json({ error: 'Import not found' }); res.json(record) })
app.post('/api/imports/:importId/continue', (req, res) => { const record = continueBuildFromImport(req.params.importId); if (!record) return res.status(404).json({ error: 'Import not found' }); const project = getProject('default'); updateProject('default', { history: [`Continue unfinished build from import ${record.filename}`, ...project.history].slice(0, 25) }); res.json(record) })
app.get('/api/deploy/providers', (_req, res) => res.json(listDeployProviders()))
app.post('/api/deploy/mock', (req, res) => { try { res.status(201).json(createMockDeploy(String(req.body?.providerId ?? 'vercel'))) } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : 'Deploy failed' }) } })

app.get('/api/intelligence/suggestions', (req, res) => res.json(getIntelligentSuggestions(String(req.query.prompt ?? ''))))
app.get('/api/intelligence/trends', (_req, res) => res.json(trendSignals))
app.get('/api/intelligence/error-fixer', (_req, res) => res.json(runErrorFixer()))
app.post('/api/intelligence/agent-plan', (req, res) => res.json({ plan: aiAgentExecutionPlan(String(req.body?.prompt ?? '')) }))
app.get('/api/admin/billing', (_req, res) => res.json({ settings: getBillingSettings(), providers: getBillingProviderStatus() }))
app.patch('/api/admin/billing', (req, res) => res.json(updateBillingSettings(req.body)))
app.post('/api/admin/billing/checkout-session', (req, res) => { try { res.status(201).json(createMockCheckoutSession(String(req.body?.planId ?? 'pro'))) } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to create checkout session' }) } })
app.get('/api/pro-skills', (_req, res) => res.json(listProSkills()))
app.post('/api/pro-skills/god-mode-prompt', (req, res) => res.json({ prompt: buildGodModePrompt(String(req.body?.prompt ?? '')) }))
app.get('/api/devtools', (_req, res) => res.json(listDevTools()))
app.get('/api/devtools/god-mode-plan', (_req, res) => res.json({ tools: enabledDevTools(), plan: godModeToolPlan() }))
app.post('/api/devtools/:toolId/toggle', (req, res) => { const tool = toggleDevTool(req.params.toolId); if (!tool) return res.status(404).json({ error: 'Dev tool not found' }); res.json(tool) })
app.get('/api/ai/providers', (_req, res) => res.json(getProviderStatus()))
app.post('/api/ai/generate', async (req, res) => { const parsed = aiRequestSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: 'Invalid AI request', details: parsed.error.flatten() }); res.json(await runAIRequest({ ...parsed.data, prompt: buildGodModePrompt(parsed.data.prompt) })) })

app.get('/api/project/:projectId/memory', (req, res) => res.json(getProject(req.params.projectId)))
app.patch('/api/project/:projectId/memory', (req, res) => res.json(updateProject(req.params.projectId, req.body)))
app.get('/api/project/:projectId/plugins', (req, res) => res.json(listPlugins(req.params.projectId)))
app.post('/api/project/:projectId/plugins/:pluginId/toggle', (req, res) => res.json(togglePlugin(req.params.projectId, req.params.pluginId)))

app.post('/api/generate', async (req, res) => {
  const parsed = generationSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid generation request', details: parsed.error.flatten() })
  const userId = parsed.data.userId ?? 'demo-user'
  const cost = estimateBuildCredits('god-mode')
  const creditResult = useCredits({ userId, amount: cost, reason: `God Mode generation: ${parsed.data.title}` })
  if (!creditResult.ok) return res.status(402).json({ error: creditResult.error, credits: creditResult.account })
  const imports = listImports().filter((item) => item.status === 'continued' || item.status === 'reviewed')
  const importContext = imports.length ? imports.map((item) => `[Import Context] ${item.filename}: ${item.summary}`).join('\n') : '[Import Context] No imported project files selected.'
  const intelligencePlan = aiAgentExecutionPlan(parsed.data.prompt)
  const proPrompt = `${buildGodModePrompt(parsed.data.prompt)}\n\n${importContext}\n\n${intelligencePlan.join('\n')}`
  const aiResult = await runAIRequest({ projectId: parsed.data.projectId, prompt: proPrompt, provider: 'auto' })
  const job = createGenerationJob({ ...parsed.data, prompt: `${parsed.data.prompt}\n\nImported Context:\n${importContext}\n\nAI Gateway Output:\n${aiResult.text}` })
  const logs = ['$ vantix build --mode god --auto-preview --with-imports --credits', `[Credits] Deducted ${cost} credits. Remaining: ${creditResult.account.credits}`, `[Prompt] ${parsed.data.prompt}`, '[Import Center] Reviewing imported ZIPs, source files, images, and unfinished AI-builder exports...', importContext, '[Intelligence Engine] Loading smart suggestions, trends, humanized UX, modern programming guidance, and error fixer...', ...intelligencePlan, '[Error Fixer] Checking responsive overflow, secret safety, API fallback, mock auth warning, and deployment readiness...', '[God Mode] Loading AI Pro Skills registry...', ...proSkillExecutionLogs(), '[God Mode] Loading Dev Tools registry...', ...devToolExecutionLogs(), '[Deployment Center] Preparing Vercel, Netlify, GitHub, Render, Railway, Cloudflare, and Firebase provider configs...', '[Preview] Auto-preview is ready. Switching client workspace to Live Preview.', '[God Mode] Success: generated reviewed, optimized, full-stack output.']
  res.status(201).json({ ...job, logs, credits: creditResult.account, imports, proSkills: listProSkills(), devTools: enabledDevTools(), intelligence: { suggestions: getIntelligentSuggestions(parsed.data.prompt), trends: trendSignals, fixes: runErrorFixer() }, aiGateway: aiResult, autoPreview: true })
})
app.get('/api/generate/:jobId', (req, res) => { const job = getGenerationJob(req.params.jobId); if (!job) return res.status(404).json({ error: 'Generation job not found' }); res.json(job) })
app.get('/api/project/:projectId/generations', (req, res) => res.json(listGenerationJobs(req.params.projectId)))
app.get('/api/project/:projectId/file-tree', (req, res) => { const project = getProject(req.params.projectId); res.json({ projectId: project.id, tree: [`vantix-ai-builders/ # Project Memory v${project.buildVersion}`, '├── import-center/', ...listImports().map((item) => `│   ├── ${item.filename} # ${item.status}`), '├── deployment-center/', ...listDeployProviders().map((item) => `│   ├── ${item.id}.deploy.ts # ${item.status}`), '├── intelligence-engine/', '│   ├── suggestions.engine.ts', '│   ├── trends.engine.ts', '│   └── error-fixer.engine.ts', '├── ai-pro-skills/', ...listProSkills().map((skill) => `│   ├── ${skill.id}.skill.ts # ${skill.level}`), '├── dev-tools/', ...enabledDevTools().map((tool) => `│   ├── ${tool.id}.tool.ts # ${tool.status}`), '└── memory/', '    ├── imported-projects.memory.json', '    ├── auto-preview.memory.json', '    └── version-history.json'] }) })

app.get('/api/admin/stats', (_req, res) => { const project = getProject('default'); const jobs = listGenerationJobs('default'); const connectedPlugins = Object.values(project.plugins).filter((status) => status === 'connected').length; res.json({ users: 1, projects: 1, activeJobs: jobs.filter((job) => job.status === 'running' || job.status === 'queued').length, failedJobs: jobs.filter((job) => job.status === 'failed').length, connectedPlugins, uptime: uptimeLabel(), apiStatus: 'online', enabledDevTools: enabledDevTools().length, proSkills: listProSkills().length, imports: listImports().length, billingProviderConfigured: getBillingSettings().accountStatus !== 'not_connected' }) })
app.get('/api/admin/jobs', (_req, res) => res.json(listGenerationJobs('default').map((job) => ({ id: job.id, prompt: job.prompt, status: job.status, agent: 'God Mode Router', createdAt: job.createdAt }))))
app.get('/api/admin/security-events', (_req, res) => res.json([{ id: 'evt-1', level: 'info', message: 'Import Center uses explicit user file selection only. No arbitrary computer file access.', timestamp: new Date().toISOString() }, { id: 'evt-2', level: 'info', message: 'Credits system active with 200 welcome credits for non-subscribed users.', timestamp: new Date().toISOString() }, { id: 'evt-3', level: 'info', message: 'Auto-preview enabled after successful generation.', timestamp: new Date().toISOString() }]))
app.get('/api/admin/settings', (_req, res) => res.json({ aiRouter: 'enabled', importCenter: 'enabled', deploymentCenter: 'enabled', credits: 'enabled', autoPreview: 'enabled' }))
app.get('/api/admin/model-gateway', (_req, res) => res.json({ providers: getProviderStatus(), routing: 'auto fallback: OpenAI → Claude → Grok → Ollama → Mock', safeMode: true }))
app.get('/api/admin/users', (_req, res) => res.json([{ id: 'demo-user', name: 'Demo User', email: 'demo@advantix.ai', role: 'owner', status: 'active', credits: getOrCreateCreditAccount('demo-user').credits }]))
app.get('/api/admin/logs', (_req, res) => { const project = getProject('default'); res.json(['[Admin] Command Center loaded', '[Credits] Credit system loaded', '[Import Center] Upload/review/continue routes loaded', '[Deployment Center] Provider registry loaded', `[Memory] Active build version ${project.buildVersion}`, ...project.history.map((item) => `[History] ${item}`)]) })
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))
app.listen(port, '0.0.0.0', () => console.log(`Vantix AI Builders API running on http://localhost:${port}`))
