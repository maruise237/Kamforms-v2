import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, ExternalLink } from 'lucide-react'
import { COMPARISONS } from '@/lib/comparisons-data'
import { PublicPageShell } from '@/components/public-page-shell'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export async function generateStaticParams() {
  return COMPARISONS.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = COMPARISONS.find(x => x.slug === slug)
  if (!c) return { title: 'Comparatif introuvable' }
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `${APP_URL}/comparatif/${slug}` },
    openGraph: {
      title: c.title,
      description: c.description,
      url: `${APP_URL}/comparatif/${slug}`,
      type: 'article',
      locale: 'fr_FR',
      siteName: 'Kamforms',
    },
  }
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = COMPARISONS.find(x => x.slug === slug)
  if (!c) notFound()

  const canonical = `${APP_URL}/comparatif/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: APP_URL },
          { '@type': 'ListItem', position: 2, name: 'Comparatifs', item: `${APP_URL}/comparatif` },
          { '@type': 'ListItem', position: 3, name: `Kamforms vs ${c.competitor}` },
        ],
      },
      {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: c.title,
        description: c.description,
        author: { '@type': 'Person', name: 'Mariuse' },
        publisher: { '@type': 'Organization', name: 'Kamtech', url: APP_URL },
        inLanguage: 'fr-FR',
        datePublished: c.date,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${APP_URL}#software`,
        name: 'Kamforms',
        applicationCategory: 'FormBuilder',
        operatingSystem: 'Web',
        description: 'Formulaires WhatsApp intelligents pour PME africaines',
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'XOF',
          lowPrice: '0',
          highPrice: '29000',
        },
        review: {
          '@type': 'Review',
          reviewBody: `Kamforms est ${c.advantages.length > 0 ? c.advantages[0].toLowerCase().replace(/^kamforms /i, '') : 'mieux adapté aux PME africaines que ' + c.competitor}`,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: c.faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.r },
        })),
      },
    ],
  }

  return (
    <PublicPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link href="/comparatif" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Retour aux comparatifs
        </Link>

        <article>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
            <span className="inline-flex items-center gap-1"><ExternalLink size={10} /><a href={c.competitorUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">{c.competitor}</a></span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">{c.title}</h1>

          <p className="text-sm text-muted-foreground leading-relaxed mb-10">{c.description}</p>

          <h2 className="text-lg font-semibold text-foreground mb-4">Tableau comparatif</h2>
          <div className="overflow-hidden rounded-[14px] border border-border mb-10">
            <div className="grid grid-cols-3 gap-0 text-xs font-semibold uppercase tracking-[0.08em]">
              <div className="p-3 bg-muted/30 text-muted-foreground">Fonctionnalité</div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-center">Kamforms</div>
              <div className="p-3 bg-muted/30 text-muted-foreground text-center">{c.competitor}</div>
            </div>
            {c.comparisonRows.map((row, i) => (
              <div key={i} className={cn('grid grid-cols-3 gap-0 text-sm border-t border-border', i % 2 === 0 ? 'bg-background' : 'bg-muted/10')}>
                <div className="p-3 text-foreground font-medium">{row.feature}</div>
                <div className="p-3 text-emerald-700 dark:text-emerald-400 text-center text-xs leading-relaxed">{row.kamforms}</div>
                <div className="p-3 text-muted-foreground text-center text-xs leading-relaxed">{row.them}</div>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-foreground mb-4">Pourquoi choisir Kamforms ?</h2>
          <ul className="space-y-2 mb-8">
            {c.advantages.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>{a}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-lg font-semibold text-foreground mb-4">Ce que {c.competitor} fait mieux</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">{c.disadvantage}</p>

          <h2 className="text-lg font-semibold text-foreground mb-4">Conclusion</h2>
          <div className="border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 rounded-[14px] p-5 mb-8">
            <p className="text-sm text-foreground leading-relaxed">{c.conclusion}</p>
          </div>

          <h2 className="text-lg font-semibold text-foreground mb-4">FAQ</h2>
          <div className="space-y-4 mb-8">
            {c.faqs.map((f, i) => (
              <div key={i} className="border border-border rounded-[14px] p-4">
                <p className="text-sm font-medium text-foreground mb-2">{f.q}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.r}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }))}>
              Essayer Kamforms gratuitement <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </article>
      </div>
    </PublicPageShell>
  )
}
