'use client'

import { cn } from '@/lib/utils'

const LABELS = [
  'Bienvenue',
  'Profil',
  'Création IA',
  'WhatsApp',
  'Partage',
  'Tableau de bord',
]

export function Stepper({
  currentStep,
  totalSteps = 6,
  onStepClick,
}: {
  currentStep: number
  totalSteps?: number
  onStepClick?: (step: number) => void
}) {
  return (
    <nav aria-label="Progression de l'onboarding" className="w-full">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => onStepClick?.(i)}
              disabled={i > currentStep && !onStepClick}
              aria-current={i === currentStep ? 'step' : undefined}
              className={cn(
                'relative flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold transition-all shrink-0',
                i < currentStep && 'bg-foreground text-background',
                i === currentStep && 'bg-foreground text-background ring-2 ring-offset-2 ring-foreground',
                i > currentStep && 'bg-muted text-muted-foreground',
              )}
            >
              {i < currentStep ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                i + 1
              )}
            </button>
            <div className={cn(
              'h-px flex-1 mx-1.5',
              i < totalSteps - 1 && (i < currentStep ? 'bg-foreground' : 'bg-border'),
              i >= totalSteps - 1 && 'hidden',
            )} />
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground text-center mt-1.5">
        {LABELS[currentStep] ?? `Étape ${currentStep + 1}`}
        <span className="text-muted-foreground/50 ml-1">
          · {currentStep + 1}/{totalSteps}
        </span>
      </p>
    </nav>
  )
}
