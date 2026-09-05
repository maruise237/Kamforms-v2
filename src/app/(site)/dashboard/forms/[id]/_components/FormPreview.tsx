'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Maximize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormRenderer } from '@/components/form-renderer'
import { resolveThemeColor, contrastColor, type FormTheme } from '@/lib/form-theme'
import type { FormSchema } from '@/lib/form-schema'
import type { FormEnding } from '@/lib/form-ending'

interface FormPreviewProps {
  schema: FormSchema
  formSlug: string
  theme: FormTheme | null
  ending: FormEnding | null
}

export function FormPreview({ schema, formSlug, theme, ending }: FormPreviewProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  const bgColor        = theme?.bgColor ?? ''
  const bannerUrl      = theme?.bannerUrl ?? ''
  const bannerPosition = theme?.bannerPosition ?? 'center'
  const themeColor     = resolveThemeColor(theme)
  const themeFg        = contrastColor(themeColor)

  // When bgColor is set → contrast determines dark/light
  // When auto → follow dashboard's current theme (after hydration to avoid flash)
  const previewDark = bgColor
    ? contrastColor(bgColor) === '#ffffff'
    : mounted && resolvedTheme === 'dark'

  const formContent = (test: boolean) => (
    <>
      {bannerUrl && (
        <div className={cn('overflow-hidden', test ? 'h-36' : 'h-28')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: `center ${bannerPosition}` }}
          />
        </div>
      )}
      <div className={cn('p-6', test && 'max-w-xl mx-auto py-10')}>
        <FormRenderer
          schema={schema}
          formSlug={formSlug}
          preview={!test}
          testMode={test}
          themeColor={themeColor}
          themeFg={themeFg}
          ending={ending}
        />
      </div>
    </>
  )

  return (
    <>
      <div
        className={cn(
          'border border-border rounded-lg overflow-hidden text-foreground',
          previewDark && 'dark',
          !bgColor && 'bg-background',
        )}
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <div className="px-6 pt-4 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Aperçu</p>
            {!bgColor && (
              <span className="text-[10px] text-muted-foreground/50 italic">
                fond auto — suit le thème du visiteur
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Tester en plein écran"
          >
            <Maximize2 size={13} />
            Tester
          </button>
        </div>
        <div className="p-6 pt-3">
          {bannerUrl && (
            <div className="overflow-hidden h-28 mb-4 rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerUrl}
                alt=""
                className="w-full h-full object-cover"
                style={{ objectPosition: `center ${bannerPosition}` }}
              />
            </div>
          )}
          <FormRenderer
            schema={schema}
            formSlug={formSlug}
            preview={true}
            themeColor={themeColor}
            themeFg={themeFg}
            ending={ending}
          />
        </div>
      </div>

      {/* Fullscreen test overlay */}
      {fullscreen && (
        <div
          className={cn('fixed inset-0 z-50 overflow-y-auto text-foreground', previewDark && 'dark', !bgColor && 'bg-background')}
          style={bgColor ? { backgroundColor: bgColor } : undefined}
        >
          <div className="min-h-screen">
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-border bg-background/90 backdrop-blur-sm">
              <p className="text-xs text-muted-foreground">Mode test — les soumissions ne sont pas enregistrées</p>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
                Fermer
              </button>
            </div>
            {formContent(true)}
          </div>
        </div>
      )}
    </>
  )
}
