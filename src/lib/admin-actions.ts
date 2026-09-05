import 'server-only'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { parseEmail, parseEmailName } from '@/lib/email'

export type ManualAssignmentInput = {
  userId: string
  plan: 'pro' | 'business'
  days: number
  message?: string
}

export type AdminActionResult =
  | { success: true; expiresAt: Date; plan: string }
  | { success: false; error: string }

export async function assignSubscription(
  input: ManualAssignmentInput,
): Promise<AdminActionResult> {
  const { userId, plan, days, message } = input

  if (days < 1 || days > 365) {
    return { success: false, error: 'La durée doit être entre 1 et 365 jours.' }
  }

  if (!['pro', 'business'].includes(plan)) {
    return { success: false, error: 'Plan invalide. Choisissez Pro ou Business.' }
  }

  // Verify the caller is an admin
  const session = await auth()
  if (!session.userId) {
    return { success: false, error: 'Non authentifié.' }
  }

  // Check that target user exists
  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!targetUser) {
    return { success: false, error: 'Utilisateur introuvable.' }
  }

  // Calculate expiration
  const now = new Date()
  const expiresAt = new Date(now.getTime() + days * 86_400_000)

  // Update the user
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      billingStatus: 'active',
      billingPeriod: 'manual',
      billingPlanId: plan === 'pro' ? 'pro_monthly' : 'business_monthly',
      billingReference: `manual:${session.userId}:${Date.now()}`,
      planActivatedAt: now,
      planExpiresAt: expiresAt,
    },
  })

  // Notification par email si Plunk est configuré
  if (process.env.PLUNK_SECRET_KEY && message) {
    try {
          const fromRaw = process.env.EMAIL_FROM ?? 'Kamforms <noreply@kamforms.com>'
          const PLUNK_API = 'https://next-api.useplunk.com/v1/send'
          await fetch(PLUNK_API, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.PLUNK_SECRET_KEY}`,
            },
            body: JSON.stringify({
              to: targetUser.id,
              subject: 'Votre abonnement KamForms a été activé',
              body: `
                <p>Bonjour,</p>
                <p>Un abonnement <strong>${plan === 'pro' ? 'Pro' : 'Business'}</strong>
                vous a été offert pour une durée de <strong>${days} jours</strong>.</p>
                ${message ? `<p>Message : ${message}</p>` : ''}
                <p>Valable jusqu'au ${expiresAt.toLocaleDateString('fr-FR')}.</p>
                <p>— L'équipe KamForms</p>
              `,
              from: {
                email: parseEmail(fromRaw),
                ...(parseEmailName(fromRaw) && { name: parseEmailName(fromRaw) }),
              },
            }),
          })
    } catch {
      // Email non bloquant — on ne fait pas échouer l'opération
      console.warn('Échec envoi email notification attribution manuelle')
    }
  }

  return { success: true, expiresAt, plan }
}

export async function suspendUser(userId: string): Promise<AdminActionResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: 'Utilisateur introuvable.' }

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: 'free',
      billingStatus: 'cancelled',
      billingPlanId: null,
      billingReference: null,
      billingPeriod: null,
      planExpiresAt: null,
      planActivatedAt: null,
    },
  })

  // Désactiver les formulaires actifs
  await prisma.form.updateMany({
    where: { userId, active: true },
    data: { active: false },
  })

  return { success: true, expiresAt: new Date(), plan: 'free' }
}

export async function extendSubscription(
  userId: string,
  extraDays: number,
): Promise<AdminActionResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: 'Utilisateur introuvable.' }

  const currentExpiry = user.planExpiresAt ?? new Date()
  const newExpiry = new Date(currentExpiry.getTime() + extraDays * 86_400_000)

  await prisma.user.update({
    where: { id: userId },
    data: { planExpiresAt: newExpiry },
  })

  return { success: true, expiresAt: newExpiry, plan: user.plan }
}
