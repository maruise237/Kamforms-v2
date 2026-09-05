'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useOnboarding } from '@/hooks/use-onboarding'
import { Stepper } from '@/components/onboarding/stepper'
import { StepBienvenue } from '@/components/onboarding/steps/step-bienvenue'
import { StepProfil } from '@/components/onboarding/steps/step-profil'
import { StepCreationIa } from '@/components/onboarding/steps/step-creation-ia'
import { StepWhatsapp } from '@/components/onboarding/steps/step-whatsapp'
import { StepPartage } from '@/components/onboarding/steps/step-partage'
import { StepTableauDeBord } from '@/components/onboarding/steps/step-tableau-de-bord'
import { Logo } from '@/components/logo'

export function OnboardingFlow() {
  const router = useRouter()
  const {
    data, loading, totalSteps,
    hasForm, hasWhatsapp, hasShared,
    update, nextStep, goToStep, complete,
  } = useOnboarding()

  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading) return
    if (data.completed) {
      router.replace('/dashboard')
      return
    }
    setReady(true)
  }, [loading, data.completed, router])

  if (loading || !ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Logo size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => {
                if (data.currentStep > 0) {
                  goToStep(data.currentStep - 1)
                } else {
                  router.push('/dashboard')
                }
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {data.currentStep > 0 ? 'Retour' : 'Passer'}
            </button>
            <Logo size={18} wordmark />
            <div className="w-10" />
          </div>
          <Stepper
            currentStep={data.currentStep}
            totalSteps={totalSteps}
          />
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {data.currentStep === 0 && (
              <StepBienvenue
                key="step-0"
                onNext={nextStep}
                onSkip={() => { complete(); router.push('/dashboard') }}
              />
            )}
            {data.currentStep === 1 && (
              <StepProfil
                key="step-1"
                initialUsage={data.usage}
                initialActivity={data.activity}
                onNext={nextStep}
                onSkip={nextStep}
                onData={(usage, activity) => update({ usage, activity })}
              />
            )}
            {data.currentStep === 2 && (
              <StepCreationIa
                key="step-2"
                usage={data.usage}
                onNext={nextStep}
                onData={(slug, formId) => update({ formSlug: slug, formId })}
              />
            )}
            {data.currentStep === 3 && (
              <StepWhatsapp
                key="step-3"
                initialPhone={data.phone}
                onNext={nextStep}
                onSkip={nextStep}
                onData={phone => update({ phone })}
              />
            )}
            {data.currentStep === 4 && (
              <StepPartage
                key="step-4"
                formSlug={data.formSlug}
                onNext={nextStep}
                onData={() => update({ shared: true })}
              />
            )}
            {data.currentStep === 5 && (
              <StepTableauDeBord
                key="step-5"
                hasForm={hasForm}
                hasWhatsapp={hasWhatsapp}
                hasShared={hasShared}
                formSlug={data.formSlug}
                onComplete={() => {
                  complete().then(() => router.push('/dashboard'))
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
