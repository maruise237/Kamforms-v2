'use client'

import { useState } from 'react'
import { Check, Loader2, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EndingPreview } from '@/components/ending-preview'
import { useSaveState } from '@/hooks/use-save-state'
import { cn } from '@/lib/utils'
import type { FormEnding } from '@/lib/form-ending'
import type { Form } from '../_types'

interface EndingPanelProps {
  formId: string
  initial: FormEnding | null
  onUpdate: (patch: Partial<Form>) => void
}

export function EndingPanel({ formId, initial, onUpdate }: EndingPanelProps) {
  const [message, setMessage]         = useState(initial?.message ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [buttonLabel, setButtonLabel] = useState(initial?.buttonLabel ?? '')
  const [buttonUrl, setButtonUrl]     = useState(initial?.buttonUrl ?? '')
  const [confetti, setConfetti]       = useState(initial?.confetti !== false) // default true
  const { saving, saved, wrap }       = useSaveState()

  async function handleSave() {
    const ending: FormEnding = {
      ...(message     && { message }),
      ...(description && { description }),
      ...(buttonLabel && buttonUrl && { buttonLabel, buttonUrl }),
      confetti,
    }
    await wrap(async () => {
      await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ending }),
      })
      onUpdate({ ending })
    })
  }

  return (
    <div className="border border-border rounded-lg p-5 mb-6">
      <p className="text-sm font-medium text-foreground mb-4">Fin de formulaire</p>

      {/* Message + description */}
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Message principal</p>
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Réponse enregistrée (affiché si vide)"
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Description</p>
          <Input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Vous pouvez fermer cette page. (affiché si vide)"
          />
        </div>
      </div>

      {/* Redirect button */}
      <div className="border-t border-border pt-4 mb-4">
        <p className="text-xs text-muted-foreground mb-3">Bouton de redirection (optionnel)</p>
        <div className="space-y-2">
          <Input
            value={buttonLabel}
            onChange={e => setButtonLabel(e.target.value)}
            placeholder="Libellé du bouton — ex : Voir notre site"
          />
          <Input
            value={buttonUrl}
            onChange={e => setButtonUrl(e.target.value)}
            placeholder="https://..."
            type="url"
          />
        </div>
        {Boolean(buttonLabel) !== Boolean(buttonUrl) && (
          <p className="text-xs text-destructive mt-1.5">Les deux champs sont requis pour afficher le bouton.</p>
        )}
      </div>

      {/* Confetti toggle */}
      <div className="border-t border-border pt-4 mb-5">
        <button
          type="button"
          onClick={() => setConfetti(v => !v)}
          className={cn(
            'w-full flex items-center justify-between rounded-lg border px-4 py-3 transition-colors text-left',
            confetti
              ? 'border-foreground bg-foreground/5'
              : 'border-border bg-card hover:border-muted-foreground'
          )}
        >
          <div className="flex items-center gap-2.5">
            <PartyPopper size={15} className={confetti ? 'text-foreground' : 'text-muted-foreground'} />
            <div>
              <p className={cn('text-sm font-medium', confetti ? 'text-foreground' : 'text-muted-foreground')}>
                Confettis à la soumission
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Animation de célébration quand le formulaire est envoyé
              </p>
            </div>
          </div>
          <div className={cn(
            'w-9 h-5 rounded-full transition-colors shrink-0 relative',
            confetti ? 'bg-foreground' : 'bg-muted'
          )}>
            <span className={cn(
              'absolute top-0.5 w-4 h-4 rounded-full bg-background transition-all',
              confetti ? 'left-[18px]' : 'left-0.5'
            )} />
          </div>
        </button>
      </div>

      <Button size="sm" onClick={handleSave} disabled={saving}>
        {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
        {saved ? <><Check size={14} className="mr-1.5" />Enregistré</> : 'Enregistrer la fin'}
      </Button>

      {/* Live preview */}
      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">Aperçu</p>
        <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
          <EndingPreview
            ending={{ message, description, buttonLabel, buttonUrl, confetti }}
            preview={true}
          />
        </div>
      </div>
    </div>
  )
}
