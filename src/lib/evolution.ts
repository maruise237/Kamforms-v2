function escapeWhatsApp(s: string): string {
  return s.replace(/[*_~`]/g, c => `\\${c}`)
}

async function sendText(to: string, text: string) {
  const EVOLUTION_URL      = process.env.EVOLUTION_API_URL
  const EVOLUTION_KEY      = process.env.EVOLUTION_API_KEY
  const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE_NAME ?? process.env.EVOLUTION_INSTANCE
  if (!EVOLUTION_URL || !EVOLUTION_KEY || !EVOLUTION_INSTANCE) return
  const res = await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_KEY },
    body: JSON.stringify({ number: to, text }),
  })
  if (!res.ok) console.error('Evolution API error:', await res.text())
}

export async function sendWhatsAppWelcome(to: string) {
  await sendText(
    to,
    `Bonjour 👋 Votre numéro a bien été enregistré sur *Kamforms*.\nVous recevrez vos notifications de formulaires ici.\n\nRépondez *OK* pour confirmer.`
  )
}

export async function sendWhatsAppDelegation(to: string, formTitle: string) {
  await sendText(
    to,
    `Bonjour 👋 Le formulaire *${escapeWhatsApp(formTitle)}* vous a été confié sur *Kamforms*.\nVous recevrez les prochaines réponses directement ici.\n\nRépondez *OK* pour confirmer.`
  )
}

export async function sendWhatsAppNotification({
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
  formFields?: Array<{ id: string; label: string }>
  submissionRank?: number
  includeLink?: boolean
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const fieldLabel = (id: string) =>
    formFields?.find(f => f.id === id)?.label ?? id

  const submissionSummary = Object.entries(submissionData)
    .slice(0, 5)
    .map(([key, val]) => `*${escapeWhatsApp(fieldLabel(key))}* : ${escapeWhatsApp(String(val ?? ''))}`)
    .join('\n')

  const lines = [
    `📋 *${escapeWhatsApp(formTitle)}*`,
    ...(submissionRank ? [`🎯 *Réponse n°${submissionRank}*`] : []),
    ``,
    submissionSummary,
    ...(includeLink && appUrl ? [``, `${appUrl}/dashboard/forms/${formId}/submissions`] : []),
  ]
  const text = lines.join('\n')

  await sendText(to, text)
}
