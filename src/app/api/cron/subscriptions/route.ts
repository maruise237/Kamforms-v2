import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, enforceActiveFormLimit } from '@/lib/subscription'

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expiredUsers = await prisma.user.findMany({
    where: {
      plan: { not: 'free' },
      billingStatus: 'active',
      planExpiresAt: { lte: new Date() },
    },
    select: { id: true },
  })

  let disabledForms = 0
  for (const user of expiredUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: 'free',
        billingStatus: 'expired',
        billingPeriod: null,
        billingPlanId: null,
      },
    })
    disabledForms += await enforceActiveFormLimit(user.id, PLAN_LIMITS.free.activeForms)
  }

  return NextResponse.json({
    expiredUsers: expiredUsers.length,
    disabledForms,
  })
}
