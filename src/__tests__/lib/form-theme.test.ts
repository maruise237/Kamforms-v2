import { describe, it, expect } from 'vitest'
import { resolveThemeColor, contrastColor, THEME_PRESETS } from '@/lib/form-theme'

describe('resolveThemeColor', () => {
  it('utilise la couleur custom si hex valide', () => {
    expect(resolveThemeColor({ customColor: '#ff0000' })).toBe('#ff0000')
  })

  it('ignore une couleur custom avec hex invalide', () => {
    const color = resolveThemeColor({ customColor: 'rouge', preset: 'indigo' })
    expect(color).toBe(THEME_PRESETS.find(p => p.id === 'indigo')!.color)
  })

  it('utilise le preset si pas de custom color', () => {
    const indigo = THEME_PRESETS.find(p => p.id === 'indigo')!.color
    expect(resolveThemeColor({ preset: 'indigo' })).toBe(indigo)
  })

  it('retourne la couleur zinc par défaut si ni custom ni preset', () => {
    const zinc = THEME_PRESETS[0].color
    expect(resolveThemeColor({})).toBe(zinc)
    expect(resolveThemeColor(null)).toBe(zinc)
    expect(resolveThemeColor(undefined)).toBe(zinc)
  })

  it('retourne le fallback si le preset est inconnu', () => {
    const zinc = THEME_PRESETS[0].color
    expect(resolveThemeColor({ preset: 'inexistant' })).toBe(zinc)
  })
})

describe('contrastColor', () => {
  it('retourne noir sur blanc', () => {
    expect(contrastColor('#ffffff')).toBe('#000000')
  })

  it('retourne blanc sur noir', () => {
    expect(contrastColor('#000000')).toBe('#ffffff')
  })

  it('retourne blanc sur couleur sombre', () => {
    expect(contrastColor('#1c1917')).toBe('#ffffff')
    expect(contrastColor('#0f172a')).toBe('#ffffff')
  })

  it('retourne noir sur couleur claire', () => {
    expect(contrastColor('#fffbeb')).toBe('#000000')
    expect(contrastColor('#f0fdf4')).toBe('#000000')
  })
})
