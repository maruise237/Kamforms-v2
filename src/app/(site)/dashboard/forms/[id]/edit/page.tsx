'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { FormField, FieldType } from '@/lib/form-schema'
import { toast } from 'sonner'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text',     label: 'Texte court'     },
  { value: 'email',    label: 'Email'            },
  { value: 'phone',    label: 'Téléphone'        },
  { value: 'number',   label: 'Nombre'           },
  { value: 'textarea', label: 'Texte long'       },
  { value: 'select',   label: 'Liste déroulante' },
  { value: 'radio',    label: 'Choix unique'     },
  { value: 'checkbox', label: 'Case à cocher'    },
  { value: 'date',     label: 'Date'             },
  { value: 'rating',   label: 'Note (1-5)'       },
]

function newField(index: number): FormField {
  return {
    id: `field_${Date.now()}_${index}`,
    type: 'text',
    label: '',
    required: false,
  }
}

// ─── Single field editor card ─────────────────────────────────────────────────

function FieldCard({
  field,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: {
  field: FormField
  index: number
  total: number
  onChange: (f: FormField) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const needsOptions = field.type === 'select' || field.type === 'radio'
  const options = field.options ?? []

  function setOption(i: number, val: string) {
    const next = [...options]
    next[i] = val
    onChange({ ...field, options: next })
  }

  function addOption() {
    onChange({ ...field, options: [...options, ''] })
  }

  function removeOption(i: number) {
    onChange({ ...field, options: options.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="border border-border rounded-lg bg-card p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-2">
        {/* Move buttons */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed leading-none text-xs"
          >
            ▲
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed leading-none text-xs"
          >
            ▼
          </button>
        </div>

        <span className="text-xs text-muted-foreground font-mono w-6 shrink-0">{index + 1}</span>

        {/* Type selector */}
        <select
          value={field.type}
          onChange={e => {
            const type = e.target.value as FieldType
            const update: FormField = { ...field, type }
            if (type !== 'select' && type !== 'radio') delete update.options
            onChange(update)
          }}
          className="text-sm border border-border rounded-md bg-background text-foreground px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          {FIELD_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Required toggle */}
        <label className="flex items-center gap-1.5 ml-auto cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={field.required}
            onChange={e => onChange({ ...field, required: e.target.checked })}
            className="accent-foreground w-3.5 h-3.5"
          />
          <span className="text-xs text-muted-foreground">Requis</span>
        </label>

        {/* Delete */}
        <button
          type="button"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-1"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Label */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">Libellé</Label>
        <Input
          value={field.label}
          onChange={e => onChange({ ...field, label: e.target.value })}
          placeholder="Ex : Nom complet"
          className="text-sm"
        />
      </div>

      {/* Description (help text below label) */}
      {field.type !== 'checkbox' && (
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Description <span className="text-muted-foreground/60">(texte d'aide sous le libellé, optionnel)</span></Label>
          <Input
            value={field.description ?? ''}
            onChange={e => onChange({ ...field, description: e.target.value || undefined })}
            placeholder="Ex : Entrez votre adresse email professionnelle"
            className="text-sm"
          />
        </div>
      )}

      {/* Placeholder */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">
          {field.type === 'checkbox' ? 'Texte à côté de la case' : "Placeholder (texte dans le champ, optionnel)"}
        </Label>
        <Input
          value={field.placeholder ?? ''}
          onChange={e => onChange({ ...field, placeholder: e.target.value || undefined })}
          placeholder={field.type === 'checkbox' ? "Ex : J'accepte les conditions" : 'Ex : Jean Dupont'}
          className="text-sm"
        />
      </div>

      {/* Options (for select / radio) */}
      {needsOptions && (
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Options</Label>
          <div className="space-y-1.5">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={e => setOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="text-sm flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  disabled={options.length <= 1}
                  className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-20"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              <Plus size={12} />
              Ajouter une option
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditFormPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [fields, setFields]           = useState<FormField[]>([])
  const [steps, setSteps]             = useState<{ title: string }[] | undefined>(undefined)
  const [ending, setEnding]           = useState<Record<string, unknown> | undefined>(undefined)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then(r => r.json())
      .then(data => {
        setTitle(data.title ?? '')
        setDescription(data.description ?? '')
        setFields(data.schema?.fields ?? [])
        setSteps(data.schema?.steps ?? undefined)
        setEnding(data.ending ?? undefined)
        setLoading(false)
      })
  }, [id])

  function updateField(index: number, updated: FormField) {
    setFields(prev => prev.map((f, i) => (i === index ? updated : f)))
  }

  function deleteField(index: number) {
    setFields(prev => prev.filter((_, i) => i !== index))
  }

  function addField() {
    setFields(prev => [...prev, newField(prev.length)])
  }

  function moveField(index: number, dir: -1 | 1) {
    const next = [...fields]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setFields(next)
  }

  async function handleSave() {
    if (!title.trim()) { setError('Le titre est obligatoire.'); return }

    const emptyLabel = fields.findIndex(f => f.type !== 'checkbox' && !f.label.trim())
    if (emptyLabel >= 0) {
      setError(`Le champ ${emptyLabel + 1} n'a pas de libellé.`)
      return
    }

    const reindexed = fields.map((f, i) => ({ ...f, id: `field_${i + 1}` }))

    setSaving(true)
    setError('')

    const res = await fetch(`/api/forms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: description || null,
        schema: { fields: reindexed, ...(steps ? { steps } : {}) },
        ...(ending !== undefined ? { ending } : {}),
      }),
    })

    setSaving(false)

    if (!res.ok) {
      setError('Erreur lors de la sauvegarde.')
      return
    }

    toast.success('Formulaire enregistré.')
    setSaved(true)
    setTimeout(() => {
      router.push(`/dashboard/forms/${id}`)
    }, 800)
  }

  if (loading) {
    return (
      <div className="max-w-2xl pb-16 space-y-6 animate-pulse">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-5 h-5 bg-muted rounded" />
          <div className="h-6 w-48 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-3">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/forms/${id}`)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Modifier le formulaire</h1>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-1.5 block">Titre</Label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Mon formulaire"
          />
        </div>

        {/* Description */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-1.5 block">
            Description <span className="text-muted-foreground font-normal">(optionnel)</span>
          </Label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Courte description affichée sous le titre du formulaire"
            rows={2}
            className="resize-none"
          />
        </div>

        {/* Fields */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground">
              Champs <span className="text-muted-foreground font-normal">({fields.length})</span>
            </Label>
          </div>

          {fields.length === 0 && (
            <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
              Aucun champ. Ajoutez-en un ci-dessous.
            </div>
          )}

          <div className="space-y-3">
            {fields.map((field, i) => (
              <FieldCard
                key={field.id}
                field={field}
                index={i}
                total={fields.length}
                onChange={updated => updateField(i, updated)}
                onDelete={() => deleteField(i)}
                onMove={dir => moveField(i, dir)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addField}
            className="mt-3 w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-3 text-sm text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={15} />
            Ajouter un champ
          </button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving || saved}>
            {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
            {saved
              ? <><Check size={14} className="mr-1.5" />Enregistré — retour…</>
              : saving ? 'Sauvegarde...' : 'Enregistrer les modifications'
            }
          </Button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/forms/${id}`)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
