import { Code2, Database, KeyRound, CreditCard, Brain, Bug, Rocket, ShieldCheck, Search, Smartphone, Palette, Server, Activity, Wrench } from 'lucide-react'
import type { DevTool } from '../types'

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  frontend: Code2,
  backend: Server,
  database: Database,
  auth: KeyRound,
  payments: CreditCard,
  ai: Brain,
  testing: Bug,
  debugging: Wrench,
  devops: Rocket,
  monitoring: Activity,
  security: ShieldCheck,
  seo: Search,
  mobile: Smartphone,
  design: Palette,
  deployment: Rocket,
}

type Props = {
  tools: DevTool[]
  onToggle: (id: string) => void
  compact?: boolean
}

export default function DevToolsPanel({ tools, onToggle, compact = false }: Props) {
  const grouped = tools.reduce<Record<string, DevTool[]>>((acc, tool) => {
    acc[tool.category] = acc[tool.category] || []
    acc[tool.category].push(tool)
    return acc
  }, {})

  return (
    <section className={`devtools-panel ${compact ? 'compact' : ''}`}>
      {Object.entries(grouped).map(([category, categoryTools]) => {
        const Icon = iconMap[category] ?? Wrench
        return (
          <div key={category} className="devtool-category">
            <div className="devtool-category-title"><Icon size={17} /> {category}</div>
            <div className="devtool-grid">
              {categoryTools.map((tool) => (
                <article key={tool.id} className={`devtool-card ${tool.status}`}>
                  <div className="devtool-topline">
                    <strong>{tool.name}</strong>
                    <span>{tool.status}</span>
                  </div>
                  <p>{tool.description}</p>
                  <small>{tool.godModeUse}</small>
                  <button disabled={tool.status === 'locked'} onClick={() => onToggle(tool.id)}>
                    {tool.status === 'enabled' ? 'Enabled' : tool.status === 'locked' ? 'Locked' : 'Enable'}
                  </button>
                </article>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
