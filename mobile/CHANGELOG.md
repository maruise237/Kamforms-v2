# Changelog

Toutes les modifications notables du projet Kamforms Mobile seront documentées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-09-05

### ✨ Ajouts (Phase 3 — Features MVP)

- **Phase 3.5 — Export CSV des réponses** : nouveau bouton « Exporter » en haut de l'onglet Réponses. Au tap, ouverture d'une modale listant tous les formulaires avec leur nombre de réponses. Au choix, le CSV est téléchargé depuis l'API, écrit dans `FileSystem.cacheDirectory` puis ouvert via le menu de partage natif (`Sharing.shareAsync`). Le bouton est désactivé en mode hors-ligne.
  - Nouveau fichier `src/lib/csvExport.ts` : helper complet (download → base64 → write → share) avec gestion d'erreurs et cache cleanup.
  - Nouvelle fonction `exportSubmissionsCsv()` dans `src/lib/api.ts`.
  - `(tabs)/reponses.tsx` : ajout d'un header avec bouton Exporter + modale de sélection de formulaire.
  - Dépendances ajoutées : `expo-file-system`, `expo-sharing`.

- **Phase 3.6 — Mode offline-first avec bandeau** : nouveau composant `<OfflineBanner />` affiché automatiquement en haut de chaque écran quand l'app détecte l'absence de connexion internet. Le bandeau informe l'utilisateur que les données affichées proviennent du cache et que les actions mutantes sont désactivées. Le bouton d'export CSV est aussi désactivé en hors-ligne.
  - Nouveau hook `src/lib/useOffline.ts` : écoute `@react-native-community/netinfo` avec fallback gracieux (online) si la lib n'est pas installée. Retourne `true` si `isConnected === false` ou `isInternetReachable === false`.
  - Nouveau composant `src/components/OfflineBanner.tsx` : bandeau discret (couleur `spark` / amber, icône `WifiOff`), `paddingVertical` ajustable via prop `compact`.
  - `(tabs)/index.tsx` (Formulaires) et `(tabs)/reponses.tsx` (Réponses) : `<OfflineBanner />` inséré en haut.
  - Dépendance ajoutée : `@react-native-community/netinfo`.

- **Phase 3.7 — Deep linking kamforms://** : gestion des liens entrants `kamforms://...` pour permettre à un utilisateur d'ouvrir directement l'éditeur d'un formulaire ou l'onglet Réponses depuis un push, un QR code, ou un email.
  - Nouveau fichier `src/lib/deepLinking.ts` : parser `parseKamformsLink()` + helpers `buildFormDeepLink()` / `buildFormulaireDeepLink()`.
  - Schémas supportés :
    - `kamforms://formulaire/[id]` → ouvre l'éditeur du formulaire
    - `kamforms://reponses` → ouvre l'onglet Réponses
    - `kamforms://reponses/[formId]` → ouvre l'onglet Réponses (filtrage TODO V1.1)
    - `kamforms://form/[slug]` → URL publique (laisse l'utilisateur ouvrir dans le navigateur, pour MVP)
    - `kamforms://oauth-native-callback` → déjà géré par Clerk (ignoré)
  - `_layout.tsx` : ajout d'un `useEffect` qui écoute `Linking.getInitialURL()` + `Linking.addEventListener("url")` et route vers le bon écran. Ne s'active que si l'utilisateur est authentifié.
  - Dépendance déjà présente : `expo-linking` (~7.0.5).

### 🔧 Améliorations

- `(tabs)/reponses.tsx` : `useQuery` des soumissions enrichi avec `formId` sur chaque `SubmissionRow` pour permettre l'export.
- `package.json` : ajout de 3 scripts npm (`build:preview:android`, `build:production:*`, `submit:*`, `update`).
- `_layout.tsx` : `Linking` ajouté aux imports.

### 📋 Ce qui existait déjà et a été préservé

L'analyse fine du code source a révélé que les éléments suivants étaient déjà implémentés dans `formulaire/[id]/index.tsx` (2314 lignes) — aucune nouvelle implémentation n'était nécessaire :

- **Phase 3.2 — Éditeur de formulaire mobile complet** : 5 onglets (Aperçu, Apparence, Fin, Paramètres, Statistiques) déjà présents. Édition du titre, description, schéma de champs, ajout/suppression/réordonnancement via `ArrowUp`/`ArrowDown`/`Trash2`, personnalisation du thème (couleur, bannière, position), configuration de l'ending (message, redirection, confetti), paramètres de notification (mode, WhatsApp, email, max submissions, expiration). Tout est fonctionnel et appelle `PATCH /api/forms/[id]`.
- **Phase 3.4 — Analytics par formulaire** : l'onglet « Statistiques » (`TabStatistiques` composant, lignes 1602-2314) affiche déjà les cartes de vues / visiteurs uniques / taux de complétion / nombre de soumissions, la répartition par pays et par villes. Aucune librairie de chart externe nécessaire — les visualisations sont en vues natives RN, ce qui évite d'embarquer une dépendance de 200 Ko.
- **Phase 3.3 — Synchronisation des types de champs** : `FormField` dans `src/lib/api.ts` et `FIELD_TYPES` dans `formulaire/[id]/editer.tsx` listent les mêmes 10 types (text, email, phone, number, textarea, select, radio, checkbox, date, rating), cohérents avec la validation backend.

### 📊 Gains Phase 3

| Fonctionnalité | Statut | Effort constaté |
|---------------|--------|-----------------|
| Éditeur formulaire mobile | ✅ Déjà existant (2314 lignes) | Préexistant |
| Analytics par formulaire | ✅ Déjà existant (712 lignes) | Préexistant |
| Export CSV | ✅ Implémenté Phase 3.5 | ~1 jour |
| Mode offline-first | ✅ Implémenté Phase 3.6 | ~0,5 jour |
| Deep linking kamforms:// | ✅ Implémenté Phase 3.7 | ~0,5 jour |

### 🔗 Dépendances ajoutées (Phase 3)

| Package | Version | Raison |
|---------|---------|--------|
| `@react-native-community/netinfo` | 11.4.1 | Détection offline pour OfflineBanner |
| `expo-file-system` | ~18.1.11 | Écriture du CSV en cache avant partage |
| `expo-sharing` | ~13.0.1 | Menu de partage natif iOS/Android |

## [1.0.0] — 2026-09-05

Version initiale optimisée selon le plan d'action du rapport d'analyse. Cette version ne contient pas encore de features fonctionnelles nouvelles, mais applique toutes les optimisations de Phase 1 (allègement APK), Phase 2 (performance), Phase 3.1 (account deletion) et Phase 4.1 (Sentry).

### ✨ Ajouts

- **Phase 3.1 — Account Deletion** : nouvel écran `parametres-supprimer-compte.tsx` accessible depuis l'onglet Paramètres. Supprime les données Prisma via `DELETE /api/user` puis le user Clerk via `user.delete()`. Satisfait la règle Apple App Store Review 5.1.1v7 (account deletion obligatoire pour toute app avec création de compte).
  - Endpoint backend associé : `src/app/api/user/route.ts` — `DELETE` handler ajouté. Cascade Prisma supprime automatiquement Form[], UsageEvent[], MobilePushToken[].
- **Phase 4.1 — Sentry mobile** : `@sentry/react-native` ajouté en dépendance, initialisé dans `_layout.tsx` (no-op si `EXPO_PUBLIC_SENTRY_DSN` est vide). Capture des crashes en production dès le premier render.
- **Phase 2.3 — Cache React Query persisté** : nouveau helper `src/lib/queryCache.ts` qui persiste les queries `forms` et `submissions` sur AsyncStorage (24h max). Effet offline-first : l'utilisateur voit ses formulaires sans réseau.
- **Phase 2.1 — Préchargement queries critiques** : appel `prefetchCriticalQueries()` dans `_layout.tsx` au moment où l'utilisateur est authentifié. Les queries `forms` et `userSettings` sont peuplées en parallèle pendant le splash, l'effet à l'arrivée sur l'onglet Formulaires est quasi-instantané.
- **Helper fonts** : nouveau fichier `src/lib/fonts.ts` qui centralise les 5 variants de polices chargés (Inter 400/500, InterTight 600/700, JetBrainsMono 600). Documentation des variants supprimés.
- **Babel config** : `babel.config.js` avec `transform-remove-console` en production (conserve `error` et `warn`).
- **Metro config** : `metro.config.js` avec `disableHierarchicalLookup` pour accélérer le build.
- **README détaillé** : guide d'installation, builds, soumission stores, OTA updates, tests OAuth.
- **Scripts npm** dans `package.json` : `build:preview:android`, `build:production:android`, `build:production:ios`, `submit:android`, `submit:ios`, `update`.

### 🔧 Modifications

- **Phase 1.1 — `app.json`** :
  - `expo-build-properties.android.useLegacyPackaging` : `true` → `false` (gain ~3 Mo sur l'APK, décompression à l'installation).
  - Ajout `expo-build-properties.android.ndk.abiFilters: ["arm64-v8a"]` (gain ~6 Mo — exclusion armeabi-v7a et x86_64 obsolètes).
  - Ajout `expo-build-properties.android.minSdkVersion: 24` (Android 7.0+ — couvre 99 % des devices actifs).
  - Ajout `android.blockedPermissions` pour exclure explicitement `READ/WRITE_EXTERNAL_STORAGE` (réduit les permissions demandées à l'installation).
  - Ajout `ios.infoPlist.ITSAppUsesNonExemptEncryption: false` (évite le warning App Store sur l'encryption).
  - Ajout `extra.sentry.dsn` (placeholder vide, sera lu par `_layout.tsx`).
  - Ajout `updates.url` et `runtimeVersion` pour activer EAS Update (OTA).
- **Phase 1.2 — `_layout.tsx`** :
  - Imports de polices déplacés vers `@/lib/fonts` (helper centralisé). Plus aucun import direct de `@expo-google-fonts/*` dans `_layout.tsx`.
  - `useFonts(kamformsFonts)` au lieu de `useFonts({ InterTight_700Bold, ... })` inline.
- **Phase 1.3 — DebugPanel** :
  - `auth-choice.tsx` et `sign-in.tsx` : import du composant via `lazy()` + guard `__DEV__`. En production, le panneau et son bouton "Diagnostic" sont complètement absents du bundle.
- **Phase 1.5 — Assets** :
  - Conversion PNG → WebP pour 9 fichiers d'illustrations (logo, tutorial-web, react-logo × 3, expo-badge × 2, expo-logo, logo-glow). Gain 297 Ko. Les icons d'app Android/iOS restent en PNG (requis par les stores).
- **Phase 1.7 — `eas.json`** :
  - Profile `production` : `buildType: "app-bundle"` (AAB, requis par Play Store).
  - Ajout des profils `submit` pour Android et iOS (configuration fastlane/EAS).
  - Ajout `gradleCommand: ":app:assembleRelease"` pour les builds dev/preview (build release au lieu de debug).
  - Variables d'environnement par profil (DSN Sentry vide en dev/preview, à renseigner en prod).
- **Phase 2.1 — `_layout.tsx`** :
  - QueryClient : `staleTime` 30s → 60s, ajout `gcTime: 5min`, `refetchOnWindowFocus: false`, `refetchOnReconnect: true`.
  - Effet `prefetchCriticalQueries` déclenché après authentification.
- **Phase 2.2 — `(tabs)/index.tsx`** :
  - Carte formulaire encapsulée dans `React.memo` avec comparaison custom sur `id`, `_count.submissions`, `active`, `title`, `colors`.
  - `handleDelete` mémoïsé via `useCallback` (closure stable).
  - `renderItem` mémoïsé via `useCallback`.
  - `listData` mémoïsé via `useMemo`.
  - FlatList : `removeClippedSubviews=true`, `maxToRenderPerBatch=8`, `windowSize=5`.
- **Phase 2.2 — `(tabs)/reponses.tsx`** :
  - Carte soumission encapsulée dans `React.memo` avec comparaison custom.
  - `renderItem` mémoïsé, `listData` mémoïsé.
  - FlatList : mêmes optimisations que index.tsx.
- **`(tabs)/parametres.tsx`** : ajout d'un lien "Supprimer mon compte" en bas de l'écran, avec icône `Trash2` et couleur `danger`.
- **`package.json`** : ajout de `@react-native-async-storage/async-storage`, `@sentry/react-native`, `@tanstack/react-query-async-storage-persist`, `@tanstack/query-sync-storage-persister`, `expo-updates`, et `babel-plugin-transform-remove-console` en devDep.

### 🗑️ Suppressions

- 9 fichiers PNG d'illustrations remplacés par leurs équivalents WebP (gain 297 Ko) :
  - `logo-glow.png`, `tutorial-web.png`, `react-logo.png`, `react-logo@2x.png`, `react-logo@3x.png`, `expo-badge.png`, `expo-badge-white.png`, `expo-logo.png`, `logo.png`

### 📊 Gains attendus

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| Taille APK Android | 39 Mo | ~21-22 Mo | -44 % |
| Bundle JS initial | 5,97 Mo | ~4,8 Mo | -20 % |
| Polices embarquées | 17 variants | 5 variants | -71 % |
| Architectures natives | 3 (arm64 + armv7 + x86) | 1 (arm64-v8a) | -67 % |
| TTI démarrage | ~3-4 s | ~1,5-2 s | -50 % |
| Re-render listes | sans memo | React.memo + useCallback | -30 % |
| Compliance App Store | account deletion manquant | ✅ règle 5.1.1v7 | — |

### ⚠️ Breaking changes

- **`minSdkVersion` 24 (Android 7.0+)** : exclut les devices Android < 7.0 (~0,5 % du marché 2026). Si vous devez supporter Android 5.x, retirer `minSdkVersion` de `app.json`.
- **ABI arm64-v8a uniquement** : exclut les devices 32-bit ARM (armeabi-v7a) commercialisés avant 2021. Représente < 2 % du marché 2026. Si vous devez supporter ces devices, ajouter `"armeabi-v7a"` à `abiFilters`.
- **Backend** : endpoint `DELETE /api/user` à déployer côté kamforms.com (fichier `src/app/api/user/route.ts`). Sans cet endpoint, la suppression de compte échoue côté backend (mais Clerk.user.delete() réussit quand même côté client).

### 🔗 Dépendances ajoutées

| Package | Version | Raison |
|---------|---------|--------|
| `@sentry/react-native` | ~6.1.0 | Monitoring crashes production |
| `@react-native-async-storage/async-storage` | 1.23.1 | Persistance cache React Query |
| `@tanstack/react-query-async-storage-persist` | ^5.62.7 | Persistance cache offline |
| `@tanstack/query-sync-storage-persister` | ^5.62.7 | Helper sync (utilisé en interne) |
| `expo-updates` | ~0.28.10 | OTA updates via EAS Update |
| `babel-plugin-transform-remove-console` | ^6.9.4 | Supprime console.log en prod |

### 📋 À faire avant le premier build release

1. **Vérifier `.env`** : `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` doit être renseigné avec la vraie clé (pas `pk_test_xxx`).
2. **Tester OAuth sur device physique** : build preview Android, installer sur Samsung Galaxy A12, tester Google sign-in.
3. **Vérifier les credentials stores** :
   - Apple : certificat distribution + provisioning profile pour `com.kamtech.kamforms`
   - Google : service account JSON dans `.eas/credentials/play-store-service-account.json`
4. **Captures d'écran stores** : générer 5-8 screenshots par format (iPhone 6.7", 6.5", 5.5", iPad 12.9", Android phone, Android 7" tablet).
5. **Métadonnées stores** : titre, sous-titre (≤30 char App Store), descriptions, mots-clés, catégorie "Productivity", classification 4+ (iOS) / Everyone (Android).
6. **Déployer le backend** : ajouter le handler `DELETE /api/user` sur kamforms.com avant la soumission App Store.
7. **Renseigner le DSN Sentry** dans `.env` (optionnel mais recommandé pour la V1).
