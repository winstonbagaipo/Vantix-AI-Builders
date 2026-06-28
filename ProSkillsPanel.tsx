import { BrainCircuit, CheckCircle2 } from 'lucide-react'

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

type Props = {
  skills: ProSkill[]
  compact?: boolean
}

export default function ProSkillsPanel({ skills, compact = false }: Props) {
  const grouped = skills.reduce<Record<string, ProSkill[]>>((acc, skill) => {
    acc[skill.category] = acc[skill.category] || []
    acc[skill.category].push(skill)
    return acc
  }, {})

  return (
    <section className={`proskills-panel ${compact ? 'compact' : ''}`}>
      {Object.entries(grouped).map(([category, categorySkills]) => (
        <div key={category} className="proskill-category">
          <div className="devtool-category-title"><BrainCircuit size={17} /> {category}</div>
          <div className="devtool-grid">
            {categorySkills.map((skill) => (
              <article key={skill.id} className={`devtool-card enabled proskill-card ${skill.level}`}>
                <div className="devtool-topline">
                  <strong>{skill.name}</strong>
                  <span>{skill.level}</span>
                </div>
                <p>{skill.description}</p>
                <small>{skill.buildOutputs.join(' · ')}</small>
                <div className="proskill-checklist">
                  {skill.checklist.slice(0, 5).map((item) => (
                    <em key={item}><CheckCircle2 size={12} /> {item}</em>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
