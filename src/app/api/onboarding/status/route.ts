import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingWelcomeSent: true, createdAt: true },
  })

  return NextResponse.json({
    onboardingWelcomeSent: user?.onboardingWelcomeSent ?? false,
    isNewUser: !user?.onboardingWelcomeSent,
  })
}
