/**
 * Envoi de notifications push vers l'app mobile Kamforms (Expo Push API).
 * Le son custom « reponse.wav » et le canal Android « reponses » (vibration)
 * sont définis côté app — le payload ne fait que les référencer.
 */

import { prisma } from '@/lib/prisma'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export type ExpoPushPayload = {
  title: string
  body: string
  url?: string
}

type ExpoPushTicket = {
  status: 'ok' | 'error'
  details?: { error?: string }
}

export async function sendExpoPushNotification(
  expoPushTokens: string[],
  payload: ExpoPushPayload
) {
  if (expoPushTokens.length === 0) return

  const messages = expoPushTokens.map((to) => ({
    to,
    title: payload.title,
    body: payload.body,
    sound: 'reponse.wav',
    channelId: 'reponses',
    priority: 'high' as const,
    data: { url: payload.url ?? '/dashboard' },
  }))

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(messages),
    })

    if (!res.ok) {
      console.error('[expo-push] Erreur HTTP', res.status)
      return
    }

    const { data: tickets } = (await res.json()) as { data?: ExpoPushTicket[] }

    // Nettoyage des tokens invalides, comme le 410 du web-push
    tickets?.forEach((ticket, i) => {
      if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
        prisma.mobilePushToken
          .deleteMany({ where: { token: expoPushTokens[i] } })
          .catch((err) => console.error('[expo-push] Nettoyage token impossible:', err))
      }
    })
  } catch (err) {
    console.error('[expo-push] Erreur envoi notification:', err)
  }
}
