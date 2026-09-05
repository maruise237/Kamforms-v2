'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export function StepPartage({
  formSlug,
  onNext,
  onData,
}: {
  formSlug: string
  onNext: () => void
  onData: () => void
}) {
  const slug = formSlug || 'mon-formulaire'
  const publicUrl = `${APP_URL}/f/${slug}`
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleContinue() {
    onData()
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col max-w-sm mx-auto w-full"
    >
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mb-3">
          <Check size={10} />
          En ligne
        </span>
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Partage ton formulaire</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Copie le lien et envoie-le à tes clients.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground mb-1.5">Lien public</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-foreground truncate bg-muted rounded px-2 py-1">
              {publicUrl}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                'shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors',
                copied ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
              aria-label={copied ? 'Copié' : 'Copier le lien'}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground mb-2">Partager sur</p>
          <div className="flex gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Réponds ici : ${publicUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 text-xs font-medium hover:bg-blue-500/20 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
            <a
              href={`mailto:?subject=Formulaire&body=${encodeURIComponent(`Remplis ce formulaire : ${publicUrl}`)}`}
              className="flex items-center gap-1.5 rounded-md bg-muted text-muted-foreground px-3 py-1.5 text-xs font-medium hover:text-foreground transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
              Email
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground mb-2">Aperçu côté répondant</p>
          <div className="rounded-lg border border-border bg-background p-3 space-y-2">
            <p className="text-xs font-medium text-foreground">Mon formulaire</p>
            <div className="h-5 rounded bg-muted" style={{ width: '70%' }} />
            <div className="h-5 rounded bg-muted" style={{ width: '85%' }} />
            <div className="h-5 rounded bg-muted" style={{ width: '50%' }} />
            <div className="flex justify-end">
              <div className="h-6 w-20 rounded-md bg-muted" />
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleContinue} className="w-full">
        Voir le tableau de bord
      </Button>
    </motion.div>
  )
}
