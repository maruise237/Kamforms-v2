export type FormTheme = {
  preset?: string
  customColor?: string
  bannerUrl?: string
  bannerPosition?: 'top' | 'center' | 'bottom'
  bgColor?: string
}

export type ThemePreset = {
  id: string
  name: string
  color: string
}

export type BgPreset = {
  id: string
  name: string
  color: string
}

export const BG_PRESETS: BgPreset[] = [
  // Clairs
  { id: 'white',     name: 'Blanc',       color: '#ffffff' },
  { id: 'gray',      name: 'Gris',        color: '#f9fafb' },
  { id: 'cream',     name: 'Crème',       color: '#fffbeb' },
  { id: 'rose',      name: 'Rose',        color: '#fff1f2' },
  { id: 'blue',      name: 'Azur',        color: '#eff6ff' },
  { id: 'green',     name: 'Menthe',      color: '#f0fdf4' },
  // Sombres
  { id: 'noir',      name: 'Noir',        color: '#0f172a' },
  { id: 'charcoal',  name: 'Anthracite',  color: '#1c1917' },
  { id: 'indigo',    name: 'Indigo nuit', color: '#1e1b4b' },
  { id: 'forest',    name: 'Forêt',       color: '#052e16' },
]

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'zinc',    name: 'Zinc',      color: '#18181b' },
  { id: 'indigo',  name: 'Indigo',    color: '#4f46e5' },
  { id: 'rose',    name: 'Rose',      color: '#e11d48' },
  { id: 'emerald', name: 'Émeraude',  color: '#059669' },
  { id: 'amber',   name: 'Ambre',     color: '#d97706' },
  { id: 'violet',  name: 'Violet',    color: '#7c3aed' },
  { id: 'ocean',   name: 'Océan',     color: '#0891b2' },
]

export function resolveThemeColor(theme: FormTheme | null | undefined): string {
  if (theme?.customColor && /^#[0-9a-fA-F]{6}$/.test(theme.customColor)) {
    return theme.customColor
  }
  return THEME_PRESETS.find(p => p.id === theme?.preset)?.color ?? THEME_PRESETS[0].color
}

/** Returns black or white depending on background luminance */
export function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#000000' : '#ffffff'
}
