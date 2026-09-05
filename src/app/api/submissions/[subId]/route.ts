import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ subId: string }> },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subId } = await params
  const submission = await prisma.submission.findUnique({
    where: { id: subId },
    select: { form: { select: { userId: true } } },
  })
  if (!submission || submission.form.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.submission.delete({ where: { id: subId } })
  return new NextResponse(null, { status: 204 })
}
