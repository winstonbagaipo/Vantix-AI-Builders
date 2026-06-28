import { useEffect, useMemo, useState } from 'react'
import { Activity, Bot, CreditCard, Cpu, Database, Lock, PlugZap, Settings, ShieldAlert, ShieldCheck, TerminalSquare, Users, Wrench } from 'lucide-react'
import type { DevTool } from '../types'
import DevToolsPanel from '../components/DevToolsPanel'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
const demoEmail = 'admin@advantix.ai'
const demoPassword = 'godmode'
const demoPin = '000000'

type AdminStats = { users: number; projects: number; activeJobs: number; failedJobs: number; connectedPlugins: number; uptime: string; apiStatus: 'online' | 'degraded' | 'offline'; enabledDevTools?: number; proSkills?: number; billingProviderConfigured?: boolean }
type AdminJob = { id: string; prompt: string; status: string; agent: string; createdAt: string }
type SecurityEvent = { id: string; level: 'info' | 'warning' | 'critical'; message: string; timestamp: string }
type BillingPlan = { id: string; name: string; priceMonthly: number; currency: string; features: string[]; active: boolean }
type BillingState = { settings: { mode: 'test' | 'live'; provider: 'stripe' | 'paypal'; accountStatus: string; webhookStatus: string; publicCheckoutEnabled: boolean; adminOnly: true; plans: BillingPlan[]; notes: string[] }; providers: Record<string, Record<string, boolean>> }

async function fetchAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init })
  if (!response.ok) throw new Error(`Admin API failed: ${response.status}`)
  return response.json()
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState(demoEmail)
  const [password, setPassword] = useState(demoPassword)
  const [pin, setPin] = useState(demoPin)
  const [error, setError] = useState('')
  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (email === demoEmail && password === demoPassword && pin === demoPin) {
      sessionStorage.setItem('advantix-admin-session', 'mock-secure-session')
      onLogin()
      return
    }
    setError('Invalid admin credentials. Use the demo credentials shown below.')
  }
  return <main className="admin-login-shell"><form className="glass admin-login-card" onSubmit={submit}><div className="admin-brand-lock"><Lock size={22} /> Secure Host Page</div><h1>Vantix Admin Command Center</h1><p>Protected operator dashboard for God Mode generation, project memory, security, plugins, dev tools, private billing, deployments, and system health.</p><label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label>Admin PIN<input value={pin} onChange={(event) => setPin(event.target.value)} /></label>{error && <div className="admin-error">{error}</div>}<button className="primary-btn" type="submit"><ShieldCheck size={18} /> Unlock Dashboard</button><div className="demo-creds"><strong>Demo access</strong><span>{demoEmail}</span><span>Password: {demoPassword}</span><span>PIN: {demoPin}</span></div></form></main>
}

function StatCard({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string | number; hint: string }) {
  return <article className="admin-stat-card glass"><Icon size={22} /><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>
}

function BillingPanel({ billing, reload }: { billing: BillingState | null; reload: () => void }) {
  const [checkoutMessage, setCheckoutMessage] = useState('')
  async function createSession(planId: string) {
    const session = await fetchAdmin<{ message: string; id: string }>('/api/admin/billing/checkout-session', { method: 'POST', body: JSON.stringify({ planId }) })
    setCheckoutMessage(`${session.id}: ${session.message}`)
  }
  async function setMode(mode: 'test' | 'live') {
    await fetchAdmin('/api/admin/billing', { method: 'PATCH', body: JSON.stringify({ mode }) })
    reload()
  }
  if (!billing) return <section className="glass admin-panel">Loading private billing controls...</section>
  return <section className="glass admin-panel"><div className="admin-panel-heading"><CreditCard /><h2>Billing & Subscriptions</h2></div><div className="settings-grid"><div className="setting-line"><span>Visibility</span><strong>Admin-only, hidden from public builder frontend</strong></div><div className="setting-line"><span>Provider</span><strong>{billing.settings.provider}</strong></div><div className="setting-line"><span>Mode</span><strong>{billing.settings.mode}</strong></div><div className="setting-line"><span>Account Status</span><strong>{billing.settings.accountStatus}</strong></div><div className="setting-line"><span>Webhook Status</span><strong>{billing.settings.webhookStatus}</strong></div><div className="setting-line"><span>Public Checkout</span><strong>{String(billing.settings.publicCheckoutEnabled)}</strong></div></div><div className="action-row"><button className="secondary-btn" onClick={() => setMode('test')}>Use Test Mode</button><button className="secondary-btn" onClick={() => setMode('live')}>Use Live Mode</button></div><div className="admin-grid-two">{billing.settings.plans.map((plan) => <article className="plugin-card connected" key={plan.id}><div className="plugin-topline"><strong>{plan.name}</strong><span>${plan.priceMonthly}/mo</span></div><p>{plan.features.join(' · ')}</p><button onClick={() => createSession(plan.id)}>Create Mock Checkout</button></article>)}</div>{checkoutMessage && <div className="success-banner"><ShieldCheck size={18} /> {checkoutMessage}</div>}<div className="security-list">{billing.settings.notes.map((note) => <article className="security-event info" key={note}><strong>note</strong><span>{note}</span></article>)}</div></section>
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [security, setSecurity] = useState<SecurityEvent[]>([])
  const [devTools, setDevTools] = useState<DevTool[]>([])
  const [billing, setBilling] = useState<BillingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('Overview')

  async function loadAdmin() {
    try {
      const [statsData, jobsData, securityData, toolsData, billingData] = await Promise.all([fetchAdmin<AdminStats>('/api/admin/stats'), fetchAdmin<AdminJob[]>('/api/admin/jobs'), fetchAdmin<SecurityEvent[]>('/api/admin/security-events'), fetchAdmin<DevTool[]>('/api/devtools'), fetchAdmin<BillingState>('/api/admin/billing')])
      setStats(statsData); setJobs(jobsData); setSecurity(securityData); setDevTools(toolsData); setBilling(billingData); setLoading(false)
    } catch {
      setStats({ users: 1, projects: 1, activeJobs: 0, failedJobs: 0, connectedPlugins: 3, uptime: 'local fallback', apiStatus: 'degraded', billingProviderConfigured: false })
      setJobs([]); setSecurity([{ id: 'fallback', level: 'warning', message: 'Admin API unavailable. Showing local fallback state.', timestamp: new Date().toISOString() }]); setLoading(false)
    }
  }
  useEffect(() => { loadAdmin() }, [])
  async function toggleDevTool(id: string) {
    setDevTools((current) => current.map((tool) => tool.id === id && tool.status !== 'locked' ? { ...tool, status: tool.status === 'enabled' ? 'available' : 'enabled' } : tool))
    try { const updated = await fetchAdmin<DevTool>(`/api/devtools/${id}/toggle`, { method: 'POST', body: JSON.stringify({}) }); setDevTools((current) => current.map((tool) => tool.id === id ? updated : tool)) } catch { await loadAdmin() }
  }
  const nav = ['Overview', 'AI Jobs', 'Project Memory', 'Plugin Tools', 'Dev Tools', 'Billing & Subscriptions', 'Model Gateway', 'Security Center', 'Deployments', 'Settings']
  const healthScore = useMemo(() => stats ? Math.max(72, 100 - stats.failedJobs * 8) : 0, [stats])
  const enabledToolCount = devTools.filter((tool) => tool.status === 'enabled').length
  return <main className="admin-shell"><aside className="glass admin-sidebar"><div className="admin-logo"><Cpu /> <strong>Vantix Admin</strong><span>God Mode Control</span></div><nav>{nav.map((item) => <button key={item} className={activeSection === item ? 'active' : ''} onClick={() => setActiveSection(item)}>{item}</button>)}</nav><button className="secondary-btn" onClick={onLogout}>Logout</button></aside><section className="admin-main"><header className="glass admin-topbar"><div><span>Secure host page</span><h1>{activeSection}</h1></div><div className="admin-status"><ShieldCheck size={18} /> {stats?.apiStatus ?? 'checking'} · Health {healthScore}%</div></header>{loading ? <section className="glass admin-panel">Loading secure admin telemetry...</section> : <><section className="admin-stats-grid"><StatCard icon={Users} label="Users" value={stats?.users ?? 0} hint="Admin + team seats" /><StatCard icon={Database} label="Projects" value={stats?.projects ?? 0} hint="Project memory records" /><StatCard icon={Bot} label="Active Jobs" value={stats?.activeJobs ?? 0} hint="Generation queue" /><StatCard icon={PlugZap} label="Plugins" value={stats?.connectedPlugins ?? 0} hint="Connected tools" /><StatCard icon={Wrench} label="Dev Tools" value={enabledToolCount} hint="Enabled build tools" /><StatCard icon={CreditCard} label="Billing" value={stats?.billingProviderConfigured ? 'Connected' : 'Setup'} hint="Admin-only payments" /><StatCard icon={Activity} label="Uptime" value={stats?.uptime ?? 'n/a'} hint="Backend API" /></section>{activeSection === 'Dev Tools' ? <section className="glass admin-panel"><div className="admin-panel-heading"><Wrench /><h2>Developer Tools Registry</h2></div><DevToolsPanel tools={devTools} onToggle={toggleDevTool} /></section> : activeSection === 'Billing & Subscriptions' ? <BillingPanel billing={billing} reload={loadAdmin} /> : <><section className="admin-grid-two"><div className="glass admin-panel"><div className="admin-panel-heading"><TerminalSquare /><h2>AI Job Logs</h2></div><div className="admin-table">{jobs.map((job) => <div key={job.id} className="admin-row"><span>{job.agent}</span><strong>{job.status}</strong><small>{job.prompt}</small></div>)}</div></div><div className="glass admin-panel"><div className="admin-panel-heading"><ShieldCheck /><h2>Security Center</h2></div><div className="security-list">{security.map((event) => <article key={event.id} className={`security-event ${event.level}`}><strong>{event.level}</strong><span>{event.message}</span><small>{new Date(event.timestamp).toLocaleString()}</small></article>)}</div></div></section><section className="glass admin-panel settings-grid"><div className="admin-panel-heading"><Settings /><h2>Complete Detailed Settings</h2></div>{[['AI Router', 'Planner → UI Generator → Code Generator → Validator → Security → Deploy'], ['Private Billing', 'Admin-only Stripe/PayPal config, hidden from public frontend'], ['Dev Tools', `${enabledToolCount} enabled across build pipeline`], ['Model Gateway', 'OpenAI, Claude, Grok, Ollama, mock fallback'], ['Project Memory', 'Components, pages, database, plugins, dev tools, billing, history'], ['Secure Hosting', 'CORS, admin gate, audit events, environment checks']].map(([label, value]) => <div key={label} className="setting-line"><span>{label}</span><strong>{value}</strong></div>)}</section></>}</>}</section></main>
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('advantix-admin-session') === 'mock-secure-session')
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />
  return <AdminDashboard onLogout={() => { sessionStorage.removeItem('advantix-admin-session'); setAuthed(false) }} />
}
