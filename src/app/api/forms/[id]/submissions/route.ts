import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parsePositiveIntParam } from '@/lib/pagination'

const MAX_PAGE_SIZE = 100

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const form = await prisma.form.findFirst({ where: { id, userId } })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const page  = parsePositiveIntParam(searchParams.get('page'), 1)
  const limit = parsePositiveIntParam(searchParams.get('limit'), 25, MAX_PAGE_SIZE)
  const skip  = (page - 1) * limit

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where: { formId: id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.submission.count({ where: { formId: id } }),
  ])

  return NextResponse.json({ submissions, total, page, limit })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const form = await prisma.form.findFirst({ where: { id, userId } })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.submission.deleteMany({ where: { formId: id } })
  return new NextResponse(null, { status: 204 })
}
