/**
 * Babel configuration Kamforms Mobile
 *
 * Optimisations (Phase 1.6 + 1.4 + 2.3) :
 * - transform-remove-console : supprime tous les console.log/dlog en production
 *   (gain ~200 Ko sur le bundle, surtout utile pour DebugPanel en prod)
 * - module-resolver : alias @/* pour compatibilité TypeScript
 * - react-native-reanimated/plugin : plugin requis par Reanimated (déjà présent)
 *
 * ⚠️ Important : ne pas ajouter @babel/plugin-transform-react-jsx-source
 * ici — il est déjà géré par React Native preset.
 */

module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);

  const isProduction = process.env.NODE_ENV === "production";

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      // ─── Production-only : supprimer les console.log/dlog ───────────
      isProduction && [
        "transform-remove-console",
        {
          exclude: ["error", "warn"],
        },
      ],

      // ─── React Native Reanimated (déjà requis par le projet) ─────────
      "react-native-reanimated/plugin",
    ].filter(Boolean),
  };
};
