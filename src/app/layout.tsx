import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
}

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: 'Kamforms — Formulaires WhatsApp intelligents',
    template: '%s — Kamforms',
  },

  description:
    'Créez des formulaires en quelques secondes avec l\'IA. Recevez chaque réponse sur WhatsApp. Idéal pour les PME en Afrique francophone. Self-hosted possible.',

  keywords: [
    'formulaire en ligne',
    'générateur de formulaire IA',
    'notification WhatsApp formulaire',
    'formulaire WhatsApp Afrique',
    'créer formulaire rapidement',
    'formulaire sans code',
    'formulaire devis',
    'formulaire contact',
    'collecte de données WhatsApp',
    'Kamforms',
    'Kamtech',
    'formulaire Côte d\'Ivoire',
    'formulaire Cameroun',
    'formulaire Sénégal',
  ],

  authors: [{ name: 'Kamtech', url: 'https://kamtech.online' }],
  creator: 'Kamtech',
  publisher: 'Kamtech',

  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: APP_URL,
    siteName: 'Kamforms',
    title: 'Kamforms — Formulaires intelligents avec notifications WhatsApp',
    description:
      'Créez des formulaires professionnels en quelques secondes avec l\'IA. Partagez un lien, recevez chaque réponse instantanément sur WhatsApp. Self-hosted.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Kamforms - Formulaires intelligents WhatsApp' }],
    countryName: 'Cameroun',
    emails: ['contact@kamtech.online'],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Kamforms — Formulaires intelligents WhatsApp',
    description:
      'Créez des formulaires en quelques secondes avec l\'IA. Chaque réponse sur WhatsApp. Self-hosted.',
    images: ['/opengraph-image'],
    creator: '@kamtech',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: [{ url: '/icon.svg' }, { url: '/icon-192x192.png?v=2', sizes: '192x192', type: 'image/png' }],
    shortcut: '/icon-192x192.png?v=2',
    apple: '/icon-152x152.png?v=2',
  },

  alternates: {
    canonical: APP_URL,
    languages: {
      'fr-FR': APP_URL,
      'en': `${APP_URL}/en`,
    },
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },

  other: {
    'geo.region': 'CM',
    'geo.placename': 'Yaoundé',
  },
}

import { WebVitals } from '@/components/web-vitals'
import { AppShell } from '@/components/app-shell'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr" suppressHydrationWarning className={`${inter.variable} ${bricolage.variable}`}>
        <head>
          <link rel="manifest" href="/manifest.json?v=3" />
          <script defer src="https://umami.kamtech.online/script.js" data-website-id="ad432ff4-d66b-4515-8ed1-13a0e52108a2" />
          <script dangerouslySetInnerHTML={{ __html: `
if('serviceWorker'in navigator){navigator.serviceWorker.register('/sw.js?v=4')}
` }} />
        </head>
        <body>
          <WebVitals />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                '@id': 'https://kamforms.com#software',
                name: 'Kamforms',
                applicationCategory: 'FormBuilder',
                operatingSystem: 'Web',
                description: 'Formulaires WhatsApp intelligents pour PME africaines. Génération IA, notifications WhatsApp instantanées, paiements Mobile Money (bientôt).',
                offers: {
                  '@type': 'AggregateOffer',
                  priceCurrency: 'XOF',
                  lowPrice: '0',
                  highPrice: '29000',
                  offerCount: '3',
                },
                author: {
                  '@type': 'Person',
                  name: 'Mariuse Kamga',
                },
                inLanguage: ['fr-FR', 'en'],
                availableOnDevice: 'Web',
                applicationSuite: 'Kamforms',
                browserRequirements: 'Requires modern browser',
                permissions: 'none',
                countriesSupported: 'CI,SN,CM,ML,BF,TG,BJ,NE,GN,CF',
                featureList: 'Génération IA, Notifications WhatsApp, Paiements Mobile Money (bientôt), Import Google Forms, Formulaires multi-étapes, Self-hosting',
              }),
            }}
          />
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  )
}
