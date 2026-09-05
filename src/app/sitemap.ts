import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { ARTICLES } = await import('@/lib/blog/articles')
  const { COUNTRIES } = await import('@/lib/pays-data')
  const { CASE_STUDIES } = await import('@/lib/case-studies')
  const { COMPARISONS } = await import('@/lib/comparisons-data')

  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${APP_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...ARTICLES.map(a => ({
      url: `${APP_URL}/blog/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${APP_URL}/fonctionnalites`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${APP_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/a-propos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${APP_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${APP_URL}/sign-up`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/sign-in`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${APP_URL}/tarifs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${APP_URL}/etudes-de-cas`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...CASE_STUDIES.map(a => ({
      url: `${APP_URL}/etudes-de-cas/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${APP_URL}/comparatif`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...COMPARISONS.map(c => ({
      url: `${APP_URL}/comparatif/${c.slug}`,
      lastModified: new Date(c.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${APP_URL}/alternative-a-google-forms`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...COUNTRIES.map(c => ({
      url: `${APP_URL}/pays/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  // Requête optionnelle — ne bloque pas le build si la DB est indisponible
  try {
    const { prisma } = await import('@/lib/prisma')
    const forms = await prisma.form.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    })
    staticPages.push(
      ...forms.map(f => ({
        url: `${APP_URL}/f/${f.slug}`,
        lastModified: f.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }))
    )
  } catch (_) {
    // DB pas encore disponible (build time) — on sert juste les pages statiques
  }

  return staticPages
}
