/**
 * Hook useOffline (Phase 3.6)
 *
 * Détecte l'absence de connexion réseau via @react-native-community/netinfo
 * avec un fallback sur true (online) si la lib n'est pas installée ou
 * échoue.
 *
 * ⚠️ Requiert : npx expo install @react-native-community/netinfo
 *
 * Usage :
 *   const isOffline = useOffline();
 *   if (isOffline) return <OfflineScreen />;
 */

import { useEffect, useState } from "react";

type NetInfoState = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
};

let NetInfo: any = null;
try {
  // Import dynamique — si le package n'est pas installé, on dégrade gracieusement
  NetInfo = require("@react-native-community/netinfo").default;
} catch {
  NetInfo = null;
}

export function useOffline(): boolean {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!NetInfo) {
      // Fallback : on suppose online
      setIsOffline(false);
      return;
    }

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      // Offline si isConnected est false OU isInternetReachable est false
      const offline =
        state.isConnected === false ||
        (state.isConnected === true && state.isInternetReachable === false);
      setIsOffline(offline);
    });

    // Vérification initiale
    NetInfo.fetch()
      .then((state: NetInfoState) => {
        const offline =
          state.isConnected === false ||
          (state.isConnected === true && state.isInternetReachable === false);
        setIsOffline(offline);
      })
      .catch(() => setIsOffline(false));

    return () => unsubscribe();
  }, []);

  return isOffline;
}

/**
 * Retourne vrai si une mutation (POST/PATCH/DELETE) doit être bloquée.
 * Utilisé par les composants qui veulent désactiver leurs boutons d'action
 * en mode offline.
 */
export function useMutationAllowed(): boolean {
  const isOffline = useOffline();
  return !isOffline;
}
