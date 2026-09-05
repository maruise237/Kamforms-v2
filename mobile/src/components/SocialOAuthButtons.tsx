import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { useOAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { Ionicons } from '@expo/vector-icons'

// Indique à WebBrowser de fermer le navigateur à la fin de la session OAuth
if (Platform.OS !== 'web') {
  WebBrowser.maybeCompleteAuthSession()
}

export function SocialOAuthButtons() {
  const router = useRouter()
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Préchauffage du navigateur mobile pour un temps d'ouverture rapide
  useEffect(() => {
    if (Platform.OS === 'web') return
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])

  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' })
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' })

  const handleOAuth = useCallback(
    async (provider: 'google' | 'apple') => {
      setLoadingProvider(provider)
      setErrorMessage(null)
      try {
        const startFlow = provider === 'google' ? startGoogleFlow : startAppleFlow
        const redirectUrl = Linking.createURL('/oauth-native-callback', { scheme: 'kamforms' })

        const { createdSessionId, setActive } = await startFlow({
          redirectUrl,
        })

        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId })
          router.replace('/(tabs)' as any)
        }
      } catch (err: any) {
        console.error(`Erreur OAuth ${provider}:`, err)
        // Ignorer l'annulation par l'utilisateur
        if (!err?.message?.includes('cancel') && !err?.message?.includes('dismiss')) {
          setErrorMessage(`Connexion avec ${provider === 'google' ? 'Google' : 'Apple'} interrompue.`)
        }
      } finally {
        setLoadingProvider(null)
      }
    },
    [startGoogleFlow, startAppleFlow, router]
  )

  return (
    <View style={styles.container}>
      {/* Bouton Google */}
      <Pressable
        style={({ pressed }) => [
          styles.oauthButton,
          styles.googleButton,
          pressed && styles.buttonPressed,
          loadingProvider === 'google' && styles.buttonDisabled,
        ]}
        onPress={() => handleOAuth('google')}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === 'google' ? (
          <ActivityIndicator color="#09090b" />
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="logo-google" size={20} color="#ea4335" style={styles.icon} />
            <Text style={styles.googleText}>Continuer avec Google</Text>
          </View>
        )}
      </Pressable>

      {/* Bouton Apple */}
      <Pressable
        style={({ pressed }) => [
          styles.oauthButton,
          styles.appleButton,
          pressed && styles.buttonPressed,
          loadingProvider === 'apple' && styles.buttonDisabled,
        ]}
        onPress={() => handleOAuth('apple')}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === 'apple' ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="logo-apple" size={22} color="#ffffff" style={styles.icon} />
            <Text style={styles.appleText}>Continuer avec Apple</Text>
          </View>
        )}
      </Pressable>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  oauthButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appleButton: {
    backgroundColor: '#09090b',
    borderColor: '#09090b',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  googleText: {
    color: '#09090b',
    fontSize: 15,
    fontWeight: '600',
  },
  appleText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
})
