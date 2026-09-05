'use client'

import { useEffect } from 'react'

export default function PublicFormError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-2">
        <p className="text-sm font-medium">Formulaire introuvable</p>
        <p className="text-xs text-muted-foreground">
          Ce lien ne retrouve plus son formulaire. Vérifiez l&apos;adresse ou demandez un nouveau lien.
        </p>
      </div>
    </div>
  )
}
