import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

export const tokenCache = {
  async getToken(key: string) {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage.getItem(key)
        }
        return null
      }
      return await SecureStore.getItemAsync(key)
    } catch (err) {
      console.warn('tokenCache getToken error:', err)
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, value)
        }
      } else {
        await SecureStore.setItemAsync(key, value)
      }
    } catch (err) {
      console.warn('tokenCache saveToken error:', err)
    }
  },
}
