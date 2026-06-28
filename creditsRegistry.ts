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

const now = () => new Date().toISOString()

const accounts = new Map<string, CreditAccount>()
const transactions: CreditTransaction[] = []

const planCredits: Record<CreditAccount['plan'], number> = {
  free: 200,
  starter: 1000,
  pro: 5000,
  enterprise: 25000,
}

export function getOrCreateCreditAccount(userId = 'demo-user') {
  const existing = accounts.get(userId)
  if (existing) return existing

  const account: CreditAccount = {
    userId,
    plan: 'free',
    subscribed: false,
    credits: 200,
    monthlyCredits: 200,
    usedCredits: 0,
    createdAt: now(),
    updatedAt: now(),
  }

  accounts.set(userId, account)
  transactions.unshift({
    id: `credit_${Date.now()}`,
    userId,
    type: 'grant',
    amount: 200,
    reason: 'New non-subscribed user welcome credits',
    createdAt: now(),
  })
  return account
}

export function useCredits(input: { userId?: string; amount: number; reason: string }) {
  const userId = input.userId ?? 'demo-user'
  const account = getOrCreateCreditAccount(userId)
  if (account.credits < input.amount) {
    return { ok: false, account, error: 'Not enough credits. Upgrade subscription or add credits.' }
  }

  account.credits -= input.amount
  account.usedCredits += input.amount
  account.updatedAt = now()
  transactions.unshift({ id: `credit_${Date.now()}`, userId, type: 'usage', amount: -input.amount, reason: input.reason, createdAt: now() })
  return { ok: true, account }
}

export function adjustSubscription(input: { userId?: string; plan: CreditAccount['plan']; subscribed: boolean }) {
  const userId = input.userId ?? 'demo-user'
  const account = getOrCreateCreditAccount(userId)
  account.plan = input.plan
  account.subscribed = input.subscribed
  account.monthlyCredits = planCredits[input.plan]
  account.credits = input.subscribed ? planCredits[input.plan] : Math.max(account.credits, 200)
  account.updatedAt = now()
  transactions.unshift({ id: `credit_${Date.now()}`, userId, type: 'subscription_reset', amount: account.credits, reason: `Subscription adjusted to ${input.plan}`, createdAt: now() })
  return account
}

export function addCredits(input: { userId?: string; amount: number; reason: string }) {
  const userId = input.userId ?? 'demo-user'
  const account = getOrCreateCreditAccount(userId)
  account.credits += input.amount
  account.updatedAt = now()
  transactions.unshift({ id: `credit_${Date.now()}`, userId, type: 'admin_adjustment', amount: input.amount, reason: input.reason, createdAt: now() })
  return account
}

export function listCreditTransactions(userId = 'demo-user') {
  return transactions.filter((transaction) => transaction.userId === userId)
}

export function estimateBuildCredits(kind: 'quick' | 'standard' | 'god-mode' = 'standard') {
  if (kind === 'quick') return 10
  if (kind === 'god-mode') return 50
  return 25
}
