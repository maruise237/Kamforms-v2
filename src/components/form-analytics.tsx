'use client'

import { useEffect, useState } from 'react'
import { Eye, Users, CheckCircle, MapPin, Globe, BarChart2 } from 'lucide-react'
import type { AnalyticsMetric } from '@/lib/analytics-api'

interface AnalyticsData {
  stats: { pageviews: number; uniques: number } | null
  countries: AnalyticsMetric[]
  cities: AnalyticsMetric[]
  submissionCount: number
  completionRate: number
  analyticsConfigured: boolean
}

/** Convert ISO 3166-1 alpha-2 code to country name using browser API */
function countryName(code: string): string {
  if (!code || code.length !== 2) return code || '—'
  try {
    const display = new Intl.DisplayNames(['fr'], { type: 'region' })
    return display.of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

/** Emoji flag — works on macOS/Android/Linux; Windows falls back to code */
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return ''
  try {
    return String.fromCodePoint(
      ...code.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
    )
  } catch {
    return ''
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="border border-border rounded-lg p-4 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon size={13} />
        {label}
      </div>
      <p className="text-2xl font-semibold text-foreground tabular-nums leading-tight">
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function BarList({ items }: { items: AnalyticsMetric[] }) {
  if (!items.length) {
    return <p className="text-xs text-muted-foreground">Aucune donnée</p>
  }
  const max = items[0]?.y ?? 1
  return (
    <div className="space-y-2">
      {items.slice(0, 6).map(item => (
        <div key={item.x} className="flex items-center gap-2 text-sm">
          <span className="w-32 shrink-0 truncate text-foreground">{item.x || '—'}</span>
          <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden min-w-0">
            <div
              className="h-full bg-foreground/40 rounded-full"
              style={{ width: `${Math.round((item.y / max) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums w-6 text-right shrink-0">
            {item.y}
          </span>
        </div>
      ))}
    </div>
  )
}

export function FormAnalytics({ formId }: { formId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/forms/${formId}/analytics`)
      .then(r => r.json())
      .then((d: AnalyticsData) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [formId])

  if (loading) {
    return (
      <div className="border border-border rounded-lg p-5 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map(i => <div key={i} className="h-20 bg-muted rounded-lg" />)}
        </div>
      </div>
    )
  }

  if (!data) return null

  if (!data.analyticsConfigured) {
    return (
      <div className="border border-border rounded-lg p-5">
        <p className="text-sm font-medium text-foreground mb-1">Statistiques</p>
        <div className="mt-3 flex items-start gap-3 bg-muted/50 rounded-lg p-4">
          <BarChart2 size={16} className="text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground">Analytics non configuré</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ajoutez les variables d'environnement analytics à votre déploiement.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <StatCard
            icon={CheckCircle}
            label="Soumissions"
            value={data.submissionCount}
            sub="données en base"
          />
        </div>
      </div>
    )
  }

  // Enrich country list: flag emoji + full name
  const countriesEnriched = data.countries.map((c: AnalyticsMetric) => ({
    x: `${countryFlag(c.x)} ${countryName(c.x)}`,
    y: c.y,
  }))

  return (
    <div className="border border-border rounded-lg p-5">
      <p className="text-sm font-medium text-foreground mb-4">Statistiques</p>

      {/* Main stats — 1 col on mobile, 3 on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatCard
          icon={Eye}
          label="Vues"
          value={data.stats?.pageviews ?? 0}
        />
        <StatCard
          icon={Users}
          label="Visiteurs uniques"
          value={data.stats?.uniques ?? 0}
        />
        <StatCard
          icon={CheckCircle}
          label="Taux de complétion"
          value={`${data.completionRate}%`}
          sub={`${data.submissionCount} soumission${data.submissionCount !== 1 ? 's' : ''}`}
        />
      </div>

      {/* Geo breakdown — stack on mobile */}
      {(countriesEnriched.length > 0 || data.cities.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {countriesEnriched.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <Globe size={12} />
                Pays
              </p>
              <BarList items={countriesEnriched} />
            </div>
          )}
          {data.cities.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <MapPin size={12} />
                Villes
              </p>
              <BarList items={data.cities} />
            </div>
          )}
        </div>
      )}

      {!data.stats?.pageviews && (
        <p className="text-xs text-muted-foreground mt-1">
          Aucune visite enregistrée pour ce formulaire pour l'instant.
        </p>
      )}
    </div>
  )
}
