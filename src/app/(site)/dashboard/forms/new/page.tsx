'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trackEvent } from '@/lib/utils'
import {
  Loader2, AlignLeft, Layers, Sparkles, LayoutTemplate,
  Download, ArrowLeft, ExternalLink, AlertCircle, CheckCircle2,
  Mail, Banknote, Star, Briefcase, CalendarCheck, Send, Target, MessageSquare, CalendarDays,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { FormSchema } from '@/lib/form-schema'
import type { FormEnding } from '@/lib/form-ending'
import { FORM_TEMPLATES } from '@/lib/form-templates'

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  Mail, Banknote, Star, Briefcase, CalendarCheck, Send, Target, MessageSquare, CalendarDays,
}

type Mode     = 'select' | 'ai' | 'template' | 'import'
type FormType = 'single' | 'multi'

// ─── Form type selector (shared) ────────────────────────────────────────────

function FormTypeSelector({
  value,
  onChange,
}: {
  value: FormType
  onChange: (v: FormType) => void
}) {
  return (
    <div>
      <Label className="text-sm font-medium text-foreground mb-3 block">
        Type de formulaire
      </Label>
      <div className="grid grid-cols-2 gap-3">
        {([
          { value: 'single' as FormType, label: 'Page unique',  desc: 'Simple et rapide.',                   icon: <AlignLeft size={16} /> },
          { value: 'multi'  as FormType, label: 'Multi-étapes', desc: 'Guidé, meilleur taux de complétion.', icon: <Layers    size={16} /> },
        ]).map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              'flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors',
              value === t.value
                ? 'border-foreground bg-card'
                : 'border-border bg-card/50 hover:border-muted-foreground'
            )}
          >
            <span className={cn('transition-colors', value === t.value ? 'text-foreground' : 'text-muted-foreground')}>
              {t.icon}
            </span>
            <span>
              <span className={cn('block text-sm font-medium', value === t.value ? 'text-foreground' : 'text-muted-foreground')}>
                {t.label}
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5">{t.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Schema preview ──────────────────────────────────────────────────────────

function SchemaPreview({ schema }: { schema: FormSchema }) {
  const stepGroups = (schema as any).steps
    ? (schema as any).steps.map((step: any, i: number) => ({
        title: step.title,
        fields: schema.fields.filter(f => ((f as any).step ?? 1) === i + 1),
      }))
    : null

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30">
      {stepGroups ? (
        <div className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {stepGroups.length} étapes · {schema.fields.length} champs
          </p>
          {stepGroups.map((group: any, i: number) => (
            <div key={i}>
              <p className="text-xs font-medium text-foreground mb-1.5">Étape {i + 1} — {group.title}</p>
              <div className="space-y-1">
                {group.fields.map((f: any) => <FieldRow key={f.id} field={f} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            {schema.fields.length} champs
          </p>
          <div className="space-y-1.5">
            {schema.fields.map(f => <FieldRow key={f.id} field={f} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function FieldRow({ field }: { field: any }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono shrink-0">
        {field.type}
      </span>
      <span className="truncate text-foreground">{field.label}</span>
      {field.required && <span className="text-xs text-muted-foreground shrink-0">*</span>}
    </div>
  )
}

// ─── Import error component ──────────────────────────────────────────────────

function ImportError({ message }: { message: string }) {
  const isPrivate = message.toLowerCase().includes('connexion') ||
    message.toLowerCase().includes('accéder') ||
    message.toLowerCase().includes('public')

  return (
    <div className={cn(
      'rounded-lg border p-4 text-sm',
      'border-destructive/40 bg-destructive/5'
    )}>
      <div className="flex items-start gap-2 mb-2">
        <AlertCircle size={15} className="text-destructive shrink-0 mt-0.5" />
        <p className="text-destructive font-medium">Import impossible</p>
      </div>
      <p className="text-muted-foreground mb-3 pl-5">{message}</p>

      {isPrivate && (
        <div className="pl-5 space-y-1.5">
          <p className="text-xs font-medium text-foreground">Pour rendre le formulaire public :</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Ouvrir le formulaire dans Google Forms</li>
            <li>Cliquer sur <strong className="text-foreground">Réglages</strong> (icône engrenage)</li>
            <li>Onglet <strong className="text-foreground">Réponses</strong> → désactiver <em>"Collecter les adresses e-mail"</em></li>
            <li>Onglet <strong className="text-foreground">Présentation</strong> → désactiver <em>"Limiter à 1 réponse"</em></li>
            <li>Réessayer l'import</li>
          </ol>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Autre option : utilisez <strong className="text-foreground">Générer avec l'IA</strong> en décrivant votre formulaire.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Save section ─────────────────────────────────────────────────────────────

function SaveSection({
  schema, ending, title, setTitle, saving, error, onSave, onBack,
}: {
  schema: FormSchema
  ending: FormEnding | null
  title: string
  setTitle: (v: string) => void
  saving: boolean
  error: string
  onSave: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 size={14} className="text-green-500 shrink-0" />
        Formulaire prêt — {schema.fields.length} champs détectés
        {ending?.message && <span className="text-muted-foreground/70">· Message de fin personnalisé</span>}
      </div>

      <SchemaPreview schema={schema} />

      <div>
        <Label className="text-sm font-medium text-foreground">Titre du formulaire</Label>
        <Input
          className="mt-1.5"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Mon formulaire"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={saving || !title.trim()} size="sm">
          {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
          {saving ? 'Sauvegarde...' : 'Créer le formulaire'}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Recommencer
        </button>
      </div>
    </div>
  )
}

// ─── Mode selector ────────────────────────────────────────────────────────────

function ModeSelector({ onSelect }: { onSelect: (m: Mode) => void }) {
  return (
    <div className="space-y-3">
      {/* AI — full-width, no badge */}
      <button
        type="button"
        onClick={() => onSelect('ai')}
        className="w-full flex items-center gap-4 rounded-lg border-2 border-foreground bg-card px-5 py-4 text-left hover:bg-muted/40 transition-colors"
      >
        <Sparkles size={22} className="text-foreground shrink-0" />
        <span>
          <span className="block text-sm font-semibold text-foreground">Générer avec l'IA</span>
          <span className="block text-xs text-muted-foreground mt-0.5">Décrivez votre formulaire, l'IA le construit.</span>
        </span>
      </button>

      {/* Template + Import side by side */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSelect('template')}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-5 text-left hover:border-muted-foreground hover:bg-muted/20 transition-colors"
        >
          <LayoutTemplate size={22} className="text-muted-foreground" />
          <span>
            <span className="block text-sm font-medium text-foreground">Choisir un modèle</span>
            <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
              {FORM_TEMPLATES.length} modèles prêts à l'emploi.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect('import')}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-5 text-left hover:border-muted-foreground hover:bg-muted/20 transition-colors"
        >
          <Download size={22} className="text-muted-foreground" />
          <span>
            <span className="block text-sm font-medium text-foreground">Importer Google Forms</span>
            <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
              Convertissez un formulaire Google existant.
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}

// ─── AI mode ──────────────────────────────────────────────────────────────────

function AiMode({ onSchema }: { onSchema: (s: FormSchema, title: string, ending?: FormEnding, description?: string) => void }) {
  const [formType, setFormType]     = useState<FormType>('single')
  const [prompt, setPrompt]         = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError]           = useState('')

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    setError('')

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, multiStep: formType === 'multi' }),
    })

    if (!res.ok) {
      setError('Erreur lors de la génération. Vérifiez votre clé API.')
      setGenerating(false)
      return
    }

    const { schema, ending, description } = await res.json()
    onSchema(schema, prompt.slice(0, 60), ending, description)
    setGenerating(false)
  }

  return (
    <div className="space-y-5">
      <FormTypeSelector value={formType} onChange={setFormType} />

      <div>
        <Label className="text-sm font-medium text-foreground">Décrivez votre formulaire</Label>
        <Textarea
          className="mt-1.5 resize-none"
          rows={3}
          placeholder="ex : formulaire de qualification pour coach business — budget, objectifs, disponibilité"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate() }}
        />
        <p className="text-xs text-muted-foreground mt-1">Ctrl+Entrée pour générer</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleGenerate} disabled={generating || !prompt.trim()} variant="outline" size="sm">
        {generating && <Loader2 size={14} className="mr-1.5 animate-spin" />}
        {generating ? 'Génération en cours...' : 'Générer'}
      </Button>
    </div>
  )
}

// ─── Template mode ────────────────────────────────────────────────────────────

function convertToMultiStep(schema: FormSchema): FormSchema {
  const PERSONAL = ['text', 'email', 'phone']
  const LONG     = ['textarea']
  const personal = schema.fields.filter(f => PERSONAL.includes(f.type))
  const long     = schema.fields.filter(f => LONG.includes(f.type))
  const other    = schema.fields.filter(f => !PERSONAL.includes(f.type) && !LONG.includes(f.type))

  const groups: { title: string; fields: typeof schema.fields }[] = []
  if (personal.length) groups.push({ title: 'Vos coordonnées',               fields: personal })
  if (other.length)    groups.push({ title: 'Votre demande',                  fields: other })
  if (long.length)     groups.push({ title: 'Informations complémentaires',   fields: long })

  if (groups.length <= 1) return schema

  return {
    fields: groups.flatMap((g, i) => g.fields.map(f => ({ ...f, step: i + 1 }))),
    steps:  groups.map(g => ({ title: g.title })),
  }
}

function TemplateMode({ onSchema }: { onSchema: (s: FormSchema, title: string, ending?: FormEnding) => void }) {
  const [formType, setFormType] = useState<FormType>('single')

  function handleSelect(tpl: typeof FORM_TEMPLATES[number]) {
    const schema = formType === 'multi' ? convertToMultiStep(tpl.schema) : tpl.schema
    onSchema(schema, tpl.name)
  }

  return (
    <div className="space-y-5">
      <FormTypeSelector value={formType} onChange={setFormType} />
      <div>
        <p className="text-sm text-muted-foreground mb-3">Sélectionnez un modèle pour démarrer.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FORM_TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleSelect(tpl)}
              className="flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-4 text-left hover:border-muted-foreground hover:bg-muted/20 transition-colors"
            >
              {(() => { const Icon = TEMPLATE_ICONS[tpl.icon]; return Icon ? <Icon size={20} className="text-muted-foreground" /> : null })()}
              <span>
                <span className="block text-sm font-medium text-foreground">{tpl.name}</span>
                <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">{tpl.description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Import mode ──────────────────────────────────────────────────────────────

function ImportMode({ onSchema }: { onSchema: (s: FormSchema, title: string, ending?: FormEnding, description?: string, bannerUrl?: string) => void }) {
  const [url, setUrl]         = useState('')
  const [formType, setFormType] = useState<FormType>('single')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleImport() {
    if (!url.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/import/google-forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erreur lors de l\'import.')
      setLoading(false)
      return
    }

    // If multi-step requested, ask AI to restructure the imported schema
    if (formType === 'multi') {
      const fields = data.schema.fields
      const desc = fields.map((f: any) => `${f.label} (${f.type})`).join(', ')

      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Convertis ce formulaire existant en format multi-étapes logique : ${desc}`,
          multiStep: true,
        }),
      })

      if (genRes.ok) {
        const { schema: genSchema, ending: genEnding } = await genRes.json()
        onSchema(genSchema, data.title, genEnding)
        setLoading(false)
        return
      }
      // Fallback: use imported schema as-is if AI fails
    }

    if (data._debug) console.log('[GF Import debug]', data._debug)
    onSchema(data.schema, data.title, undefined, data.description, data.bannerUrl)
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <FormTypeSelector value={formType} onChange={setFormType} />

      <div>
        <Label className="text-sm font-medium text-foreground">URL du formulaire Google</Label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">
          Le formulaire doit être <strong>public</strong> (accessible sans connexion Google).
        </p>
        <Input
          value={url}
          onChange={e => { setUrl(e.target.value); setError('') }}
          placeholder="https://docs.google.com/forms/d/e/…/viewform"
          onKeyDown={e => { if (e.key === 'Enter') handleImport() }}
        />
      </div>

      {error && <ImportError message={error} />}

      <Button onClick={handleImport} disabled={loading || !url.trim()} size="sm">
        {loading
          ? <><Loader2 size={14} className="mr-1.5 animate-spin" />{formType === 'multi' ? 'Import + conversion…' : 'Import en cours…'}</>
          : <><ExternalLink size={14} className="mr-1.5" />Importer</>
        }
      </Button>
    </div>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function NewFormPage() {
  const router = useRouter()

  const [mode, setMode]           = useState<Mode>('select')
  const [schema, setSchema]           = useState<FormSchema | null>(null)
  const [ending, setEnding]           = useState<FormEnding | null>(null)
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState<string | undefined>(undefined)
  const [bannerUrl, setBannerUrl]     = useState<string | undefined>(undefined)
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState('')

  function handleSchema(s: FormSchema, suggestedTitle: string, e?: FormEnding, desc?: string, banner?: string) {
    setSchema(s)
    setEnding(e ?? null)
    setTitle(suggestedTitle)
    setDescription(desc)
    setBannerUrl(banner)
    setSaveError('')
  }

  function handleBack() {
    setSchema(null)
    setEnding(null)
    setTitle('')
    setDescription(undefined)
    setBannerUrl(undefined)
    setSaveError('')
  }

  async function handleSave() {
    if (!schema || !title.trim()) return
    setSaving(true)
    setSaveError('')

    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        schema,
        ...(description ? { description } : {}),
        ...(ending      ? { ending }      : {}),
        ...(bannerUrl   ? { bannerUrl }   : {}),
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setSaveError(data?.error ?? 'Erreur lors de la sauvegarde.')
      setSaving(false)
      return
    }

    const form = await res.json()
    trackEvent('form_created', { title })
    router.push(`/dashboard/forms/${form.id}`)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        {mode !== 'select' && (
          <button
            type="button"
            onClick={() => { setMode('select'); handleBack() }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h1 className="text-xl font-semibold text-foreground">Nouveau formulaire</h1>
      </div>

      {mode === 'select'   && <ModeSelector onSelect={setMode} />}
      {mode === 'ai'       && !schema && <AiMode       onSchema={handleSchema} />}
      {mode === 'template' && !schema && <TemplateMode onSchema={handleSchema} />}
      {mode === 'import'   && !schema && <ImportMode   onSchema={handleSchema} />}

      {schema && (
        <SaveSection
          schema={schema}
          ending={ending}
          title={title}
          setTitle={setTitle}
          saving={saving}
          error={saveError}
          onSave={handleSave}
          onBack={handleBack}
        />
      )}
    </div>
  )
}
