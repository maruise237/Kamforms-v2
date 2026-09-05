const ANALYTICS_URL        = process.env.UMAMI_URL
const ANALYTICS_API_KEY    = process.env.UMAMI_API_KEY
const ANALYTICS_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID
const ANALYTICS_USERNAME   = process.env.UMAMI_USERNAME
const ANALYTICS_PASSWORD   = process.env.UMAMI_PASSWORD

// ── Token cache (Bearer token from /api/auth/login, valid ~24h) ───────────────
let cachedToken: { value: string; expires: number } | null = null

async function getBearerToken(): Promise<string | null> {
  if (ANALYTICS_API_KEY) return null

  if (!ANALYTICS_USERNAME || !ANALYTICS_PASSWORD || !ANALYTICS_URL) return null

  if (cachedToken && cachedToken.expires > Date.now() + 5 * 60 * 1000) {
    return cachedToken.value
  }

  try {
    const res = await fetch(`${ANALYTICS_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ANALYTICS_USERNAME, password: ANALYTICS_PASSWORD }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json() as { token?: string }
    if (!data.token) return null

    cachedToken = { value: data.token, expires: Date.now() + 23 * 60 * 60 * 1000 }
    return data.token
  } catch {
    return null
  }
}

function authHeaders(bearerToken: string | null): Record<string, string> {
  if (ANALYTICS_API_KEY) {
    return { 'x-umami-api-key': ANALYTICS_API_KEY }
  }
  if (bearerToken) {
    return { Authorization: `Bearer ${bearerToken}` }
  }
  return {}
}

// ── In-memory response cache (5-minute TTL) ───────────────────────────────────
const cache = new Map<string, { data: unknown; expires: number }>()

async function analyticsGet(path: string, params: Record<string, string>): Promise<unknown> {
  if (!ANALYTICS_URL || !ANALYTICS_WEBSITE_ID) return null
  if (!ANALYTICS_API_KEY && (!ANALYTICS_USERNAME || !ANALYTICS_PASSWORD)) return null

  const cacheKey = path + JSON.stringify(params)
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.data

  const bearerToken = await getBearerToken()
  const headers = authHeaders(bearerToken)

  const url = new URL(`${ANALYTICS_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json', ...headers },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      console.error(`Analytics API error ${res.status} on ${path}`)
      return null
    }
    const data = await res.json()
    cache.set(cacheKey, { data, expires: Date.now() + 5 * 60 * 1000 })
    return data
  } catch (err) {
    console.error('Analytics fetch error:', err)
    return null
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AnalyticsMetric {
  x: string  // country code / city name
  y: number  // count
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get pageview count for a specific form.
 * v3 API uses type=path.
 */
export async function getFormPageviews(
  slug: string,
  createdAt: Date,
): Promise<number> {
  const websiteId = ANALYTICS_WEBSITE_ID
  if (!websiteId) return 0

  const data = await analyticsGet(`/api/websites/${websiteId}/metrics`, {
    startAt: String(createdAt.getTime()),
    endAt:   String(Date.now()),
    type:    'path',
    path:    `/f/${slug}`,
    limit:   '5',
  })

  if (!Array.isArray(data)) return 0
  return (data as AnalyticsMetric[]).reduce((sum, m) => sum + m.y, 0)
}

/** Top countries for this form (up to 10). */
export async function getFormCountries(
  slug: string,
  createdAt: Date,
): Promise<AnalyticsMetric[]> {
  const websiteId = ANALYTICS_WEBSITE_ID
  if (!websiteId) return []

  const data = await analyticsGet(`/api/websites/${websiteId}/metrics`, {
    startAt: String(createdAt.getTime()),
    endAt:   String(Date.now()),
    type:    'country',
    path:    `/f/${slug}`,
    limit:   '10',
  })

  return Array.isArray(data) ? (data as AnalyticsMetric[]) : []
}

/** Top cities for this form (up to 10). */
export async function getFormCities(
  slug: string,
  createdAt: Date,
): Promise<AnalyticsMetric[]> {
  const websiteId = ANALYTICS_WEBSITE_ID
  if (!websiteId) return []

  const data = await analyticsGet(`/api/websites/${websiteId}/metrics`, {
    startAt: String(createdAt.getTime()),
    endAt:   String(Date.now()),
    type:    'city',
    path:    `/f/${slug}`,
    limit:   '10',
  })

  return Array.isArray(data) ? (data as AnalyticsMetric[]) : []
}
