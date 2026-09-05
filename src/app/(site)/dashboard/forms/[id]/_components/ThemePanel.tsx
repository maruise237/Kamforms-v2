'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ImageIcon, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  THEME_PRESETS,
  BG_PRESETS,
  resolveThemeColor,
  contrastColor,
  type FormTheme,
} from '@/lib/form-theme'
import { useSaveState } from '@/hooks/use-save-state'
import type { Form } from '../_types'

const POSITIONS: { value: NonNullable<FormTheme['bannerPosition']>; label: string }[] = [
  { value: 'top',    label: 'Haut' },
  { value: 'center', label: 'Centre' },
  { value: 'bottom', label: 'Bas' },
]

async function validateImageDimensions(file: File): Promise<string | null> {
  return new Promise(resolve => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      if (img.width < 600)         resolve('Image trop petite. Largeur minimum : 600 px.')
      else if (img.height >= img.width) resolve('Utilisez une image en mode paysage (largeur > hauteur).')
      else                          resolve(null)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve('Image invalide ou corrompue.')
    }
    img.src = objectUrl
  })
}

interface ThemePanelProps {
  formId: string
  initial: FormTheme | null
  onUpdate: (patch: Partial<Form>) => void
  onLiveChange: (theme: FormTheme) => void
}

export function ThemePanel({ formId, initial, onUpdate, onLiveChange }: ThemePanelProps) {
  const fileInputRef                        = useRef<HTMLInputElement>(null)
  const [selectedPreset, setSelectedPreset] = useState(initial?.preset ?? 'zinc')
  const [customColor, setCustomColor]       = useState(initial?.customColor ?? '')
  const [bannerUrl, setBannerUrl]           = useState(initial?.bannerUrl ?? '')
  const [bannerPosition, setBannerPosition] = useState<NonNullable<FormTheme['bannerPosition']>>(
    initial?.bannerPosition ?? 'center'
  )
  const [bgColor, setBgColor]               = useState(initial?.bgColor ?? '')
  const [uploading, setUploading]           = useState(false)
  const [bannerError, setBannerError]       = useState('')
  const { saving, saved, wrap }             = useSaveState()

  // Debug
  console.log('[ThemePanel] initial:', JSON.stringify(initial))
  console.log('[ThemePanel] bannerUrl:', bannerUrl, 'type:', typeof bannerUrl)
  console.log('[ThemePanel] uploading:', uploading)

  const themeColor = resolveThemeColor({
    preset: selectedPreset,
    customColor: customColor || undefined,
  })

  useEffect(() => {
    const theme: FormTheme = {
      preset: selectedPreset,
      ...(customColor   && { customColor }),
      ...(bannerUrl     && { bannerUrl, bannerPosition }),
      ...(bgColor       && { bgColor }),
    }
    onLiveChange(theme)
  }, [selectedPreset, customColor, bannerUrl, bannerPosition, bgColor, onLiveChange])

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setBannerError('')

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setBannerError('Format non supporté. Utilisez JPG, PNG ou WebP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setBannerError('Fichier trop lourd. Maximum : 5 Mo.')
      return
    }

    const validationError = await validateImageDimensions(file)
    if (validationError) {
      setBannerError(validationError)
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const json = await res.json()
        setBannerError(json.error ?? "Erreur lors de l'upload.")
        return
      }
      const { url } = await res.json()
      setBannerUrl(url)
    } finally {
      setUploading(false)
    }
  }

  function removeBanner() {
    setBannerUrl('')
    setBannerPosition('center')
    setBannerError('')
  }

  async function saveTheme() {
    const theme: FormTheme = {
      preset: selectedPreset,
      ...(customColor && { customColor }),
      ...(bannerUrl   && { bannerUrl, bannerPosition }),
      ...(bgColor     && { bgColor }),
    }
    await wrap(async () => {
      await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      })
      onUpdate({ theme })
    })
  }

  return (
    <div className="border border-border rounded-lg p-5 mb-6">
      <p className="text-sm font-medium text-foreground mb-4">Apparence</p>

      {/* Color presets */}
      <div className="mb-5">
        <p className="text-xs text-muted-foreground mb-2">Couleur principale</p>
        <div className="flex items-center gap-2 flex-wrap">
          {THEME_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={selectedPreset === preset.id && !customColor}
              aria-label={preset.name}
              onClick={() => { setSelectedPreset(preset.id); setCustomColor('') }}
              title={preset.name}
              className={cn(
                'w-7 h-7 rounded-full transition-all ring-offset-background ring-offset-2',
                selectedPreset === preset.id && !customColor
                  ? 'ring-2 ring-foreground scale-110'
                  : 'hover:scale-105'
              )}
              style={{ backgroundColor: preset.color }}
            />
          ))}

          <div className="relative">
            <input
              type="color"
              value={customColor || themeColor}
              onChange={e => { setCustomColor(e.target.value); setSelectedPreset('') }}
              className="sr-only"
              id="custom-color"
            />
            <label
              htmlFor="custom-color"
              title="Couleur personnalisée"
              className={cn(
                'w-7 h-7 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer transition-all hover:scale-105 block',
                customColor ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''
              )}
              style={customColor ? { backgroundColor: customColor } : undefined}
            >
              {!customColor && <span className="text-muted-foreground text-xs font-bold">+</span>}
            </label>
          </div>
        </div>
        <div
          className="mt-2 h-1 rounded-full w-24 transition-colors duration-200"
          style={{ backgroundColor: themeColor }}
        />
      </div>

      {/* Background color */}
      <div className="mb-5">
        <p className="text-xs text-muted-foreground mb-2">Fond de page</p>

        <div className="flex gap-1.5 mb-3">
          <button
            type="button"
            onClick={() => setBgColor('')}
            className={cn(
              'text-xs px-3 py-1.5 rounded-md border transition-colors',
              !bgColor
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/50'
            )}
          >
            Automatique
          </button>
          <button
            type="button"
            onClick={() => { if (!bgColor) setBgColor(BG_PRESETS[0].color) }}
            className={cn(
              'text-xs px-3 py-1.5 rounded-md border transition-colors',
              bgColor
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/50'
            )}
          >
            Personnalisé
          </button>
        </div>

        {bgColor ? (
          <>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-1.5">Clair</p>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {BG_PRESETS.filter(p => contrastColor(p.color) === '#000000').map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setBgColor(preset.color)}
                  title={preset.name}
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all ring-offset-background ring-offset-2 flex items-center justify-center',
                    bgColor === preset.color
                      ? 'ring-2 ring-foreground scale-110 border-foreground/30'
                      : 'border-border hover:scale-105'
                  )}
                  style={{ backgroundColor: preset.color }}
                >
                  {bgColor === preset.color && <Check size={12} className="text-foreground/60" />}
                </button>
              ))}
            </div>

            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-1.5">Sombre</p>
            <div className="flex items-center gap-2 flex-wrap">
              {BG_PRESETS.filter(p => contrastColor(p.color) === '#ffffff').map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setBgColor(preset.color)}
                  title={preset.name}
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all ring-offset-background ring-offset-2 flex items-center justify-center',
                    bgColor === preset.color
                      ? 'ring-2 ring-foreground scale-110 border-white/30'
                      : 'border-border hover:scale-105'
                  )}
                  style={{ backgroundColor: preset.color }}
                >
                  {bgColor === preset.color && <Check size={12} className="text-white/70" />}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">
            Suit le thème clair / sombre du visiteur
          </p>
        )}
      </div>

      {/* Banner upload */}
      <div className="mb-5">
        <p className="text-xs text-muted-foreground mb-2">Image bannière</p>

        {bannerUrl ? (
          <div className="relative rounded-md overflow-hidden border-2 border-border group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerUrl}
              alt=""
              className="w-full block"
              style={{
                height: 'auto',
                maxHeight: '200px',
                objectFit: 'cover',
                objectPosition: `center ${bannerPosition}`,
              }}
              onError={(e) => {
                // Si l'image ne charge pas (ex: mauvais domaine), on réinitialise la bannière
                console.warn('[ThemePanel] Échec chargement image bannière:', bannerUrl)
                setBannerUrl('')
                setBannerPosition('center')
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                className="text-white text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md backdrop-blur-sm transition-colors"
              >
                Changer
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeBanner() }}
                className="text-white text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md backdrop-blur-sm transition-colors"
              >
                <X size={12} className="inline mr-1" />
                Supprimer
              </button>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                <Loader2 size={22} className="animate-spin text-foreground" />
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'rounded-md border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5 px-4 h-24',
              'hover:border-muted-foreground hover:bg-muted/30',
              uploading && 'pointer-events-none'
            )}
          >
            {uploading
              ? <Loader2 size={20} className="animate-spin text-muted-foreground" />
              : <ImageIcon size={20} className="text-muted-foreground" />
            }
            <p className="text-xs text-muted-foreground text-center">
              {uploading ? 'Upload en cours…' : 'Cliquer pour choisir une image'}
            </p>
          </div>
        )}

        {/* Input file toujours présent dans le DOM */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleBannerUpload}
        />

        {/* Fallback button */}
        {!bannerUrl && !uploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Ou cliquez ici pour parcourir…
          </button>
        )}

        {bannerError && <p className="text-xs text-destructive mt-1.5">{bannerError}</p>}

        <p className="text-xs text-muted-foreground mt-1.5">
          JPG, PNG ou WebP · Max 5 Mo · Largeur min 600 px · Mode paysage obligatoire
        </p>

        {bannerUrl && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Position :</span>
            {POSITIONS.map(pos => (
              <button
                key={pos.value}
                type="button"
                onClick={() => setBannerPosition(pos.value)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-md border transition-colors',
                  bannerPosition === pos.value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground/50'
                )}
              >
                {pos.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button size="sm" onClick={saveTheme} disabled={saving || uploading}>
        {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
        {saved
          ? <><Check size={14} className="mr-1.5" />Enregistré</>
          : "Enregistrer l'apparence"
        }
      </Button>
    </div>
  )
}
