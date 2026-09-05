'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, Code2, Copy, Loader2, Users, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useSaveState } from '@/hooks/use-save-state'
import type { Form } from '../_types'
import { toast } from 'sonner'

type NotificationMode = 'every' | 'milestones' | 'first_only' | 'daily_digest' | 'off'

const MODES: { id: NotificationMode; label: string; desc: string }[] = [
  { id: 'every',        label: 'Chaque réponse',    desc: 'Un message à chaque soumission' },
  { id: 'milestones',   label: 'Jalons',             desc: '1ère, 5ème, 10ème, 25ème, 50ème…' },
  { id: 'first_only',   label: 'Première réponse',   desc: 'Un seul message pour démarrer' },
  { id: 'daily_digest', label: 'Briefing quotidien', desc: 'Un résumé à 18h, tous les formulaires' },
  { id: 'off',          label: 'Aucune',             desc: 'Silence total pour ce formulaire' },
]

const IMMEDIATE_MODES: NotificationMode[] = ['every', 'milestones', 'first_only']

interface SettingsPanelProps {
  formId: string
  formSlug: string
  initial: {
    notificationsEnabled: boolean
    notificationMode: NotificationMode
    assignedWhatsapp: string | null
    assignedEmail: string | null
    maxSubmissions: number | null
    expiresAt: string | null
  }
  onUpdate: (patch: Partial<Form>) => void
}

export function SettingsPanel({ formId, formSlug, initial, onUpdate }: SettingsPanelProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(initial.notificationsEnabled)
  const [mode, setMode]                 = useState<NotificationMode>(initial.notificationMode)
  const [assignedWhatsapp, setAssignedWhatsapp] = useState(initial.assignedWhatsapp ?? '')
  const [assignedEmail, setAssignedEmail]       = useState(initial.assignedEmail ?? '')
  const [budgetUsed, setBudgetUsed]     = useState<number | null>(null)
  const [budgetLimit, setBudgetLimit]   = useState(1)
  const [budgetBlocked, setBudgetBlocked] = useState(false)
  const [maxSubmissions, setMaxSubmissions] = useState<string>(
    initial.maxSubmissions !== null ? String(initial.maxSubmissions) : ''
  )
  const [expiresAt, setExpiresAt] = useState<string>(
    initial.expiresAt ? initial.expiresAt.slice(0, 16) : ''
  )
  const [embedCopied, setEmbedCopied] = useState(false)
  const { saving: savingNotif,  saved: notifSaved,  wrap: wrapNotif }   = useSaveState()
  const { saving: savingLimits, saved: limitsSaved, wrap: wrapLimits }  = useSaveState()

  const hasDelegate = !!(assignedWhatsapp.trim() || assignedEmail.trim())
  const isImmediate = IMMEDIATE_MODES.includes(mode)

  // Load notification budget
  useEffect(() => {
    fetch('/api/forms/notification-budget')
      .then(r => r.json())
      .then(({ used, limit }: { used: number; limit: number }) => {
        setBudgetUsed(used)
        setBudgetLimit(limit)
      })
      .catch(() => {})
  }, [])

  function handleModeChange(next: NotificationMode) {
    // If switching to an immediate mode without delegate, check budget
    if (IMMEDIATE_MODES.includes(next) && !hasDelegate && !IMMEDIATE_MODES.includes(mode)) {
      const currentUsed = budgetUsed ?? 0
      if (currentUsed >= budgetLimit) {
        setBudgetBlocked(true)
        return
      }
    }
    setBudgetBlocked(false)
    setMode(next)
  }

  async function saveNotifications() {
    await wrapNotif(async () => {
      const res = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationsEnabled,
          notificationMode: mode,
          assignedWhatsapp: assignedWhatsapp.trim() || null,
          assignedEmail:    assignedEmail.trim()    || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(data?.error ?? 'Impossible de sauvegarder les notifications.')
        throw new Error('SAVE_NOTIFICATIONS_FAILED')
      }
      onUpdate({
        notificationsEnabled,
        notificationMode: mode,
        assignedWhatsapp: assignedWhatsapp.trim() || null,
        assignedEmail:    assignedEmail.trim()    || null,
      })
      // Refresh budget after save
      fetch('/api/forms/notification-budget')
        .then(r => r.json())
        .then(({ used, limit }: { used: number; limit: number }) => {
          setBudgetUsed(used)
          setBudgetLimit(limit)
        })
        .catch(() => {})
    })
  }

  async function saveLimits() {
    await wrapLimits(async () => {
      const res = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxSubmissions: maxSubmissions ? Number(maxSubmissions) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(data?.error ?? 'Impossible de sauvegarder les limites.')
        throw new Error('SAVE_LIMITS_FAILED')
      }
      onUpdate({
        maxSubmissions: maxSubmissions ? Number(maxSubmissions) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      })
    })
  }

  function copyEmbed() {
    const origin = window.location.origin
    navigator.clipboard.writeText(
      `<iframe src="${origin}/f/${formSlug}" width="100%" height="600" frameborder="0" style="border:none;"></iframe>`
    )
    setEmbedCopied(true)
    setTimeout(() => setEmbedCopied(false), 2000)
  }

  // Budget display
  const showBudget = notificationsEnabled && isImmediate && !hasDelegate && budgetUsed !== null
  const budgetPct  = budgetUsed !== null ? (budgetUsed / budgetLimit) * 100 : 0
  const budgetWarn = budgetUsed !== null && budgetUsed >= budgetLimit - 1

  return (
    <div className="border border-border rounded-lg p-5 mb-6 space-y-6">
      <p className="text-sm font-medium text-foreground">Paramètres</p>

      {/* ── Notifications ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground mt-0.5">WhatsApp & Email à chaque réponse</p>
          </div>
          <button
            onClick={() => setNotificationsEnabled(v => !v)}
            className={cn(
              'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors',
              notificationsEnabled
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/50'
            )}
          >
            {notificationsEnabled ? <Bell size={12} /> : <BellOff size={12} />}
            {notificationsEnabled ? 'Activées' : 'Désactivées'}
          </button>
        </div>

        {notificationsEnabled && (
          <>
            {/* Mode selector */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Fréquence de notification</p>
              <div className="grid grid-cols-1 gap-1.5">
                {MODES.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={mode === m.id}
                    onClick={() => handleModeChange(m.id)}
                    className={cn(
                      'flex items-center justify-between rounded-md border px-3 py-2.5 text-left transition-colors text-sm',
                      mode === m.id
                        ? 'border-foreground bg-foreground/5'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    <div>
                      <span className={cn('font-medium', mode === m.id ? 'text-foreground' : 'text-muted-foreground')}>
                        {m.label}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">{m.desc}</span>
                    </div>
                    {mode === m.id && <Check size={13} className="text-foreground shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget bar */}
            {showBudget && (
              <div className={cn(
                'rounded-md border px-3 py-2.5 text-xs',
                budgetUsed! >= budgetLimit
                  ? 'border-destructive/50 bg-destructive/5 text-destructive'
                  : budgetWarn
                    ? 'border-amber-500/50 bg-amber-500/5 text-amber-700 dark:text-amber-400'
                    : 'border-border text-muted-foreground'
              )}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5">
                    {budgetUsed! >= budgetLimit
                      ? <AlertTriangle size={11} />
                      : budgetWarn
                        ? <AlertTriangle size={11} />
                        : <Info size={11} />
                    }
                    Notifications immédiates sur ce numéro
                  </span>
                  <span className="font-medium tabular-nums">{budgetUsed}/{budgetLimit}</span>
                </div>
                <div className="h-1 rounded-full bg-current/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-current transition-all"
                    style={{ width: `${Math.min(budgetPct, 100)}%` }}
                  />
                </div>
                {budgetUsed! >= budgetLimit && (
                  <p className="mt-1.5">Limite atteinte. Passez en mode Briefing ou ajoutez un numéro délégué.</p>
                )}
                {budgetWarn && budgetUsed! < budgetLimit && (
                  <p className="mt-1.5">Vous approchez de la limite. Pensez au mode Briefing pour les prochains formulaires.</p>
                )}
              </div>
            )}

            {/* Budget blocked warning */}
            {budgetBlocked && (
              <div className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                <p className="font-medium flex items-center gap-1.5 mb-1">
                  <AlertTriangle size={11} /> Limite atteinte ({budgetLimit}/{budgetLimit} formulaires)</p>
                <p>Vous avez déjà {budgetLimit} formulaires avec des notifications immédiates sur votre numéro par défaut. Pour activer ce mode ici, passez d&apos;abord un autre formulaire en mode <strong>Briefing quotidien</strong> ou ajoutez un <strong>numéro délégué</strong> ci-dessous.</p>
              </div>
            )}

            {/* Briefing quotidien note */}
            {mode === 'daily_digest' && (
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground flex items-start gap-2">
                <Info size={11} className="shrink-0 mt-0.5" />
                Un résumé de toutes vos réponses sera envoyé à 18h chaque jour. Ce mode ne compte pas dans la limite.
              </div>
            )}

            {/* Delegate section */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={13} className="text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">Déléguer à un membre d&apos;équipe</p>
                <span className="text-xs text-muted-foreground">(optionnel)</span>
              </div>
              <div className="space-y-2 mb-2">
                <Input
                  value={assignedWhatsapp}
                  onChange={e => setAssignedWhatsapp(e.target.value)}
                  placeholder="Numéro WhatsApp — ex : +33612345678"
                  className="h-8 text-sm"
                />
                <div className="relative">
                  <Input
                    value=""
                    onChange={() => {}}
                    placeholder="Email — ex : rh@entreprise.com"
                    type="email"
                    className="h-8 text-sm opacity-50 cursor-not-allowed"
                    disabled
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Bientôt
                  </span>
                </div>
              </div>
              {hasDelegate && (
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <Info size={11} className="shrink-0 mt-0.5" />
                  Ce membre recevra les notifications à la place du propriétaire, sans lien vers le tableau de bord. Ce formulaire ne compte plus dans votre limite.
                </p>
              )}
            </div>
          </>
        )}

        <Button size="sm" onClick={saveNotifications} disabled={savingNotif || budgetBlocked}>
          {savingNotif && <Loader2 size={14} className="mr-1.5 animate-spin" />}
          {notifSaved ? <><Check size={14} className="mr-1.5" />Enregistré</> : 'Enregistrer les notifications'}
        </Button>
      </div>

      {/* ── Limites ───────────────────────────────────────────────────── */}
      <div className="border-t border-border pt-5">
        <p className="text-sm text-foreground mb-3">Limites</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Réponses max</p>
            <Input
              type="number"
              min="1"
              value={maxSubmissions}
              onChange={e => setMaxSubmissions(e.target.value)}
              placeholder="Illimité"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Date d&apos;expiration</p>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <Button size="sm" onClick={saveLimits} disabled={savingLimits}>
          {savingLimits && <Loader2 size={14} className="mr-1.5 animate-spin" />}
          {limitsSaved ? <><Check size={14} className="mr-1.5" />Enregistré</> : 'Enregistrer les limites'}
        </Button>
      </div>

      {/* ── Intégration ───────────────────────────────────────────────── */}
      <div className="border-t border-border pt-5">
        <p className="text-sm text-foreground mb-1.5">Intégrer sur un site</p>
        <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2 bg-muted/30">
          <Code2 size={13} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground flex-1 font-mono truncate">
            {'<iframe src="…/f/'}{formSlug}{'" …></iframe>'}
          </span>
          <button onClick={copyEmbed} className="text-muted-foreground hover:text-foreground shrink-0">
            {embedCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        {embedCopied && <p className="text-xs text-muted-foreground mt-1">Code copié</p>}
      </div>
    </div>
  )
}
