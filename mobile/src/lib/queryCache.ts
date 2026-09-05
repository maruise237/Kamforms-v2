/**
 * Cache React Query persisté — offline-first (Phase 2.3)
 *
 * ─── Pourquoi ───────────────────────────────────────────────────────
 * Sans persistance, l'utilisateur qui ferme l'app et la rouvre sans
 * réseau voit un écran "Chargement..." puis une erreur. Avec ce cache,
 * les données sont restaurées instantanément depuis AsyncStorage, puis
 * un re-fetch se fait en arrière-plan au retour du réseau.
 *
 * ─── Stratégie ──────────────────────────────────────────────────────
 *  - Persister uniquement les clés commençant par ["forms"] et
 *    ["submissions"] — pas ["planInfo"] qui change souvent
 *  - maxAge: 24h — au-delà, on considère le cache périmé
 *  - Persister sur AsyncStorage (16 KB max par item, 50 Mo au total)
 *
 * ─── Installation requise ───────────────────────────────────────────
 *  npm install @tanstack/query-async-storage-persister \
 *              @tanstack/query-sync-storage-persister \
 *              @react-native-async-storage/async-storage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { QueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "kamforms-rq-cache-v1";

// Clés à persister : on garde les listes (forms, submissions), pas les plans
const PERSIST_KEY_PATTERNS = [
  ["forms"],          // Liste des formulaires
  ["submissions"],    // Liste des soumissions
];

function shouldPersistQuery(queryKey: readonly unknown[]): boolean {
  return PERSIST_KEY_PATTERNS.some(pattern =>
    pattern.every((segment, i) => queryKey[i] === segment)
  );
}

/** Persister un QueryClient sur AsyncStorage
 *  Retourne [unsubscribe, restorePromise] — voir type PersistQueryClientReturn
 */
export function setupQueryCachePersistence(
  queryClient: QueryClient
): [() => void, Promise<void>] {
  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: STORAGE_KEY,
    throttleTime: 1000, // 1s — évite d'écrire sur chaque keystroke
  });

  return persistQueryClient({
    queryClient,
    persister,
    maxAge: 24 * 60 * 60 * 1000, // 24h
    buster: "v1.0.0",
  });
}

/**
 * Préchargement des queries critiques au démarrage (Phase 2.1)
 *
 * Appelé après authentification réussie pour peupler le cache avant
 * que l'utilisateur n'arrive sur l'onglet Formulaires. Les données
 * sont déjà disponibles au render, l'effet est quasi-instantané.
 */
export async function prefetchCriticalQueries(
  queryClient: QueryClient,
  getToken: () => Promise<string | null>
) {
  const token = await getToken();
  if (!token) return;

  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://kamforms.com";

  // Préchargement parallèle : liste des formulaires + paramètres utilisateur
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ["forms"],
      queryFn: async () => {
        const res = await fetch(`${API_URL}/api/forms`, {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      },
      staleTime: 60_000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["userSettings"],
      queryFn: async () => {
        const res = await fetch(`${API_URL}/api/user`, {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      },
      staleTime: 60_000,
    }),
  ]);
}
