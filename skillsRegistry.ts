export type ProSkill = {
  id: string
  name: string
  category: string
  level: 'core' | 'advanced' | 'expert' | 'god-mode'
  description: string
  buildOutputs: string[]
  promptTemplate: string
  checklist: string[]
}

export const proSkills: ProSkill[] = [
  {
    id: 'app-architect',
    name: 'Senior App Architect',
    category: 'architecture',
    level: 'god-mode',
    description: 'Turns any idea into a complete system blueprint with modules, data flow, APIs, security, and deployment plan.',
    buildOutputs: ['system architecture', 'module map', 'API contract', 'database plan', 'deployment topology'],
    promptTemplate: 'Act as a senior software architect. Convert the user prompt into a complete production blueprint with functional requirements, non-functional requirements, component boundaries, database entities, APIs, security model, deployment plan, scaling risks, and implementation phases.',
    checklist: ['define scope', 'identify users', 'map modules', 'design data model', 'define APIs', 'plan security', 'plan deployment']
  },
  {
    id: 'frontend-engineer',
    name: 'Frontend Engineer Pro',
    category: 'frontend',
    level: 'expert',
    description: 'Builds responsive React/Vite UI, routes, layouts, state, forms, dashboards, admin pages, and polished visual systems.',
    buildOutputs: ['React components', 'routes', 'state flows', 'forms', 'dashboards', 'responsive UI'],
    promptTemplate: 'Act as a senior frontend engineer. Generate component architecture, page structure, state management plan, responsive behavior, accessibility requirements, empty/loading/error states, and UI implementation details.',
    checklist: ['pages', 'components', 'state', 'forms', 'responsive', 'accessibility', 'loading/error states']
  },
  {
    id: 'backend-engineer',
    name: 'Backend Engineer Pro',
    category: 'backend',
    level: 'expert',
    description: 'Builds APIs, services, auth middleware, jobs, queues, business logic, integrations, and webhook handlers.',
    buildOutputs: ['REST API', 'services', 'middleware', 'jobs', 'webhooks', 'validation schemas'],
    promptTemplate: 'Act as a senior backend engineer. Design endpoints, validation, service modules, auth boundaries, business logic, job processing, webhooks, error handling, logging, and testing requirements.',
    checklist: ['routes', 'schemas', 'services', 'auth', 'jobs', 'webhooks', 'logs', 'tests']
  },
  {
    id: 'database-designer',
    name: 'Database Designer Pro',
    category: 'database',
    level: 'expert',
    description: 'Designs schemas for SQL/NoSQL, relationships, indexes, migrations, seed data, permissions, and data lifecycle.',
    buildOutputs: ['schema', 'relationships', 'indexes', 'migrations', 'seed data', 'RLS rules'],
    promptTemplate: 'Act as a database architect. Create tables/collections, fields, relationships, indexes, constraints, migrations, seed data, access rules, and data retention strategy.',
    checklist: ['entities', 'fields', 'relations', 'indexes', 'constraints', 'seeds', 'permissions']
  },
  {
    id: 'ai-agent-builder',
    name: 'AI Agent Builder Pro',
    category: 'ai',
    level: 'god-mode',
    description: 'Designs AI assistants, agent tools, memory, model routing, RAG, prompt chains, and evaluation loops.',
    buildOutputs: ['agent design', 'tool registry', 'memory plan', 'RAG pipeline', 'model router', 'eval plan'],
    promptTemplate: 'Act as an AI systems engineer. Design agent roles, system prompts, tool calls, memory, retrieval, model routing, safeguards, evaluation metrics, and fallback behavior.',
    checklist: ['agents', 'tools', 'memory', 'retrieval', 'routing', 'safety', 'evals']
  },
  {
    id: 'mobile-builder',
    name: 'Mobile App Builder Pro',
    category: 'mobile',
    level: 'advanced',
    description: 'Plans Android/iOS apps, screens, navigation, offline mode, push notifications, and API sync.',
    buildOutputs: ['mobile screens', 'navigation', 'offline plan', 'push notifications', 'API sync'],
    promptTemplate: 'Act as a senior mobile engineer. Convert the app idea into screens, navigation, state, API sync, offline behavior, notifications, permissions, store readiness, and testing plan.',
    checklist: ['screens', 'navigation', 'state', 'offline', 'notifications', 'permissions', 'store']
  },
  {
    id: 'saas-builder',
    name: 'SaaS Product Builder Pro',
    category: 'saas',
    level: 'god-mode',
    description: 'Builds SaaS apps with onboarding, workspace/orgs, billing, roles, dashboards, analytics, and admin tooling.',
    buildOutputs: ['onboarding', 'orgs/workspaces', 'billing', 'roles', 'dashboard', 'admin panel'],
    promptTemplate: 'Act as a SaaS product engineer. Design onboarding, workspace model, users/roles, billing tiers, dashboards, usage tracking, admin tools, upgrade flows, and retention loops.',
    checklist: ['onboarding', 'orgs', 'roles', 'billing', 'dashboard', 'usage', 'admin']
  },
  {
    id: 'ecommerce-builder',
    name: 'E-commerce Builder Pro',
    category: 'commerce',
    level: 'expert',
    description: 'Builds stores with products, cart, checkout, orders, inventory, payments, taxes, and fulfillment.',
    buildOutputs: ['catalog', 'cart', 'checkout', 'orders', 'inventory', 'payments', 'fulfillment'],
    promptTemplate: 'Act as an e-commerce architect. Design product catalog, variants, cart, checkout, orders, inventory, payment flow, tax/shipping model, fulfillment, admin controls, and analytics.',
    checklist: ['catalog', 'cart', 'checkout', 'orders', 'inventory', 'payments', 'fulfillment']
  },
  {
    id: 'security-auditor',
    name: 'Security Auditor Pro',
    category: 'security',
    level: 'expert',
    description: 'Adds auth hardening, RBAC, audit logs, secret safety, rate limits, input validation, and deployment security.',
    buildOutputs: ['threat model', 'RBAC', 'audit logs', 'rate limits', 'validation', 'security checklist'],
    promptTemplate: 'Act as a security engineer. Create threat model, auth strategy, RBAC, audit logs, input validation, rate limiting, secret handling, dependency scanning, and production security checklist.',
    checklist: ['threats', 'auth', 'RBAC', 'audit', 'validation', 'rate limits', 'secrets']
  },
  {
    id: 'devops-deployer',
    name: 'DevOps Deployment Pro',
    category: 'devops',
    level: 'expert',
    description: 'Plans CI/CD, environment variables, deployment targets, monitoring, rollback, logs, backups, and scaling.',
    buildOutputs: ['CI/CD plan', 'env config', 'deployment guide', 'monitoring', 'rollback', 'scaling plan'],
    promptTemplate: 'Act as a DevOps engineer. Design environments, CI/CD, build commands, deployment targets, secrets, monitoring, logs, backups, rollback strategy, and scaling plan.',
    checklist: ['envs', 'CI/CD', 'build', 'deploy', 'monitoring', 'logs', 'rollback', 'scale']
  }
]

export function listProSkills() {
  return proSkills
}

export function getProSkill(id: string) {
  return proSkills.find((skill) => skill.id === id)
}

export function buildGodModePrompt(userPrompt: string) {
  const templates = proSkills.map((skill) => `## ${skill.name}\n${skill.promptTemplate}\nChecklist: ${skill.checklist.join(', ')}`).join('\n\n')
  return `VANTIX AI BUILDERS GOD MODE\n\nUser request:\n${userPrompt}\n\nUse these AI Pro Skills:\n\n${templates}\n\nFinal output must include architecture, UI, backend, database, AI, security, testing, deployment, project memory, and next actions.`
}

export function proSkillExecutionLogs() {
  return proSkills.map((skill) => `[AI Pro Skill] ${skill.name}: ${skill.checklist.join(' → ')}`)
}
