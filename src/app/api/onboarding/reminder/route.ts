import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

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

  const [user, formCount, submissionCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { notificationEmail: true, createdAt: true },
    }),
    prisma.form.count({ where: { userId } }),
    prisma.submission.count({
      where: { form: { userId } },
    }),
  ])

  if (!user) return NextResponse.json({ sent: false })

  const targetEmail = user.notificationEmail ?? await getClerkEmail(userId)
  if (!targetEmail) return NextResponse.json({ sent: false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const accountAge = Date.now() - new Date(user.createdAt).getTime()
  const hoursSinceSignup = accountAge / 3_600_000

  // J+1 : pas de formulaire créé après 24h
  if (formCount === 0 && hoursSinceSignup >= 24 && hoursSinceSignup < 72) {
    await sendEmail({
      to: targetEmail,
      subject: 'Crée ton premier formulaire en 30 secondes',
      html: emailTemplate({
        title: 'Pas encore de formulaire ?',
        body: `Il suffit d'une phrase pour décrire ce que tu veux collecter. L'IA génère les champs automatiquement.`,
        cta: { label: 'Créer mon premier formulaire', url: `${appUrl}/dashboard/forms/new` },
        footer: `Tu as reçu cet email car tu es inscrit sur Kamforms.`,
      }),
    })
    return NextResponse.json({ sent: true, type: 'reminder-create' })
  }

  // J+3 : pas de notification configurée après 72h
  if (formCount > 0 && !user.notificationEmail && hoursSinceSignup >= 72 && hoursSinceSignup < 168) {
    await sendEmail({
      to: targetEmail,
      subject: 'Configure tes notifications pour ne rien manquer',
      html: emailTemplate({
        title: 'Reçois les réponses en temps réel',
        body: `Configure ton email ou ton numéro WhatsApp pour être alerté instantanément dès qu'une réponse arrive.`,
        cta: { label: 'Configurer les notifications', url: `${appUrl}/dashboard/settings` },
        footer: `Tu as reçu cet email car tu es inscrit sur Kamforms.`,
      }),
    })
    return NextResponse.json({ sent: true, type: 'reminder-notifications' })
  }

  // J+7 : formulaire créé mais pas de réponse reçue
  if (formCount > 0 && submissionCount === 0 && hoursSinceSignup >= 168) {
    await sendEmail({
      to: targetEmail,
      subject: 'Partage ton formulaire pour recevoir ta première réponse',
      html: emailTemplate({
        title: 'Ton formulaire attend des réponses',
        body: `Copie le lien public de ton formulaire et partage-le sur WhatsApp, par email ou sur tes réseaux sociaux pour collecter tes premières réponses.`,
        cta: { label: 'Voir mes formulaires', url: `${appUrl}/dashboard` },
        footer: `Tu as reçu cet email car tu es inscrit sur Kamforms.`,
      }),
    })
    return NextResponse.json({ sent: true, type: 'reminder-share' })
  }

  return NextResponse.json({ sent: false })
}

function emailTemplate({
  title,
  body,
  cta,
  footer,
}: {
  title: string
  body: string
  cta: { label: string; url: string }
  footer: string
}): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width:100%">
      <tr>
        <td align="center" style="padding:0">
          <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
            <tr>
              <td style="height:4px;background:#18181b;font-size:0;line-height:0" height="4">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:28px 32px 16px;text-align:center">
                <span style="font-size:16px;font-weight:700;color:#18181b;letter-spacing:-0.3px">Kamforms</span>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 16px">
                <h2 style="font-size:18px;font-weight:700;color:#18181b;margin:0 0 8px;line-height:1.3">${title}</h2>
                <p style="margin:0;font-size:14px;color:#52525b;line-height:1.6">${body}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 24px">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:8px;background:#18181b">
                      <a href="${cta.url}" style="display:inline-block;padding:11px 22px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;background:#18181b">${cta.label}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px">
                <p style="margin:0;font-size:11px;color:#a1a1aa">${footer}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}
