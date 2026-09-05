import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { FormSchema } from '@/lib/form-schema'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { id } = await params
  const form = await prisma.form.findFirst({ where: { id, userId } })
  if (!form) return new Response('Not found', { status: 404 })

  const schema = form.schema as unknown as FormSchema
  const fields = schema.fields.map(f => ({ id: f.id, label: f.label }))
  const ids    = fields.map(f => f.id)

  const sanitize = (v: string) => /^[=+\-@\t\r]/.test(v) ? `\t${v}` : v
  const csvRow   = (cells: string[]) =>
    cells.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\n'

  const filename = `${form.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-reponses.csv`
  const encoder  = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const headers = ['Date', ...fields.map(f => f.label)]
      controller.enqueue(encoder.encode('﻿' + csvRow(headers)))

      const BATCH = 500
      const MAX   = 10_000
      let skip = 0
      let total = 0
      while (true) {
        const batch = await prisma.submission.findMany({
          where:   { formId: id },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Math.min(BATCH, MAX - total),
        })
        if (batch.length === 0) break
        for (const sub of batch) {
          const data = sub.data as Record<string, unknown>
          const row  = [
            new Date(sub.createdAt).toLocaleString('fr-FR'),
            ...ids.map(fid => sanitize(String(data[fid] ?? ''))),
          ]
          controller.enqueue(encoder.encode(csvRow(row)))
        }
        total += batch.length
        if (batch.length < BATCH || total >= MAX) break
        skip += BATCH
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':        'text/csv;charset=utf-8;',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
