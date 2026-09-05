# Kamforms Mobile — Guide d'installation et de build

App mobile **Kamforms** pour Android et iOS, construite avec Expo SDK 52 + React Native 0.76 + Clerk + React Query. Consomme l'API REST exposée par le backend [kamforms.com](https://kamforms.com).

---

## 📋 Prérequis

- Node.js 20+ (recommandé 22 LTS)
- npm 10+ ou pnpm 9+
- Expo CLI (`npm install -g eas-cli`)
- Pour iOS : macOS avec Xcode 15+ (Apple Silicon recommandé)
- Pour Android : Android Studio avec SDK 35+
- Compte Expo (gratuit) — owner: `kamtech19`

## 🚀 Installation

```bash
# 1. Se placer dans le dossier mobile/
cd mobile

# 2. Installer les dépendances
npm install
#  ou: pnpm install

# 3. Copier et renseigner les variables d'environnement
cp .env.example .env
# Éditer .env :
#   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...   (même clé que web)
#   EXPO_PUBLIC_API_URL=https://kamforms.com
#   EXPO_PUBLIC_SENTRY_DSN=                         (optionnel, vide = désactivé)

# 4. Lancer en développement
npm start              # Expo Dev Server
# ou avec device :
npm run android        # Android emulator
npm run ios            # iOS simulator (macOS seulement)
```

## 📦 Builds

### Build de développement (test sur device physique)

```bash
# Android APK debug + distribution interne EAS
eas build --profile development --platform android

# iOS development build (nécessite compte Apple Developer)
eas build --profile development --platform ios
```

### Build preview (APK release pour testeurs)

```bash
# Android APK release signé — pour distribution interne
eas build --profile preview --platform android

# iOS preview build — pour TestFlight Internal Testing
eas build --profile preview --platform ios
```

### Build production (AAB Android + IPA iOS pour stores)

```bash
# Android App Bundle (.aab) pour Play Store
eas build --profile production --platform android

# iOS IPA release pour App Store
eas build --profile production --platform ios
```

## 🚀 Déploiement sur les stores

### Configuration initiale (une seule fois)

1. **Apple Developer Program** (99 USD/an) :
   - Créer un App ID `com.kamtech.kamforms`
   - Créer un App Store Connect API key (rôle App Manager)
   - Renseigner dans `eas.json` : `appleId`, `ascAppId`, `appleTeamId`

2. **Google Play Console** (25 USD, à vie) :
   - Créer un service account et téléverser le JSON dans
     `mobile/.eas/credentials/play-store-service-account.json`

### Submit

```bash
# Android → Play Internal Testing
eas submit --platform android --profile production

# iOS → TestFlight Internal Testing
eas submit --platform ios --profile production

# Plus tard : promotion vers production (depuis le dashboard Play Console / App Store Connect)
```

## 🔄 Mises à jour OTA (sans repasser par les stores)

Pour corriger un bug JS-only sans repasser par le review store :

```bash
# Publier une mise à jour sur le channel "production"
eas update --auto --channel production

# Sur un channel de test :
eas update --auto --channel staging --message "fix: crash on sign-in"
```

⚠️ Les mises à jour OTA **ne peuvent pas** changer :
- Le code natif (modules Expo, plugins)
- Les permissions Android
- Le bundleIdentifier / package
- Le schéma URL (kamforms://)

## 🧪 Tests

```bash
# Type checking
npx tsc --noEmit

# Lint
npm run lint
```

## 📱 Test OAuth sur device physique (recommandé avant soumission)

Le flux OAuth Google/Apple utilise un plugin natif custom (`plugins/withOAuthBrowserLauncher/`). Ce plugin **doit être testé en build release** avant soumission store :

```bash
# 1. Build preview (APK release signé)
eas build --profile preview --platform android

# 2. Installer sur device physique (Samsung Galaxy A12 ou équivalent)
#    adb install base.apk  (ou via EAS)

# 3. Tester :
#    - Connexion Google → vérifier que l'onglet Chrome s'ouvre puis revient
#    - Connexion Apple (iOS) → vérifier SIWA natif
#    - Tuer l'app pendant l'OAuth → vérifier la récupération
```

## 🗂️ Structure du projet

```
mobile/
├── app.json                    # Config Expo (bundleId, plugins, splash, icons)
├── eas.json                    # Profils de build (development/preview/production)
├── babel.config.js             # Babel (transform-remove-console en prod)
├── metro.config.js             # Metro (disableHierarchicalLookup)
├── package.json                # Dépendances + scripts
├── assets/                     # Images (WebP), sons (reponse.wav), fonts
├── plugins/
│   └── withOAuthBrowserLauncher/  # Plugin natif OAuth Android
├── google-services.json        # FCM Android (ne pas committer)
├── GoogleService-Info.plist    # APNs iOS (ne pas committer)
└── src/
    ├── app/                    # Routes expo-router (18 écrans)
    │   ├── _layout.tsx         # Root layout : ClerkProvider + QueryClientProvider
    │   ├── index.tsx           # Splash
    │   ├── welcome.tsx
    │   ├── auth-choice.tsx
    │   ├── sign-in.tsx
    │   ├── creer.tsx           # Création de formulaire (IA/template/import)
    │   ├── onboarding/         # 4 écrans d'onboarding
    │   ├── (tabs)/             # 3 onglets : Formulaires, Réponses, Paramètres
    │   ├── formulaire/[id]/    # Détail + édition
    │   └── parametres-supprimer-compte.tsx  # Règle App Store 5.1.1v7
    ├── components/
    │   ├── ui/                 # Composants réutilisables
    │   └── DebugPanel.tsx      # (lazy-importé en DEV seulement)
    ├── lib/
    │   ├── api.ts              # Client REST (fetch + Bearer token)
    │   ├── fonts.ts            # 5 polices chargées (au lieu de 17)
    │   ├── queryCache.ts       # Persistance React Query + prefetch
    │   ├── notifications.ts    # expo-notifications + canal Android
    │   ├── useSocialAuth.ts   # OAuth Google/Apple
    │   ├── tokenCache.ts       # Clerk SecureStore
    │   └── debugLog.ts         # Logs DEV-only (no-op en prod via babel)
    ├── context/
    │   └── ThemeContext.tsx    # Thème sombre/clair/auto
    └── theme.ts                # Design tokens (couleurs, typo, radius)
```

## 📊 Optimisations appliquées (v1.0.0)

Voir `CHANGELOG.md` pour le détail des modifications.

| Catégorie | Optimisation | Gain estimé |
|-----------|--------------|-------------|
| Taille APK | Restriction ABI arm64-v8a | -6 Mo |
| Taille APK | Nettoyage polices (17 → 5) | -5 Mo |
| Taille APK | Conversion PNG → WebP | -300 Ko |
| Taille APK | Suppression DebugPanel prod | -200 Ko |
| Performance | Prefetch queries au splash | TTI -400 ms |
| Performance | React.memo sur cartes listes | -30 % re-render |
| Performance | Cache React Query persisté | offline-first |
| Performance | Désactivation console.log prod | -200 Ko bundle |
| Compliance | Account deletion (règle 5.1.1v7) | ✅ App Store OK |

## 📞 Support

- Email : hello@kamforms.com
- Documentation interne : voir `CLAUDE.md` et `AGENTS.md` dans le repo
