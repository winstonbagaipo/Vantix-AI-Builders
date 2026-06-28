export type DevToolCategory =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'auth'
  | 'payments'
  | 'ai'
  | 'testing'
  | 'debugging'
  | 'devops'
  | 'monitoring'
  | 'security'
  | 'seo'
  | 'mobile'
  | 'design'
  | 'deployment'

export type DevTool = {
  id: string
  name: string
  category: DevToolCategory
  description: string
  status: 'enabled' | 'available' | 'locked'
  configRequired: boolean
  godModeUse: string
}

const tools: DevTool[] = [
  { id: 'react-builder', name: 'React Component Builder', category: 'frontend', description: 'Generates reusable pages, layouts, components, and stateful UI flows.', status: 'enabled', configRequired: false, godModeUse: 'Programmer AI creates React/Vite UI modules.' },
  { id: 'tailwind-system', name: 'Design System Engine', category: 'design', description: 'Creates tokens, typography, glassmorphism styling, spacing, and responsive rules.', status: 'enabled', configRequired: false, godModeUse: 'Designer AI creates visual language and layout rules.' },
  { id: 'express-api', name: 'Express API Builder', category: 'backend', description: 'Creates API endpoints, validation, middleware, and service modules.', status: 'enabled', configRequired: false, godModeUse: 'Backend Agent generates REST APIs and service boundaries.' },
  { id: 'project-memory', name: 'Project Memory Store', category: 'database', description: 'Stores project state, versions, generated files, prompts, and build history.', status: 'enabled', configRequired: false, godModeUse: 'Memory Agent syncs generated artifacts and decisions.' },
  { id: 'postgres-prisma', name: 'PostgreSQL + Prisma', category: 'database', description: 'Production relational database schema, migrations, and ORM models.', status: 'available', configRequired: true, godModeUse: 'Database Agent designs schema and migrations.' },
  { id: 'supabase-auth', name: 'Supabase Auth', category: 'auth', description: 'Email/password, OAuth, sessions, row-level security, and storage.', status: 'available', configRequired: true, godModeUse: 'Auth Agent wires login, signup, and protected routes.' },
  { id: 'clerk-auth', name: 'Clerk Auth', category: 'auth', description: 'User management, organizations, roles, and admin auth workflows.', status: 'available', configRequired: true, godModeUse: 'Security Agent creates role-based access and admin gates.' },
  { id: 'stripe-payments', name: 'Stripe Payments', category: 'payments', description: 'Checkout, billing, subscriptions, customer portal, and webhooks.', status: 'available', configRequired: true, godModeUse: 'Payments Agent generates billing flows and webhook handlers.' },
  { id: 'ai-gateway', name: 'Multi-Model AI Gateway', category: 'ai', description: 'Routes prompts across OpenAI, Claude, Grok, Ollama, and mock fallback.', status: 'enabled', configRequired: true, godModeUse: 'AI Router chooses model, executes, and syncs memory.' },
  { id: 'playwright-qa', name: 'Playwright QA', category: 'testing', description: 'End-to-end browser testing, screenshots, flows, and regression checks.', status: 'available', configRequired: false, godModeUse: 'QA Agent validates generated app flows.' },
  { id: 'vitest-unit', name: 'Vitest Unit Tests', category: 'testing', description: 'Unit tests for components, services, schemas, and utilities.', status: 'available', configRequired: false, godModeUse: 'QA Agent creates and runs unit tests.' },
  { id: 'error-fixer', name: 'Auto Error Fixer', category: 'debugging', description: 'Detects syntax, runtime, build, dependency, security, and performance issues.', status: 'enabled', configRequired: false, godModeUse: 'Error Fixer diagnoses, repairs, and retests.' },
  { id: 'github-sync', name: 'GitHub Sync', category: 'devops', description: 'Repository setup, commits, branches, pull requests, and version restore.', status: 'available', configRequired: true, godModeUse: 'Release Agent creates branches and version history.' },
  { id: 'vercel-deploy', name: 'Vercel Deploy', category: 'deployment', description: 'Frontend preview and production deployments with environment variables.', status: 'available', configRequired: true, godModeUse: 'Deployment Engine ships web builds.' },
  { id: 'render-api', name: 'Render API Hosting', category: 'deployment', description: 'Backend hosting for Express APIs, workers, and cron jobs.', status: 'available', configRequired: true, godModeUse: 'DevOps Agent deploys backend services.' },
  { id: 'sentry-monitoring', name: 'Sentry Monitoring', category: 'monitoring', description: 'Runtime errors, traces, releases, and performance monitoring.', status: 'available', configRequired: true, godModeUse: 'Monitoring Agent tracks production issues.' },
  { id: 'security-scanner', name: 'Security Scanner', category: 'security', description: 'Dependency audit, route checks, auth review, and secret scanning checklist.', status: 'enabled', configRequired: false, godModeUse: 'Security Agent audits app before release.' },
  { id: 'seo-optimizer', name: 'SEO Optimizer', category: 'seo', description: 'Metadata, sitemap plan, content hierarchy, schema, and performance basics.', status: 'available', configRequired: false, godModeUse: 'SEO Agent optimizes public pages.' },
  { id: 'react-native-export', name: 'React Native Export', category: 'mobile', description: 'Mobile app scaffold, screens, navigation, and API integration plan.', status: 'available', configRequired: false, godModeUse: 'Mobile Agent creates Android/iOS scaffold.' }
]

export function listDevTools() {
  return tools
}

export function getDevTool(id: string) {
  return tools.find((tool) => tool.id === id)
}

export function toggleDevTool(id: string) {
  const tool = getDevTool(id)
  if (!tool || tool.status === 'locked') return tool
  tool.status = tool.status === 'enabled' ? 'available' : 'enabled'
  return tool
}

export function enabledDevTools() {
  return tools.filter((tool) => tool.status === 'enabled')
}

export function godModeToolPlan() {
  return enabledDevTools().map((tool) => `[${tool.name}] ${tool.godModeUse}`)
}
