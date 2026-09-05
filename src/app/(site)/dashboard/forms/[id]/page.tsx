'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, Copy, ExternalLink, Inbox, Loader2, Pencil, Share2, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { FormTheme } from '@/lib/form-theme'
import type { Form } from './_types'
import { ThemePanel } from './_components/ThemePanel'
import { EndingPanel } from './_components/EndingPanel'
import { SettingsPanel } from './_components/SettingsPanel'
import { FormPreview } from './_components/FormPreview'
import { FormAnalytics } from '@/components/form-analytics'

type Tab = 'overview' | 'appearance' | 'ending' | 'settings' | 'analytics'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',   label: 'Aperçu' },
  { id: 'appearance', label: 'Apparence' },
  { id: 'ending',     label: 'Fin' },
  { id: 'settings',   label: 'Paramètres' },
  { id: 'analytics',  label: 'Statistiques' },
]

function SkeletonDetail() {
  return (
    <div className="max-w-2xl animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-4 h-4 rounded bg-muted" />
        <div className="h-5 w-48 rounded bg-muted" />
        <div className="h-5 w-12 rounded-full bg-muted" />
      </div>
      <div className="flex gap-0 border-b border-border mb-6">
        {TABS.map(t => (
          <div key={t.id} className="px-4 py-2 h-9 w-20 rounded bg-muted/50 mr-1" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-10 rounded bg-muted" />
        <div className="h-32 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function FormDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const [form, setForm]               = useState<Form | null>(null)
  const [liveTheme, setLiveTheme]     = useState<FormTheme>({ preset: 'zinc' })
  const [tab, setTab]                 = useState<Tab>('overview')
  const [copied, setCopied]           = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [toggling, setToggling]       = useState(false)
  const [customSlug, setCustomSlug]   = useState('')
  const [slugError, setSlugError]     = useState('')
  const [savingSlug, setSavingSlug]   = useState(false)
  const [slugSaved, setSlugSaved]     = useState(false)

  useEffect(() => {
    async function loadForm() {
      const res  = await fetch(`/api/forms/${id}`)
      const data: Form = await res.json()
      setForm(data)
      setCustomSlug(data.slug)
      if (data.theme) setLiveTheme(data.theme)
    }
    loadForm()
  }, [id])

  const updateForm = useCallback((patch: Partial<Form>) => {
    setForm(prev => prev ? { ...prev, ...patch } : null)
  }, [])

  const handleLiveThemeChange = useCallback((theme: FormTheme) => {
    setLiveTheme(theme)
  }, [])

  if (!form) return <SkeletonDetail />

  const publicLink = `${window.location.origin}/f/${form.slug}`

  function copyLink() {
    navigator.clipboard.writeText(publicLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    if (!form) return
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: form.title,
          text: `Réponds à mon formulaire : ${form.title}`,
          url: publicLink,
        })
      } catch { /* user canceled */ }
    } else {
      copyLink()
    }
  }

  async function handleToggle() {
    setToggling(true)
    const res = await fetch(`/api/forms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !form!.active }),
    })
    const updated = await res.json()
    setToggling(false)
    updateForm({ active: updated.active })
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    await fetch(`/api/forms/${id}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  async function saveSlug() {
    if (!form || customSlug === form.slug) return
    setSlugError('')
    setSavingSlug(true)
    const res  = await fetch(`/api/forms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: customSlug }),
    })
    const json = await res.json()
    setSavingSlug(false)
    if (!res.ok) {
      setSlugError(json.error ?? 'Erreur lors de la sauvegarde.')
    } else {
      updateForm({ slug: json.slug })
      setSlugSaved(true)
      setTimeout(() => setSlugSaved(false), 2000)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-[18px] font-semibold text-foreground flex-1 truncate">{form.title}</h1>

        {/* Active badge */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={cn(
            'inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer transition-all shrink-0',
            form.active
              ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
            toggling && 'opacity-60'
          )}
        >
          <span className={cn(
            'w-[5px] h-[5px] rounded-full shrink-0',
            form.active ? 'bg-green-500 dark:bg-green-400' : 'bg-muted-foreground/40'
          )} />
          {form.active ? 'Actif' : 'Inactif'}
        </button>

        {/* Réponses */}
        <Link
          href={`/dashboard/forms/${id}/submissions`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0 h-8 text-[12px]')}
        >
          <Inbox size={13} className="mr-1.5" />
          Réponses
        </Link>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[12px] text-muted-foreground hidden sm:inline">Supprimer ?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2.5 py-1 text-[12px] font-medium rounded-md bg-destructive text-destructive-foreground border-0 cursor-pointer"
            >
              {deleting ? <Loader2 size={12} className="animate-spin" /> : 'Oui'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 text-[12px] font-medium rounded-md bg-transparent text-muted-foreground border border-border cursor-pointer hover:text-foreground transition-colors"
            >
              Non
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted/60 rounded-md transition-colors shrink-0"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative px-4 py-2 text-[13px] font-medium border-0 bg-transparent cursor-pointer transition-colors whitespace-nowrap',
              tab === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-t-sm bg-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* Tab: Aperçu */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {/* Public link + slug editor */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Lien public</p>
            <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2 bg-muted/30 mb-2">
              <span className="text-sm text-foreground flex-1 truncate">{publicLink}</span>
              <button onClick={copyLink} className="text-muted-foreground hover:text-foreground shrink-0 transition-colors" title="Copier le lien">
                {copied ? <Check size={14} className="text-foreground" /> : <Copy size={14} />}
              </button>
              <button onClick={handleShare} className="text-muted-foreground hover:text-foreground shrink-0 transition-colors md:hidden" title="Partager">
                <Share2 size={14} />
              </button>
              <a href={publicLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground shrink-0 transition-colors" title="Ouvrir le formulaire">
                <ExternalLink size={14} />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">/f/</span>
              <Input
                value={customSlug}
                onChange={e => { setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugError('') }}
                className="text-sm h-8 flex-1"
                placeholder="mon-formulaire"
              />
              <Button size="sm" variant="outline" onClick={saveSlug} disabled={savingSlug || customSlug === form.slug} className="h-8 shrink-0">
                {savingSlug ? <Loader2 size={13} className="animate-spin" /> : slugSaved ? <Check size={13} /> : 'OK'}
              </Button>
            </div>
            {slugError && <p className="text-xs text-destructive mt-1">{slugError}</p>}
          </div>

          {/* Callout partage si pas encore de réponse */}
          {(form.submissionCount ?? 0) === 0 && (
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <ExternalLink size={13} className="text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground">Formulaire prêt à être partagé</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Copie le lien public ci-dessus et partage-le pour recevoir ta première réponse.
                </p>
              </div>
            </div>
          )}

          {/* Edit button */}
          <Link
            href={`/dashboard/forms/${id}/edit`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-center gap-2')}
          >
            <Pencil size={13} />
            Modifier les champs
          </Link>

          {/* Form preview */}
          <div className="border border-border rounded-lg overflow-hidden">
            <p className="text-xs font-medium text-muted-foreground px-4 py-3 border-b border-border">Aperçu</p>
            <div className="p-4">
              <FormPreview
                schema={form.schema}
                formSlug={form.slug}
                theme={liveTheme}
                ending={form.ending}
              />
            </div>
          </div>

        </div>
      )}

      {/* Tab: Apparence */}
      {tab === 'appearance' && (
        <ThemePanel
          formId={id}
          initial={form.theme}
          onUpdate={updateForm}
          onLiveChange={handleLiveThemeChange}
        />
      )}

      {/* Tab: Fin */}
      {tab === 'ending' && (
        <EndingPanel
          formId={id}
          initial={form.ending}
          onUpdate={updateForm}
        />
      )}

      {/* Tab: Paramètres */}
      {tab === 'settings' && (
        <SettingsPanel
          formId={id}
          formSlug={form.slug}
          initial={{
            notificationsEnabled: form.notificationsEnabled,
            notificationMode: form.notificationMode,
            assignedWhatsapp: form.assignedWhatsapp,
            assignedEmail: form.assignedEmail,
            maxSubmissions: form.maxSubmissions,
            expiresAt: form.expiresAt,
          }}
          onUpdate={updateForm}
        />
      )}

      {/* Tab: Statistiques */}
      {tab === 'analytics' && (
        <FormAnalytics formId={id} />
      )}
    </div>
  )
}
