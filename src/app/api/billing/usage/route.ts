import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getPlanLabel, getSubscriptionUsage } from '@/lib/subscription'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subscription, usage, period } = await getSubscriptionUsage(userId)

  return NextResponse.json({
    plan: subscription.plan,
    planLabel: getPlanLabel(subscription.plan),
    status: subscription.status,
    billingPeriod: subscription.billingPeriod,
    billingPlanId: subscription.billingPlanId,
    expiresAt: subscription.expiresAt,
    isPaidActive: subscription.isPaidActive,
    limits: subscription.limits,
    usage,
    period,
  })
}
