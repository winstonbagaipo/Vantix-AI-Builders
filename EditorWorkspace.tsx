import * as Tabs from '@radix-ui/react-tabs'
import { Bot, CheckCircle2, Code2, FileCode2, FolderTree, PlugZap, ShieldCheck, TerminalSquare, Wrench, BrainCircuit, UploadCloud, Coins } from 'lucide-react'
import type { CreditAccount, DeployProvider, DevTool, ImportRecord, Plugin, ProSkill, Skill, Suggestion, TabId } from '../types'
import PluginsPanel from './PluginsPanel'
import DevToolsPanel from './DevToolsPanel'
import ProSkillsPanel from './ProSkillsPanel'
import ImportDeployPanel from './ImportDeployPanel'

type Props = {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  selected: Suggestion
  prompt: string
  skills: Skill[]
  plugins: Plugin[]
  devTools: DevTool[]
  proSkills: ProSkill[]
  imports: ImportRecord[]
  deployProviders: DeployProvider[]
  credits: CreditAccount | null
  onImportUpload: (files: FileList) => void
  onImportReview: (id: string) => void
  onImportContinue: (id: string) => void
  onDeploy: (id: string) => void
  onPluginToggle: (id: string) => void
  onDevToolToggle: (id: string) => void
  isGenerating: boolean
  generationStatus: 'idle' | 'running' | 'success'
  terminalLogs: string[]
  buildVersion: number
  fileTree: string[]
}

const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: 'preview', label: 'Live Preview', icon: Bot },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'files', label: 'File Explorer', icon: FolderTree },
  { id: 'console', label: 'Terminal', icon: TerminalSquare },
  { id: 'plugins', label: 'Plugins', icon: PlugZap },
  { id: 'devtools', label: 'Dev Tools', icon: Wrench },
  { id: 'proskills', label: 'Pro Skills', icon: BrainCircuit },
  { id: 'importdeploy', label: 'Import & Deploy', icon: UploadCloud },
]

function makeCode(selected: Suggestion, skills: Skill[], plugins: Plugin[], devTools: DevTool[], proSkills: ProSkill[], imports: ImportRecord[], generationStatus: Props['generationStatus'], buildVersion: number) {
  return `export default function ${selected.template.replace(/\W/g, '')}() {
  const vantixCore = {
    brand: 'Vantix AI Builders',
    mode: 'GOD_MODE',
    status: '${generationStatus}',
    buildVersion: ${buildVersion},
    autoPreview: true,
    creditsEnabled: true,
    imports: ${JSON.stringify(imports.map((item) => item.filename), null, 2)},
    skills: ${JSON.stringify(skills.map((skill) => skill.name), null, 2)},
    plugins: ${JSON.stringify(plugins.filter((p) => p.status === 'connected').map((p) => p.name), null, 2)},
    devTools: ${JSON.stringify(devTools.filter((tool) => tool.status === 'enabled').map((tool) => tool.name), null, 2)},
    proSkills: ${JSON.stringify(proSkills.map((skill) => skill.name), null, 2)},
  }

  return <CommandCenter core={vantixCore} />
}`
}

function fallbackFileTree(selected: Suggestion, plugins: Plugin[], devTools: DevTool[], proSkills: ProSkill[], imports: ImportRecord[], deployProviders: DeployProvider[], generationStatus: Props['generationStatus'], buildVersion: number) {
  return [
    `vantix-ai-builders/ # Local fallback memory v${buildVersion}`,
    '├── import-center/',
    ...(imports.length ? imports.map((item) => `│   ├── ${item.filename} # ${item.status}`) : ['│   └── no-imports-yet.placeholder']),
    '├── deployment-center/',
    ...deployProviders.map((provider) => `│   ├── ${provider.id}.deploy.ts # ${provider.status}`),
    '├── generated-app/',
    `│   ├── ${selected.id}-preview.tsx`,
    `│   ├── ${selected.id}-routes.ts`,
    `│   └── ${selected.id}-schema.sql`,
    '├── ai-pro-skills/',
    ...proSkills.map((skill) => `│   ├── ${skill.id}.skill.ts # ${skill.level}`),
    '├── dev-tools/',
    ...devTools.filter((tool) => tool.status === 'enabled').map((tool) => `│   ├── ${tool.id}.tool.ts`),
    '├── plugins/',
    ...plugins.filter((plugin) => plugin.status === 'connected').map((plugin) => `│   ├── ${plugin.id}.plugin.ts`),
    '└── memory/',
    '    ├── imported-projects.memory.json',
    '    ├── credits.memory.json',
    '    ├── auto-preview.memory.json',
    '    └── version-history.json',
    '',
    `status: ${generationStatus}`,
  ]
}

function PreviewPanel(props: Pick<Props, 'selected' | 'skills' | 'plugins' | 'devTools' | 'proSkills' | 'imports' | 'credits' | 'generationStatus' | 'buildVersion'>) {
  const { selected, skills, plugins, devTools, proSkills, imports, credits, generationStatus, buildVersion } = props
  const connected = plugins.filter((plugin) => plugin.status === 'connected')
  const enabledTools = devTools.filter((tool) => tool.status === 'enabled')
  return (
    <div className="preview-stage">
      <div className="mock-app-shell">
        <div className="mock-sidebar"><strong>Advantix</strong>{['Dashboard', 'AI Chat', 'Builder Studio', 'Import Center', 'Credits', 'Live Preview', 'Deploy'].map((item) => <span key={item}>{item}</span>)}</div>
        <div className="mock-main">
          <div className="mock-topbar"><div><small>AI APP BUILDER : GOD MODE</small><h3>{generationStatus === 'success' ? `${selected.title} ready` : selected.title}</h3></div><span className="status-pill">{generationStatus === 'running' ? 'Executing' : generationStatus === 'success' ? 'Auto Preview' : 'Autonomous'}</span></div>
          <div className="god-flow">{['Prompt', 'Import', 'Think', 'Build', 'Fix', 'Preview', 'Deploy'].map((step) => <b key={step}>{step}</b>)}</div>
          <div className="mock-grid">
            <article><Coins /><span>Credits</span><strong>{credits ? `${credits.credits} remaining` : 'Loading'}</strong></article>
            <article><UploadCloud /><span>Imports</span><strong>{imports.length} files/context</strong></article>
            <article><FileCode2 /><span>Dev Tools</span><strong>{enabledTools.length} tools enabled</strong></article>
          </div>
          {generationStatus === 'success' && <div className="success-banner"><CheckCircle2 size={18} /> Build v{buildVersion} generated successfully. Auto-preview opened with imported context and updated credit balance.</div>}
          <div className="tag-cloud">{skills.map((skill) => <span key={skill.id}>{skill.name}</span>)}{connected.map((plugin) => <span key={plugin.id}>{plugin.name}</span>)}{enabledTools.slice(0, 5).map((tool) => <span key={tool.id}>{tool.name}</span>)}{proSkills.slice(0, 5).map((skill) => <span key={skill.id}>{skill.name}</span>)}</div>
        </div>
      </div>
    </div>
  )
}

export default function EditorWorkspace(props: Props) {
  const { activeTab, setActiveTab, selected, prompt, skills, plugins, devTools, proSkills, imports, deployProviders, credits, onImportUpload, onImportReview, onImportContinue, onDeploy, onPluginToggle, onDevToolToggle, isGenerating, generationStatus, terminalLogs, buildVersion, fileTree } = props
  const visibleFileTree = fileTree.length ? fileTree : fallbackFileTree(selected, plugins, devTools, proSkills, imports, deployProviders, generationStatus, buildVersion)
  return (
    <section className="glass editor-card">
      <div className="section-heading"><div><span>Command Center</span><h2>Prompt → Import → Build → Fix → Auto Preview → Deploy</h2></div><span className="mode-badge">{isGenerating ? 'EXECUTING' : credits ? `${credits.credits} CREDITS` : 'GOD MODE'}</span></div>
      <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as TabId)}>
        <Tabs.List className="tab-list" aria-label="Vantix AI Builder workspace tabs">{tabs.map((tab) => { const Icon = tab.icon; return <Tabs.Trigger key={tab.id} value={tab.id} className="tab-trigger"><Icon size={16} /> {tab.label}</Tabs.Trigger> })}</Tabs.List>
        <Tabs.Content value="preview" className="tab-content"><PreviewPanel selected={selected} skills={skills} plugins={plugins} devTools={devTools} proSkills={proSkills} imports={imports} credits={credits} generationStatus={generationStatus} buildVersion={buildVersion} /></Tabs.Content>
        <Tabs.Content value="code" className="tab-content"><pre className="code-block">{makeCode(selected, skills, plugins, devTools, proSkills, imports, generationStatus, buildVersion)}</pre></Tabs.Content>
        <Tabs.Content value="files" className="tab-content"><pre className="code-block tree">{visibleFileTree.join('\n')}</pre></Tabs.Content>
        <Tabs.Content value="console" className="tab-content"><div className="console-block">{terminalLogs.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}<p className="prompt-line">Current prompt: {prompt}</p></div></Tabs.Content>
        <Tabs.Content value="plugins" className="tab-content"><PluginsPanel plugins={plugins} onToggle={onPluginToggle} /></Tabs.Content>
        <Tabs.Content value="devtools" className="tab-content"><DevToolsPanel tools={devTools} onToggle={onDevToolToggle} /></Tabs.Content>
        <Tabs.Content value="proskills" className="tab-content"><ProSkillsPanel skills={proSkills} /></Tabs.Content>
        <Tabs.Content value="importdeploy" className="tab-content"><ImportDeployPanel imports={imports} providers={deployProviders} onUpload={onImportUpload} onReview={onImportReview} onContinue={onImportContinue} onDeploy={onDeploy} /></Tabs.Content>
      </Tabs.Root>
    </section>
  )
}
