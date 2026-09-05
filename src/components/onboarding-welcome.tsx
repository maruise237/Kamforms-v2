'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * OnboardingWelcome détecte les nouveaux utilisateurs et les redirige
 * vers le nouveau flow d'onboarding en 6 étapes (/onboarding).
 */
export function OnboardingWelcome() {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/onboarding/status')
      .then(r => r.json())
      .then((data: { isNewUser: boolean }) => {
        if (data.isNewUser) {
          fetch('/api/onboarding/welcome', { method: 'POST' }).catch(() => {})
          router.replace('/onboarding')
        }
      })
      .catch(() => {
        const seen = localStorage.getItem('kamforms-onboarding-welcome-seen')
        if (!seen) {
          router.replace('/onboarding')
        }
      })
  }, [router])

  return null
}
