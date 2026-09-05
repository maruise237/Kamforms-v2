'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, Loader2, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function PushNotificationToggle({ compact }: { compact?: boolean }) {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [vapidMissing, setVapidMissing] = useState(false)
  const [vapidKey, setVapidKey] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    fetch('/api/vapid-key').then(r => r.json()).then((d: { key: string }) => {
      setVapidKey(d.key)
      if (!d.key) setVapidMissing(true)
    }).catch(() => setVapidMissing(true))
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    setSupported(true)

    // Détection mobile + mode installé (standalone)
    const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsMobile(mobile)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: window-controls-overlay)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)

    navigator.serviceWorker.register('/sw.js').then(() => {
      return navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.getSubscription()
      )
    }).then(sub => {
      setSubscribed(!!sub)
    }).catch(() => {})
  }, [])

  async function toggle() {
    if (!supported) {
      toast.error('Notifications non supportées sur ce navigateur.')
      return
    }

    // Sur mobile, il faut d'abord installer l'application
    if (isMobile && !isStandalone) {
      toast.error('Installez d\'abord l\'application depuis le menu du navigateur (Ajouter à l\'écran d\'accueil).')
      return
    }

    if (!vapidKey) {
      setVapidMissing(true)
      toast.error('Clé VAPID manquante.')
      return
    }

    setLoading(true)
    try {
      if (subscribed) {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        await sub?.unsubscribe()
        await fetch('/api/notifications/unsubscribe', { method: 'POST' })
        setSubscribed(false)
        toast.success('Notifications désactivées.')
      } else {
        const perm = await Notification.requestPermission()
        if (perm !== 'granted') {
          toast.error('Veuillez autoriser les notifications dans les paramètres du navigateur.')
          setLoading(false)
          return
        }
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
        })
        const res = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub.toJSON() }),
        })
        if (!res.ok) throw new Error('API error')
        setSubscribed(true)
        toast.success('Notifications activées !')
      }
    } catch (err) {
      console.error('[push]', err)
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Erreur: ${msg}`)
    }
    setLoading(false)
  }

  if (!supported) return null

  const needsInstall = isMobile && !isStandalone

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={subscribed ? 'Notifications activées' : needsInstall ? 'Installer l\'app pour les notifications' : 'Activer les notifications'}
      className={cn(
        compact
          ? cn(
              'w-8 h-8 flex items-center justify-center rounded-md transition-colors shrink-0',
              subscribed
                ? 'text-green-600 dark:text-green-400'
                : needsInstall
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )
          : cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-border w-full text-left',
              subscribed
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40'
                : needsInstall
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )
      )}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : subscribed ? <Bell size={13} /> : needsInstall ? <Smartphone size={13} /> : <BellOff size={13} />}
      {!compact && (
        <span className="truncate">
          {subscribed ? 'Notifications activées'
            : vapidMissing ? 'Clé VAPID manquante'
            : needsInstall ? 'Installer l\'app pour les notifications'
            : 'Notifications push'}
        </span>
      )}
    </button>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}
