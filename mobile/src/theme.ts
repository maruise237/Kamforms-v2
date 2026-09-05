/**
 * Kamforms — design tokens
 * Source unique de vérité pour couleurs, typographie, espacement et rayons.
 * Voir KAMFORMS_DESIGN_SYSTEM.md pour les règles d'usage.
 *
 * Polices à charger via expo-font :
 *   @expo-google-fonts/inter-tight  → display (titres, CTA)
 *   @expo-google-fonts/inter        → corps de texte
 *   @expo-google-fonts/jetbrains-mono → données structurées (OTP, XP, stats)
 */

/* ------------------------------------------------------------------ */
/*  Palettes                                                            */
/* ------------------------------------------------------------------ */

export const darkColors = {
  ink: "#0B0B0E",
  bone: "#F7F7F5",
  graphite: "#17171B",
  graphiteSoft: "#1D1D22",
  line: "#2A2A30",
  signal: "#1F9D55",
  signalSoft: "#163A28",
  spark: "#E8A33D",
  sparkSoft: "#332912",
  textMuted: "#9A9AA2",
  textFaint: "#5C5C64",
  danger: "#D9534F",
} as const;

export const lightColors = {
  ink: "#0B0B0E",
  bone: "#F7F7F5",
  graphite: "#FFFFFF",
  graphiteSoft: "#F0F0EE",
  line: "#E0DFDB",
  signal: "#1F9D55",
  signalSoft: "#E6F7ED",
  spark: "#E8A33D",
  sparkSoft: "#FFF4E0",
  textMuted: "#6B6B73",
  textFaint: "#A0A0A8",
  danger: "#D9534F",
} as const;

// ThemeColors assoupli pour accepter string (compatible avec Palette du ThemeContext)
export type ThemeColors = { [K in keyof typeof darkColors]: string };

/* ------------------------------------------------------------------ */
/*  Radius / Spacing / Typography / Motion / Icon / Gamification        */
/*  (identiques quelle que soit la palette)                             */
/* ------------------------------------------------------------------ */

export const radius = {
  sm: 12,   // champs, boutons
  md: 16,   // cartes internes
  lg: 20,
  xl: 28,   // cartes flottantes, feuilles modales
  pill: 999, // chips, badges
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,   // marge extérieure standard d'écran
  xxl: 32,
} as const;

export const typography = {
  fontFamily: {
    display: "InterTight_700Bold",
    displaySemibold: "InterTight_600SemiBold",
    body: "Inter_400Regular",
    bodyMedium: "Inter_500Medium",
    mono: "JetBrainsMono_600SemiBold",
  },
  size: {
    screenTitle: 26,
    sectionTitle: 22,
    body: 14,
    bodySmall: 13,
    caption: 12,
    micro: 11,
  },
} as const;

export const motion = {
  duration: {
    fast: 150,
    base: 200,
    slow: 250,
  },
  easing: "ease-out" as const,
} as const;

// Une seule bibliothèque d'icônes dans tout le projet : lucide-react-native.
// Jamais d'emoji — ni comme icône, ni en décoration de texte.
export const iconSize = {
  chip: 14,
  button: 17,
  tile: 20,
  standalone: 24,
} as const;

export const gamification = {
  xpPerStep: 50,
  activationSteps: [
    "connect_whatsapp",
    "verify_number",
    "create_first_form",
    "customize_colors",
  ] as const,
} as const;

// Rétro-compatibilité : l'ancien `colors` exporté pointe vers dark
export const colors = darkColors;

export const theme = {
  colors,
  darkColors,
  lightColors,
  radius,
  spacing,
  typography,
  motion,
  iconSize,
  gamification,
};
export default theme;
