import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  token: z.string().min(1).max(200),
  platform: z.enum(['android', 'ios']),
}).strict()

const unregisterSchema = z.object({
  token: z.string().min(1).max(200),
}).strict()

/** Enregistre (ou réactive) le token Expo push de l'app mobile. */
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } })
  await prisma.mobilePushToken.upsert({
    where: { token: parsed.data.token },
    update: { userId, platform: parsed.data.platform },
    create: { userId, token: parsed.data.token, platform: parsed.data.platform },
  })

  return NextResponse.json({ ok: true })
}

/** Supprime le token Expo push (déconnexion de l'app mobile). */
export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const parsed = unregisterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  await prisma.mobilePushToken.deleteMany({
    where: { userId, token: parsed.data.token },
  })

  return NextResponse.json({ ok: true })
}
