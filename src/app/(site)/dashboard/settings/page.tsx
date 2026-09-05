'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, Bell, CalendarClock, Check, CreditCard, Crown, FileText, Loader2, LogOut, Users, Zap } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { SubscriptionBadge } from '@/components/subscription-badge'
import { PushNotificationToggle } from '@/components/push-notifications'
import { useClerk } from '@clerk/nextjs'

type BillingUsage = {
  plan: 'free' | 'pro' | 'business'
  planLabel: string
  status: string
  billingPeriod: 'monthly' | 'annual' | null
  expiresAt: string | null
  limits: {
    activeForms: number
    whatsappNotifications: number
    collaborators: number
    analytics: 'standard' | 'advanced'
  }
  usage: {
    activeForms: number
    whatsappNotifications: number
    collaborators: number
  }
}

const PLAN_GROUPS = [
  {
    key: 'pro',
    name: 'Pro',
    description: 'Pour freelances, studios et petites équipes.',
    features: '5 formulaires actifs · 1 000 WhatsApp/mois · 5 collaborateurs',
    monthly: { planId: 'pro_monthly', price: '3 900 FCFA/mois' },
    annual: { planId: 'pro_annual', price: '39 000 FCFA/an' },
  },
  {
    key: 'business',
    name: 'Business',
    description: 'Pour agences, PME et volumes plus sérieux.',
    features: '20 formulaires actifs · 10 000 WhatsApp/mois · 20 collaborateurs',
    monthly: { planId: 'business_monthly', price: '29 000 FCFA/mois' },
    annual: { planId: 'business_annual', price: '290 000 FCFA/an' },
  },
] as const

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    free: 'Gratuit',
    active: 'Actif',
    pending: 'Paiement en attente',
    expired: 'Expiré',
    failed: 'Paiement échoué',
    cancelled: 'Annulé',
  }
  return labels[status] ?? status
}

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function UsageMeter({
  icon: Icon,
  label,
  used,
  limit,
}: {
  icon: typeof FileText
  label: string
  used: number
  limit: number
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const nearLimit = pct >= 85

  return (
    <div className="border-t border-border py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={15} className="text-muted-foreground" />
          <span className="truncate text-[13px] font-medium text-foreground">{label}</span>
        </div>
        <span className="font-mono text-[12px] text-muted-foreground">
          {used}/{limit}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={nearLimit ? 'h-full rounded-full bg-amber-500' : 'h-full rounded-full bg-foreground'}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { signOut } = useClerk()
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [billingUsage, setBillingUsage] = useState<BillingUsage | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      const params = new URLSearchParams(window.location.search)
      if (params.get('payment') === 'success') {
        await fetch('/api/billing/sync', { method: 'POST' }).catch(() => null)
      }

      const [user, usage] = await Promise.all([
        fetch('/api/user').then(r => r.json()),
        fetch('/api/billing/usage').then(r => r.json()),
      ])

      return { user, usage }
    }

    loadSettings()
      .then(({ user, usage }) => {
        if (cancelled) return
        setWhatsappNumber(user.whatsappNumber ?? '')
        setNotificationEmail(user.notificationEmail ?? '')
        if (!usage.error) setBillingUsage(usage)
      })
      .catch(() => toast.error('Impossible de charger les paramètres.'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const accountStatus = useMemo(() => {
    if (!billingUsage) return 'Chargement'
    if (billingUsage.status === 'active' && billingUsage.expiresAt) {
      return `Actif jusqu'au ${formatDate(billingUsage.expiresAt)}`
    }
    if (billingUsage.status === 'expired') {
      return 'Revenu automatiquement au gratuit'
    }
    return statusLabel(billingUsage.status)
  }, [billingUsage])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        whatsappNumber: whatsappNumber.trim() || null,
        notificationEmail: notificationEmail.trim() || null,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      toast.error('Erreur lors de la sauvegarde.')
      return
    }
    setSaved(true)
    toast.success('Paramètres sauvegardés.')
    setTimeout(() => setSaved(false), 2500)
  }

  async function startCheckout(planId: string) {
    setCheckoutLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? 'Checkout unavailable')
      }
      window.location.href = data.checkoutUrl
    } catch {
      toast.error('Impossible de lancer le paiement GeniusPay.')
      setCheckoutLoading(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-semibold tracking-tight text-foreground">Paramètres</h1>
          {billingUsage && <SubscriptionBadge plan={billingUsage.plan} status={billingUsage.status} />}
        </div>
	        <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
	          Gérez le numéro de réception, le plan actif et la consommation du compte.
	        </p>
	      </div>

	      <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-medium text-foreground">Réception des demandes</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ce numéro reçoit les réponses des formulaires sans collaborateur dédié.
            </p>
          </div>

          <div className="space-y-5 px-5 py-5">
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="text-[13px]">Numéro WhatsApp</Label>
              <Input
                id="whatsappNumber"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                placeholder="2250700000000"
                disabled={loading}
                type="tel"
                className="max-w-sm"
              />
              <p className="text-xs text-muted-foreground">Format international, sans espaces.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="notificationEmail" className="text-[13px]">Email de notification</Label>
              </div>
              <Input
                id="notificationEmail"
                value={notificationEmail}
                onChange={e => setNotificationEmail(e.target.value)}
                placeholder="vous@exemple.com"
                disabled={loading}
                type="email"
                className="max-w-sm"
              />
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-[13px] font-medium text-foreground">Notifications navigateur</p>
              <p className="text-xs text-muted-foreground">Recevez une notification sur votre bureau ou téléphone à chaque nouvelle réponse.</p>
              <PushNotificationToggle />
            </div>

            <Button onClick={handleSave} size="sm" disabled={loading || saving}>
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              {!saving && saved && <Check size={14} className="mr-1.5" />}
              {saving ? 'Sauvegarde...' : saved ? 'Enregistré' : 'Sauvegarder'}
            </Button>
          </div>
        </div>

        <aside className={cn(
          'rounded-lg border bg-card',
          billingUsage?.plan === 'business'
            ? 'border-amber-200/60 dark:border-amber-700/40'
            : billingUsage?.plan === 'pro'
              ? 'border-purple-200/60 dark:border-purple-700/40'
              : 'border-border'
        )}>
          {/* Plan header */}
          <div className={cn(
            'px-5 py-5 border-b border-border',
            billingUsage?.plan === 'free' && 'pb-5'
          )}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan actuel</p>
                <div className="flex flex-wrap items-center gap-2">
                  {billingUsage && <SubscriptionBadge plan={billingUsage.plan} status={billingUsage.status} />}
                  {billingUsage?.billingPeriod && billingUsage.plan !== 'free' && (
                    <span className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-medium leading-none',
                      billingUsage.billingPeriod === 'annual'
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-800/40'
                        : 'bg-muted text-muted-foreground ring-1 ring-border'
                    )}>
                      {billingUsage.billingPeriod === 'annual' ? 'Annuel' : 'Mensuel'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{accountStatus}</p>
              </div>
              {billingUsage?.plan === 'free' && (
                <Link href="#plans" scroll
                  className={cn(buttonVariants({ size: 'sm', className: 'bg-purple-600 hover:bg-purple-700' }))}>
                  Passer à Pro
                </Link>
              )}
            </div>
          </div>

          {/* Usage meters */}
          <div className="px-5 py-4">
            {billingUsage ? (
              <>
                <p className="text-xs font-medium text-foreground mb-3">Consommation</p>
                <UsageMeter icon={FileText} label="Formulaires actifs" used={billingUsage.usage.activeForms} limit={billingUsage.limits.activeForms} />
                <UsageMeter icon={Bell} label="Notifications WhatsApp" used={billingUsage.usage.whatsappNotifications} limit={billingUsage.limits.whatsappNotifications} />
                <UsageMeter icon={Users} label="Collaborateurs" used={billingUsage.usage.collaborators} limit={billingUsage.limits.collaborators} />
                <div className="mt-4 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  <Activity size={14} />
                  Analytique {billingUsage.limits.analytics === 'advanced' ? 'avancée' : 'standard'} incluse.
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-2 rounded bg-muted" />
                <div className="h-2 rounded bg-muted" />
                <div className="h-2 rounded bg-muted" />
              </div>
            )}
          </div>
        </aside>
      </section>

      {/* ═══ PLAN COMPARISON ═══════════════════════════════════════════════ */}
      <section id="plans" className="rounded-lg border border-border bg-card">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Changer d&apos;offre</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Paiement sécurisé GeniusPay. L&apos;activation se fait par webhook après confirmation.
              </p>
            </div>
            <CreditCard size={16} className="text-muted-foreground shrink-0 mt-0.5" />
          </div>
        </div>

        {/* Plan cards comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {PLAN_GROUPS.map(plan => {
            const isCurrent = billingUsage?.plan === plan.key
            const Icon = plan.key === 'pro' ? Zap : Crown
            return (
              <div key={plan.key} className={cn(
                'relative rounded-xl border p-5 flex flex-col gap-4 transition-all',
                isCurrent
                  ? plan.key === 'pro'
                    ? 'border-purple-300 dark:border-purple-600 bg-purple-50/30 dark:bg-purple-950/20'
                    : 'border-amber-300 dark:border-amber-600 bg-amber-50/30 dark:bg-amber-950/20'
                  : 'border-border bg-card hover:border-foreground/20'
              )}>
                {isCurrent && (
                  <div className={cn(
                    'absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white',
                    plan.key === 'pro' ? 'bg-purple-600' : 'bg-amber-500'
                  )}>
                    Actuel
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    plan.key === 'pro' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
                  )}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={isCurrent ? 'outline' : plan.key === 'pro' ? 'default' : 'outline'}
                    disabled={checkoutLoading !== null || isCurrent}
                    onClick={() => startCheckout(plan.monthly.planId)}
                    className={cn(
                      'justify-between text-xs',
                      !isCurrent && plan.key === 'pro' && 'bg-purple-600 hover:bg-purple-700 border-purple-600'
                    )}
                  >
                    <span>Mensuel</span>
                    <span className="font-mono text-[11px] opacity-80">{plan.monthly.price}</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={isCurrent ? 'outline' : plan.key === 'business' ? 'default' : 'outline'}
                    disabled={checkoutLoading !== null || isCurrent}
                    onClick={() => startCheckout(plan.annual.planId)}
                    className={cn(
                      'justify-between text-xs',
                      !isCurrent && plan.key === 'business' && 'bg-amber-600 hover:bg-amber-700 border-amber-600'
                    )}
                  >
                    <span>Annuel</span>
                    <span className="font-mono text-[11px] opacity-80">{plan.annual.price}</span>
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Inclus</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {(plan.key === 'pro'
                      ? ['5 formulaires actifs', '1 000 notifications WhatsApp/mois', '5 collaborateurs', 'Import Google Forms', 'Export CSV']
                      : ['20 formulaires actifs', '10 000 notifications WhatsApp/mois', '20 collaborateurs', 'Analytique avancée', 'Support prioritaire']
                    ).map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check size={11} className={plan.key === 'pro' ? 'text-purple-500 shrink-0' : 'text-amber-500 shrink-0'} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-2 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
          <CalendarClock size={13} />
          Les compteurs WhatsApp se remettent à zéro chaque mois. Un abonnement expiré revient automatiquement au plan gratuit.
        </div>
      </section>

      {/* ═══ SIGN OUT ════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4">
        <div>
          <p className="text-sm font-medium text-foreground">Session</p>
          <p className="text-xs text-muted-foreground mt-0.5">Vous êtes connecté à votre compte Kamforms.</p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: '/' })}
          className="inline-flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 border border-border transition-colors cursor-pointer"
        >
          <LogOut size={13} />Se déconnecter
        </button>
      </div>
    </div>
  )
}
