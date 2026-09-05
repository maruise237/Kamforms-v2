/**
 * Polices Kamforms — registre minimal pour réduire la taille du bundle.
 *
 * ─── Pourquoi ce fichier existe ────────────────────────────────────
 * Le package @expo-google-fonts/inter expose 17 variantes (100 Thin → 900 Black
 * + italiques). Si on importe le module entier, Metro bundle les 17 fichiers TTF
 * (~6 Mo dans l'APK final) même si on n'en charge que 2 via useFonts().
 *
 * Solution : importer explicitement UNIQUEMENT les variants utilisés par le
 * design system (cf. src/theme.ts), et exclure les autres du bundle Metro.
 *
 * ─── Variants conservés (5 au lieu de 17) ───────────────────────────
 *   Inter_400Regular            → corps de texte (fontFamily.body)
 *   Inter_500Medium             → texte semi-emphase (fontFamily.bodyMedium)
 *   InterTight_600SemiBold      → titres secondaires (fontFamily.displaySemibold)
 *   InterTight_700Bold          → titres et CTA (fontFamily.display)
 *   JetBrainsMono_600SemiBold   → données, OTP, stats (fontFamily.mono)
 *
 * ─── Variants supprimés (12 au lieu de 17) ──────────────────────────
 *   Inter_100Thin, Inter_200ExtraLight, Inter_300Light, Inter_600SemiBold,
 *   Inter_700Bold, Inter_800ExtraBold, Inter_900Black,
 *   + toutes les variantes italiques (sauf JetBrainsMono qui n'en a pas).
 *
 * Gain estimé sur l'APK : ~5 Mo.
 */

import {
  InterTight_700Bold,
  InterTight_600SemiBold,
} from "@expo-google-fonts/inter-tight";
import {
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";
import { JetBrainsMono_600SemiBold } from "@expo-google-fonts/jetbrains-mono";

/** Map unique à passer à useFonts() dans _layout.tsx */
export const kamformsFonts = {
  InterTight_700Bold,
  InterTight_600SemiBold,
  Inter_400Regular,
  Inter_500Medium,
  JetBrainsMono_600SemiBold,
};

/** Liste des noms de fonts chargés (pour debug / Sentry breadcrumbs) */
export const loadedFontNames = Object.keys(kamformsFonts);
