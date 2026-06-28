export type IntelligentSuggestion = {
  id: string
  title: string
  category: string
  reason: string
  prompt: string
  priority: 'quick-win' | 'important' | 'advanced'
}

export type TrendSignal = {
  id: string
  name: string
  category: string
  relevance: number
  summary: string
}

export type ErrorFix = {
  id: string
  area: string
  issue: string
  fix: string
  status: 'ready' | 'applied' | 'needs-review'
}

export const trendSignals: TrendSignal[] = [
  { id: 'ai-agents', name: 'AI agent workflows', category: 'AI', relevance: 98, summary: 'Multi-agent workflows for planning, coding, testing, and deployment are becoming standard in AI builder products.' },
  { id: 'fullstack-ts', name: 'Full-stack TypeScript', category: 'Programming', relevance: 94, summary: 'Shared TypeScript contracts across frontend/backend reduce integration bugs and improve velocity.' },
  { id: 'edge-deploy', name: 'Edge-ready deployment', category: 'DevOps', relevance: 88, summary: 'Modern apps benefit from fast global previews, cached assets, and backend APIs close to users.' },
  { id: 'privacy-admin', name: 'Private admin controls', category: 'Security', relevance: 91, summary: 'Billing, secrets, and operations should stay isolated from public product routes.' },
  { id: 'mobile-first-saas', name: 'Mobile-first SaaS UX', category: 'Design', relevance: 90, summary: 'Admin and builder interfaces must work on phones, tablets, and desktops with responsive information density.' }
]

export function getIntelligentSuggestions(prompt = ''): IntelligentSuggestion[] {
  const lower = prompt.toLowerCase()
  const base: IntelligentSuggestion[] = [
    { id: 'add-auth', title: 'Add secure auth and roles', category: 'Security', reason: 'Most production apps need login, sessions, and role permissions.', prompt: 'Add secure authentication, admin-only routes, role-based access control, and audit logs.', priority: 'important' },
    { id: 'add-db', title: 'Design production database', category: 'Database', reason: 'Project memory and app data need durable schema and migration planning.', prompt: 'Create a normalized database schema with migrations, indexes, seed data, and access rules.', priority: 'important' },
    { id: 'add-tests', title: 'Generate QA tests', category: 'Testing', reason: 'Automated tests catch broken routes, forms, and generation flows.', prompt: 'Add unit tests, API tests, and browser QA tests for the generated app.', priority: 'quick-win' },
    { id: 'add-deploy', title: 'Prepare deployment', category: 'DevOps', reason: 'A deploy checklist prevents environment and hosting failures.', prompt: 'Create deployment config for frontend, backend, environment variables, monitoring, rollback, and scaling.', priority: 'important' },
    { id: 'add-humanized-ux', title: 'Humanize UX details', category: 'Design', reason: 'Microcopy, empty states, onboarding, and helpful feedback make generated apps feel real.', prompt: 'Improve the app with humanized microcopy, onboarding, helpful empty states, error recovery, and polished user feedback.', priority: 'quick-win' }
  ]

  if (lower.includes('marketplace') || lower.includes('ecommerce')) {
    base.unshift({ id: 'commerce-stack', title: 'Add commerce stack', category: 'Payments', reason: 'Commerce apps need catalog, cart, checkout, inventory, and order management.', prompt: 'Add product catalog, cart, checkout, Stripe billing, order management, inventory, and admin fulfillment tools.', priority: 'advanced' })
  }
  if (lower.includes('ai') || lower.includes('chatbot')) {
    base.unshift({ id: 'agent-memory', title: 'Add AI agent memory', category: 'AI', reason: 'AI apps need model routing, memory, evals, and fallback behavior.', prompt: 'Add AI agent memory, tool calling, model routing, RAG-ready structure, safety rules, and evaluation logs.', priority: 'advanced' })
  }
  return base
}

export function runErrorFixer() {
  const fixes: ErrorFix[] = [
    { id: 'mobile-overflow', area: 'Responsive UI', issue: 'Dense admin grids may overflow on small screens.', fix: 'Use single-column grids, horizontal-safe tabs, and reduced padding below 720px.', status: 'ready' },
    { id: 'secret-safety', area: 'Security', issue: 'Payment and AI provider secrets must never be exposed to frontend.', fix: 'Keep keys in server-only .env and expose only provider status booleans.', status: 'ready' },
    { id: 'api-fallback', area: 'Reliability', issue: 'Frontend should remain usable if API is offline.', fix: 'Use fallback state, terminal warnings, and retryable admin reloads.', status: 'ready' },
    { id: 'mock-auth-warning', area: 'Auth', issue: 'Admin login is prototype-only.', fix: 'Show security event warning and require production auth before launch.', status: 'needs-review' }
  ]
  return fixes
}

export function aiAgentExecutionPlan(prompt: string) {
  return [
    `[AI Agent] Reads your prompt with product context: ${prompt.slice(0, 120)}`,
    '[Architect Agent] Converts intent into system design, data model, API contracts, and scale plan.',
    '[Designer Agent] Adds humanized UX details: onboarding, helpful empty states, microcopy, mobile layouts, and accessibility.',
    '[Programmer Agent] Applies modern TypeScript, modular services, clear boundaries, and maintainable components.',
    '[Trend Agent] Checks current product patterns: AI agents, mobile-first SaaS, edge deploy, secure admin, and full-stack TypeScript.',
    '[Error Fixer Agent] Reviews build risks, missing env vars, route protection, responsive overflow, and secret leakage.',
    '[Deployment Agent] Prepares run commands, production env checklist, monitoring, rollback, and scaling notes.'
  ]
}
