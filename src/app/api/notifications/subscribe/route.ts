import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subscription } = await req.json()
  if (!subscription) return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })

  await prisma.user.update({
    where: { id: userId },
    data: { pushSubscription: subscription },
  })

  return NextResponse.json({ ok: true })
}
