export type BillingProvider = 'stripe' | 'paypal'

export type SubscriptionPlan = {
  id: string
  name: string
  priceMonthly: number
  currency: 'USD'
  features: string[]
  active: boolean
}

export type BillingSettings = {
  mode: 'test' | 'live'
  provider: BillingProvider
  accountStatus: 'not_connected' | 'test_connected' | 'live_connected'
  webhookStatus: 'not_configured' | 'configured' | 'verified'
  publicCheckoutEnabled: boolean
  adminOnly: true
  plans: SubscriptionPlan[]
  notes: string[]
}

const billingSettings: BillingSettings = {
  mode: 'test',
  provider: 'stripe',
  accountStatus: process.env.STRIPE_SECRET_KEY ? 'test_connected' : 'not_connected',
  webhookStatus: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'not_configured',
  publicCheckoutEnabled: false,
  adminOnly: true,
  plans: [
    { id: 'starter', name: 'Starter Builder', priceMonthly: 19, currency: 'USD', active: true, features: ['10 projects', 'Mock AI builder', 'Export code', 'Basic plugins'] },
    { id: 'pro', name: 'Pro Builder', priceMonthly: 49, currency: 'USD', active: true, features: ['Unlimited projects', 'AI Gateway', 'Dev Tools suite', 'Admin dashboard'] },
    { id: 'enterprise', name: 'Enterprise God Mode', priceMonthly: 199, currency: 'USD', active: true, features: ['Team controls', 'Private deployment', 'Advanced security', 'Priority workflows'] }
  ],
  notes: [
    'Billing controls are admin-only and not exposed in the public builder UI.',
    'Use .env for real payment provider secrets. Never commit secret keys.',
    'Checkout/session creation is stubbed until real Stripe or PayPal keys are configured.'
  ]
}

export function getBillingSettings() {
  return billingSettings
}

export function updateBillingSettings(patch: Partial<BillingSettings>) {
  Object.assign(billingSettings, {
    ...patch,
    adminOnly: true,
    publicCheckoutEnabled: false
  })
  return billingSettings
}

export function getBillingProviderStatus() {
  return {
    stripe: {
      configured: Boolean(process.env.STRIPE_SECRET_KEY),
      publishableConfigured: Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
      webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET)
    },
    paypal: {
      configured: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
      webhookConfigured: Boolean(process.env.PAYPAL_WEBHOOK_ID)
    }
  }
}

export function createMockCheckoutSession(planId: string) {
  const plan = billingSettings.plans.find((item) => item.id === planId)
  if (!plan) throw new Error('Plan not found')
  return {
    id: `mock_checkout_${planId}_${Date.now()}`,
    plan,
    provider: billingSettings.provider,
    mode: billingSettings.mode,
    status: 'created_mock_session',
    adminOnly: true,
    message: 'Mock checkout session created. Connect real Stripe/PayPal keys to enable production checkout.'
  }
}
