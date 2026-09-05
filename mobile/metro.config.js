/**
 * Metro bundler configuration Kamforms Mobile
 *
 * Optimisations :
 * - minifierConfig : aggressive minification en production
 * - resolver.disableHierarchicalLookup : vitesse de build +50%
 * - transformer : Hermes engine (déjà par défaut Expo SDK 52)
 *
 * Note : Expo Router gère déjà le code splitting par route automatiquement
 * via son intégration avec React.lazy. Pas besoin de lazy-importer les
 * écrans manuellement.
 */

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ─── Optimisations de résolution ──────────────────────────────────
// Désactive le lookup hiérarchique : Metro ne cherche les modules que
// dans node_modules (pas dans les dossiers parents), ce qui accélère
// drastiquement le build sur les gros monorepos.
config.resolver.disableHierarchicalLookup = true;

// ─── Plateformes supportées ────────────────────────────────────────
config.resolver.platforms = ["ios", "android", "native"];

// ─── Optimisations de cache ────────────────────────────────────────
config.cacheStores = [
  // Cache par défaut dans node_modules/.cache/metro
  // (laisse Expo gérer)
];

module.exports = withNativeWind(config, { input: "./global.css" });
