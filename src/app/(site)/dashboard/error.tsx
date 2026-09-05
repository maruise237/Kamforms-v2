'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <p className="text-sm font-medium text-foreground">Une erreur est survenue</p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Quelque chose s&apos;est mal passé. Vous pouvez réessayer ou revenir plus tard.
      </p>
      <Button size="sm" variant="outline" onClick={reset}>
        Réessayer
      </Button>
    </div>
  )
}
