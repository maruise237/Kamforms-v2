import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { FormField, FieldType } from '@/lib/form-schema'
import { createRateLimiter } from '@/lib/rate-limit'

const isImportRateLimited = createRateLimiter(10, 60 * 60 * 1000)

// Google Forms field type → our FieldType
const GF_TYPE_MAP: Record<number, FieldType> = {
  0: 'text',      // Short answer
  1: 'textarea',  // Paragraph
  2: 'radio',     // Multiple choice
  3: 'checkbox',  // Checkboxes
  4: 'select',    // Dropdown
  5: 'text',      // Linear scale → text fallback
}

function smartType(base: FieldType, label: string): FieldType {
  if (base !== 'text') return base
  const l = label.toLowerCase()
  if (l.includes('email') || l.includes('mail') || l.includes('courriel')) return 'email'
  if (l.includes('phone') || l.includes('tel') || l.includes('mobile') || l.includes('portable') || l.includes('whatsapp')) return 'phone'
  if (l.includes('nombre') || l.includes('âge') || l.includes('age') || l.includes('quantit') || l.includes('montant') || l.includes('budget')) return 'number'
  return 'text'
}

function extractTitle(data: unknown[]): string {
  // Try multiple known paths for the form title
  try { const t = (data[1] as any)[8][0][4]; if (t && typeof t === 'string') return t } catch {}
  try { const t = (data[1] as any)[8][0][0]; if (t && typeof t === 'string') return t } catch {}
  try { const t = (data as any)[3];           if (t && typeof t === 'string') return t } catch {}
  return 'Formulaire importé'
}

function extractDescription(data: unknown[]): string | undefined {
  // data[1][8][0][2] — description inside the form header block
  try { const d = (data[1] as any)[8][0][2]; if (d && typeof d === 'string' && d.trim()) return d.trim() } catch {}
  // data[1][0] — direct description string in some GF versions
  try { const d = (data[1] as any)[0];       if (d && typeof d === 'string' && d.trim()) return d.trim() } catch {}
  return undefined
}

function extractBannerUrl(data: unknown[]): string | undefined {
  // Google Forms stores the header image URL at several possible paths
  try { const u = (data[1] as any)[8][0][3][3][3]; if (u && typeof u === 'string' && u.startsWith('https://')) return u } catch {}
  try { const u = (data[1] as any)[8][0][3][3][0]; if (u && typeof u === 'string' && u.startsWith('https://')) return u } catch {}
  try { const u = (data[1] as any)[12];             if (u && typeof u === 'string' && u.startsWith('https://')) return u } catch {}
  return undefined
}

function extractFBData(html: string): string | null {
  // Split on the marker to avoid catastrophic backtracking — never use [\s\S]*? on untrusted HTML
  const marker = 'FB_PUBLIC_LOAD_DATA_'
  const idx = html.indexOf(marker)
  if (idx === -1) return null

  const after = html.slice(idx + marker.length, idx + marker.length + 2_000_000)
  const eqIdx = after.indexOf('[')
  if (eqIdx === -1) return null

  // Find the matching closing bracket by counting depth
  let depth = 0
  let end = -1
  for (let i = eqIdx; i < after.length; i++) {
    if (after[i] === '[') depth++
    else if (after[i] === ']') { depth--; if (depth === 0) { end = i; break } }
  }
  if (end === -1) return null
  return after.slice(eqIdx, end + 1)
}

function parseGoogleFormsHTML(html: string): { title: string; description?: string; bannerUrl?: string; fields: FormField[] } {
  const raw = extractFBData(html)
  if (!raw) throw new Error('Google Forms data not found — make sure the form is public')

  const data: unknown[] = JSON.parse(raw)
  const title       = extractTitle(data)
  const description = extractDescription(data)
  const bannerUrl   = extractBannerUrl(data)

  // Questions live at data[1][1]
  const questions: unknown[] = (data[1] as any)?.[1] ?? []
  const fields: FormField[] = []
  let idx = 1

  for (const q of questions) {
    if (!Array.isArray(q)) continue

    const label: string  = (q[1] as string) || `Champ ${idx}`
    const helpText: string | undefined = (typeof q[2] === 'string' && q[2]) ? q[2] : undefined
    const typeNum: number = (q[3] as number) ?? 0

    // Options nested at q[4][0][1]: array of [optionText, ...]
    let options: string[] = []
    try {
      options = ((q[4] as any)?.[0]?.[1] ?? [])
        .map((o: unknown[]) => String(o[0]))
        .filter((s: string) => s && s !== 'null')
    } catch {}

    // Required flag at q[4][0][6] or q[7]
    let required = false
    try { required = (q[4] as any)?.[0]?.[6] === 1 || (q as any)[7] === 1 } catch {}

    const baseType: FieldType = GF_TYPE_MAP[typeNum] ?? 'text'
    const type = smartType(baseType, label)

    const field: FormField = {
      id: `field_${idx}`,
      type,
      label,
      required,
      ...(helpText ? { description: helpText } : {}),
      ...((options.length > 0 && (type === 'radio' || type === 'select' || type === 'checkbox')) ? { options } : {}),
    }

    fields.push(field)
    idx++
  }

  return { title, description, bannerUrl, fields }
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (await isImportRateLimited(userId)) {
    return NextResponse.json({ error: 'Limite atteinte. Réessayez dans une heure.' }, { status: 429 })
  }

  const body = await req.json()
  const { url } = body as { url?: string }

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL requise' }, { status: 400 })
  }

  // Strict allowlist: only HTTPS requests to docs.google.com/forms/d/…
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return NextResponse.json({ error: 'URL Google Forms invalide (exemple : https://docs.google.com/forms/d/e/…/viewform)' }, { status: 400 })
  }
  if (
    parsedUrl.protocol !== 'https:' ||
    parsedUrl.hostname !== 'docs.google.com' ||
    !parsedUrl.pathname.startsWith('/forms/d/')
  ) {
    return NextResponse.json({ error: 'URL Google Forms invalide (exemple : https://docs.google.com/forms/d/e/…/viewform)' }, { status: 400 })
  }

  // Ensure the URL ends with /viewform
  const viewformUrl = /\/viewform(\?.*)?$/.test(parsedUrl.pathname)
    ? url
    : url.replace(/\/?(\?.*)?$/, '/viewform$1')

  let html: string
  try {
    const response = await fetch(viewformUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Impossible d'accéder au formulaire (${response.status}). Vérifiez qu'il est public.` },
        { status: 400 }
      )
    }

    html = await response.text()
  } catch {
    return NextResponse.json({ error: 'Erreur réseau lors de l\'accès au formulaire.' }, { status: 400 })
  }

  try {
    const { title, description, bannerUrl, fields } = parseGoogleFormsHTML(html)

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'Aucun champ trouvé. Vérifiez que le formulaire est public et accessible.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ title, description, bannerUrl, schema: { fields } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inconnue'
    return NextResponse.json({ error: `Import échoué : ${msg}` }, { status: 400 })
  }
}
