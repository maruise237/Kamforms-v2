import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendLimitReached,
  sendUsageMilestone,
  sendFeatureTease,
  sendTip,
  sendReengage,
  sendFormAbandoned,
} from '@/lib/email-templates'

async function getClerkEmail(userId: string): Promise<string | null> {
  try {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    const primary = clerkUser.primaryEmailAddressId
      ? clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)
      : clerkUser.emailAddresses[0]
    return primary?.emailAddress ?? null
  } catch { return null }
}

async function getTargetEmail(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { notificationEmail: true } })
  return user?.notificationEmail ?? await getClerkEmail(userId)
}

/**
 * POST /api/email/trigger?type=...
 *
 * Types disponibles:
 *   limit_reached      — Cycle Conversion : limite de forfait atteinte
 *   usage_milestone    — Cycle Conversion : palier de réponses atteint
 *   feature_tease      — Cycle Conversion : fonctionnalités inutilisées
 *   tip                — Cycle Rétention : astuce personnalisée
 *   reengage           — Cycle Réengagement : utilisateur inactif
 *   form_abandoned     — Cycle Réengagement : formulaire sans réponse
 *   onboard_check      — Vérification complète onboarding (unified)
 */
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'onboard_check'
  const targetEmail = await getTargetEmail(userId)
  if (!targetEmail) return NextResponse.json({ sent: false, reason: 'no email' })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, billingStatus: true, createdAt: true, notificationEmail: true },
  })
  if (!user) return NextResponse.json({ sent: false, reason: 'no user' })

  const [formCount, totalSubmissions] = await Promise.all([
    prisma.form.count({ where: { userId } }),
    prisma.submission.count({ where: { form: { userId } } }),
  ])

  const accountAge = Date.now() - new Date(user.createdAt).getTime()
  const daysSinceSignup = Math.floor(accountAge / 86_400_000)

  switch (type) {
    // ─── Cycle Conversion ──────────────────────────────────────────
    case 'limit_reached': {
      const body = await req.json().catch(() => ({}))
      await sendLimitReached(targetEmail, user.plan, body.limitType ?? 'activeForms')
      return NextResponse.json({ sent: true, type: 'limit_reached' })
    }

    case 'usage_milestone': {
      const milestones = [10, 50, 100, 500, 1000]
      const nearest = [...milestones].reverse().find(m => totalSubmissions >= m)
      if (!nearest) return NextResponse.json({ sent: false, reason: 'no milestone' })
      await sendUsageMilestone(targetEmail, user.plan, nearest)
      return NextResponse.json({ sent: true, type: 'usage_milestone', milestone: nearest })
    }

    case 'feature_tease': {
      if (daysSinceSignup < 7) return NextResponse.json({ sent: false, reason: 'too early' })
      await sendFeatureTease(targetEmail, user.plan)
      return NextResponse.json({ sent: true, type: 'feature_tease' })
    }

    // ─── Cycle Rétention ───────────────────────────────────────────
    case 'tip': {
      const body = await req.json().catch(() => ({}))
      const tipType = body.tipType ?? (
        totalSubmissions === 0 ? 'template'
        : formCount === 1 ? 'multi_step'
        : 'theme'
      )
      await sendTip(targetEmail, tipType)
      return NextResponse.json({ sent: true, type: 'tip', tipType })
    }

    // ─── Cycle Réengagement ────────────────────────────────────────
    case 'reengage': {
      if (daysSinceSignup < 14) return NextResponse.json({ sent: false, reason: 'too early' })
      await sendReengage(targetEmail, daysSinceSignup, formCount)
      return NextResponse.json({ sent: true, type: 'reengage' })
    }

    case 'form_abandoned': {
      const forms = await prisma.form.findMany({
        where: { userId, active: true },
        select: { id: true, title: true, slug: true, _count: { select: { submissions: true } } },
        take: 5,
      })
      const abandoned = forms.filter(f => f._count.submissions === 0)
      if (abandoned.length === 0) return NextResponse.json({ sent: false, reason: 'no abandoned' })
      const f = abandoned[0]
      await sendFormAbandoned(targetEmail, f.title, `${process.env.NEXT_PUBLIC_APP_URL}/f/${f.slug}`)
      return NextResponse.json({ sent: true, type: 'form_abandoned', form: f.id })
    }

    // ─── Unified onboarding check ──────────────────────────────────
    case 'onboard_check': {
      const sentTypes: string[] = []

      // J+1 : pas de formulaire
      if (formCount === 0 && daysSinceSignup >= 1 && daysSinceSignup < 7) {
        await sendTip(targetEmail, 'template')
        sentTypes.push('tip_template')
      }

      // J+3 : pas de soumission
      if (formCount > 0 && totalSubmissions === 0 && daysSinceSignup >= 3) {
        await sendTip(targetEmail, 'theme')
        sentTypes.push('tip_theme')
      }

      // J+7 : feature tease
      if (daysSinceSignup >= 7 && daysSinceSignup < 14) {
        await sendFeatureTease(targetEmail, user.plan)
        sentTypes.push('feature_tease')
      }

      // J+14 : re-engagement
      if (daysSinceSignup >= 14 && formCount === 0) {
        await sendReengage(targetEmail, daysSinceSignup, formCount)
        sentTypes.push('reengage')
      }

      return NextResponse.json({ sent: sentTypes.length > 0, types: sentTypes })
    }

    default:
      return NextResponse.json({ sent: false, reason: 'unknown type' })
  }
}
