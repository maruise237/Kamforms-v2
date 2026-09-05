'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export type OnboardingUsage =
  | 'commandes'
  | 'evenement'
  | 'recrutement'
  | 'satisfaction'
  | 'autre'
  | null

export interface OnboardingData {
  usage: OnboardingUsage
  activity: string
  phone: string
  formSlug: string
  formId: string
  shared: boolean
  completed: boolean
  currentStep: number
}

const STORAGE_KEY = 'kf-onboarding'
const TOTAL_STEPS = 6

function loadFromStorage(): OnboardingData {
  if (typeof window === 'undefined') {
    return {
      usage: null, activity: '', phone: '', formSlug: '', formId: '',
      shared: false, completed: false, currentStep: 0,
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    usage: null, activity: '', phone: '', formSlug: '', formId: '',
    shared: false, completed: false, currentStep: 0,
  }
}

function saveToStorage(data: OnboardingData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function useOnboarding() {
  const router = useRouter()
  const [data, setData] = useState<OnboardingData>(loadFromStorage)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/onboarding/status')
      .then(r => r.json())
      .then((res: { isNewUser: boolean }) => {
        if (!res.isNewUser && loadFromStorage().completed) {
          router.replace('/dashboard')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const update = useCallback((partial: Partial<OnboardingData>) => {
    setData(prev => {
      const next = { ...prev, ...partial }
      saveToStorage(next)
      return next
    })
  }, [])

  const goToStep = useCallback((step: number) => {
    if (step < 0 || step >= TOTAL_STEPS) return
    update({ currentStep: step })
  }, [update])

  const nextStep = useCallback(() => {
    if (data.currentStep < TOTAL_STEPS - 1) {
      goToStep(data.currentStep + 1)
    }
  }, [data.currentStep, goToStep])

  const prevStep = useCallback(() => {
    if (data.currentStep > 0) {
      goToStep(data.currentStep - 1)
    }
  }, [data.currentStep, goToStep])

  const complete = useCallback(async () => {
    update({ completed: true, currentStep: TOTAL_STEPS - 1 })
    try {
      await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingCompleted: true,
          onboardingUsage: data.usage,
          onboardingActivity: data.activity,
        }),
      })
    } catch {}
    localStorage.removeItem('kamforms-onboarding-welcome-seen')
  }, [data.usage, data.activity, update])

  const reset = useCallback(() => {
    const fresh: OnboardingData = {
      usage: null, activity: '', phone: '', formSlug: '', formId: '',
      shared: false, completed: false, currentStep: 0,
    }
    setData(fresh)
    saveToStorage(fresh)
  }, [])

  const hasForm = !!data.formId
  const hasWhatsapp = !!data.phone
  const hasShared = data.shared
  const progress = data.completed ? 100 : Math.round((data.currentStep / (TOTAL_STEPS - 1)) * 100)

  return {
    data,
    loading,
    hasForm,
    hasWhatsapp,
    hasShared,
    progress,
    totalSteps: TOTAL_STEPS,
    update,
    goToStep,
    nextStep,
    prevStep,
    complete,
    reset,
  }
}
