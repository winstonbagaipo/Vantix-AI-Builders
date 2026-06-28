export type ImportRecord = {
  id: string
  filename: string
  kind: 'zip' | 'image' | 'source' | 'document' | 'unknown'
  size: number
  status: 'uploaded' | 'reviewed' | 'continued'
  summary: string
  createdAt: string
}

export type DeployProvider = {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'fullstack' | 'repo' | 'static'
  status: 'configured' | 'available' | 'missing_credentials'
  requiredEnv: string[]
  description: string
}

const imports: ImportRecord[] = []

export const deployProviders: DeployProvider[] = [
  { id: 'vercel', name: 'Vercel', category: 'frontend', status: process.env.VERCEL_TOKEN ? 'configured' : 'missing_credentials', requiredEnv: ['VERCEL_TOKEN', 'VERCEL_PROJECT_ID', 'VERCEL_ORG_ID'], description: 'Frontend previews, production web deploys, and Vite/React hosting.' },
  { id: 'netlify', name: 'Netlify', category: 'frontend', status: process.env.NETLIFY_AUTH_TOKEN ? 'configured' : 'missing_credentials', requiredEnv: ['NETLIFY_AUTH_TOKEN', 'NETLIFY_SITE_ID'], description: 'Static frontend hosting, previews, redirects, and forms.' },
  { id: 'github', name: 'GitHub', category: 'repo', status: process.env.GITHUB_TOKEN ? 'configured' : 'missing_credentials', requiredEnv: ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO'], description: 'Repository sync, source control, branches, releases, and PR workflow.' },
  { id: 'render', name: 'Render', category: 'backend', status: process.env.RENDER_API_KEY ? 'configured' : 'missing_credentials', requiredEnv: ['RENDER_API_KEY', 'RENDER_SERVICE_ID'], description: 'Express API hosting, backend services, workers, and cron jobs.' },
  { id: 'railway', name: 'Railway', category: 'fullstack', status: process.env.RAILWAY_TOKEN ? 'configured' : 'missing_credentials', requiredEnv: ['RAILWAY_TOKEN', 'RAILWAY_PROJECT_ID'], description: 'Full-stack app hosting, databases, environment variables, and deploy previews.' },
  { id: 'cloudflare', name: 'Cloudflare Pages', category: 'static', status: process.env.CLOUDFLARE_API_TOKEN ? 'configured' : 'missing_credentials', requiredEnv: ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'], description: 'Global edge frontend hosting, CDN, workers, DNS, and performance.' },
  { id: 'firebase', name: 'Firebase Hosting', category: 'static', status: process.env.FIREBASE_TOKEN ? 'configured' : 'missing_credentials', requiredEnv: ['FIREBASE_TOKEN', 'FIREBASE_PROJECT_ID'], description: 'Static/web app hosting with Firebase ecosystem integration.' }
]

export function classifyFile(filename: string): ImportRecord['kind'] {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.zip')) return 'zip'
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(lower)) return 'image'
  if (/\.(ts|tsx|js|jsx|json|css|html|md|py|go|java)$/.test(lower)) return 'source'
  if (/\.(pdf|doc|docx|txt)$/.test(lower)) return 'document'
  return 'unknown'
}

export function addImport(input: { filename: string; size: number }) {
  const kind = classifyFile(input.filename)
  const record: ImportRecord = {
    id: `import_${Date.now()}_${imports.length + 1}`,
    filename: input.filename,
    kind,
    size: input.size,
    status: 'uploaded',
    summary: kind === 'zip'
      ? 'ZIP project received. Ready for extraction/review and continue-build analysis.'
      : kind === 'image'
        ? 'Image asset received. Ready for design reference and UI extraction.'
        : 'File received. Ready for code/content review.',
    createdAt: new Date().toISOString()
  }
  imports.unshift(record)
  return record
}

export function listImports() {
  return imports
}

export function reviewImport(importId: string) {
  const record = imports.find((item) => item.id === importId)
  if (!record) return undefined
  record.status = 'reviewed'
  record.summary = [
    `Reviewed ${record.filename}.`,
    record.kind === 'zip' ? 'Detected project archive structure placeholder: package files, source folder, assets, configs.' : '',
    record.kind === 'image' ? 'Detected visual reference placeholder: layout, colors, typography, and UI inspiration.' : '',
    'God Mode can continue unfinished build using imported context, Project Memory, AI Pro Skills, Dev Tools, and Error Fixer.'
  ].filter(Boolean).join(' ')
  return record
}

export function continueBuildFromImport(importId: string) {
  const record = imports.find((item) => item.id === importId)
  if (!record) return undefined
  record.status = 'continued'
  record.summary = `Continue-build context created from ${record.filename}. Architect AI, Programmer AI, Error Fixer, and Deployment Engine will use this import as project memory.`
  return record
}

export function listDeployProviders() {
  return deployProviders
}

export function createMockDeploy(providerId: string) {
  const provider = deployProviders.find((item) => item.id === providerId)
  if (!provider) throw new Error('Deployment provider not found')
  return {
    id: `deploy_${providerId}_${Date.now()}`,
    provider,
    status: provider.status === 'configured' ? 'ready_to_deploy' : 'missing_credentials',
    message: provider.status === 'configured'
      ? `Mock deployment prepared for ${provider.name}. Wire provider SDK/API to deploy for real.`
      : `${provider.name} needs environment variables: ${provider.requiredEnv.join(', ')}`,
    createdAt: new Date().toISOString()
  }
}
