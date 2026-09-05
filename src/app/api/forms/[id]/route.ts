import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { isSafeUrl } from '@/lib/utils'
import { unlink } from 'fs/promises'
import { join, resolve } from 'path'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import type { FormTheme } from '@/lib/form-theme'
import { formSchemaSchema } from '@/lib/form-schema'
import { sendWhatsAppDelegation } from '@/lib/evolution'
import { getSubscriptionUsage } from '@/lib/subscription'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads')

const SAFE_UPLOAD_FILENAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/i

const PHONE_RE = /^\+?[1-9]\d{1,14}$/

const patchSchema = z.object({
  title:               z.string().min(1).max(200).optional(),
  description:         z.string().max(1000).nullable().optional(),
  active:              z.boolean().optional(),
  slug:                z.string().regex(/^[a-z0-9-]{3,}$/).optional(),
  notificationsEnabled: z.boolean().optional(),
  notificationMode:    z.enum(['every', 'milestones', 'first_only', 'daily_digest', 'off']).optional(),
  assignedWhatsapp:    z.string().regex(PHONE_RE).max(16).nullable().optional(),
  assignedEmail:       z.string().email().max(254).nullable().optional(),
  maxSubmissions:      z.number().int().min(1).nullable().optional(),
  expiresAt:           z.string().datetime().nullable().optional(),
	  theme: z.object({
	    preset:         z.string().optional(),
	    customColor:    z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
	    bannerUrl:      z.string().max(500).refine(
	      v => v.startsWith('/') || v.startsWith('http'),
	      { message: 'bannerUrl doit être une URL absolue ou relative' }
	    ).optional(),
	    bannerPosition: z.enum(['top', 'center', 'bottom']).optional(),
	    bgColor:        z.string().optional(),
	  }).nullable().optional(),
  schema:  formSchemaSchema.optional(),
  ending:  z.record(z.unknown()).optional(),
}).strict()

async function deleteBannerFile(theme: unknown) {
  try {
    const t = theme as FormTheme | null
    if (!t?.bannerUrl) return
    // Only delete files we uploaded ourselves (/api/uploads/<uuid>.<ext>)
    const match = t.bannerUrl.match(/\/api\/uploads\/([^/]+)$/)
    if (!match) return
    const filename = match[1]
    if (!SAFE_UPLOAD_FILENAME.test(filename)) return
    // Ensure resolved path stays inside UPLOAD_DIR (directory traversal guard)
    const uploadDir = resolve(UPLOAD_DIR)
    const target    = resolve(join(uploadDir, filename))
    if (!target.startsWith(uploadDir + '/') && target !== uploadDir) return
    await unlink(target)
  } catch {
    // File may already be gone — ignore
  }
}

async function getOwnedForm(userId: string, id: string) {
  return prisma.form.findFirst({ where: { id, userId } })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const form = await getOwnedForm(userId, id)
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const submissionCount = await prisma.submission.count({ where: { formId: id } })
  return NextResponse.json({ ...form, submissionCount })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const form = await getOwnedForm(userId, id)
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }
  const {
    title, description, active, theme, schema, ending,
    slug, maxSubmissions, expiresAt, notificationsEnabled,
    notificationMode, assignedWhatsapp, assignedEmail,
  } = parsed.data

  const { subscription, usage } = await getSubscriptionUsage(userId)

  if (active === true && !form.active && usage.activeForms >= subscription.limits.activeForms) {
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

  const addsDelegate = (
    (assignedWhatsapp !== undefined && assignedWhatsapp !== null && assignedWhatsapp !== form.assignedWhatsapp) ||
    (assignedEmail !== undefined && assignedEmail !== null && assignedEmail !== form.assignedEmail)
  )
  if (addsDelegate && usage.collaborators >= subscription.limits.collaborators) {
    return NextResponse.json(
      {
        error: `Limite atteinte: votre plan autorise ${subscription.limits.collaborators} collaborateur(s).`,
        code: subscription.limits.collaborators === 0 ? 'FEATURE_NOT_INCLUDED' : 'PLAN_LIMIT_REACHED',
      },
      { status: 403 }
    )
  }

  // Validate buttonUrl server-side to prevent stored javascript: / open-redirect
  if (ending?.buttonUrl !== undefined && ending.buttonUrl !== '') {
    if (!isSafeUrl(String(ending.buttonUrl))) {
      return NextResponse.json({ error: 'buttonUrl invalide. Utilisez une URL https://.' }, { status: 400 })
    }
  }

  // Atomic slug uniqueness check + update
  let updated
  try {
    updated = await prisma.$transaction(async (tx) => {
      if (slug !== undefined) {
        const existing = await tx.form.findFirst({ where: { slug: String(slug), id: { not: id } } })
        if (existing) throw Object.assign(new Error('SLUG_TAKEN'), { code: 'SLUG_TAKEN' })
      }
      return tx.form.update({
        where: { id },
        data: {
          ...(title               !== undefined && { title }),
          ...(description        !== undefined && { description }),
          ...(active             !== undefined && { active }),
          ...(theme   !== undefined && { theme:  theme  === null ? Prisma.DbNull : theme  as Prisma.InputJsonValue }),
          ...(schema  !== undefined && { schema: schema as Prisma.InputJsonValue }),
          ...(ending  !== undefined && { ending: ending as Prisma.InputJsonValue }),
          ...(slug               !== undefined && { slug }),
          ...(maxSubmissions     !== undefined && { maxSubmissions: maxSubmissions === null ? null : Number(maxSubmissions) }),
          ...(expiresAt          !== undefined && { expiresAt: expiresAt === null ? null : new Date(expiresAt) }),
          ...(notificationsEnabled !== undefined && { notificationsEnabled: Boolean(notificationsEnabled) }),
          ...(notificationMode    !== undefined && { notificationMode: String(notificationMode) }),
          ...(assignedWhatsapp    !== undefined && { assignedWhatsapp: assignedWhatsapp === null ? null : String(assignedWhatsapp) }),
          ...(assignedEmail       !== undefined && { assignedEmail:    assignedEmail    === null ? null : String(assignedEmail) }),
        },
      })
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'SLUG_TAKEN') {
      return NextResponse.json({ error: 'Ce slug est déjà utilisé.' }, { status: 409 })
    }
    throw err
  }

  // Invalidate ISR cache for the public form page
  revalidatePath(`/f/${updated.slug}`)

  // Send confirmation to new delegate if number changed
  const newDelegate = assignedWhatsapp !== undefined
    ? (assignedWhatsapp === null ? null : String(assignedWhatsapp))
    : null
  if (newDelegate && newDelegate !== form.assignedWhatsapp) {
    sendWhatsAppDelegation(newDelegate, updated.title).catch(() => {})
  }

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const form = await getOwnedForm(userId, id)
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await deleteBannerFile(form.theme)
  await prisma.form.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
