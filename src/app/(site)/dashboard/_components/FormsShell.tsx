'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { FormCard } from '@/components/form-card'
import { OnboardingWelcome } from '@/components/onboarding-welcome'
import { OnboardingChecklist } from '@/components/onboarding-checklist'
import { SubscriptionBadge } from '@/components/subscription-badge'

interface Form {
  id: string
  title: string
  slug: string
  active: boolean
  _count: { submissions: number }
  createdAt: string
}

type SubscriptionSummary = {
  plan: string
  status: string
  activeFormsLimit: number
  activeFormsUsed: number
}

type Filter = 'all' | 'active' | 'inactive'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',      label: 'Tous' },
  { id: 'active',   label: 'Actifs' },
  { id: 'inactive', label: 'Inactifs' },
]

export function FormsShell({
  initialForms,
  subscription,
  onboarding,
}: {
  initialForms: Form[]
  subscription: SubscriptionSummary
  onboarding?: {
    hasWhatsapp: boolean
    hasEmail: boolean
    hasCustomizedTheme: boolean
    hasShared?: boolean
    onboardingCompleted?: boolean
  }
}) {
  const router = useRouter()
  const [forms, setForms]   = useState<Form[]>(initialForms)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const lastRefreshRef      = useRef(0)

	  useEffect(() => { setForms(initialForms) }, [initialForms])

	  useEffect(() => {
	    lastRefreshRef.current = Date.now()
	    const onFocus = () => {
	      if (Date.now() - lastRefreshRef.current < 30_000) return
	      lastRefreshRef.current = Date.now()
	      router.refresh()
	    }
	    window.addEventListener('focus', onFocus)
	    return () => window.removeEventListener('focus', onFocus)
	  }, [router])

	  // Vérification des relances onboarding (J1, J3, J7)
	  useEffect(() => {
	    const sentKey = 'kamforms-onboarding-reminders-sent'
	    const alreadySent = JSON.parse(localStorage.getItem(sentKey) ?? '[]') as string[]
	    const typesToCheck = ['reminder-create', 'reminder-notifications', 'reminder-share']
	    const pending = typesToCheck.filter(t => !alreadySent.includes(t))
	    if (pending.length === 0) return
	    fetch('/api/onboarding/reminder', { method: 'POST' })
	      .then(r => r.json())
	      .then((data: { sent: boolean; type?: string }) => {
	        if (data.sent && data.type) {
	          localStorage.setItem(sentKey, JSON.stringify([...alreadySent, data.type]))
	        }
	      })
	      .catch(() => {})
	  }, [])

  function handleDeleted(id: string) { setForms(prev => prev.filter(f => f.id !== id)) }
  function handleToggled(id: string, active: boolean) {
    setForms(prev => prev.map(f => f.id === id ? { ...f, active } : f))
  }

  const totalResponses = forms.reduce((sum, f) => sum + f._count.submissions, 0)
  const activeCount    = forms.filter(f => f.active).length
  const hasReachedActiveLimit = activeCount >= subscription.activeFormsLimit

  const filtered = forms
    .filter(f => filter === 'all' ? true : filter === 'active' ? f.active : !f.active)
    .filter(f => !search.trim() || f.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-semibold text-foreground">Formulaires</h1>
          <SubscriptionBadge plan={subscription.plan} status={subscription.status} />
        </div>
        {hasReachedActiveLimit ? (
          <Link href="/dashboard/settings" className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}>
            Limite atteinte
          </Link>
        ) : (
          <Link href="/dashboard/forms/new" className={cn(buttonVariants({ size: 'sm' }))}>
            <Plus size={14} className="mr-1.5" />
            Nouveau
          </Link>
        )}
      </div>

      {hasReachedActiveLimit && (
        <div className="mb-5 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-[13px] text-amber-800 dark:text-amber-300">
          Votre plan autorise {subscription.activeFormsLimit} formulaire(s) actif(s). Désactivez un formulaire ou passez à une offre supérieure pour en créer un nouveau.
        </div>
      )}

      {/* Onboarding — bienvenue au premier login */}
      <OnboardingWelcome />

      {/* Onboarding — checklist de démarrage */}
      {forms.length > 0 && (
        <div className="mb-5">
          <OnboardingChecklist
            hasForms
            hasWhatsapp={onboarding?.hasWhatsapp ?? false}
            hasEmail={onboarding?.hasEmail ?? false}
            hasSubmissions={totalResponses > 0}
            hasCustomizedTheme={onboarding?.hasCustomizedTheme ?? false}
            hasShared={onboarding?.hasShared ?? false}
          />
        </div>
      )}

      {forms.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Formulaires', value: forms.length },
            { label: 'Actifs',      value: activeCount },
            { label: 'Réponses',    value: totalResponses },
          ].map(s => (
            <div key={s.label} className="border border-border rounded-lg px-4 py-3 bg-card">
              <p className="text-[22px] font-semibold text-foreground leading-none mb-1">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {forms.length > 0 && (
        <div className="relative mb-3">
          <Search size={13} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un formulaire…"
            aria-label="Rechercher un formulaire"
            className="w-full pl-8 pr-3 py-2 text-[13px] bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground"
          />
        </div>
      )}

      {forms.length > 0 && (
        <div role="tablist" aria-label="Filtrer les formulaires" className="flex gap-0 border-b border-border mb-4">
          {FILTERS.map(f => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'relative px-4 py-2 text-[13px] font-medium border-0 bg-transparent cursor-pointer transition-colors whitespace-nowrap',
                filter === f.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
              {filter === f.id && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-t-sm bg-foreground" />
              )}
            </button>
          ))}
        </div>
      )}

      {forms.length === 0 && (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-5 ring-1 ring-border">
            <Plus size={22} className="text-muted-foreground" />
          </div>
          <p className="text-[16px] font-semibold text-foreground mb-1">Bienvenue sur Kamforms</p>
          <p className="text-[13px] text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
            Crée ton premier formulaire en quelques secondes avec l&apos;IA. Aucune compétence technique requise.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard/forms/new" className={cn(buttonVariants({ size: 'sm' }))}>
              <Plus size={14} className="mr-1.5" />Créer mon formulaire
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-[11px] text-muted-foreground">
            <span>Génération IA</span>
            <span>Notifications WhatsApp</span>
            <span>Lien public</span>
          </div>
        </div>
      )}

      {forms.length > 0 && filtered.length === 0 && (
        <p className="text-[13px] text-muted-foreground text-center py-10">
          {search.trim() ? `Aucun résultat pour "${search}"` : 'Aucun formulaire dans cette catégorie.'}
        </p>
      )}

	      <div className="flex flex-col gap-1.5">
	        {filtered.map(form => (
	          <FormCard key={form.id} form={form} onDeleted={handleDeleted} onToggled={handleToggled} />
	        ))}
	      </div>

	      {/* FAB — Nouveau formulaire sur mobile */}
	      {!hasReachedActiveLimit && forms.length > 0 && (
	        <Link
	          href="/dashboard/forms/new"
	          className="md:hidden fixed right-5 bottom-24 z-40 w-12 h-12 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
	          aria-label="Nouveau formulaire"
	        >
	          <Plus size={20} />
	        </Link>
	      )}
	    </div>
  )
}
