/**
 * Service d'envoi d'emails via Plunk (https://docs.useplunk.com).
 * Utilise l'API REST directement (pas de SDK nécessaire).
 */

const PLUNK_API = 'https://next-api.useplunk.com/v1/send'

function getApiKey() {
  const key = process.env.PLUNK_SECRET_KEY
  if (!key) {
    console.warn('[plunk] PLUNK_SECRET_KEY non définie')
    return null
  }
  return key
}

/** Extrait l'email nu depuis un champ "Nom <email>" ou retourne tel quel */
export function parseEmail(raw: string): string {
  const m = raw.match(/<([^>]+)>/)
  return m ? m[1] : raw
}

export function parseEmailName(raw: string): string | undefined {
  const m = raw.match(/^([^<]+)\s*</)
  return m ? m[1].trim() : undefined
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  const apiKey = getApiKey()
  if (!apiKey) return

  const defaultFrom = process.env.EMAIL_FROM ?? 'Kamforms <noreply@kamforms.com>'
  const fromRaw = from ?? defaultFrom

  try {
    const res = await fetch(PLUNK_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to,
        subject,
        body: html,
        from: {
          email: parseEmail(fromRaw),
          ...(parseEmailName(fromRaw) && { name: parseEmailName(fromRaw) }),
        },
      }),
    })

    const data = await res.json()

    if (!data.success) {
      console.error('[plunk] Envoi échoué:', JSON.stringify(data.error ?? data))
    } else {
      console.log('[plunk] Email envoyé OK, event:', data.data?.event)
    }
  } catch (err) {
    console.error('[plunk] Exception:', err)
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const KF_LOGO_SVG = `<svg width="28" height="28" viewBox="0 0 510 510" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g fill="#18181b">
    <rect x="28" y="33" width="130" height="447" rx="22"/>
    <path d="M 240,48 L 390,48 Q 415,48 411,73 L 395,160 Q 390,185 365,185 L 215,185 Q 190,185 195,160 L 211,73 Q 215,48 240,48 Z"/>
    <g transform="translate(302, 342) rotate(28)">
      <rect x="-140" y="-82" width="280" height="164" rx="80"/>
    </g>
  </g>
</svg>`

function emailHeader(title: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width:100%">
      <tr>
        <td align="center" style="padding:0">
          <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px 12px 0 0;overflow:hidden">
            <tr>
              <td style="height:4px;background:linear-gradient(90deg,#7c3aed,#1e1b4b);font-size:0;line-height:0" height="4">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:28px 32px 0">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="middle" style="padding-right:10px">${KF_LOGO_SVG}</td>
                    <td valign="middle"><span style="font-size:16px;font-weight:700;color:#18181b;letter-spacing:-0.3px">Kamforms</span></td>
                  </tr>
                </table>
                <h1 style="font-size:20px;font-weight:700;color:#18181b;margin:20px 0 4px;line-height:1.3">${title}</h1>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

function emailFooter(appUrl: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width:100%">
      <tr>
        <td align="center" style="padding:0">
          <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fafafa;border-radius:0 0 12px 12px">
            <tr>
              <td style="padding:24px 32px;text-align:center">
                <p style="margin:0 0 6px;font-size:12px;color:#a1a1aa">
                  Kamforms — Formulaires intelligents propulsés par l'IA
                </p>
                <p style="margin:6px 0 0;font-size:11px;color:#d4d4d8">
                  <a href="${appUrl}" style="color:#7c3aed;text-decoration:none">kamforms.com</a>
                  &nbsp;·&nbsp;
                  <a href="${appUrl}/dashboard" style="color:#a1a1aa;text-decoration:none">Tableau de bord</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

export async function sendEmailNotification({
  to,
  formTitle,
  formId,
  submissionData,
  formFields,
  submissionRank,
  includeLink = true,
}: {
  to: string
  formTitle: string
  formId: string
  submissionData: Record<string, unknown>
  formFields: Array<{ id: string; label: string }>
  submissionRank?: number
  includeLink?: boolean
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const fieldMap = new Map(formFields.map(f => [f.id, f.label]))
  const rows = Object.entries(submissionData).map(([key, val]) => ({
    label: fieldMap.get(key) ?? key,
    value: String(val ?? ''),
  }))

  const tableRows = rows
    .map((r, i) =>
      `<tr>
        <td style="padding:10px 16px;color:#52525b;font-size:13px;border-bottom:1px solid #f4f4f5;white-space:nowrap;vertical-align:top;${i === 0 ? 'border-top:1px solid #e4e4e7' : ''}">${escapeHtml(r.label)}</td>
        <td style="padding:10px 16px;font-size:13px;color:#18181b;border-bottom:1px solid #f4f4f5;vertical-align:top;${i === 0 ? 'border-top:1px solid #e4e4e7' : ''}">${escapeHtml(r.value)}</td>
      </tr>`
    )
    .join('')

  const safeTitle = escapeHtml(formTitle.replace(/[\r\n]/g, ' '))

  const rankBadge = submissionRank
    ? `<span style="display:inline-block;background:#f5f3ff;color:#7c3aed;font-size:12px;font-weight:600;padding:2px 10px;border-radius:999px;margin-top:6px">Réponse n°${submissionRank}</span>`
    : ''

  await sendEmail({
    to,
    subject: `Nouvelle réponse · ${submissionRank ? `n°${submissionRank} · ` : ''}${safeTitle}`,
    html: `
      ${emailHeader('Nouvelle réponse reçue')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width:100%">
        <tr>
          <td align="center" style="padding:0">
            <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff">
              <tr>
                <td style="padding:0 32px 8px">
                  <p style="margin:0;font-size:15px;font-weight:600;color:#18181b">${safeTitle}</p>
                  ${rankBadge}
                </td>
              </tr>
              <tr>
                <td style="padding:16px 32px 8px">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7">
                    ${tableRows}
                  </table>
                </td>
              </tr>
              ${includeLink ? `
              <tr>
                <td style="padding:16px 32px 32px">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-radius:8px;background:#18181b">
                        <a href="${appUrl}/dashboard/forms/${formId}/submissions"
                           style="display:inline-block;padding:11px 22px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;background:#18181b">
                          Voir toutes les réponses
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>` : ''}
            </table>
          </td>
        </tr>
      </table>
      ${emailFooter(appUrl)}`,
  })
}

export async function sendDigestEmail({
  to,
  rows,
  appUrl,
}: {
  to: string
  rows: Array<{ title: string; count: number }>
  appUrl: string
}) {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const total = rows.reduce((s, r) => s + r.count, 0)

  const tableRows = rows.map(r => `
    <tr>
      <td style="padding:10px 16px;color:#52525b;font-size:13px;border-bottom:1px solid #f4f4f5">${escapeHtml(r.title)}</td>
      <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#18181b;border-bottom:1px solid #f4f4f5;text-align:center">${r.count}</td>
    </tr>`).join('')

  await sendEmail({
    to,
    subject: `Résumé Kamforms — ${today}`,
    html: `
      ${emailHeader('Votre résumé quotidien')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width:100%">
        <tr>
          <td align="center" style="padding:0">
            <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff">
              <tr>
                <td style="padding:0 32px 4px">
                  <p style="margin:0;font-size:14px;color:#71717a">${today}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 32px 16px">
                  <p style="margin:0;font-size:13px;color:#52525b">
                    <span style="font-size:28px;font-weight:800;color:#18181b">${total}</span>
                    &nbsp;nouvelle${total > 1 ? 's' : ''} réponse${total > 1 ? 's' : ''} sur l'ensemble de vos formulaires
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 32px 24px">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7">
                    <thead>
                      <tr style="background:#fafafa">
                        <th style="padding:10px 16px;font-size:12px;font-weight:600;text-align:left;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e4e4e7">Formulaire</th>
                        <th style="padding:10px 16px;font-size:12px;font-weight:600;text-align:center;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e4e4e7">Nouvelles</th>
                      </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 32px 32px">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-radius:8px;background:#18181b">
                        <a href="${appUrl}/dashboard"
                           style="display:inline-block;padding:11px 22px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;background:#18181b">
                          Ouvrir le tableau de bord
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      ${emailFooter(appUrl)}`,
  })
}

export async function sendWelcomeEmail({
  to,
}: {
  to: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  await sendEmail({
    to,
    subject: 'Bienvenue sur Kamforms',
    html: `
      ${emailHeader('Bienvenue sur Kamforms')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width:100%">
        <tr>
          <td align="center" style="padding:0">
            <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff">
              <tr>
                <td style="padding:0 32px 16px">
                  <p style="margin:0;font-size:14px;color:#52525b;line-height:1.6">
                    Bonjour,<br><br>
                    Bienvenue sur <strong>Kamforms</strong> — l'outil qui te permet de créer des formulaires intelligents
                    en quelques secondes et de recevoir chaque réponse instantanément sur WhatsApp ou par email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px 8px">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7">
                    <tr>
                      <td style="padding:14px 16px;border-bottom:1px solid #f4f4f5">
                        <span style="font-size:13px;color:#18181b;font-weight:500">1. Décris ton formulaire en une phrase</span>
                        <span style="display:block;font-size:12px;color:#71717a;margin-top:2px">L'IA génère les champs automatiquement</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 16px;border-bottom:1px solid #f4f4f5">
                        <span style="font-size:13px;color:#18181b;font-weight:500">2. Reçois les réponses en temps réel</span>
                        <span style="display:block;font-size:12px;color:#71717a;margin-top:2px">WhatsApp ou email — à toi de choisir</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 16px">
                        <span style="font-size:13px;color:#18181b;font-weight:500">3. Partage le lien et collecte</span>
                        <span style="display:block;font-size:12px;color:#71717a;margin-top:2px">Un lien public, aucun code à écrire</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px 32px">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-radius:8px;background:#7c3aed">
                        <a href="${appUrl}/dashboard/forms/new"
                           style="display:inline-block;padding:11px 22px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;background:#7c3aed">
                          Créer mon premier formulaire
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:12px 0 0;font-size:12px;color:#a1a1aa">
                    Ou <a href="${appUrl}/dashboard" style="color:#7c3aed;text-decoration:none">voir le tableau de bord</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      ${emailFooter(appUrl)}`,
  })
}
