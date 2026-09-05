import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PublicPageShell } from '@/components/public-page-shell'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export const metadata: Metadata = {
  title: 'Tarifs Kamforms \u2014 Gratuit puis \u00e0 partir de 3 500 FCFA/mois',
  description: 'D\u00e9couvrez les tarifs Kamforms. Plan Gratuit pour d\u00e9marrer, Pro \u00e0 3 500 FCFA/mois, Business \u00e0 29 000 FCFA/mois. Paiements Mobile Money (bient\u00f4t), notifications WhatsApp, IA.',
  alternates: { canonical: `${APP_URL}/tarifs` },
  openGraph: {
    title: 'Tarifs Kamforms \u2014 Gratuit puis \u00e0 partir de 3 500 FCFA/mois',
    description: 'Plan Gratuit, Pro \u00e0 3 500 FCFA/mois, Business \u00e0 29 000 FCFA/mois. Paiements Mobile Money (bient\u00f4t), notifications WhatsApp, IA.',
    url: `${APP_URL}/tarifs`,
    locale: 'fr_FR',
    siteName: 'Kamforms',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Tarifs Kamforms' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarifs Kamforms \u2014 Gratuit puis \u00e0 partir de 3 500 FCFA/mois',
    description: 'Plan Gratuit, Pro \u00e0 3 500 FCFA/mois, Business \u00e0 29 000 FCFA/mois.',
    images: ['/opengraph-image'],
    creator: '@kamtech',
  },
}

const plans = [
  {
    name: 'Gratuit',
    price: '0 FCFA',
    priceUSD: '0$',
    period: '/mois',
    desc: 'Pour d\u00e9couvrir Kamforms et cr\u00e9er vos premiers formulaires.',
    cta: 'Cr\u00e9er mon compte',
    href: '/sign-up',
    features: [
      '3 formulaires actifs',
      '50 r\u00e9ponses/mois',
      'G\u00e9n\u00e9ration IA de formulaires',
      'Notifications WhatsApp limit\u00e9es',
      'Notifications email',
      'Formulaires multi-\u00e9tapes',
      'Import Google Forms',
      'Export CSV',
    ],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '3 500 FCFA',
    priceUSD: '6$',
    period: '/mois',
    desc: 'Pour les entrepreneurs et freelances qui veulent passer \u00e0 la vitesse sup\u00e9rieure.',
    cta: 'Essayer Pro',
    href: '/sign-up',
    popular: true,
    features: [
      '10 formulaires actifs',
      '1 000 r\u00e9ponses/mois',
      'G\u00e9n\u00e9ration IA illimit\u00e9e',
      'Notifications WhatsApp illimit\u00e9es',
      'Notifications email + push',
      'Paiements Mobile Money (\u00e0 venir : Orange Money, MTN, Wave)',
      'Formulaires multi-\u00e9tapes',
      'Import Google Forms',
      'Analytique des r\u00e9ponses',
      'Personnalisation visuelle',
      'Export CSV',
    ],
    highlight: true,
  },
  {
    name: 'Business',
    price: '29 000 FCFA',
    priceUSD: '49$',
    period: '/mois',
    desc: 'Pour les agences et PME avec des besoins avanc\u00e9s.',
    cta: 'Essayer Business',
    href: '/sign-up',
    features: [
      '20 formulaires actifs',
      '10 000 r\u00e9ponses/mois',
      'G\u00e9n\u00e9ration IA illimit\u00e9e',
      'Notifications WhatsApp illimit\u00e9es',
      'Notifications email + push',
      'Paiements Mobile Money (\u00e0 venir)',
      'Formulaires multi-\u00e9tapes',
      'Import Google Forms',
      'Analytique avanc\u00e9e',
      'Personnalisation visuelle',
      '20 collaborateurs',
      'Self-hosting disponible',
      'Support prioritaire',
      'Export CSV',
    ],
    highlight: false,
  },
]

const comparisonRows = [
  { feature: 'Prix mensuel', gratis: '0 FCFA', pro: '3 500 FCFA', biz: '29 000 FCFA' },
  { feature: 'Prix annuel (2 mois offerts)', gratis: '-', pro: '35 000 FCFA', biz: '290 000 FCFA' },
  { feature: 'Formulaires actifs', gratis: '3', pro: '10', biz: '20' },
  { feature: 'R\u00e9ponses par mois', gratis: '50', pro: '1 000', biz: '10 000' },
  { feature: 'G\u00e9n\u00e9ration IA', gratis: 'Oui', pro: 'Illimit\u00e9e', biz: 'Illimit\u00e9e' },
  { feature: 'Notifications WhatsApp', gratis: 'Limit\u00e9es', pro: 'Illimit\u00e9es', biz: 'Illimit\u00e9es' },
  { feature: 'Paiements Mobile Money', gratis: '-', pro: '\u00c0 venir', biz: '\u00c0 venir' },
  { feature: 'Formulaires multi-\u00e9tapes', gratis: 'Oui', pro: 'Oui', biz: 'Oui' },
  { feature: 'Import Google Forms', gratis: 'Oui', pro: 'Oui', biz: 'Oui' },
  { feature: 'Collaborateurs', gratis: '1', pro: '1', biz: '20' },
  { feature: 'Self-hosting', gratis: '-', pro: '-', biz: 'Disponible' },
  { feature: 'Support', gratis: 'Email', pro: 'Email', biz: 'Prioritaire' },
]

export default function TarifsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${APP_URL}/tarifs#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: APP_URL },
          { '@type': 'ListItem', position: 2, name: 'Tarifs' },
        ],
      },
      {
        '@type': 'Product',
        '@id': `${APP_URL}/tarifs#product`,
        name: 'Kamforms - Formulaires WhatsApp pour PME africaines',
        description: 'Plan Gratuit, Pro à 3 500 FCFA/mois, Business à 29 000 FCFA/mois',
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'XOF',
          lowPrice: '0',
          highPrice: '29000',
          offerCount: '3',
        },
      },
    ],
  }

  return (
    <PublicPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="py-20 md:py-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4">Tarifs</p>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] text-balance mb-6">
            Des tarifs pensés pour <span className="text-muted-foreground">les PME africaines</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
            Gratuit pour commencer. Pro à partir de <strong>3 500 FCFA/mois (6$/mois)</strong>.
            En dessous du prix d&apos;une connexion data mensuelle.
          </p>
          <p className="text-xs text-muted-foreground">
            Paiements Mobile Money : bientôt disponible
          </p>
        </div>
      </section>

      <section className="pb-16 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'border rounded-[18px] p-6 md:p-8 bg-card relative flex flex-col',
                plan.highlight ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5' : 'border-border'
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-semibold uppercase tracking-[0.1em] px-4 py-1 rounded-full">
                  Recommandé
                </div>
              )}
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-2">{plan.name}</p>
              <div className="mb-1">
                <span className="text-3xl font-heading font-extrabold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{plan.priceUSD}{plan.period} en devise internationale</p>
              <p className="text-sm text-muted-foreground mb-6 mt-2">{plan.desc}</p>
              <div className="flex-1 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check size={12} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({ variant: plan.highlight ? 'default' : 'outline', size: 'sm' }),
                  'w-full'
                )}
              >
                {plan.cta} <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-24 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4 text-center">Comparatif</p>
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.1] text-balance mb-8 text-center">
            Comparez les formules <span className="text-muted-foreground">en un coup d&apos;oeil</span>
          </h2>
          <div className="overflow-hidden rounded-[18px] border border-border">
            <div className="grid grid-cols-4 gap-0 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <div className="p-4 bg-muted/30 text-muted-foreground">Fonctionnalité</div>
              <div className="p-4 bg-muted/30 text-muted-foreground text-center">Gratuit</div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-center font-bold">Pro</div>
              <div className="p-4 bg-muted/30 text-muted-foreground text-center">Business</div>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className={cn('grid grid-cols-4 gap-0 text-sm border-t border-border', i % 2 === 0 ? 'bg-background' : 'bg-muted/10')}>
                <div className="p-4 text-foreground font-medium">{row.feature}</div>
                <div className="p-4 text-muted-foreground text-center">{row.gratis}</div>
                <div className="p-4 text-emerald-700 dark:text-emerald-400 text-center font-medium">{row.pro}</div>
                <div className="p-4 text-muted-foreground text-center">{row.biz}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.1] text-balance mb-4">
            Pas sûr de quelle formule choisir ?
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Commencez par le plan Gratuit. Pas de carte bancaire. Vous pourrez passer à Pro ou Business à tout moment.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }))}>
              Créer mon compte gratuit <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link href="/contact" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
              Contacter l&apos;\u00e9quipe
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  )
}
