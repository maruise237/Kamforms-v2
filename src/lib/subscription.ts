import type { User } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type SubscriptionPlan = 'free' | 'pro' | 'business'
type BillingPeriod = 'monthly' | 'annual' | null

export type PlanLimits = {
  activeForms: number
  whatsappNotifications: number
  collaborators: number
  analytics: 'standard' | 'advanced'
}

export type EffectiveSubscription = {
  plan: SubscriptionPlan
  status: string
  billingPeriod: BillingPeriod
  billingPlanId: string | null
  expiresAt: Date | null
  isPaidActive: boolean
  isExpired: boolean
  limits: PlanLimits
}

export const USAGE_TYPES = {
  whatsappNotification: 'whatsapp_notification',
} as const

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    activeForms: 1,
    whatsappNotifications: 100,
    collaborators: 0,
    analytics: 'standard',
  },
  pro: {
    activeForms: 5,
    whatsappNotifications: 1_000,
    collaborators: 5,
    analytics: 'standard',
  },
  business: {
    activeForms: 20,
    whatsappNotifications: 10_000,
    collaborators: 20,
    analytics: 'advanced',
  },
}

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: 'Gratuit',
  pro: 'Pro',
  business: 'Business',
}

export function getPlanLabel(plan: SubscriptionPlan) {
  return PLAN_LABELS[plan]
}

export function getMonthlyUsageWindow(date = new Date()) {
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
  }
}

function getEffectiveSubscription(user: Pick<User,
  'plan' | 'billingStatus' | 'billingPeriod' | 'billingPlanId' | 'planExpiresAt'
>): EffectiveSubscription {
  const now = new Date()
  const storedPlan = user.plan === 'pro' || user.plan === 'business' ? user.plan : 'free'
  const isPaidPlan = storedPlan === 'pro' || storedPlan === 'business'
  const isExpired = Boolean(user.planExpiresAt && user.planExpiresAt <= now)
  const isPaidActive = isPaidPlan && user.billingStatus === 'active' && !isExpired
  const plan: SubscriptionPlan = isPaidActive ? storedPlan : 'free'

  return {
    plan,
    status: isExpired && isPaidPlan ? 'expired' : user.billingStatus,
    billingPeriod: user.billingPeriod === 'monthly' || user.billingPeriod === 'annual'
      ? user.billingPeriod
      : null,
    billingPlanId: isPaidActive ? user.billingPlanId : null,
    expiresAt: user.planExpiresAt,
    isPaidActive,
    isExpired,
    limits: PLAN_LIMITS[plan],
  }
}

export async function normalizeExpiredSubscription(userId: string) {
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  })
  const subscription = getEffectiveSubscription(user)

  if (subscription.isExpired && user.plan !== 'free') {
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: 'free',
        billingStatus: 'expired',
        billingPeriod: null,
        billingPlanId: null,
      },
    })

    await enforceActiveFormLimit(userId, PLAN_LIMITS.free.activeForms)

    return {
      ...subscription,
      plan: 'free' as const,
      status: 'expired',
      billingPeriod: null,
      billingPlanId: null,
      isPaidActive: false,
      limits: PLAN_LIMITS.free,
    }
  }

  return subscription
}

export async function enforceActiveFormLimit(userId: string, limit: number) {
  const activeForms = await prisma.form.findMany({
    where: { userId, active: true },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })

  if (activeForms.length <= limit) return 0

  const formsToDisable = activeForms.slice(limit)
  await prisma.form.updateMany({
    where: { id: { in: formsToDisable.map(form => form.id) } },
    data: { active: false },
  })

  return formsToDisable.length
}

export async function getSubscriptionUsage(userId: string) {
  const subscription = await normalizeExpiredSubscription(userId)
  const { start, end } = getMonthlyUsageWindow()

  const [activeForms, whatsappNotifications, delegatedForms] = await Promise.all([
    prisma.form.count({ where: { userId, active: true } }),
    prisma.usageEvent.aggregate({
      where: {
        userId,
        type: USAGE_TYPES.whatsappNotification,
        createdAt: { gte: start, lt: end },
      },
      _sum: { quantity: true },
    }),
    prisma.form.findMany({
      where: {
        userId,
        OR: [
          { assignedWhatsapp: { not: null } },
          { assignedEmail: { not: null } },
        ],
      },
      select: { assignedWhatsapp: true, assignedEmail: true },
    }),
  ])

  const collaborators = new Set<string>()
  for (const form of delegatedForms) {
    if (form.assignedWhatsapp) collaborators.add(`whatsapp:${form.assignedWhatsapp}`)
    if (form.assignedEmail) collaborators.add(`email:${form.assignedEmail}`)
  }

  return {
    subscription,
    usage: {
      activeForms,
      whatsappNotifications: whatsappNotifications._sum.quantity ?? 0,
      collaborators: collaborators.size,
    },
    period: { start, end },
  }
}
