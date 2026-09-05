/**
 * Service d'envoi de notifications push navigateur via Web Push API.
 * Le package `web-push` est installé au moment du build Docker.
 * Pas de typage statique — le module est chargé dynamiquement.
 */

let webPush: { setVapidDetails: (s: string, pk: string, k: string) => void; sendNotification: (sub: unknown, payload: string, opts?: { TTL: number }) => Promise<unknown> } | null = null

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  webPush = require('web-push')
  const publicKey  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
  const privateKey = process.env.VAPID_PRIVATE_KEY ?? ''
  const subject    = process.env.VAPID_SUBJECT ?? 'mailto:contact@kamforms.com'

  if (publicKey && privateKey && webPush) {
    webPush.setVapidDetails(subject, publicKey, privateKey)
  }
} catch {
  // web-push pas installé — notifications push désactivées
}

export async function sendPushNotification(
  subscription: unknown,
  payload: { title: string; body: string; url?: string }
) {
  if (!webPush || !subscription) return

  try {
    await webPush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url ?? '/dashboard',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      }),
      { TTL: 86400 }
    )
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
      // Subscription expirée — on la nettoie
      console.warn('[push] Subscription expirée, à supprimer')
    } else {
      console.error('[push] Erreur envoi notification:', err)
    }
  }
}
