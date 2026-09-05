'use client'

import confetti from 'canvas-confetti'
import { useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isSafeUrl } from '@/lib/utils'
import type { FormEnding } from '@/lib/form-ending'

// Animated SVG checkmark — draws the circle then the check in sequence
function SuccessIcon() {
  return (
    <svg
      viewBox="0 0 52 52"
      className="w-20 h-20 text-foreground"
      fill="none"
      aria-hidden
    >
      <circle
        cx="26"
        cy="26"
        r="25"
        stroke="currentColor"
        strokeWidth="2"
        className="animate-success-circle"
      />
      <path
        d="M14 27 l9 9 l15 -15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-success-check"
      />
    </svg>
  )
}

interface EndingPreviewProps {
  ending?: Partial<FormEnding> | null
  preview?: boolean
}

// Visible on both light and dark backgrounds
const CONFETTI_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export function EndingPreview({ ending, preview = false }: EndingPreviewProps) {
  const message     = ending?.message     || 'Réponse enregistrée'
  const description = ending?.description || 'Vous pouvez fermer cette page.'
  const hasButton   = !!(ending?.buttonLabel && ending?.buttonUrl && isSafeUrl(ending.buttonUrl ?? ''))
  // confetti is enabled by default (undefined = true)
  const withConfetti = ending?.confetti !== false

  useEffect(() => {
    if (preview || !withConfetti) return

    const end = Date.now() + 2500
    let raf: number

    function shoot() {
      confetti({ particleCount: 8, angle: 60,  spread: 55, startVelocity: 45, gravity: 0.9, origin: { x: 0, y: 0.65 }, colors: CONFETTI_COLORS })
      confetti({ particleCount: 8, angle: 120, spread: 55, startVelocity: 45, gravity: 0.9, origin: { x: 1, y: 0.65 }, colors: CONFETTI_COLORS })
      if (Date.now() < end) {
        raf = requestAnimationFrame(shoot)
      }
    }

    shoot()
    return () => cancelAnimationFrame(raf)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="text-center py-12 px-6">
      <div className="flex justify-center mb-5">
        <SuccessIcon />
      </div>
      <p className="text-foreground font-semibold text-lg mb-2 leading-snug">{message}</p>
      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{description}</p>
      {hasButton && (
        <a
          href={ending!.buttonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-6"
        >
          <Button size="sm">
            {ending!.buttonLabel}
            <ExternalLink size={12} className="ml-1.5" />
          </Button>
        </a>
      )}
    </div>
  )
}
