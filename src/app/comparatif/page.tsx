import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { COMPARISONS } from '@/lib/comparisons-data'
import { PublicPageShell } from '@/components/public-page-shell'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export const metadata: Metadata = {
  title: 'Comparatifs — Kamforms vs alternatives',
  description: 'Comparez Kamforms aux autres outils de formulaires : Typeform, Jotform, Tally, Fillout, WATI, Respond.io, Google Forms, ManyChat. Prix, fonctionnalités, Mobile Money.',
  alternates: { canonical: `${APP_URL}/comparatif` },
  openGraph: {
    title: 'Comparatifs — Kamforms vs alternatives',
    description: 'Comparez Kamforms à Typeform, Jotform, Tally, Fillout, WATI, Respond.io, Google Forms, ManyChat.',
    url: `${APP_URL}/comparatif`,
    locale: 'fr_FR',
    siteName: 'Kamforms',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparatifs — Kamforms vs alternatives',
    description: 'Comparez Kamforms aux autres outils de formulaires.',
    images: ['/opengraph-image'],
    creator: '@kamtech',
  },
}

export default function ComparisonsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${APP_URL}/comparatif#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: APP_URL },
          { '@type': 'ListItem', position: 2, name: 'Comparatifs' },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${APP_URL}/comparatif#page`,
        headline: 'Comparatifs Kamforms vs alternatives',
        description: 'Comparez Kamforms aux autres outils de formulaires en ligne.',
        inLanguage: 'fr-FR',
      },
    ],
  }

  return (
    <PublicPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-12">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Accueil</Link>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Comparatifs</h1>
        <p className="text-muted-foreground mb-12 max-w-xl">
          Kamforms face aux alternatives du marché. Prix, fonctionnalités WhatsApp, Mobile Money et spécificités Afrique.
        </p>

        <div className="space-y-6">
          {COMPARISONS.map(c => (
            <article key={c.slug} className="border border-border rounded-[18px] p-6 md:p-8 bg-card hover:border-foreground/20 transition-colors">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-1">
                <span>Comparatif</span>
                <span className="text-foreground/20">·</span>
                <a href={c.competitorUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                  {c.competitor} <ExternalLink size={10} />
                </a>
              </div>
              <Link href={`/comparatif/${c.slug}`} className="group">
                <h2 className="text-xl font-semibold text-foreground group-hover:text-foreground/70 transition-colors mb-2">{c.title}</h2>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.description}</p>
              <Link href={`/comparatif/${c.slug}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                Voir le comparatif <ArrowRight size={14} className="ml-2" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </PublicPageShell>
  )
}
