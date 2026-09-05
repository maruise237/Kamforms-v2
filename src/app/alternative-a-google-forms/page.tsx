import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, X, Copy, MessageSquare, Zap, Smartphone, Upload, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PublicPageShell } from '@/components/public-page-shell'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export const metadata: Metadata = {
  title: 'Alternative à Google Forms en Afrique — Kamforms',
  description:
    'Découvrez pourquoi Kamforms est la meilleure alternative à Google Forms pour les entreprises africaines. Notifications WhatsApp instantanées, paiements Mobile Money (bientôt), génération IA.',
  alternates: { canonical: `${APP_URL}/alternative-a-google-forms` },
  openGraph: {
    title: 'Alternative à Google Forms en Afrique — Kamforms',
    description: 'Notifications WhatsApp, Mobile Money (bientôt), génération IA. Kamforms est l\'alternative africaine à Google Forms.',
    url: `${APP_URL}/alternative-a-google-forms`,
    locale: 'fr_FR',
    siteName: 'Kamforms',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Alternative Google Forms Afrique - Kamforms' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alternative à Google Forms en Afrique — Kamforms',
    description: 'Notifications WhatsApp, Mobile Money (bientôt), génération IA.',
    images: ['/opengraph-image'],
    creator: '@kamtech',
  },
}

const comparisons = [
  { feature: 'Notifications des réponses', kamforms: 'WhatsApp instantané (< 5s)', google: 'Email (90 min en moyenne)' },
  { feature: 'Paiements Mobile Money', kamforms: 'À venir (Orange Money, MTN, Wave)', google: 'Non disponible' },
  { feature: 'Génération par IA', kamforms: 'Oui, en français', google: 'Non' },
  { feature: 'Import Google Forms', kamforms: 'Oui, en 1 clic', google: 'N/A' },
  { feature: 'Self-hosting', kamforms: 'Oui, disponible', google: 'Non' },
  { feature: 'Prix adapté Afrique', kamforms: 'Gratuit + 3 500 FCFA/mois', google: 'Gratuit (limité)' },
  { feature: 'Accès sans compte Google', kamforms: 'Oui', google: 'Non' },
  { feature: 'Formulaires multi-étapes', kamforms: 'Oui', google: 'Non' },
  { feature: 'Optimisé mobile (3G/4G)', kamforms: 'Oui, prioritaire', google: 'Partiel' },
  { feature: 'Notifications push navigateur', kamforms: 'Oui', google: 'Non' },
]

export default function AlternativePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${APP_URL}/alternative-a-google-forms#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: APP_URL },
          { '@type': 'ListItem', position: 2, name: 'Alternative à Google Forms Afrique', item: `${APP_URL}/alternative-a-google-forms` },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${APP_URL}/alternative-a-google-forms#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Pourquoi chercher une alternative à Google Forms en Afrique ?',
            acceptedAnswer: { '@type': 'Answer', text: "Google Forms n'offre pas de notifications WhatsApp, ne supporte pas les paiements Mobile Money (Orange Money, MTN), et nécessite un compte Google. Kamforms résout tous ces problèmes : notifications WhatsApp instantanées, paiements Mobile Money bientôt disponibles, et pas de compte Google requis." },
          },
          {
            '@type': 'Question',
            name: 'Puis-je importer mes formulaires Google Forms existants ?',
            acceptedAnswer: { '@type': 'Answer', text: "Oui. Kamforms permet d'importer vos formulaires Google Forms existants en un clic. Toutes vos questions, options et logique conditionnelle sont transférées automatiquement." },
          },
          {
            '@type': 'Question',
            name: 'Quel est le prix de Kamforms comparé à Google Forms ?',
            acceptedAnswer: { '@type': 'Answer', text: "Google Forms est gratuit mais limité. Kamforms propose un plan Gratuit pour démarrer et des plans Pro à partir de 3 500 FCFA/mois (6$/mois) avec notifications WhatsApp illimitées, paiements Mobile Money (bientôt) et fonctionnalités avancées." },
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Kamforms',
        url: APP_URL,
        description: 'Alternative à Google Forms avec notifications WhatsApp et paiements Mobile Money (bientôt) pour l\'Afrique.',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        inLanguage: 'fr-FR',
      },
    ],
  }

  return (
    <PublicPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="py-20 md:py-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4">
            Alternative à Google Forms
          </p>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] text-balance mb-6">
            L&apos;alternative à Google Forms<br />
            <span className="text-muted-foreground">pensée pour l&apos;Afrique</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Google Forms est pratique, mais pas adapté au marché africain. Pas de notifications WhatsApp,
            pas de paiements Mobile Money, pas d&apos;optimisation pour les connexions 3G/4G.
            <strong> Kamforms résout tout ça.</strong>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }))}>
              Essayer Kamforms gratuitement <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link href="/fonctionnalites" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
              Voir les fonctionnalités
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-24 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4 text-center">Comparatif</p>
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.1] text-balance mb-8 text-center">
            Kamforms vs Google Forms : <span className="text-muted-foreground">le match</span>
          </h2>
          <div className="overflow-hidden rounded-[18px] border border-border">
            <div className="grid grid-cols-3 gap-0 text-xs font-semibold uppercase tracking-[0.08em]">
              <div className="p-4 bg-muted/30 text-muted-foreground">Fonctionnalité</div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                <Copy size={14} /> Kamforms
              </div>
              <div className="p-4 bg-muted/30 text-muted-foreground flex items-center justify-center gap-1.5">
                <X size={14} /> Google Forms
              </div>
            </div>
            {comparisons.map((row, i) => (
              <div key={i} className={cn('grid grid-cols-3 gap-0 text-sm border-t border-border', i % 2 === 0 ? 'bg-background' : 'bg-muted/10')}>
                <div className="p-4 text-foreground font-medium">{row.feature}</div>
                <div className="p-4 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Check size={14} className="shrink-0" /> <span>{row.kamforms}</span>
                </div>
                <div className="p-4 text-muted-foreground">{row.google}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4 text-center">Pourquoi migrer</p>
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.1] text-balance mb-8 text-center">
            3 raisons de passer de Google Forms <span className="text-muted-foreground">à Kamforms</span>
          </h2>
          <div className="space-y-6">
            <div className="border border-border rounded-[18px] p-6 md:p-8 bg-card">
              <div className="w-10 h-10 rounded-[10px] border border-border bg-muted/40 flex items-center justify-center mb-4">
                <MessageSquare size={18} className="text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">1. Les réponses arrivent sur votre WhatsApp</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Avec Google Forms, vous devez vérifier vos emails constamment. Avec Kamforms, chaque réponse
                arrive sur votre WhatsApp en moins de 5 secondes. Vous pouvez même choisir de recevoir les
                notifications par paliers (1, 5, 10, 50 réponses).
              </p>
            </div>
            <div className="border border-border rounded-[18px] p-6 md:p-8 bg-card">
              <div className="w-10 h-10 rounded-[10px] border border-border bg-muted/40 flex items-center justify-center mb-4">
                <Smartphone size={18} className="text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">2. Paiements Mobile Money (à venir)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Google Forms ne supporte pas Orange Money, MTN Mobile Money ou Wave. Kamforms intégrera
                bientôt les moyens de paiement utilisés par vos clients africains. Vous pourrez ajouter un paiement
                à n&apos;importe quelle question de votre formulaire.
              </p>
            </div>
            <div className="border border-border rounded-[18px] p-6 md:p-8 bg-card">
              <div className="w-10 h-10 rounded-[10px] border border-border bg-muted/40 flex items-center justify-center mb-4">
                <Upload size={18} className="text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">3. Import Google Forms en 1 clic</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vous avez déjà des formulaires Google Forms ? Importez-les en un clic. Toutes vos questions,
                options et logique conditionnelle sont transférées automatiquement. Vous retrouvez vos
                formulaires avec toutes les fonctionnalités Kamforms en moins d&apos;une minute.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.1] text-balance mb-4">
            Prêt à quitter Google Forms ?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Importez vos formulaires en 1 clic. Gratuit pour commencer, sans carte bancaire.
          </p>
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }))}>
            Migrer vers Kamforms gratuitement <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>
    </PublicPageShell>
  )
}
