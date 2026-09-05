import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSubscriptionUsage } from '@/lib/subscription'
import { FormsShell } from './_components/FormsShell'

type FormWithTheme = {
  id: string; title: string; slug: string; active: boolean
  createdAt: Date; notificationsEnabled: boolean; theme: unknown
  _count: { submissions: number }
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [{ subscription, usage }, forms, user] = await Promise.all([
    getSubscriptionUsage(userId),
    prisma.form.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        slug: true,
        active: true,
        createdAt: true,
        notificationsEnabled: true,
        theme: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { whatsappNumber: true, notificationEmail: true, onboardingCompleted: true, onboardingStep: true },
    }),
  ])

  const hasCustomizedTheme = forms.some((f: FormWithTheme) => {
    if (!f.theme) return false
    const t = f.theme as { bgColor?: string; preset?: string; customColor?: string }
    return !!(t.bgColor || t.customColor || (t.preset && t.preset !== 'zinc'))
  })

  return (
    <FormsShell
      initialForms={forms.map((f: FormWithTheme) => {
        const { theme: _, ...rest } = f
        return { ...rest, createdAt: rest.createdAt.toISOString() }
      })}
      subscription={{
        plan: subscription.plan,
        status: subscription.status,
        activeFormsLimit: subscription.limits.activeForms,
        activeFormsUsed: usage.activeForms,
      }}
      onboarding={{
        hasWhatsapp: !!user?.whatsappNumber,
        hasEmail: !!user?.notificationEmail,
        hasCustomizedTheme,
        hasShared: false,
        onboardingCompleted: user?.onboardingCompleted ?? false,
      }}
    />
  )
}
