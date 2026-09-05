import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSubscriptionUsage } from '@/lib/subscription'
import { nanoid } from 'nanoid'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonInput = any

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const form = await prisma.form.findFirst({ where: { id, userId } })
  if (!form) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

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

  const clone = await prisma.form.create({
    data: {
      userId,
      title: `${form.title} (copie)`,
      description: form.description,
      slug: `${form.slug}-${nanoid(4)}`,
      schema: form.schema as JsonInput,
      ...(form.theme  && { theme:  form.theme  as JsonInput }),
      ...(form.ending && { ending: form.ending as JsonInput }),
    },
  })

  return NextResponse.json(clone, { status: 201 })
}
