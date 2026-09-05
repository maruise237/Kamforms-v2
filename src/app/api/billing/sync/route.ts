import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getBillingPlan } from '@/lib/billing-plans'
import { getGeniusPayPayment, isGeniusPayPaymentNotFoundError } from '@/lib/geniuspay'
import { prisma } from '@/lib/prisma'

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date)
  nextDate.setMonth(nextDate.getMonth() + months)
  return nextDate
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      billingReference: true,
      billingPlanId: true,
      billingStatus: true,
    },
  })

  if (!user?.billingReference || !user.billingPlanId) {
    return NextResponse.json({ synced: false, reason: 'NO_PENDING_PAYMENT' })
  }

  if (user.billingStatus === 'active') {
    return NextResponse.json({ synced: true, reason: 'ALREADY_ACTIVE' })
  }

  let payment
  try {
    payment = await getGeniusPayPayment(user.billingReference)
  } catch (error) {
    if (isGeniusPayPaymentNotFoundError(error)) {
      return NextResponse.json({
        synced: false,
        reason: 'PAYMENT_NOT_FOUND',
        status: 'not_found',
      })
    }
    throw error
  }
  const planId = typeof payment.metadata.plan_id === 'string'
    ? payment.metadata.plan_id
    : user.billingPlanId
  const plan = getBillingPlan(planId)

  if (!plan) {
    return NextResponse.json({ synced: false, reason: 'UNKNOWN_PLAN' }, { status: 400 })
  }

  if (!payment.paid) {
    return NextResponse.json({
      synced: false,
      status: payment.status,
    })
  }

  const activatedAt = new Date()
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: plan.plan,
      billingStatus: 'active',
      billingPeriod: plan.billing,
      billingPlanId: plan.id,
      billingReference: payment.reference,
      planActivatedAt: activatedAt,
      planExpiresAt: addMonths(activatedAt, plan.billing === 'annual' ? 12 : 1),
    },
  })

  return NextResponse.json({
    synced: true,
    plan: plan.id,
    status: 'active',
  })
}
