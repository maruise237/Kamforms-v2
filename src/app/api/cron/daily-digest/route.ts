import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendDigestEmail } from '@/lib/email'

function escapeWhatsApp(s: string): string {
  return s.replace(/[*_~`]/g, c => `\\${c}`)
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const forms = await prisma.form.findMany({
    where: { notificationsEnabled: true, notificationMode: 'daily_digest', active: true },
    include: {
      user: true,
      submissions: { where: { createdAt: { gte: since } }, select: { id: true } },
      _count: { select: { submissions: true } },
    },
  })

  if (forms.length === 0) return NextResponse.json({ sent: 0 })

  // Group by userId so each owner gets one message
  const byUser = new Map<string, typeof forms>()
  for (const form of forms) {
    const list = byUser.get(form.userId) ?? []
    list.push(form)
    byUser.set(form.userId, list)
  }

  const appUrl         = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const EVOLUTION_URL  = process.env.EVOLUTION_API_URL
  const EVOLUTION_KEY  = process.env.EVOLUTION_API_KEY
  const EVOLUTION_INST = process.env.EVOLUTION_INSTANCE_NAME ?? process.env.EVOLUTION_INSTANCE
  const canWhatsApp    = !!(EVOLUTION_URL && EVOLUTION_KEY && EVOLUTION_INST)

  let sent = 0
  const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })

  for (const [, userForms] of byUser) {
    const user = userForms[0].user
    const rows: Array<{ title: string; count: number; total: number }> = []

    for (const form of userForms) {
      const count = form.submissions.length
      if (count === 0) continue
      rows.push({ title: form.title, count, total: form._count.submissions })
    }

    if (rows.length === 0) continue

    // WhatsApp digest
    if (canWhatsApp && user.whatsappNumber) {
      const lines = [
        `📊 *Résumé Kamforms — ${now}*`,
        '',
        ...rows.map(r => `📋 *${escapeWhatsApp(r.title)}* : ${r.count} nouvelle${r.count > 1 ? 's' : ''} réponse${r.count > 1 ? 's' : ''} (total : ${r.total})`),
        '',
        `👉 ${appUrl}/dashboard`,
      ]
      await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY! },
        body: JSON.stringify({ number: user.whatsappNumber, text: lines.join('\n') }),
      }).catch(err => console.error('Digest WhatsApp failed:', err))
    }

    // Email digest via Plunk
    if (user.notificationEmail) {
      await sendDigestEmail({
        to: user.notificationEmail,
        rows,
        appUrl,
      }).catch(err => console.error('Digest email failed:', err))
    }

    sent++
  }

  return NextResponse.json({ sent })
}
