import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendWhatsAppWelcome } from '@/lib/evolution'
import { normalizeExpiredSubscription } from '@/lib/subscription'

const updateUserSchema = z.object({
  whatsappNumber:    z.string().regex(/^\+?[1-9]\d{1,14}$/).max(16).optional().nullable(),
  notificationEmail: z.string().email().max(254).optional().nullable(),
})

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

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clerkEmail = await getClerkEmail(userId)
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, notificationEmail: clerkEmail },
  })
  await normalizeExpiredSubscription(userId)
  const user = await prisma.user.findUnique({ where: { id: userId } })

  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }
  const { whatsappNumber, notificationEmail } = parsed.data

  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { whatsappNumber: true } })

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      ...(whatsappNumber    !== undefined && { whatsappNumber }),
      ...(notificationEmail !== undefined && { notificationEmail }),
    },
    create: { id: userId, whatsappNumber, notificationEmail },
  })

  // Send welcome message when a new (or changed) number is saved
  if (whatsappNumber && whatsappNumber !== existing?.whatsappNumber) {
    sendWhatsAppWelcome(whatsappNumber).catch(() => {})
  }

  return NextResponse.json(user)
}

/**
 * DELETE /api/user — Suppression de compte (Phase 3.1 — règle Apple App Store 5.1.1v7)
 *
 * Supprime l'utilisateur et toutes ses données en cascade (Form → Submission,
 * UsageEvent, MobilePushToken — déjà configuré dans le schéma Prisma via
 * onDelete: Cascade).
 *
 * ⚠️ L'utilisateur Clerk lui-même n'est PAS supprimé ici : il est supprimé
 * côté client via Clerk.user.delete() dans l'app mobile. Cette séparation
 * permet à l'utilisateur de supprimer ses données métier sans casser
 * sa session Clerk (utile s'il veut recréer un compte avec la même adresse
 * email plus tard).
 */
export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // La cascade Prisma supprime automatiquement :
  //   - Form[] (avec Submission[] en cascade)
  //   - UsageEvent[]
  //   - MobilePushToken[]
  await prisma.user.deleteMany({ where: { id: userId } })

  return NextResponse.json({ ok: true })
}
