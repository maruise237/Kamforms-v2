import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'
import { LandingClient } from '@/components/landing-client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export const metadata: Metadata = {
  title: 'Collectez les réponses sans saturer votre groupe',
  description:
    'Collectez les réponses dans vos groupes WhatsApp sans les saturer. Un lien, un formulaire IA, et tout arrive en privé sur votre WhatsApp.',
  keywords: [
    'collecter les réponses dans un groupe WhatsApp',
    'formulaire WhatsApp groupe',
    'questionnaire participants formation WhatsApp',
    'collecte infos intervenants événement WhatsApp',
    'brief client structuré WhatsApp',
    'formulaire questionnaire participants',
    'collecte infos équipe WhatsApp',
    'formulaire en ligne',
    'générateur formulaire IA',
    'notification WhatsApp formulaire',
    'import Google Forms',
    'migrer depuis Google Forms',
    'formulaire intelligent',
    'alternative Typeform',
    'formulaire sans code',
    'form builder IA',
    'kamforms',
    'formulaire WhatsApp',
    'formulaire devis WhatsApp',
    'formulaire client WhatsApp',
    'setup formulaire Google Forms',
  ],
  alternates: { canonical: APP_URL },
  openGraph: {
    title: 'Kamforms — Collectez les réponses sans saturer votre groupe',
    description:
      'Un lien dans votre groupe. Des réponses propres sur votre WhatsApp privé.',
    url: APP_URL,
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Kamforms',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Kamforms - Formulaires intelligents WhatsApp' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kamforms — Collectez les réponses sans saturer votre groupe',
    description:
      'Un lien dans votre groupe. Des réponses propres sur votre WhatsApp privé.',
    images: ['/opengraph-image'],
    creator: '@kamtech',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${APP_URL}/#app`,
      name: 'Kamforms',
      url: APP_URL,
      description:
        'Collecte structurée pour groupes WhatsApp avec génération IA, formulaires privés et notifications WhatsApp instantanées.',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      inLanguage: 'fr-FR',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '0',
        highPrice: '490',
        offerCount: 5,
        offers: [
          { '@type': 'Offer', name: 'Gratuit', price: '0', priceCurrency: 'USD' },
          { '@type': 'Offer', name: 'Pro mensuel', price: '6', priceCurrency: 'USD' },
          { '@type': 'Offer', name: 'Pro annuel', price: '60', priceCurrency: 'USD' },
          { '@type': 'Offer', name: 'Business mensuel', price: '49', priceCurrency: 'USD' },
          { '@type': 'Offer', name: 'Business annuel', price: '490', priceCurrency: 'USD' },
        ],
      },
      featureList: [
        'Génération de formulaire par IA',
        'Notifications WhatsApp instantanées',
        'Notifications email',
        'Notifications push navigateur',
        'Analytique des réponses',
        'Collecte structurée dans les groupes WhatsApp',
        'Import depuis Google Forms',
        'Plans Pro et Business avec volumes WhatsApp',
        'Formulaires multi-étapes (Tally-style)',
        'Thèmes personnalisés',
        'Export CSV',
        'Self-hosting disponible',
      ],
      screenshot: `${APP_URL}/opengraph-image`,
    },
    {
      '@type': 'Organization',
      '@id': `${APP_URL}/#org`,
      name: 'Kamtech',
      url: APP_URL,
      logo: `${APP_URL}/icon.svg`,
      sameAs: [
        'https://kamtech.online',
        'https://x.com/kamtech',
        'https://github.com/maruise237/kamforms',
      ],
      founder: { '@type': 'Person', name: 'Mariuse' },
    },
    {
      '@type': 'WebSite',
      '@id': `${APP_URL}/#site`,
      url: APP_URL,
      name: 'Kamforms',
      inLanguage: 'fr-FR',
      publisher: { '@id': `${APP_URL}/#org` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${APP_URL}/blog?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${APP_URL}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Peut-on importer des formulaires depuis Google Forms ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Oui. Kamforms permet d'importer vos formulaires Google Forms existants en quelques clics. Vos questions et votre logique conditionnelle sont transférées automatiquement.",
          },
        },
        {
          '@type': 'Question',
          name: 'Comment fonctionne la génération par IA ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Décrivez votre formulaire en une phrase. L'IA analyse votre description et génère automatiquement les champs, la logique conditionnelle et la validation en quelques secondes.",
          },
        },
        {
          '@type': 'Question',
          name: 'Comment recevoir les réponses sur WhatsApp ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Connectez votre numéro WhatsApp dans les paramètres. À chaque soumission de formulaire, vous recevez une notification WhatsApp avec toutes les réponses formatées.",
          },
        },
        {
          '@type': 'Question',
          name: 'Que comprend le plan Business ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Le plan Business est prévu pour les agences et PME : 20 formulaires actifs, 10 000 notifications WhatsApp par mois, 20 collaborateurs, analytique avancée, import Google Forms, exports CSV et support prioritaire. Une formule annuelle avec deux mois offerts est disponible.",
          },
        },
        {
          '@type': 'Question',
          name: 'Est-il possible d\'héberger Kamforms sur sa propre infrastructure ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Oui. Une option self-hosting est disponible pour les entreprises souhaitant héberger Kamforms sur leur propre infrastructure. Contactez-nous pour en savoir plus.",
          },
        },
        {
          '@type': 'Question',
          name: 'Kamforms supporte-t-il les formulaires multi-étapes ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Oui. Vous pouvez créer des formulaires découpés en plusieurs étapes avec barre de progression, logique conditionnelle et validation par étape.",
          },
        },
      ],
    },
  ],
}

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip to content — accessibilité */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-lg focus:text-sm focus:font-medium">
        Aller au contenu principal
      </a>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Fixed header */}
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm px-6 flex items-center justify-between">
        <Logo size={22} wordmark />
        <div className="flex items-center gap-1">
          <Link href="/fonctionnalites" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden md:inline-flex')}>Fonctionnalités</Link>
          <Link href="/tarifs" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden md:inline-flex')}>Tarifs</Link>
          <Link href="/blog" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden md:inline-flex')}>Blog</Link>
          <Link href="/comparatif" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden lg:inline-flex')}>Comparatifs</Link>
          <Link href="/etudes-de-cas" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden lg:inline-flex')}>Cas clients</Link>
          <Link href="/contact" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden md:inline-flex')}>Contact</Link>
          <Link href="/a-propos" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden md:inline-flex')}>À propos</Link>
          <ThemeToggle />
          <Link href="/sign-in" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            Connexion
          </Link>
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'sm' }))}>
            <span className="hidden sm:inline">Créer mon lien de collecte</span>
            <span className="sm:hidden">Créer mon lien</span>
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <LandingClient />
      </main>

      <footer className="border-t border-border bg-muted/10 px-6 py-12 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1.2fr]">
          <div>
            <Logo size={18} wordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Kamforms organise la collecte d&apos;infos dans les groupes WhatsApp. Un lien, un formulaire, et les réponses arrivent en privé.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/sign-up" className={cn(buttonVariants({ size: 'sm' }), 'text-xs')}>
                Créer mon lien de collecte
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-foreground">Produit</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/fonctionnalites" className="hover:text-foreground">Fonctionnalités</Link>
              <Link href="/tarifs" className="hover:text-foreground">Tarifs</Link>
              <Link href="/alternative-a-google-forms" className="hover:text-foreground">Alternative Google Forms</Link>
              <Link href="/comparatif" className="hover:text-foreground">Comparatifs</Link>
              <Link href="/etudes-de-cas" className="hover:text-foreground">Études de cas</Link>
              <Link href="/blog" className="hover:text-foreground">Blog</Link>
              <Link href="/#faq" className="hover:text-foreground">FAQ</Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-foreground">Compte</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/sign-up" className="hover:text-foreground">Créer un compte</Link>
              <Link href="/sign-in" className="hover:text-foreground">Connexion</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
              <Link href="/a-propos" className="hover:text-foreground">À propos</Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-foreground">Légal</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">Politique de confidentialité</Link>
              <Link href="/terms" className="hover:text-foreground">Conditions d&apos;utilisation</Link>
              <a href="https://kamtech.online" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Kamtech</a>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-foreground">Par pays</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <Link href="/pays/cote-d-ivoire" className="hover:text-foreground">Côte d'Ivoire</Link>
              <Link href="/pays/senegal" className="hover:text-foreground">Sénégal</Link>
              <Link href="/pays/cameroun" className="hover:text-foreground">Cameroun</Link>
              <Link href="/pays/mali" className="hover:text-foreground">Mali</Link>
              <Link href="/pays/burkina-faso" className="hover:text-foreground">Burkina Faso</Link>
              <Link href="/pays/togo" className="hover:text-foreground">Togo</Link>
              <Link href="/pays/benin" className="hover:text-foreground">Bénin</Link>
              <Link href="/pays/niger" className="hover:text-foreground">Niger</Link>
              <Link href="/pays/guinee" className="hover:text-foreground">Guinée</Link>
              <Link href="/pays/rca" className="hover:text-foreground">Centrafrique</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-[1100px] flex-col gap-3 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Kamforms. Développé par Kamtech.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground">Confidentialité</Link>
            <Link href="/terms" className="hover:text-foreground">Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
