# Kamforms v2 — Plateforme de formulaires IA + apps mobiles

Monorepo unifié Kamforms v2 contenant :
- **`/`** (racine) : Plateforme web Next.js 16 — `kamforms.com`
- **`mobile/`** : App mobile Expo / React Native — Android + iOS

> ⚠️ Ce dépôt est destiné aux tests avant promotion vers le dépôt de production.
> Toutes les modifications Phase 1-4 du plan d'optimisation mobile y sont appliquées.

---

## 📦 Structure du monorepo

```
Kamforms-v2/
├── README.md                   # Ce fichier
├── package.json                # Web — Next.js 16
├── next.config.ts              # Web — config Next.js
├── prisma/                     # Web — schéma + migrations PostgreSQL
├── public/                     # Web — assets statiques
├── src/                        # Web — App Router Next.js
│   ├── app/                    # Web — routes + API REST
│   │   ├── (site)/             # Web — pages publiques + auth
│   │   ├── api/                # Web — 23 endpoints REST
│   │   ├── f/[slug]/           # Web — formulaires publics
│   │   └── [adminSecret]/      # Web — admin interne
│   ├── components/             # Web — composants React + shadcn/ui
│   └── lib/                    # Web — logique métier + intégrations
├── mobile/                     # Mobile — Expo SDK 52
│   ├── app.json                # Mobile — config Expo (bundleId, plugins, splash)
│   ├── eas.json                # Mobile — profils de build (dev/preview/production)
│   ├── babel.config.js         # Mobile — Babel (transform-remove-console prod)
│   ├── metro.config.js         # Mobile — Metro (disableHierarchicalLookup)
│   ├── package.json            # Mobile — dépendances + scripts
│   ├── assets/                 # Mobile — images (WebP), sons, fonts
│   ├── plugins/                # Mobile — plugins natifs (withOAuthBrowserLauncher)
│   ├── google-services.json    # Mobile — FCM Android (requis pour notif push)
│   ├── GoogleService-Info.plist # Mobile — APNs iOS (requis pour notif push)
│   └── src/                    # Mobile — code source (40 fichiers TS/TSX)
│       ├── app/                # Mobile — 18 écrans expo-router
│       ├── components/          # Mobile — composants UI réutilisables
│       ├── lib/                # Mobile — helpers (api, fonts, queryCache, etc.)
│       ├── context/             # Mobile — ThemeProvider
│       └── theme.ts            # Mobile — design system
└── docker-compose.yml          # Web — PostgreSQL + Redis + app
```

## 🚀 Démarrage rapide

### Pré-requis

- Node.js 20+ (recommandé 22 LTS)
- npm 10+
- PostgreSQL 16+
- Redis 7+ (optionnel pour le rate limiting partagé)
- Compte Clerk (https://clerk.com) pour l'authentification
- Pour le mobile : Expo CLI (`npm install -g eas-cli`)

### Installation web

```bash
# 1. Installer les dépendances web
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos vraies clés : DATABASE_URL, Clerk, DeepSeek, etc.

# 3. Appliquer les migrations Prisma
./scripts/migrate.sh

# 4. Lancer le dev server
npm run dev
# → http://localhost:3000
```

### Installation mobile

```bash
cd mobile

# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement mobile
cp .env.example .env
# Éditer .env : EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY, EXPO_PUBLIC_API_URL, EXPO_PUBLIC_SENTRY_DSN

# 3. Lancer en développement
npm start              # Expo Dev Server
npm run android        # Android emulator
npm run ios            # iOS simulator (macOS)
```

## 📊 Optimisations mobile v1.0.0 (détails dans `mobile/CHANGELOG.md`)

| Catégorie | Optimisation | Gain estimé |
|-----------|--------------|-------------|
| Taille APK | Restriction ABI arm64-v8a | -6 Mo |
| Taille APK | Nettoyage polices (17 → 5) | -5 Mo |
| Taille APK | Conversion PNG → WebP | -300 Ko |
| Taille APK | Suppression DebugPanel prod | -200 Ko |
| Performance | Prefetch queries au splash | TTI -400 ms |
| Performance | React.memo sur cartes listes | -30 % re-render |
| Performance | Cache React Query persisté | offline-first |
| Compliance | Account deletion (règle 5.1.1v7) | ✅ App Store OK |
| Monitoring | Sentry mobile activé | ✅ crashs capturés |

## 🔧 Builds et déploiement

### Web

```bash
npm run build      # Build de production Next.js
npm run start      # Lancer en mode production
```

### Mobile — voir `mobile/README.md` pour le détail

```bash
cd mobile

# Build preview (APK pour testeurs)
eas build --profile preview --platform android

# Build production (AAB pour Play Store)
eas build --profile production --platform android
eas build --profile production --platform ios

# Soumission stores
eas submit --platform android --profile production
eas submit --platform ios --profile production

# OTA updates
eas update --auto --channel production
```

## 🛡️ Sécurité

- ✅ `.env` est exclu de git via `.gitignore`
- ✅ Les fichiers Firebase (`google-services.json`, `GoogleService-Info.plist`) sont inclus car Firebase security rules gèrent la sécurité server-side
- ✅ CSP, HSTS, X-Frame-Options configurés côté web (`next.config.ts`)
- ✅ Clerk gère l'authentification (jamais de mots de passe stockés en clair)
- ⚠️ Ne jamais committer de vraies clés API dans `.env` — toujours utiliser `.env.example` comme template

## 📝 Documentation

- `mobile/README.md` — guide complet installation + builds + stores
- `mobile/CHANGELOG.md` — détail des modifications v1.0.0
- `mobile/AGENTS.md` / `mobile/CLAUDE.md` — notes pour assistants IA
- `AGENTS.md` / `CLAUDE.md` (racine) — notes pour assistants IA sur le web
- `prisma/schema.prisma` — schéma de la base de données

## 🧪 Tests

### Web
```bash
npm test              # Vitest run
npm run test:watch    # Vitest watch mode
npm run test:coverage # Couverture
```

### Mobile
```bash
cd mobile
npx tsc --noEmit      # Type checking
npm run lint          # ESLint
```

## 📞 Support

- Email : hello@kamforms.com
- Site : https://kamforms.com

---

**Version** : v2.0.0 (Septembre 2026)
**Stack** : Next.js 16 · React 19 · Prisma 7 · PostgreSQL · Clerk · Expo SDK 52 · React Native 0.76 · React Query 5
**License** : voir `LICENSE`
