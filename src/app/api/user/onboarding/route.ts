import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { onboardingCompleted, onboardingUsage, onboardingActivity, onboardingStep } = body

  const data: Record<string, unknown> = {}
  if (typeof onboardingCompleted === 'boolean') data.onboardingCompleted = onboardingCompleted
  if (typeof onboardingUsage === 'string') data.onboardingUsage = onboardingUsage
  if (typeof onboardingActivity === 'string') data.onboardingActivity = onboardingActivity
  if (typeof onboardingStep === 'number') data.onboardingStep = onboardingStep

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  })

  return NextResponse.json({ ok: true })
}
