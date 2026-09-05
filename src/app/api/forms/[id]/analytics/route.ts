import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFormPageviews, getFormCountries, getFormCities } from '@/lib/analytics-api'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const form = await prisma.form.findFirst({
    where: { id, userId },
    select: { id: true, slug: true, createdAt: true },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [submissionCount, pageviews, countries, cities] = await Promise.all([
    prisma.submission.count({ where: { formId: id } }),
    getFormPageviews(form.slug, form.createdAt),
    getFormCountries(form.slug, form.createdAt),
    getFormCities(form.slug, form.createdAt),
  ])

  // Uniques derived from country session counts
  const uniques = countries.reduce((sum: number, c: { y: number }) => sum + c.y, 0)

  const stats = pageviews > 0 || uniques > 0
    ? { pageviews: Math.max(pageviews, uniques), uniques }
    : null

  const completionRate = (stats?.pageviews ?? 0) > 0
    ? Math.min(100, Math.round((submissionCount / stats!.pageviews) * 100))
    : 0

  const analyticsConfigured = Boolean(
    process.env.UMAMI_URL &&
    process.env.UMAMI_WEBSITE_ID &&
    (process.env.UMAMI_API_KEY || (process.env.UMAMI_USERNAME && process.env.UMAMI_PASSWORD))
  )

  return NextResponse.json({
    stats,
    countries,
    cities,
    submissionCount,
    completionRate,
    analyticsConfigured,
  })
}
