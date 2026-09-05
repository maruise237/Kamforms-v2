/**
 * Système de notifications Kamforms.
 *
 * - Canal Android « reponses » : son custom + vibration (c'est le canal qui
 *   porte le son, pas la notification elle-même).
 * - Handler foreground : bannière + son + haptique quand l'app est ouverte.
 * - Enregistrement du token Expo push auprès du backend Kamforms.
 */

import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

export const ANDROID_CHANNEL_ID = 'reponses'
export const NOTIFICATION_SOUND = 'reponse.wav'

/** Affiche les notifications même quand l'app est ouverte (bannière + son). */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })
}

/** Crée le canal Android avec son custom + pattern de vibration. */
export async function setupAndroidChannel() {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Réponses aux formulaires',
    description: 'Une notification à chaque nouvelle réponse reçue',
    importance: Notifications.AndroidImportance.MAX,
    sound: NOTIFICATION_SOUND,
    enableVibrate: true,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  })
}

/**
 * Demande la permission, récupère le token Expo push et l'envoie au backend.
 * Retourne le token, ou null si impossible (émulateur, permission refusée…).
 */
export async function registerForPushNotifications(
  sendToBackend: (expoPushToken: string, platform: 'android' | 'ios') => Promise<unknown>
): Promise<string | null> {
  if (!Device.isDevice) return null

  await setupAndroidChannel()

  const permissions = (await Notifications.getPermissionsAsync()) as any
  let isGranted = permissions?.granted || permissions?.status === 'granted'
  if (!isGranted) {
    const requested = (await Notifications.requestPermissionsAsync()) as any
    isGranted = requested?.granted || requested?.status === 'granted'
  }
  if (!isGranted) return null

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  )

  const platform = Platform.OS === 'ios' ? 'ios' : 'android'
  await sendToBackend(expoPushToken, platform)
  return expoPushToken
}

/** Notification de test locale (son + vibration) — utilisée dans Paramètres. */
export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nouvelle réponse',
      body: 'Une nouvelle réponse vient d\'arriver sur votre formulaire.',
      sound: NOTIFICATION_SOUND,
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
    trigger: null, // immédiat
  })
}
