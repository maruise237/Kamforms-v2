import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppNotification } from '@/lib/evolution'
import { sendEmailNotification } from '@/lib/email'
import { sendPushNotification } from '@/lib/push'
import { sendExpoPushNotification } from '@/lib/expo-push'
import type { FormSchema } from '@/lib/form-schema'
import { createRateLimiter } from '@/lib/rate-limit'
import { validateSubmission, stripUnknownFields } from '@/lib/submit-validation'
import { getSubscriptionUsage, USAGE_TYPES } from '@/lib/subscription'

const isRateLimited = createRateLimiter(10, 60 * 60 * 1000)

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
  if (await isRateLimited(ip)) {
    return NextResponse.json({ error: 'Trop de soumissions. Réessayez plus tard.' }, { status: 429 })
  }

  const form = await prisma.form.findUnique({
    where: { slug },
    include: { user: { include: { mobilePushTokens: true } } },
  })

  if (!form || !form.active) {
    return NextResponse.json({ error: 'Formulaire introuvable ou inactif' }, { status: 404 })
  }

  const { subscription, usage } = await getSubscriptionUsage(form.userId)
  const activeAfterPlanCheck = await prisma.form.findUnique({
    where: { id: form.id },
    select: { active: true },
  })
  if (!activeAfterPlanCheck?.active) {
    return NextResponse.json({ error: 'Formulaire indisponible avec le plan actuel.' }, { status: 402 })
  }

  if (form.expiresAt && new Date() > form.expiresAt) {
    return NextResponse.json({ error: 'Ce formulaire n\'accepte plus de réponses.' }, { status: 410 })
  }

  const raw = await req.json()

  // Honeypot anti-spam: bots fill hidden fields, humans don't
  if (raw._honeypot) {
    return NextResponse.json({ success: true, id: 'bot' }, { status: 201 })
  }

  // Strip honeypot before storing
  const { _honeypot: _h, ...data } = raw

  // Server-side field validation against schema
  const schema = form.schema as unknown as FormSchema
  const validationErrors = validateSubmission(schema, data)
  if (validationErrors.length > 0) {
    return NextResponse.json({ error: validationErrors[0], errors: validationErrors }, { status: 422 })
  }

  // Strip unknown field IDs
  const cleanData = stripUnknownFields(schema, data)

  // Atomic check-and-insert to prevent maxSubmissions race condition
  let submission
  try {
    submission = await prisma.$transaction(async (tx) => {
      if (form.maxSubmissions !== null) {
        const count = await tx.submission.count({ where: { formId: form.id } })
        if (count >= form.maxSubmissions) {
          throw Object.assign(new Error('LIMIT_REACHED'), { code: 'LIMIT_REACHED' })
        }
      }
      return tx.submission.create({
        data: { formId: form.id, data: cleanData as Record<string, string> },
      })
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'LIMIT_REACHED') {
      return NextResponse.json({ error: 'Ce formulaire a atteint sa limite de réponses.' }, { status: 410 })
    }
    throw err
  }

  const submissionRank = await prisma.submission.count({ where: { formId: form.id } })
  const formFields = schema.fields.map(f => ({ id: f.id, label: f.label }))

  if (form.notificationsEnabled) {
    const mode            = form.notificationMode as string
    const hasDelegate     = !!(form.assignedWhatsapp || form.assignedEmail)
    const whatsappTarget  = form.assignedWhatsapp ?? form.user.whatsappNumber
    const emailTarget     = form.assignedEmail    ?? form.user.notificationEmail
    // Delegates always get immediate notifications; owners respect their chosen mode
    const MILESTONES      = new Set([1, 5, 10, 25, 50, 100])
    const shouldNotify    = hasDelegate
      || mode === 'every'
      || (mode === 'first_only'   && submissionRank === 1)
      || (mode === 'milestones'   && MILESTONES.has(submissionRank))

    if (shouldNotify) {
      const includeLink = !hasDelegate
      const notifArgs = {
        formTitle: form.title,
        formId: form.id,
        submissionData: cleanData,
        formFields,
        submissionRank,
        includeLink,
      }
      if (whatsappTarget && usage.whatsappNotifications < subscription.limits.whatsappNotifications) {
        await prisma.usageEvent.create({
          data: {
            userId: form.userId,
            formId: form.id,
            type: USAGE_TYPES.whatsappNotification,
          },
        })
        sendWhatsAppNotification({ to: whatsappTarget, ...notifArgs })
          .catch(err => console.error('WhatsApp notification failed:', err))
      }
      if (emailTarget) {
        sendEmailNotification({ to: emailTarget, ...notifArgs })
          .catch(err => console.error('Email notification failed:', err))
      }
      // Notification push navigateur
      const pushSub = form.user.pushSubscription as Record<string, unknown> | null
      if (pushSub) {
        sendPushNotification(pushSub, {
          title: `Nouvelle réponse · ${form.title}`,
          body: `${submissionRank ? `#${submissionRank} · ` : ''}${Object.values(cleanData).slice(0, 2).join(' · ')}`,
          url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard/forms/${form.id}/submissions`,
        }).catch(() => {})
      }
      // Notification push vers l'app mobile (Expo)
      const expoTokens = (form.user.mobilePushTokens ?? []).map(t => t.token)
      if (expoTokens.length > 0) {
        sendExpoPushNotification(expoTokens, {
          title: `Nouvelle réponse · ${form.title}`,
          body: `${submissionRank ? `#${submissionRank} · ` : ''}${Object.values(cleanData).slice(0, 2).join(' · ')}`,
          url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard/forms/${form.id}/submissions`,
        }).catch(() => {})
      }
    }
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
