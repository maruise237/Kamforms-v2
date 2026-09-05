import 'server-only'

import { BILLING_PLANS, getBillingPlan } from '@/lib/billing-plans'
import { prisma } from '@/lib/prisma'
import { getMonthlyUsageWindow, PLAN_LIMITS, USAGE_TYPES } from '@/lib/subscription'

const NEAR_LIMIT_RATIO = 0.8

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function getDirectionalMonthlyRevenue(planIds: Array<string | null>) {
  return planIds.reduce((total, planId) => {
    if (!planId) return total

    const plan = getBillingPlan(planId)
    if (!plan) return total

    return total + (plan.billing === 'annual' ? Math.round(plan.amount / 12) : plan.amount)
  }, 0)
}

export function formatCompactDate(date: Date | null) {
  if (!date) return 'Non defini'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function getPlanName(plan: string) {
  if (plan === 'pro') return 'Pro'
  if (plan === 'business') return 'Business'
  return 'Gratuit'
}

export function getBillingStatusLabel(status: string) {
  const labels: Record<string, string> = {
    active: 'Actif',
    pending: 'En attente',
    expired: 'Expire',
    failed: 'Echec',
    cancelled: 'Annule',
    free: 'Gratuit',
  }

  return labels[status] ?? status
}

export async function getAdminOverview() {
  const now = new Date()
  const sevenDaysAgo = addDays(now, -7)
  const nextThirtyDays = addDays(now, 30)
  const { start: monthStart, end: monthEnd } = getMonthlyUsageWindow(now)

  const activePaidWhere = {
    plan: { in: ['pro', 'business'] },
    billingStatus: 'active',
    OR: [{ planExpiresAt: null }, { planExpiresAt: { gt: now } }],
  }

  const [
    usersTotal,
    activePaidUsers,
    activePaidPlanIds,
    activeForms,
    submissions7Days,
    whatsappThisMonth,
    pendingPayments,
    expiringSoon,
    recentUsers,
    recentForms,
    recentSubmissions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: activePaidWhere }),
    prisma.user.findMany({
      where: activePaidWhere,
      select: { billingPlanId: true },
    }),
    prisma.form.count({ where: { active: true } }),
    prisma.submission.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.usageEvent.aggregate({
      where: {
        type: USAGE_TYPES.whatsappNotification,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
      _sum: { quantity: true },
    }),
    prisma.user.findMany({
      where: { billingStatus: 'pending' },
      select: {
        id: true,
        plan: true,
        billingPlanId: true,
        billingReference: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.user.findMany({
      where: {
        plan: { in: ['pro', 'business'] },
        billingStatus: 'active',
        planExpiresAt: { gte: now, lte: nextThirtyDays },
      },
      select: {
        id: true,
        plan: true,
        billingPlanId: true,
        planExpiresAt: true,
      },
      orderBy: { planExpiresAt: 'asc' },
      take: 6,
    }),
    prisma.user.findMany({
      select: {
        id: true,
        plan: true,
        billingStatus: true,
        createdAt: true,
        _count: { select: { forms: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.form.findMany({
      select: {
        id: true,
        title: true,
        active: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            plan: true,
            billingStatus: true,
          },
        },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.submission.findMany({
      select: {
        id: true,
        createdAt: true,
        form: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const nearLimits = await getAccountsNearLimits()

  return {
    kpis: {
      usersTotal,
      activePaidUsers,
      mrr: getDirectionalMonthlyRevenue(activePaidPlanIds.map(user => user.billingPlanId)),
      activeForms,
      submissions7Days,
      whatsappThisMonth: whatsappThisMonth._sum.quantity ?? 0,
    },
    pendingPayments,
    expiringSoon,
    nearLimits,
    recentActivity: {
      users: recentUsers,
      forms: recentForms,
      submissions: recentSubmissions,
    },
  }
}

export async function getAdminClients() {
  return prisma.user.findMany({
    select: {
      id: true,
      plan: true,
      billingStatus: true,
      billingPeriod: true,
      billingPlanId: true,
      planActivatedAt: true,
      planExpiresAt: true,
      createdAt: true,
      _count: { select: { forms: true, usageEvents: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

export async function getAdminSubscriptions() {
  return prisma.user.findMany({
    where: {
      OR: [
        { plan: { in: ['pro', 'business'] } },
        { billingStatus: { not: 'free' } },
        { billingReference: { not: null } },
      ],
    },
    select: {
      id: true,
      plan: true,
      billingStatus: true,
      billingPeriod: true,
      billingPlanId: true,
      billingReference: true,
      planActivatedAt: true,
      planExpiresAt: true,
      createdAt: true,
    },
    orderBy: [{ billingStatus: 'asc' }, { planExpiresAt: 'asc' }],
    take: 100,
  })
}

export async function getAdminForms() {
  return prisma.form.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      active: true,
      notificationsEnabled: true,
      notificationMode: true,
      assignedWhatsapp: true,
      assignedEmail: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          plan: true,
          billingStatus: true,
        },
      },
      _count: { select: { submissions: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  })
}

export async function getAdminUsage() {
  const now = new Date()
  const { start: monthStart, end: monthEnd } = getMonthlyUsageWindow(now)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      plan: true,
      billingStatus: true,
      forms: {
        select: {
          id: true,
          active: true,
          assignedEmail: true,
          assignedWhatsapp: true,
        },
      },
      usageEvents: {
        where: {
          type: USAGE_TYPES.whatsappNotification,
          createdAt: { gte: monthStart, lt: monthEnd },
        },
        select: { quantity: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return users.map(user => {
    const activeForms = user.forms.filter(form => form.active).length
    const whatsappNotifications = user.usageEvents.reduce((total, event) => total + event.quantity, 0)
    const collaborators = new Set<string>()

    for (const form of user.forms) {
      if (form.assignedEmail) collaborators.add(`email:${form.assignedEmail}`)
      if (form.assignedWhatsapp) collaborators.add(`whatsapp:${form.assignedWhatsapp}`)
    }

    const plan = user.plan === 'pro' || user.plan === 'business' ? user.plan : 'free'
    const limits = PLAN_LIMITS[plan]

    return {
      id: user.id,
      plan,
      billingStatus: user.billingStatus,
      usage: {
        activeForms,
        whatsappNotifications,
        collaborators: collaborators.size,
      },
      limits,
    }
  })
}

async function getAccountsNearLimits() {
  const usageRows = await getAdminUsage()

  return usageRows
    .filter(row => {
      const formsRatio = row.usage.activeForms / row.limits.activeForms
      const whatsappRatio = row.usage.whatsappNotifications / row.limits.whatsappNotifications
      const collaboratorRatio = row.limits.collaborators
        ? row.usage.collaborators / row.limits.collaborators
        : row.usage.collaborators > 0 ? 1 : 0

      return [formsRatio, whatsappRatio, collaboratorRatio].some(ratio => ratio >= NEAR_LIMIT_RATIO)
    })
    .slice(0, 8)
}

export function getPlanPrice(planId: string | null) {
  if (!planId) return 'Non facture'

  const plan = BILLING_PLANS[planId as keyof typeof BILLING_PLANS]

  return plan?.displayPrice ?? planId
}

export function getDaysUntil(date: Date | null) {
  if (!date) return null

  const today = startOfDay(new Date())
  const target = startOfDay(date)

  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}
