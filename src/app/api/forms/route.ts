import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formSchemaSchema } from '@/lib/form-schema'
import { isSafeUrl } from '@/lib/utils'
import { getSubscriptionUsage } from '@/lib/subscription'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createFormSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  schema:      formSchemaSchema,
  ending:      z.record(z.unknown()).optional(),
  bannerUrl:   z.string().max(500).refine(
    v => v.startsWith('/') || v.startsWith('http'),
    { message: 'bannerUrl doit être une URL absolue ou relative' }
  ).optional(),
}).strict()

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return `${base}-${nanoid(6)}`
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const forms = await prisma.form.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      slug: true,
      active: true,
      createdAt: true,
      notificationsEnabled: true,
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(forms)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } })
  const { subscription, usage } = await getSubscriptionUsage(userId)
  if (usage.activeForms >= subscription.limits.activeForms) {
    return NextResponse.json(
      {
        error: `Limite atteinte: votre plan ${subscription.plan} autorise ${subscription.limits.activeForms} formulaire(s) actif(s).`,
        code: 'PLAN_LIMIT_REACHED',
        limit: subscription.limits.activeForms,
        used: usage.activeForms,
      },
      { status: 403 }
    )
  }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const parsed = createFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  const { title, description, schema, ending, bannerUrl } = parsed.data

  if (schema.fields.length > 100) {
    return NextResponse.json({ error: 'Un formulaire ne peut pas avoir plus de 100 champs.' }, { status: 400 })
  }

  // Validate bannerUrl to prevent storing javascript: or non-https URLs
  const safeBannerUrl = bannerUrl && isSafeUrl(bannerUrl) ? bannerUrl : undefined
  const initialTheme = safeBannerUrl ? { bannerUrl: safeBannerUrl } : undefined

  const form = await prisma.form.create({
    data: {
      userId,
      title,
      description: description ?? null,
      slug: generateSlug(title),
      schema: schema as Prisma.InputJsonValue,
      ...(ending       ? { ending: ending as Prisma.InputJsonValue } : {}),
      ...(initialTheme ? { theme: initialTheme as Prisma.InputJsonValue } : {}),
    },
  })

  return NextResponse.json(form, { status: 201 })
}
