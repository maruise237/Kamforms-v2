import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getBillingPlan } from '@/lib/billing-plans'
import { createGeniusPayCheckout } from '@/lib/geniuspay'

const checkoutSchema = z.object({
  planId: z.enum(['pro_monthly', 'pro_annual', 'business_monthly', 'business_annual']),
})

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid checkout plan' }, { status: 400 })
  }

  const plan = getBillingPlan(parsed.data.planId)
  const [clerkUser, appUser] = await Promise.all([
    currentUser(),
    prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    }),
  ])

  const appUrl = getAppUrl()
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? undefined
  const name = clerkUser?.fullName ?? clerkUser?.username ?? undefined
  const phone = appUser.whatsappNumber?.startsWith('+')
    ? appUser.whatsappNumber
    : appUser.whatsappNumber
      ? `+${appUser.whatsappNumber}`
      : undefined
  const reference = `kamforms_${Date.now()}_${nanoid(10)}`

  try {
    const checkout = await createGeniusPayCheckout({
      amount: plan.amount,
      description: plan.description,
      reference,
      customer: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        country: 'CI',
      },
      successUrl: `${appUrl}/dashboard/settings?payment=success&plan=${plan.id}`,
      errorUrl: `${appUrl}/dashboard/settings?payment=failed&plan=${plan.id}`,
      metadata: {
        user_id: userId,
        plan_id: plan.id,
        plan: plan.plan,
        billing: plan.billing,
        source: 'kamforms_dashboard',
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: {
        billingStatus: 'pending',
        billingPlanId: plan.id,
        billingPeriod: plan.billing,
        billingReference: checkout.reference,
      },
    })

    return NextResponse.json(checkout)
  } catch (error) {
    console.error('GeniusPay checkout error:', error)
    return NextResponse.json(
      { error: 'Impossible de créer le paiement GeniusPay.' },
      { status: 502 }
    )
  }
}
