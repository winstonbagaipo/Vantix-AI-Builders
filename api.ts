import type { DeployProvider, DevTool, ImportRecord, Plugin, ProSkill } from './types'

export type GenerationJob = {
  id: string
  projectId: string
  prompt: string
  suggestionId: string
  status: 'queued' | 'running' | 'success' | 'failed'
  logs: string[]
  previewState: { title: string; summary: string; version: number }
  aiGateway?: unknown
  devTools?: DevTool[]
  proSkills?: ProSkill[]
  credits?: CreditAccount
}

export type CreditAccount = {
  userId: string
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  subscribed: boolean
  credits: number
  monthlyCredits: number
  usedCredits: number
  createdAt: string
  updatedAt: string
}

export type CreditTransaction = {
  id: string
  userId: string
  type: 'grant' | 'usage' | 'subscription_reset' | 'admin_adjustment'
  amount: number
  reason: string
  createdAt: string
}

export type ProjectMemory = {
  id: string
  name: string
  brand: string
  currentSuggestionId: string
  prompt: string
  buildVersion: number
  components: string[]
  pages: string[]
  database: string[]
  plugins: Record<string, Plugin['status']>
  history: string[]
  updatedAt: string
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  })
  if (!response.ok) throw new Error((await response.text()) || `Request failed: ${response.status}`)
  return response.json() as Promise<T>
}

export const api = {
  getMemory: (projectId = 'default') => request<ProjectMemory>(`/api/project/${projectId}/memory`),
  generate: (input: { projectId?: string; prompt: string; suggestionId: string; title: string; userId?: string }) => request<GenerationJob>('/api/generate', { method: 'POST', body: JSON.stringify(input) }),
  togglePlugin: (projectId: string, pluginId: string) => request<ProjectMemory>(`/api/project/${projectId}/plugins/${pluginId}/toggle`, { method: 'POST', body: JSON.stringify({}) }),
  getFileTree: (projectId = 'default') => request<{ projectId: string; tree: string[] }>(`/api/project/${projectId}/file-tree`),
  getDevTools: () => request<DevTool[]>('/api/devtools'),
  toggleDevTool: (toolId: string) => request<DevTool>(`/api/devtools/${toolId}/toggle`, { method: 'POST', body: JSON.stringify({}) }),
  getGodModeToolPlan: () => request<{ tools: DevTool[]; plan: string[] }>('/api/devtools/god-mode-plan'),
  getProSkills: () => request<ProSkill[]>('/api/pro-skills'),
  getGodModePrompt: (prompt: string) => request<{ prompt: string }>('/api/pro-skills/god-mode-prompt', { method: 'POST', body: JSON.stringify({ prompt }) }),
  getCredits: (userId = 'demo-user') => request<{ account: CreditAccount; transactions: CreditTransaction[] }>(`/api/credits/${userId}`),
  adjustSubscription: (input: { userId?: string; plan: CreditAccount['plan']; subscribed: boolean }) => request<CreditAccount>('/api/admin/credits/subscription', { method: 'POST', body: JSON.stringify(input) }),
  addCredits: (input: { userId?: string; amount: number; reason: string }) => request<CreditAccount>('/api/admin/credits/add', { method: 'POST', body: JSON.stringify(input) }),
  uploadImport: (input: { filename: string; size: number }) => request<ImportRecord>('/api/imports', { method: 'POST', body: JSON.stringify(input) }),
  listImports: () => request<ImportRecord[]>('/api/imports'),
  reviewImport: (id: string) => request<ImportRecord>(`/api/imports/${id}/review`, { method: 'POST', body: JSON.stringify({}) }),
  continueImport: (id: string) => request<ImportRecord>(`/api/imports/${id}/continue`, { method: 'POST', body: JSON.stringify({}) }),
  listDeployProviders: () => request<DeployProvider[]>('/api/deploy/providers'),
  createDeploy: (providerId: string) => request('/api/deploy/mock', { method: 'POST', body: JSON.stringify({ providerId }) }),
}
