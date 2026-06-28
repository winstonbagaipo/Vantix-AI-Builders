import { UploadCloud, FileArchive, Image, Github, Rocket, Globe2 } from 'lucide-react'

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

type Props = {
  imports: ImportRecord[]
  providers: DeployProvider[]
  onUpload: (files: FileList) => void
  onReview: (id: string) => void
  onContinue: (id: string) => void
  onDeploy: (id: string) => void
}

const deployIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  vercel: Rocket,
  netlify: Globe2,
  github: Github,
}

export default function ImportDeployPanel({ imports, providers, onUpload, onReview, onContinue, onDeploy }: Props) {
  return (
    <section className="import-deploy-panel">
      <div className="admin-grid-two">
        <div className="glass admin-panel">
          <div className="admin-panel-heading"><UploadCloud /><h2>Import Center</h2></div>
          <p className="hero-copy">Upload project ZIPs, source files, screenshots, images, or exports from other AI builders. The backend records and reviews them so God Mode can continue unfinished builds.</p>
          <label className="upload-zone">
            <UploadCloud size={34} />
            <strong>Select files from your computer</strong>
            <span>ZIP, images, source files, docs</span>
            <input multiple type="file" accept=".zip,.png,.jpg,.jpeg,.webp,.svg,.tsx,.ts,.js,.jsx,.json,.css,.html,.md,.txt" onChange={(event) => event.target.files && onUpload(event.target.files)} />
          </label>
          <div className="security-list">
            {imports.map((item) => (
              <article className="security-event info" key={item.id}>
                <strong>{item.kind === 'zip' ? <FileArchive size={14} /> : item.kind === 'image' ? <Image size={14} /> : 'file'} {item.filename}</strong>
                <span>{item.summary}</span>
                <small>{item.status} · {(item.size / 1024).toFixed(1)} KB</small>
                <div className="action-row"><button className="secondary-btn" onClick={() => onReview(item.id)}>Review</button><button className="primary-btn" onClick={() => onContinue(item.id)}>Continue Build</button></div>
              </article>
            ))}
            {!imports.length && <article className="security-event warning"><strong>No imports yet</strong><span>Upload a ZIP or image to create project context.</span></article>}
          </div>
        </div>
        <div className="glass admin-panel">
          <div className="admin-panel-heading"><Rocket /><h2>Deployment Center</h2></div>
          <p className="hero-copy">Configure deploy targets. Credentials stay server-side through environment variables and are never exposed in the public frontend.</p>
          <div className="plugin-grid">
            {providers.filter((p) => ['vercel', 'netlify', 'github'].includes(p.id)).map((provider) => {
              const Icon = deployIcons[provider.id] ?? Rocket
              return (
                <article className={`plugin-card ${provider.status === 'configured' ? 'connected' : ''}`} key={provider.id}>
                  <div className="plugin-topline"><Icon size={19} /><span>{provider.status}</span></div>
                  <strong>{provider.name}</strong>
                  <p>{provider.description}</p>
                  <small>Env: {provider.requiredEnv.join(', ')}</small>
                  <button onClick={() => onDeploy(provider.id)}>{provider.status === 'configured' ? 'Prepare Deploy' : 'Show Required Env'}</button>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
