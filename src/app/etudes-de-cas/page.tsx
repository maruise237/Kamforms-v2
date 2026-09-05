import type { Metadata } from 'next'
import Link from 'next/link'
import { CASE_STUDIES } from '@/lib/case-studies'
import { PublicPageShell } from '@/components/public-page-shell'
import { MapPin, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export const metadata: Metadata = {
  title: '\u00c9tudes de cas Kamforms \u2014 PME africaines qui r\u00e9ussissent',
  description: 'D\u00e9couvrez comment les PME africaines utilisent Kamforms pour structurer leur collecte de donn\u00e9es sur WhatsApp. Cas clients r\u00e9els au Cameroun, C\u00f4te d\'Ivoire, S\u00e9n\u00e9gal.',
  alternates: { canonical: `${APP_URL}/etudes-de-cas` },
  openGraph: {
    title: '\u00c9tudes de cas Kamforms',
    description: 'PME africaines qui r\u00e9ussissent avec Kamforms.',
    url: `${APP_URL}/etudes-de-cas`,
    locale: 'fr_FR',
    siteName: 'Kamforms',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '\u00c9tudes de cas Kamforms',
    description: 'PME africaines qui r\u00e9ussissent avec Kamforms.',
    images: ['/opengraph-image'],
    creator: '@kamtech',
  },
}

export default function CaseStudiesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${APP_URL}/etudes-de-cas#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: APP_URL },
          { '@type': 'ListItem', position: 2, name: '\u00c9tudes de cas' },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${APP_URL}/etudes-de-cas#page`,
        headline: '\u00c9tudes de cas Kamforms',
        description: 'D\u00e9couvrez comment les PME africaines utilisent Kamforms.',
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Études de cas</h1>
        <p className="text-muted-foreground mb-12 max-w-xl">
          Découvrez comment des entrepreneurs africains utilisent Kamforms pour transformer leur collecte de données sur WhatsApp.
        </p>

        <div className="space-y-8">
          {CASE_STUDIES.map((cs) => (
            <article key={cs.slug} className="border border-border rounded-[18px] p-6 md:p-8 bg-card hover:border-foreground/20 transition-colors">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><MapPin size={12} />{cs.clientLocation}</span>
                <span className="text-foreground/20">·</span>
                <span>{cs.clientBusiness}</span>
              </div>
              <Link href={`/etudes-de-cas/${cs.slug}`} className="group">
                <h2 className="text-xl font-semibold text-foreground group-hover:text-foreground/70 transition-colors mb-2">{cs.title}</h2>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{cs.description}</p>
              <div className="flex flex-wrap gap-3 mb-4">
                {cs.results.map(r => (
                  <div key={r.metric} className="bg-muted/30 rounded-lg px-3 py-2 text-center min-w-[100px]">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{r.value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.05em]">{r.metric}</p>
                  </div>
                ))}
              </div>
              <Link href={`/etudes-de-cas/${cs.slug}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                Lire l&apos;\u00e9tude de cas <ArrowRight size={14} className="ml-2" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </PublicPageShell>
  )
}
