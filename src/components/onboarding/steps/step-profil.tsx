'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { OnboardingUsage } from '@/hooks/use-onboarding'

const OPTIONS: { value: OnboardingUsage; label: string; desc: string }[] = [
  { value: 'commandes', label: 'Commandes & devis', desc: 'Collecte les commandes de tes clients et gère les devis.' },
  { value: 'evenement', label: 'Inscriptions à un événement', desc: 'Inscris des participants à un atelier, webinaire ou formation.' },
  { value: 'recrutement', label: 'Candidatures & recrutement', desc: 'Reçois des candidatures structurées pour tes offres.' },
  { value: 'satisfaction', label: 'Satisfaction client', desc: 'Recueille les avis de tes clients après une vente ou un service.' },
  { value: 'autre', label: 'Autre chose', desc: 'Un autre type de formulaire ? On s\'adapte.' },
]

export function StepProfil({
  initialUsage,
  initialActivity,
  onNext,
  onSkip,
  onData,
}: {
  initialUsage: OnboardingUsage
  initialActivity: string
  onNext: () => void
  onSkip: () => void
  onData: (usage: OnboardingUsage, activity: string) => void
}) {
  const [usage, setUsage] = useState<OnboardingUsage>(initialUsage)
  const [activity, setActivity] = useState(initialActivity)

  function handleContinue() {
    if (!usage) return
    onData(usage, activity)
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col max-w-sm mx-auto w-full"
    >
      <div className="text-center mb-6">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          Tu veux utiliser Kamforms pour quoi ?
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ça nous aide à te suggérer le bon modèle.
        </p>
      </div>
      <div role="radiogroup" aria-label="Usage de Kamforms" className="space-y-2 mb-5">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={usage === opt.value}
            onClick={() => setUsage(opt.value)}
            className={cn(
              'w-full flex items-start gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors',
              usage === opt.value
                ? 'border-foreground bg-card'
                : 'border-border bg-card hover:border-muted-foreground',
            )}
          >
            <span className={cn(
              'w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors',
              usage === opt.value ? 'border-foreground' : 'border-muted-foreground/30',
            )}>
              {usage === opt.value && (
                <span className="w-2 h-2 rounded-full bg-foreground" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">{opt.label}</span>
              <span className="block text-xs text-muted-foreground mt-0.5">{opt.desc}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="mb-6">
        <label htmlFor="onboarding-activity" className="block text-xs font-medium text-foreground mb-1.5">
          Ton activité <span className="text-muted-foreground font-normal">(facultatif)</span>
        </label>
        <input
          id="onboarding-activity"
          type="text"
          value={activity}
          onChange={e => setActivity(e.target.value)}
          placeholder="Ex. restaurant, boutique en ligne, ONG..."
          className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleContinue} disabled={!usage} className="w-full">
          Continuer
        </Button>
        <Button variant="ghost" onClick={onSkip} className="w-full text-xs text-muted-foreground">
          Passer
        </Button>
      </div>
    </motion.div>
  )
}
