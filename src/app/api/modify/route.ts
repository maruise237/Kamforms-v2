import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { modifyFormSchema } from '@/lib/deepseek'
import { formSchemaSchema } from '@/lib/form-schema'
import { isAiRateLimited } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (await isAiRateLimited(userId)) {
    return NextResponse.json({ error: 'Limite atteinte. Réessayez dans une heure.' }, { status: 429 })
  }

  const { formId, schema, prompt, ending } = await req.json()

  if (!formId || typeof formId !== 'string') {
    return NextResponse.json({ error: 'formId required' }, { status: 400 })
  }

  const form = await prisma.form.findFirst({ where: { id: formId, userId } })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'prompt required' }, { status: 400 })
  }
  if (prompt.length > 2000) {
    return NextResponse.json({ error: 'Prompt trop long (max 2000 caractères).' }, { status: 400 })
  }

  const parsed = formSchemaSchema.safeParse(schema)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid schema' }, { status: 400 })
  }

  try {
    const result = await modifyFormSchema(parsed.data, prompt, ending ?? undefined)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Modification failed'
    console.error('Modify error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
