export type TabId = 'preview' | 'code' | 'files' | 'console' | 'plugins' | 'devtools' | 'proskills' | 'importdeploy'

export type Suggestion = {
  id: string
  title: string
  prompt: string
  template: string
  accent: string
}

export type Skill = {
  id: string
  name: string
  description: string
  enabled: boolean
}

export type Plugin = {
  id: string
  name: string
  description: string
  status: 'connected' | 'available' | 'disabled'
}

export type DevTool = {
  id: string
  name: string
  category: string
  description: string
  status: 'enabled' | 'available' | 'locked'
  configRequired: boolean
  godModeUse: string
}

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
  category: string
  status: 'configured' | 'available' | 'missing_credentials'
  requiredEnv: string[]
  description: string
}
