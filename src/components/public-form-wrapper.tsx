'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { contrastColor } from '@/lib/form-theme'

interface Props {
  bgColor?: string          // undefined = mode Auto
  className?: string
  children: React.ReactNode
}

/**
 * Wrapper isolé pour les formulaires publics.
 *
 * - bgColor fourni : fond fixe, .dark calculé depuis la luminance.
 * - bgColor absent (mode Auto) :
 *   1. Classe CSS `auto-theme` → active les variables dark via @media
 *      (prefers-color-scheme: dark) sans JS → zéro flash au chargement.
 *   2. JS ajoute .dark après hydration → active les utilitaires Tailwind dark:.
 *   100% indépendant du thème dashboard de l'owner (ThemeProvider isolé dans
 *   le layout (site), pas présent sur les pages /f/[slug]).
 */
export function PublicFormWrapper({ bgColor, className, children }: Props) {
  const [systemDark, setSystemDark] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (bgColor) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [bgColor])

  const isDark = bgColor
    ? contrastColor(bgColor) === '#ffffff'
    : systemDark === true

  return (
    <div
      className={cn(
        className,
        'text-foreground',
        isDark && 'dark',
        !bgColor && 'auto-theme bg-background',
      )}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      suppressHydrationWarning
    >
      {children}
    </div>
  )
}
