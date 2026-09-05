'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, X } from 'lucide-react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallBanner() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [manual, setManual] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: window-controls-overlay)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true) return

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
      setCanInstall(true)
      setShow(true)
    }
    const onInstalled = () => { setShow(false); setCanInstall(false) }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', onInstalled)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js?v=4').catch(() => {})
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function handleInstall() {
    const promptEvent = deferredPromptRef.current
    if (!promptEvent || busy) return
    setBusy(true)
    try {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice.outcome === 'accepted') setShow(false)
    } catch {
      // Le navigateur refuse le prompt (déjà consommé, etc.) -> on bascule en manuel.
      setManual(true)
    } finally {
      deferredPromptRef.current = null
      setCanInstall(false)
      setBusy(false)
    }
  }

  function handleManual() {
    if (!canInstall) setManual(true)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 inset-x-4 md:inset-x-auto md:right-6 md:bottom-6 md:w-80 z-50 rounded-xl border border-border bg-card shadow-lg p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
        <Download size={16} className="text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">Installer Kamforms</p>
        {manual ? (
          <p className="text-[11px] text-muted-foreground">
            Menu navigateur (⋮ ou partage) → « Ajouter à l&apos;écran d&apos;accueil »
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            {busy ? 'Préparation...' : 'Hors-ligne et plus rapide'}
          </p>
        )}
      </div>
      {canInstall ? (
        <button
          onClick={handleInstall}
          disabled={busy}
          className="h-7 px-3 rounded-lg bg-foreground text-background text-xs font-semibold shrink-0 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {busy ? '...' : 'Installer'}
        </button>
      ) : (
        <button
          onClick={handleManual}
          className="h-7 px-3 rounded-lg bg-foreground text-background text-xs font-semibold shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
        >
          Comment ?
        </button>
      )}
      <button onClick={() => { setShow(false); setDismissed(true) }} className="shrink-0 p-1 text-muted-foreground hover:text-foreground cursor-pointer">
        <X size={14} />
      </button>
    </div>
  )
}
