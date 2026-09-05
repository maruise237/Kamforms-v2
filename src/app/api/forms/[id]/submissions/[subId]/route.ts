import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, subId } = await params

  // Verify the form belongs to this user
  const form = await prisma.form.findFirst({ where: { id, userId } })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.submission.deleteMany({ where: { id: subId, formId: id } })

  return new NextResponse(null, { status: 204 })
}
