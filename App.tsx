import { useEffect, useMemo, useState } from 'react'
import { Sparkles, Rocket, Eye, Download, Wand2, RefreshCw, Coins } from 'lucide-react'
import { api, type CreditAccount } from './api'
import { suggestions as seedSuggestions, skills as seedSkills, plugins as seedPlugins } from './data'
import type { DeployProvider, DevTool, ImportRecord, Plugin, ProSkill, Skill, Suggestion, TabId } from './types'
import Suggestions from './components/Suggestions'
import SkillsPanel from './components/SkillsPanel'
import PluginsPanel from './components/PluginsPanel'
import EditorWorkspace from './components/EditorWorkspace'
import AdminApp from './admin/AdminApp'

const PROJECT_ID = 'default'
const USER_ID = 'demo-user'
const chips = ['Responsive layout', 'Auth + database', 'SaaS pricing', 'Admin roles', 'Realtime data', 'Mobile-first']

function BuilderApp() {
  const [selected, setSelected] = useState<Suggestion>(seedSuggestions[0])
  const [prompt, setPrompt] = useState(seedSuggestions[0].prompt)
  const [skills, setSkills] = useState<Skill[]>(seedSkills)
  const [plugins, setPlugins] = useState<Plugin[]>(seedPlugins)
  const [devTools, setDevTools] = useState<DevTool[]>([])
  const [proSkills, setProSkills] = useState<ProSkill[]>([])
  const [imports, setImports] = useState<ImportRecord[]>([])
  const [deployProviders, setDeployProviders] = useState<DeployProvider[]>([])
  const [credits, setCredits] = useState<CreditAccount | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('preview')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'running' | 'success'>('idle')
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[Command Center] Connecting to backend Project Memory...'])
  const [fileTree, setFileTree] = useState<string[]>([])
  const [buildVersion, setBuildVersion] = useState(1)
  const [apiState, setApiState] = useState<'connecting' | 'online' | 'offline'>('connecting')

  const enabledSkills = useMemo(() => skills.filter((skill) => skill.enabled), [skills])
  const connectedPlugins = useMemo(() => plugins.filter((plugin) => plugin.status === 'connected'), [plugins])
  const enabledDevTools = useMemo(() => devTools.filter((tool) => tool.status === 'enabled'), [devTools])

  async function loadBackendState() {
    try {
      const [memory, tree, tools, loadedProSkills, creditData, importData, providerData] = await Promise.all([
        api.getMemory(PROJECT_ID),
        api.getFileTree(PROJECT_ID),
        api.getDevTools(),
        api.getProSkills(),
        api.getCredits(USER_ID),
        api.listImports(),
        api.listDeployProviders(),
      ])
      const suggestion = seedSuggestions.find((item) => item.id === memory.currentSuggestionId) ?? seedSuggestions[0]
      setSelected(suggestion)
      setPrompt(memory.prompt)
      setBuildVersion(memory.buildVersion)
      setFileTree(tree.tree)
      setDevTools(tools)
      setProSkills(loadedProSkills)
      setCredits(creditData.account)
      setImports(importData)
      setDeployProviders(providerData)
      setPlugins((current) => current.map((plugin) => ({ ...plugin, status: memory.plugins[plugin.id] ?? plugin.status })))
      setTerminalLogs([
        '[Backend] Connected to Vantix AI Builders API',
        `[Credits] ${creditData.account.credits} credits available`,
        `[Project Memory] Loaded ${memory.name}`,
        `[Import Center] Loaded ${importData.length} imported files/projects`,
        `[Deployment Center] Loaded ${providerData.length} deploy providers`,
        `[AI Pro Skills] Loaded ${loadedProSkills.length} expert skill modules`,
        `[Dev Tools] Loaded ${tools.length} developer tools`,
        ...memory.history.slice(0, 5).map((item) => `[History] ${item}`),
      ])
      setApiState('online')
    } catch (error) {
      setApiState('offline')
      setTerminalLogs([
        '[Backend] API unavailable, using local fallback state',
        error instanceof Error ? `[Error] ${error.message}` : '[Error] Unknown backend connection issue',
      ])
    }
  }

  useEffect(() => { loadBackendState() }, [])

  function selectSuggestion(suggestion: Suggestion) {
    setSelected(suggestion)
    setPrompt(suggestion.prompt)
    setGenerationStatus('idle')
    setTerminalLogs([
      `[Project Memory] Loaded template memory for ${suggestion.title}`,
      `[AI Router] Suggested build target set to ${suggestion.template}`,
      '[Command Center] Ready to execute God Mode generation through backend API',
    ])
    setActiveTab('preview')
  }

  function toggleSkill(id: string) {
    setSkills((current) => current.map((skill) => skill.id === id ? { ...skill, enabled: !skill.enabled } : skill))
  }

  async function togglePlugin(id: string) {
    const previous = plugins
    setPlugins((current) => current.map((plugin) => plugin.id !== id || plugin.status === 'disabled' ? plugin : { ...plugin, status: plugin.status === 'connected' ? 'available' : 'connected' }))
    try {
      const memory = await api.togglePlugin(PROJECT_ID, id)
      setPlugins((current) => current.map((plugin) => ({ ...plugin, status: memory.plugins[plugin.id] ?? plugin.status })))
    } catch { setPlugins(previous) }
  }

  async function toggleDevTool(id: string) {
    const previous = devTools
    setDevTools((current) => current.map((tool) => tool.id === id && tool.status !== 'locked' ? { ...tool, status: tool.status === 'enabled' ? 'available' : 'enabled' } : tool))
    try {
      const updated = await api.toggleDevTool(id)
      setDevTools((current) => current.map((tool) => tool.id === id ? updated : tool))
    } catch { setDevTools(previous) }
  }

  async function uploadImports(files: FileList) {
    const created: ImportRecord[] = []
    for (const file of Array.from(files)) {
      created.push(await api.uploadImport({ filename: file.name, size: file.size }))
    }
    setImports((current) => [...created, ...current])
    setTerminalLogs((current) => [`[Import Center] Uploaded ${created.length} file(s) for review`, ...current].slice(0, 22))
  }

  async function reviewImport(id: string) {
    const updated = await api.reviewImport(id)
    setImports((current) => current.map((item) => item.id === id ? updated : item))
  }

  async function continueImport(id: string) {
    const updated = await api.continueImport(id)
    setImports((current) => current.map((item) => item.id === id ? updated : item))
    setTerminalLogs((current) => [`[Import Center] Continue unfinished build context loaded from ${updated.filename}`, ...current].slice(0, 22))
  }

  async function createDeploy(providerId: string) {
    const result = await api.createDeploy(providerId)
    setTerminalLogs((current) => [`[Deployment Center] ${JSON.stringify(result)}`, ...current].slice(0, 22))
  }

  async function refreshCredits() {
    const creditData = await api.getCredits(USER_ID)
    setCredits(creditData.account)
  }

  async function generatePrototype() {
    setIsGenerating(true)
    setGenerationStatus('running')
    setActiveTab('console')
    setTerminalLogs([
      `$ vantix build --mode god --target "${selected.title}" --credits --auto-preview`,
      `[Credits] Available before build: ${credits?.credits ?? 'loading'}`,
      `[Prompt] ${prompt}`,
      '[Backend] Sending generation request with enabled Dev Tools, AI Pro Skills, imports, and credits...',
    ])
    try {
      const job = await api.generate({ projectId: PROJECT_ID, userId: USER_ID, prompt, suggestionId: selected.id, title: selected.title })
      setTerminalLogs(job.logs)
      setBuildVersion(job.previewState.version)
      setGenerationStatus('success')
      if (job.credits) setCredits(job.credits)
      else await refreshCredits()
      const tree = await api.getFileTree(PROJECT_ID)
      setFileTree(tree.tree)
      if ((job as any).autoPreview !== false) {
        window.setTimeout(() => setActiveTab('preview'), 450)
      }
    } catch (error) {
      setTerminalLogs((current) => [...current, error instanceof Error ? `[Error] ${error.message}` : '[Error] Unknown generation issue'])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero glass hero-grid">
        <div>
          <div className="eyebrow"><Sparkles size={16} /> Vantix AI Builders · API {apiState}</div>
          <h1>AI App Builder God Mode</h1>
          <p className="hero-copy">Autonomous developer, designer, programmer, architect, error fixer, and deployment engine. Upload unfinished builds, spend credits, generate, and auto-preview your app.</p>
          <div className="hero-actions"><a className="primary-btn" href="#builder"><Rocket size={18} /> Start building</a><a className="secondary-btn" href="/admin">Secure Admin</a><button className="secondary-btn" onClick={() => setActiveTab('importdeploy')}>Import Project</button><button className="secondary-btn" onClick={() => setActiveTab('preview')}><Eye size={18} /> View preview</button></div>
        </div>
        <div className="hero-card"><span>Current build</span><strong>{generationStatus === 'success' ? 'Generation complete' : selected.title}</strong><p>{enabledSkills.length} skills · {connectedPlugins.length} plugins · {enabledDevTools.length} dev tools · {imports.length} imports · v{buildVersion}</p><div className="mini-meter"><i style={{ width: generationStatus === 'success' ? '100%' : `${Math.min(95, 45 + enabledSkills.length * 6 + connectedPlugins.length * 5)}%` }} /></div></div>
      </section>

      <section id="builder" className="builder-layout">
        <div className="left-stack">
          <Suggestions suggestions={seedSuggestions} selectedId={selected.id} onSelect={selectSuggestion} />
          <section className="glass prompt-card"><div className="section-heading"><div><span>Prompt-to-app</span><h2>Describe what to build</h2></div><div className="mode-badge"><Coins size={14} /> {credits ? `${credits.credits} credits` : 'credits loading'}</div><Wand2 className="glow-icon" /></div><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe your product idea, users, pages, data, and integrations..." /><div className="chip-row">{chips.map((chip) => <button key={chip} onClick={() => setPrompt((value) => `${value} Include ${chip.toLowerCase()}.`)}>{chip}</button>)}</div><div className="action-row"><button className="primary-btn" onClick={generatePrototype} disabled={isGenerating}>{isGenerating ? <RefreshCw className="spin" size={18} /> : <Sparkles size={18} />} {isGenerating ? 'Executing God Mode' : 'Generate Prototype · 50 credits'}</button><button className="secondary-btn" onClick={() => setActiveTab('importdeploy')}>Import & Deploy</button><button className="secondary-btn" onClick={() => setActiveTab('proskills')}>Pro Skills</button><button className="secondary-btn" onClick={() => setActiveTab('preview')}>Preview</button><button className="secondary-btn"><Download size={16} /> Export Code</button></div></section>
          <EditorWorkspace activeTab={activeTab} setActiveTab={setActiveTab} selected={selected} prompt={prompt} skills={enabledSkills} plugins={plugins} devTools={devTools} proSkills={proSkills} imports={imports} deployProviders={deployProviders} onImportUpload={uploadImports} onImportReview={reviewImport} onImportContinue={continueImport} onDeploy={createDeploy} onPluginToggle={togglePlugin} onDevToolToggle={toggleDevTool} isGenerating={isGenerating} generationStatus={generationStatus} terminalLogs={terminalLogs} buildVersion={buildVersion} fileTree={fileTree} credits={credits} />
        </div>
        <aside className="right-stack"><SkillsPanel skills={skills} onToggle={toggleSkill} /><PluginsPanel plugins={plugins} onToggle={togglePlugin} /><section className="glass summary-card"><span>Build summary</span><h3>{generationStatus === 'success' ? 'God Mode build ready' : selected.template}</h3><p>{credits ? `${credits.credits} credits remaining. New non-subscribed users start with 200 credits.` : 'Credit account loading.'}</p><p>{imports.length} imported files/projects ready for continue-build context.</p><p>Status: {generationStatus === 'running' ? 'Architecting, designing, and programming...' : generationStatus === 'success' ? 'Auto-preview opened after successful generation.' : 'Ready for prompt execution.'}</p></section></aside>
      </section>
    </main>
  )
}

export default function App() {
  if (window.location.pathname.startsWith('/admin')) return <AdminApp />
  return <BuilderApp />
}
