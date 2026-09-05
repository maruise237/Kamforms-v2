'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect, useRef } from 'react'
import { Check, ArrowUp } from 'lucide-react'
import { EndingPreview } from '@/components/ending-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DateInput } from '@/components/date-input'
import { cn, trackEvent } from '@/lib/utils'
import { toast } from 'sonner'
import type { FormSchema, FormField } from '@/lib/form-schema'
import type { FormEnding } from '@/lib/form-ending'

// ─── Zod schema builder ───────────────────────────────────────────────────────

function buildZodSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {
    _honeypot: z.string().optional(), // Anti-spam trap — bots fill it, humans don't
  }
  for (const field of fields) {
    let rule: z.ZodTypeAny
    if (field.type === 'number') {
      rule = field.required
        ? z.coerce.number({ required_error: `${field.label} est requis` })
        : z.coerce.number().optional()
    } else if (field.type === 'rating') {
      rule = field.required
        ? z.coerce.number({ required_error: `${field.label} est requis` }).min(1).max(5)
        : z.coerce.number().min(1).max(5).optional()
    } else if (field.type === 'checkbox') {
      rule = field.required
        ? z.boolean().refine(v => v === true, { message: `${field.label} est requis` })
        : z.boolean()
    } else {
      // text, email, phone, textarea, select, radio, date — all string-based
      const base = z.string()
      if (field.type === 'email') {
        rule = field.required
          ? base.min(1, `${field.label} est requis`).email('Email invalide')
          : base.email('Email invalide').optional()
      } else {
        rule = field.required
          ? base.min(1, `${field.label} est requis`)
          : base.optional()
      }
    }
    shape[field.id] = rule
  }
  return z.object(shape)
}

// ─── Shared props ─────────────────────────────────────────────────────────────

interface FormRendererProps {
  schema: FormSchema
  formSlug: string
  preview?: boolean
  testMode?: boolean   // fake submit — shows ending without real API call
  themeColor?: string
  themeFg?: string
  ending?: FormEnding | null
}

const SUBMISSION_COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 h

function storageKey(slug: string) { return `kamforms-submitted-${slug}` }

function hasRecentSubmission(slug: string): boolean {
  try {
    const ts = localStorage.getItem(storageKey(slug))
    return !!ts && Date.now() - parseInt(ts, 10) < SUBMISSION_COOLDOWN_MS
  } catch { return false }
}

function markSubmitted(slug: string) {
  try { localStorage.setItem(storageKey(slug), String(Date.now())) } catch { /* ignore */ }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function FormRenderer({
  schema,
  formSlug,
  preview = false,
  testMode = false,
  themeColor,
  themeFg = '#ffffff',
  ending,
}: FormRendererProps) {
  const isMultiStep =
    schema.fields.some(f => f.step !== undefined) ||
    (schema.steps?.length ?? 0) > 0

  if (isMultiStep) {
    return (
      <TallyRenderer
        schema={schema}
        formSlug={formSlug}
        preview={preview}
        testMode={testMode}
        themeColor={themeColor}
        themeFg={themeFg}
        ending={ending}
      />
    )
  }
  return (
    <StandardRenderer
      schema={schema}
      formSlug={formSlug}
      preview={preview}
      testMode={testMode}
      themeColor={themeColor}
      themeFg={themeFg}
      ending={ending}
    />
  )
}

// ─── Tally-style renderer (one question per slide) ────────────────────────────

function TallyRenderer({
  schema,
  formSlug,
  preview = false,
  testMode = false,
  themeColor,
  themeFg = '#ffffff',
  ending,
}: FormRendererProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [pendingAdvance, setPendingAdvance] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    if (!preview && !testMode && hasRecentSubmission(formSlug)) setAlreadySubmitted(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const zodSchema = buildZodSchema(schema.fields)
  const { register, trigger, watch, handleSubmit, control, formState: { errors } } =
    useForm({ resolver: zodResolver(zodSchema) })

  const values = watch()

  // Recompute visible fields each render (conditions)
  const visibleFields = schema.fields.filter(field => {
    if (!field.condition) return true
    return String(values[field.condition.fieldId] ?? '') === field.condition.value
  })

  const safeIndex  = Math.min(index, Math.max(0, visibleFields.length - 1))
  const field      = visibleFields[safeIndex]
  const total      = visibleFields.length
  const isLast     = safeIndex === total - 1
  const progressPct = total > 1 ? Math.round((safeIndex / (total - 1)) * 100) : 0

  // Stable refs so closures (setTimeout, keydown) always see fresh values
  const fieldRef   = useRef(field)
  const isLastRef  = useRef(isLast)
  const triggerRef = useRef(trigger)
  fieldRef.current   = field
  isLastRef.current  = isLast
  triggerRef.current = trigger

  // Advance to next slide
  async function advance() {
    if (!fieldRef.current || preview) return
    const valid = await triggerRef.current(fieldRef.current.id as Parameters<typeof trigger>[0])
    if (!valid) return
    if (!isLastRef.current) {
      setDirection('forward')
      setIndex(i => i + 1)
    }
  }

  const advanceRef = useRef(advance)
  advanceRef.current = advance

  // Auto-advance after radio selection
  useEffect(() => {
    if (!pendingAdvance) return
    const t = setTimeout(() => {
      advanceRef.current()
      setPendingAdvance(false)
    }, 380)
    return () => clearTimeout(t)
  }, [pendingAdvance])

  // Enter key → advance (skip textarea)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (submitted || preview) return
      if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        if (!isLastRef.current) advanceRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [submitted, preview])

  async function onSubmit(data: Record<string, unknown>) {
    if (preview) return
    if (testMode) { setSubmitted(true); return }
    setSubmitting(true)
    setSubmitError('')
    const res = await fetch(`/api/submit/${formSlug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSubmitting(false)
    if (res.ok) {
      markSubmitted(formSlug)
      setSubmitted(true)
      trackEvent('form_submitted', { slug: formSlug })
    } else { setSubmitError("Erreur lors de l'envoi. Veuillez réessayer."); toast.error("Erreur lors de l'envoi. Veuillez réessayer.") }
  }

  if (alreadySubmitted) return (
    <div className="text-center py-12 px-6">
      <p className="text-foreground font-semibold text-lg mb-2">Déjà répondu</p>
      <p className="text-muted-foreground text-sm">Vous avez déjà soumis ce formulaire.</p>
    </div>
  )
  if (submitted) return <EndingPreview ending={ending} />
  if (!field) return null

  const slideClass = direction === 'forward'
    ? 'animate-in fade-in-0 slide-in-from-bottom-8 duration-300'
    : 'animate-in fade-in-0 slide-in-from-top-8 duration-300'

  const btnStyle = themeColor
    ? { backgroundColor: themeColor, borderColor: themeColor, color: themeFg }
    : undefined

  return (
    <form
      onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
      className="flex flex-col min-h-[340px]"
    >
      {/* Anti-spam honeypot — invisible to real users */}
      <input
        type="text"
        className="sr-only"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        {...register('_honeypot')}
      />

      {/* Progress bar */}
      <div className="h-0.5 bg-border rounded-full mb-8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%`, backgroundColor: themeColor ?? 'var(--foreground)' }}
        />
      </div>

      {/* Counter */}
      <p aria-live="polite" aria-atomic="true" className="text-xs text-muted-foreground mb-5 tabular-nums select-none">
        {safeIndex + 1}
        <span className="mx-1 opacity-40">/</span>
        {total}
      </p>

      {/* Question slide */}
      <div
        key={`${field.id}-${safeIndex}`}
        className={cn('flex-1 space-y-6', slideClass)}
      >
        <div>
          <p className="text-xl font-semibold text-foreground leading-snug">
            {field.label}
            {field.required && (
              <span className="text-muted-foreground font-normal ml-1 text-lg">*</span>
            )}
          </p>
          {field.description && (
            <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
          )}
        </div>

        <div>
          {/* Text / email / phone / number */}
          {(field.type === 'text' ||
            field.type === 'email' ||
            field.type === 'phone' ||
            field.type === 'number') && (
            <Input
              autoFocus
              className="border-0 border-b border-border rounded-none px-0 bg-transparent text-base
                         focus-visible:ring-0 focus-visible:border-foreground
                         placeholder:text-muted-foreground/50 transition-colors h-auto py-2"
              type={
                field.type === 'phone'
                  ? 'tel'
                  : field.type === 'number'
                  ? 'number'
                  : 'text'
              }
              placeholder={field.placeholder ?? 'Votre réponse…'}
              {...register(field.id)}
            />
          )}

          {/* Textarea */}
          {field.type === 'textarea' && (
            <Textarea
              autoFocus
              className="border-0 border-b border-border rounded-none px-0 bg-transparent text-base
                         focus-visible:ring-0 focus-visible:border-foreground
                         placeholder:text-muted-foreground/50 resize-none min-h-[80px]"
              placeholder={field.placeholder ?? 'Votre réponse…'}
              {...register(field.id)}
            />
          )}

          {/* Date */}
          {field.type === 'date' && (
            <Controller
              name={field.id}
              control={control}
              defaultValue=""
              render={({ field: f }) => (
                <DateInput value={f.value ?? ''} onChange={f.onChange} />
              )}
            />
          )}

          {/* Rating — numbered squares 1–5 */}
          {field.type === 'rating' && (
            <div className="flex gap-3 mt-2 flex-wrap">
              {[1, 2, 3, 4, 5].map(n => {
                const regProps = register(field.id)
                return (
                  <label key={n} className="cursor-pointer group">
                    <input
                      type="radio"
                      value={n}
                      className="sr-only"
                      {...regProps}
                      onChange={e => {
                        regProps.onChange(e)
                        if (!isLast) setPendingAdvance(true)
                      }}
                    />
                    <div className={cn(
                      'w-12 h-12 flex items-center justify-center rounded-lg border border-border',
                      'text-base font-medium text-muted-foreground transition-all',
                      'group-has-[:checked]:border-foreground group-has-[:checked]:bg-foreground group-has-[:checked]:text-background',
                    )}>
                      {n}
                    </div>
                  </label>
                )
              })}
            </div>
          )}

          {/* Checkbox */}
          {field.type === 'checkbox' && (() => {
            const reg = register(field.id)
            return (
              <label className="flex items-center gap-4 mt-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only"
                  {...reg}
                  onChange={e => {
                    reg.onChange(e)
                    if (e.target.checked && !isLast) setPendingAdvance(true)
                  }}
                />
                <div className={cn(
                  'w-8 h-8 rounded border-2 border-border flex items-center justify-center shrink-0',
                  'group-has-[:checked]:bg-foreground group-has-[:checked]:border-foreground transition-all',
                )}>
                  <Check size={14} className="text-background opacity-0 group-has-[:checked]:opacity-100 transition-opacity" />
                </div>
                {field.placeholder && (
                  <span className="text-base text-foreground">{field.placeholder}</span>
                )}
              </label>
            )
          })()}

          {/* Radio / select — lettered options */}
          {(field.type === 'select' || field.type === 'radio') &&
            field.options && (
              <div className="space-y-2.5 mt-1">
                {field.options.map((opt, idx) => {
                  const regProps = register(field.id)
                  return (
                    <label
                      key={opt}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <span
                        className={cn(
                          'w-7 h-7 flex items-center justify-center rounded border text-xs font-medium',
                          'border-border text-muted-foreground transition-all shrink-0',
                          'group-has-[:checked]:border-foreground group-has-[:checked]:bg-foreground group-has-[:checked]:text-background',
                        )}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <input
                        type="radio"
                        value={opt}
                        className="sr-only"
                        {...regProps}
                        onChange={e => {
                          regProps.onChange(e)
                          if (!isLast) setPendingAdvance(true)
                        }}
                      />
                      <span className="text-sm text-foreground group-has-[:checked]:font-medium">
                        {opt}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}

          {errors[field.id] && (
            <p className="text-xs text-destructive mt-2">
              {(errors[field.id] as { message?: string })?.message}
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      {!preview ? (
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            {isLast ? (
              <Button type="submit" size="sm" disabled={submitting} style={btnStyle}>
                {submitting ? 'Envoi…' : 'Envoyer'}
                {!submitting && <Check size={13} className="ml-1.5" />}
              </Button>
            ) : (
              <>
                <Button type="button" size="sm" onClick={advance} style={btnStyle}>
                  OK <Check size={13} className="ml-1.5" />
                </Button>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  ou{' '}
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-sans">
                    Entrée ↵
                  </kbd>
                </span>
              </>
            )}
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          {safeIndex > 0 && (
            <button
              type="button"
              onClick={() => {
                setDirection('backward')
                setIndex(i => i - 1)
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUp size={11} />
              Précédent
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mt-4 italic">
          Aperçu — soumissions désactivées
        </p>
      )}
    </form>
  )
}

// ─── Standard renderer (all fields visible) ───────────────────────────────────

function StandardRenderer({
  schema,
  formSlug,
  preview = false,
  testMode = false,
  themeColor,
  themeFg = '#ffffff',
  ending,
}: FormRendererProps) {
  const [submitted, setSubmitted]             = useState(false)
  const [submitting, setSubmitting]           = useState(false)
  const [submitError, setSubmitError]         = useState('')
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    if (!preview && !testMode && hasRecentSubmission(formSlug)) setAlreadySubmitted(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const zodSchema = buildZodSchema(schema.fields)
  const { register, handleSubmit, watch, control, formState: { errors } } = useForm({
    resolver: zodResolver(zodSchema),
  })

  const values        = watch()
  const visibleFields = schema.fields.filter(field => {
    if (!field.condition) return true
    return String(values[field.condition.fieldId] ?? '') === field.condition.value
  })

  async function onSubmit(data: Record<string, unknown>) {
    if (preview) return
    if (testMode) { setSubmitted(true); return }
    setSubmitting(true)
    setSubmitError('')
    const res = await fetch(`/api/submit/${formSlug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSubmitting(false)
    if (res.ok) {
      markSubmitted(formSlug)
      setSubmitted(true)
      trackEvent('form_submitted', { slug: formSlug })
    } else { setSubmitError("Erreur lors de l'envoi. Veuillez réessayer."); toast.error("Erreur lors de l'envoi. Veuillez réessayer.") }
  }

  if (alreadySubmitted) return (
    <div className="text-center py-12 px-6">
      <p className="text-foreground font-semibold text-lg mb-2">Déjà répondu</p>
      <p className="text-muted-foreground text-sm">Vous avez déjà soumis ce formulaire.</p>
    </div>
  )
  if (submitted) return <EndingPreview ending={ending} />

  const btnStyle = themeColor
    ? { backgroundColor: themeColor, borderColor: themeColor, color: themeFg }
    : undefined

  return (
    <form
      onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
      className="space-y-5"
    >
      {/* Anti-spam honeypot — invisible to real users */}
      <input
        type="text"
        className="sr-only"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        {...register('_honeypot')}
      />

      {visibleFields.map(field => (
        <div key={field.id}>
          <Label className="text-sm font-medium text-foreground">
            {field.label}
            {field.required && (
              <span className="text-muted-foreground ml-0.5 font-normal"> *</span>
            )}
          </Label>

          {(field.type === 'text' ||
            field.type === 'email' ||
            field.type === 'phone' ||
            field.type === 'number') && (
            <Input
              className="mt-1.5"
              type={
                field.type === 'phone'
                  ? 'tel'
                  : field.type === 'number'
                  ? 'number'
                  : 'text'
              }
              placeholder={field.placeholder}
              {...register(field.id)}
            />
          )}

          {field.type === 'textarea' && (
            <Textarea
              className="mt-1.5 resize-none"
              rows={3}
              placeholder={field.placeholder}
              {...register(field.id)}
            />
          )}

          {field.type === 'date' && (
            <Controller
              name={field.id}
              control={control}
              defaultValue=""
              render={({ field: f }) => (
                <DateInput value={f.value ?? ''} onChange={f.onChange} />
              )}
            />
          )}

          {field.type === 'rating' && (
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map(n => (
                <label key={n} className="cursor-pointer group">
                  <input type="radio" value={n} className="sr-only" {...register(field.id)} />
                  <div className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-full border border-border',
                    'text-sm font-medium text-muted-foreground transition-all',
                    'group-has-[:checked]:bg-foreground group-has-[:checked]:border-foreground group-has-[:checked]:text-background',
                  )}>
                    {n}
                  </div>
                </label>
              ))}
            </div>
          )}

          {field.type === 'checkbox' && (
            <label className="flex items-center gap-2.5 mt-2 cursor-pointer group">
              <input type="checkbox" className="sr-only" {...register(field.id)} />
              <div className={cn(
                'w-5 h-5 rounded border border-input flex items-center justify-center shrink-0',
                'group-has-[:checked]:bg-foreground group-has-[:checked]:border-foreground transition-all',
              )}>
                <Check size={11} className="text-background opacity-0 group-has-[:checked]:opacity-100 transition-opacity" />
              </div>
              {field.placeholder && (
                <span className="text-sm text-muted-foreground">{field.placeholder}</span>
              )}
            </label>
          )}

          {(field.type === 'select' || field.type === 'radio') &&
            field.options && (
              <div className="mt-2 space-y-2">
                {field.options.map(opt => (
                  <label
                    key={opt}
                    className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={opt}
                      className="accent-primary"
                      {...register(field.id)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

          {field.description && (
            <p className="text-xs text-muted-foreground mt-1.5">{field.description}</p>
          )}
          {errors[field.id] && (
            <p className="text-xs text-destructive mt-1">
              {(errors[field.id] as { message?: string })?.message}
            </p>
          )}
        </div>
      ))}

      {submitError && (
        <p className="text-sm text-destructive">{submitError}</p>
      )}

      {!preview && (
        <Button
          type="submit"
          size="sm"
          disabled={submitting}
          style={btnStyle}
          className="mt-2"
        >
          {submitting ? 'Envoi…' : 'Envoyer'}
        </Button>
      )}

      {preview && (
        <p className="text-xs text-muted-foreground mt-2 italic">
          Aperçu — soumissions désactivées
        </p>
      )}
    </form>
  )
}
