import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { generateFormSchema } from '@/lib/deepseek'
import { isAiRateLimited } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (await isAiRateLimited(userId)) {
    return NextResponse.json({ error: 'Limite atteinte. Réessayez dans une heure.' }, { status: 429 })
  }

  const { prompt, multiStep } = await req.json()
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'prompt required' }, { status: 400 })
  }
  if (prompt.length > 2000) {
    return NextResponse.json({ error: 'Prompt trop long (max 2000 caractères).' }, { status: 400 })
  }

  try {
    const result = await generateFormSchema(prompt, multiStep === true)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
