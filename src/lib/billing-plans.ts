export const BILLING_PLANS = {
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro mensuel',
    plan: 'pro',
    billing: 'monthly',
    amount: 3900,
    displayPrice: '3 900 FCFA/mois',
    description: 'Kamforms Pro mensuel - 5 formulaires actifs',
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro annuel',
    plan: 'pro',
    billing: 'annual',
    amount: 39000,
    displayPrice: '39 000 FCFA/an',
    description: 'Kamforms Pro annuel - 2 mois offerts',
  },
  business_monthly: {
    id: 'business_monthly',
    name: 'Business mensuel',
    plan: 'business',
    billing: 'monthly',
    amount: 29000,
    displayPrice: '29 000 FCFA/mois',
    description: 'Kamforms Business mensuel - 20 formulaires actifs',
  },
  business_annual: {
    id: 'business_annual',
    name: 'Business annuel',
    plan: 'business',
    billing: 'annual',
    amount: 290000,
    displayPrice: '290 000 FCFA/an',
    description: 'Kamforms Business annuel - 2 mois offerts',
  },
} as const

type BillingPlanId = keyof typeof BILLING_PLANS

export function getBillingPlan(planId: string) {
  return BILLING_PLANS[planId as BillingPlanId]
}
