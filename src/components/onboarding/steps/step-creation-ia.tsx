'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { OnboardingUsage } from '@/hooks/use-onboarding'

const DEFAULTS: Record<string, { prompt: string; examples: string[] }> = {
  commandes: {
    prompt: 'Formulaire de commande pour restaurant — nom, menu choisi, quantité, adresse livraison, téléphone WhatsApp',
    examples: ['Commande de repas livraison', 'Demande de devis prestation', 'Précommande produit'],
  },
  evenement: {
    prompt: 'Inscription à un webinaire — nom, email, téléphone, disponibilité',
    examples: ['Inscription atelier gratuit', 'Confirmation présence séminaire', 'Candidature bénévole'],
  },
  recrutement: {
    prompt: 'Candidature spontanée — nom, poste visé, téléphone, CV résumé, disponibilité',
    examples: ['Offre stage marketing', 'Recrutement commercial', 'Candidature CDI'],
  },
  satisfaction: {
    prompt: 'Sondage satisfaction client — note, points forts, axes amélioration, recommanderais-tu ?',
    examples: ['Enquête satisfaction livraison', 'Avis après achat', 'Évaluation prestation'],
  },
  autre: {
    prompt: 'Formulaire de contact — nom, email, téléphone, message',
    examples: ['Contact service client', 'Demande d\'information', 'Inscription newsletter'],
  },
}

interface GeneratedField {
  id: string
  type: string
  label: string
  required: boolean
  options?: string[]
  placeholder?: string
}

interface GeneratedForm {
  title: string
  slug: string
  fields: GeneratedField[]
}

export function StepCreationIa({
  usage,
  onNext,
  onData,
}: {
  usage: OnboardingUsage
  onNext: () => void
  onData: (slug: string, formId: string, title: string) => void
}) {
  const cfg = DEFAULTS[usage ?? 'autre'] ?? DEFAULTS.autre
  const [prompt, setPrompt] = useState(cfg.prompt)
  const [state, setState] = useState<'input' | 'loading' | 'preview'>('input')
  const [form, setForm] = useState<GeneratedForm | null>(null)

  function generatePreview(p: string) {
    setState('loading')
    const slug = p.slice(0, 40).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mon-formulaire'
    const title = p.length > 60 ? p.slice(0, 57) + '...' : p

    const fields: GeneratedField[] = [
      { id: 'name', type: 'text', label: 'Nom & prénoms', required: true, placeholder: 'Jean Kouamé' },
      { id: 'phone', type: 'tel', label: 'Téléphone WhatsApp', required: true, placeholder: '+225 01 02 03 04 05' },
      { id: 'choice', type: 'radio', label: 'Type de demande', required: true, options: ['Information', 'Commande', 'Devis', 'Autre'] },
      { id: 'date', type: 'date', label: 'Date souhaitée', required: false },
      { id: 'precision', type: 'text', label: 'Précisions', required: false, placeholder: 'Détails supplémentaires...' },
      { id: 'message', type: 'textarea', label: 'Message', required: false, placeholder: 'Votre message...' },
    ]

    setTimeout(() => {
      setForm({ title, slug, fields })
      setState('preview')
    }, 1500)
  }

  function handleUseForm() {
    const id = `onboarding-${Date.now()}`
    const slug = form?.slug ?? 'mon-formulaire'
    const title = form?.title ?? 'Mon formulaire'
    const formId = id
    onData(slug, formId, title)
    onNext()
  }

  const isDisabled = state === 'loading'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col max-w-sm mx-auto w-full"
    >
      <div className="text-center mb-5">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Crée ton formulaire</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Décris ce que tu veux collecter, l&apos;IA génère les champs.
        </p>
      </div>

      {state === 'input' && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-foreground">Décris ton formulaire</Label>
            <Textarea
              className="mt-1.5 resize-none"
              rows={3}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="ex : formulaire de commande pour restaurant..."
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Exemples :</p>
            <div className="flex flex-wrap gap-1.5">
              {cfg.examples.map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className={cn(
                    'text-xs rounded-full border border-border px-2.5 py-1 transition-colors',
                    'hover:border-muted-foreground hover:bg-muted/30',
                  )}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={() => generatePreview(prompt)}
            disabled={!prompt.trim()}
            className="w-full"
          >
            <Sparkles size={14} className="mr-1.5" />
            Générer mon formulaire
          </Button>
        </div>
      )}

      {state === 'loading' && (
        <div className="flex flex-col items-center py-10">
          <Loader2 size={24} className="animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">L&apos;IA rédige tes champs...</p>
          <div className="w-full space-y-2 mt-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" style={{ width: `${60 + i * 8}%` }} />
            ))}
          </div>
        </div>
      )}

      {state === 'preview' && form && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {form.fields.length} champs générés
            </span>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            {form.fields.map(f => (
              <div key={f.id}>
                <label className="block text-xs font-medium text-foreground mb-1">
                  {f.label}
                  {f.required && <span className="text-destructive ml-0.5">*</span>}
                </label>
                {f.type === 'radio' ? (
                  <div className="space-y-1">
                    {f.options?.map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="radio" name={f.id} disabled className="accent-foreground" />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : f.type === 'textarea' ? (
                  <div className="h-16 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-muted-foreground/50">
                    {f.placeholder ?? ''}
                  </div>
                ) : (
                  <div className="h-8 rounded-md border border-input bg-background px-2.5 flex items-center text-xs text-muted-foreground/50">
                    {f.placeholder ?? ''}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button onClick={handleUseForm} className="w-full">
            Utiliser ce formulaire
          </Button>
          <button
            type="button"
            onClick={() => setState('input')}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            Modifier le prompt
          </button>
        </div>
      )}
    </motion.div>
  )
}
