import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

async function getClerkEmail(userId: string): Promise<string | null> {
  try {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    const primary = clerkUser.primaryEmailAddressId
      ? clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)
      : clerkUser.emailAddresses[0]
    return primary?.emailAddress ?? null
  } catch {
    return null
  }
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Ne pas renvoyer si déjà envoyé
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingWelcomeSent: true, notificationEmail: true },
  })
  if (existing?.onboardingWelcomeSent) {
    return NextResponse.json({ sent: false, reason: 'already_sent' })
  }

  const targetEmail = existing?.notificationEmail ?? await getClerkEmail(userId)

  if (targetEmail) {
    await sendWelcomeEmail({ to: targetEmail }).catch(() => {})
  }

  // Marquer comme envoyé en base (indépendant du navigateur)
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingWelcomeSent: true },
  })

  return NextResponse.json({ sent: !!targetEmail })
}
