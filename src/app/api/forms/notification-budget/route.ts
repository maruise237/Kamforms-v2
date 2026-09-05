import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSubscriptionUsage } from '@/lib/subscription'

const IMMEDIATE_MODES = ['every', 'milestones', 'first_only']

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { subscription } = await getSubscriptionUsage(userId)

  // Count forms using immediate modes on the default number (no delegate assigned)
  const used = await prisma.form.count({
    where: {
      userId,
      notificationsEnabled: true,
      notificationMode: { in: IMMEDIATE_MODES },
      assignedWhatsapp: null,
      assignedEmail: null,
    },
  })

  return NextResponse.json({ used, limit: subscription.limits.activeForms })
}
