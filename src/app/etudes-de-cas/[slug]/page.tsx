import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MapPin, Quote } from 'lucide-react'
import { CASE_STUDIES } from '@/lib/case-studies'
import { PublicPageShell } from '@/components/public-page-shell'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export async function generateStaticParams() {
  return CASE_STUDIES.map(cs => ({ slug: cs.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cs = CASE_STUDIES.find(c => c.slug === slug)
  if (!cs) return { title: 'Étude de cas introuvable' }
  return {
    title: `${cs.title} | Kamforms`,
    description: cs.description,
    alternates: { canonical: `${APP_URL}/etudes-de-cas/${slug}` },
    openGraph: {
      title: cs.title,
      description: cs.description,
      url: `${APP_URL}/etudes-de-cas/${slug}`,
      type: 'article',
      locale: 'fr_FR',
      siteName: 'Kamforms',
    },
    twitter: {
      card: 'summary_large_image',
      title: cs.title,
      description: cs.description,
      images: ['/opengraph-image'],
      creator: '@kamtech',
    },
  }
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cs = CASE_STUDIES.find(c => c.slug === slug)
  if (!cs) notFound()

  const canonical = `${APP_URL}/etudes-de-cas/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: APP_URL },
          { '@type': 'ListItem', position: 2, name: 'Études de cas', item: `${APP_URL}/etudes-de-cas` },
          { '@type': 'ListItem', position: 3, name: cs.title },
        ],
      },
      {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: cs.title,
        description: cs.description,
        author: { '@type': 'Person', name: cs.author },
        publisher: { '@type': 'Organization', name: 'Kamtech', url: APP_URL, logo: `${APP_URL}/icon.svg` },
        image: `${APP_URL}/opengraph-image`,
        inLanguage: 'fr-FR',
      },
    ],
  }

  return (
    <PublicPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link href="/etudes-de-cas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Retour aux études de cas
        </Link>

        <article>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><MapPin size={12} />{cs.clientLocation}</span>
            <span className="text-foreground/20">·</span>
            <span>{cs.clientBusiness}</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">{cs.title}</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {cs.results.map(r => (
              <div key={r.metric} className="border border-border rounded-[14px] p-4 text-center bg-card">
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{r.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.05em] mt-1">{r.metric}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed mb-8">
            <h2 className="text-lg font-semibold text-foreground">Le problème</h2>
            <p>{cs.problem}</p>
            <h2 className="text-lg font-semibold text-foreground">La solution</h2>
            <p>{cs.solution}</p>
          </div>

          <blockquote className="border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 rounded-r-[14px] p-5 mb-8">
            <Quote size={16} className="text-emerald-500 mb-2 opacity-50" />
            <p className="text-sm text-foreground italic leading-relaxed">{cs.testimonial}</p>
            <p className="text-xs text-muted-foreground mt-3 font-semibold">— {cs.clientName}</p>
          </blockquote>

          <div
            className="prose prose-sm prose-neutral dark:prose-invert max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: cs.body }}
          />
        </article>
      </div>
    </PublicPageShell>
  )
}
