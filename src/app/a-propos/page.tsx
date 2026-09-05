import type { Metadata } from 'next'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PublicPageShell } from '@/components/public-page-shell'
import { ArrowRight, MapPin, Globe, Shield, Users, Lightbulb, Heart, Linkedin, Github, Twitter } from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export const metadata: Metadata = {
  title: 'À propos — Kamtech & Kamforms | Équipe, Mission',
  description:
    'Découvrez Mariuse, le créateur de Kamforms, et l\'équipe Kamtech. Un studio basé à Yaoundé (Cameroun) spécialisé dans les outils de collecte de données sur WhatsApp pour les PME africaines.',
  keywords: [
    'Kamtech',
    'Kamforms',
    'à propos',
    'équipe Kamforms',
    'Mariuse Kamforms',
    'créateur formulaire WhatsApp',
    'studio tech Afrique',
    'formulaire WhatsApp',
    'Côte d\'Ivoire',
    'Cameroun',
    'Yaoundé',
    'startup africaine',
    'développeur Cameroun',
    'collecte données WhatsApp',
  ],
  alternates: {
    canonical: `${APP_URL}/a-propos`,
    languages: {
      'fr-FR': `${APP_URL}/a-propos`,
      'en': `${APP_URL}/en/a-propos`,
    },
  },
  openGraph: {
    title: 'À propos — Kamtech & Kamforms | Équipe, Mission',
    description:
      'Mariuse et l\'équipe Kamtech construisent Kamforms, la solution de collecte structurée pour les groupes WhatsApp en Afrique. Basé à Yaoundé, Cameroun.',
    url: `${APP_URL}/a-propos`,
    locale: 'fr_FR',
    siteName: 'Kamforms',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'À propos de Kamforms & Kamtech' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'À propos — Kamtech & Kamforms | Équipe, Mission',
    description:
      'Mariuse et l\'équipe Kamtech construisent Kamforms. Collecte structurée WhatsApp pour PME africaines.',
    images: ['/opengraph-image'],
    creator: '@kamtech',
  },
}

const values = [
  {
    icon: Lightbulb,
    title: 'Simplicité d\'abord',
    body: 'Chaque fonctionnaliture doit pouvoir s\'utiliser en moins de 30 secondes. Pas de configuration complexe, pas de jargon technique.',
  },
  {
    icon: Shield,
    title: 'Souveraineté des données',
    body: 'Nous croyons au contrôle total de vos données. C\'est pourquoi Kamforms propose le self-hosting pour les entreprises qui le souhaitent.',
  },
  {
    icon: Heart,
    title: 'Pensé pour l\'Afrique',
    body: 'WhatsApp est le cœur numérique de l\'Afrique francophone. Nos outils sont conçus pour ce canal, pas adaptés après coup.',
  },
  {
    icon: Users,
    title: 'Support humain',
    body: 'Pas de chatbot ni de FAQ interminable. Un vrai humain répond à vos questions, rapidement et en français.',
  },
]

export default function AProposPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${APP_URL}/a-propos#mariuse`,
        name: 'Mariuse',
        givenName: 'Mariuse',
        familyName: 'Kamga',
        jobTitle: 'Fondateur & Développeur Principal',
        description: 'Développeur full-stack et entrepreneur. Créateur de Kamforms, spécialiste des solutions de collecte de données sur WhatsApp pour le marché africain.',
        url: APP_URL,
        sameAs: [
          'https://github.com/maruise237/kamforms',
          'https://x.com/kamtech',
          'https://linkedin.com/in/maruise237',
        ],
        knowsAbout: ['Développement web', 'Formulaires en ligne', 'WhatsApp API', 'Intelligence Artificielle', 'Product design'],
        address: { '@type': 'PostalAddress', addressLocality: 'Yaoundé', addressCountry: 'CM' },
      },
      {
        '@type': 'Organization',
        '@id': `${APP_URL}/a-propos#org`,
        name: 'Kamtech',
        url: 'https://kamtech.online',
        logo: `${APP_URL}/icon.svg`,
        description: 'Studio de développement basé à Yaoundé, spécialisé dans les outils de collecte de données sur WhatsApp pour les PME africaines.',
        address: { '@type': 'PostalAddress', addressLocality: 'Yaoundé', addressCountry: 'CM' },
        email: 'contact@kamtech.online',
        founder: { '@type': 'Person', name: 'Mariuse' },
      },
    ],
  }

  return (
    <PublicPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section className="py-20 md:py-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4">
            À propos
          </p>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] text-balance mb-6">
            Kamforms est construit par<br />
            <span className="text-muted-foreground">Kamtech.</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8">
            Un studio de développement basé à Yaoundé, passionné par la création d&apos;outils simples et puissants
            pour les PME africaines. Notre mission : remplacer le chaos des groupes WhatsApp par des données structurées et exploitables.
          </p>
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }))}>
            Créer mon compte gratuit <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Mission */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-heading font-extrabold tracking-[-0.04em] mb-6">Notre mission</h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              En Afrique francophone, <strong>WhatsApp est le canal business numéro un</strong>. On y échange des devis, on y recrute
              des participants pour des formations, on y prend des commandes, on y fait du support client.
            </p>
            <p>
              Mais les informations se perdent dans les groupes. Les messages défilent, les réponses s&apos;éparpillent,
              et les entrepreneurs passent des heures à recoller les morceaux.
            </p>
            <p>
              <strong>Kamforms est né de ce constat.</strong> Un outil qui permet de créer un formulaire en 30 secondes avec l&apos;IA,
              de le partager sur WhatsApp, et de recevoir chaque réponse proprement structurée — directement sur votre WhatsApp privé.
            </p>
            <p>
              Pas de courbe d&apos;apprentissage, pas de configuration technique. <strong>Un lien, un formulaire, et les réponses arrivent en privé.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="pb-24 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)] bg-muted/10 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-heading font-extrabold tracking-[-0.04em] mb-3 text-center">Nos valeurs</h2>
          <p className="text-sm text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Ce qui guide chacune de nos décisions produit.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map((v, i) => (
              <div key={i} className="border border-border rounded-[18px] p-6 bg-card">
                <div className="w-9 h-9 rounded-[9px] border border-border bg-muted/40 flex items-center justify-center mb-3">
                  <v.icon size={16} className="text-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-[0.8rem] text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section className="pb-24 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4 text-center">Équipe</p>
          <h2 className="text-2xl font-heading font-extrabold tracking-[-0.04em] mb-3 text-center">Qui construit Kamforms ?</h2>
          <p className="text-sm text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Une petite équipe avec une grande mission : simplifier la collecte de données pour les entrepreneurs africains.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-border rounded-[18px] p-6 bg-card">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-heading font-bold text-lg shrink-0">
                  M
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-foreground">Mariuse</h3>
                  <p className="text-xs text-muted-foreground">Fondateur &amp; Développeur Principal</p>
                  <div className="flex gap-2 mt-2">
                    <a href="https://github.com/maruise237/kamforms" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Github size={14} />
                    </a>
                    <a href="https://x.com/kamtech" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Twitter size={14} />
                    </a>
                    <a href="https://linkedin.com/in/maruise237" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Linkedin size={14} />
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                Développeur full-stack basé à Yaoundé, passionné par les outils numériques qui résolvent des problèmes concrets pour les PME africaines.
                Avant Kamforms, il a conçu des solutions de collecte de données pour des ONG et institutions au Cameroun et en Côte d&apos;Ivoire.
                Convaincu que WhatsApp est le canal business numéro un en Afrique, il a créé Kamforms pour remplacer le chaos des groupes WhatsApp par des données structurées et exploitables.
              </p>
            </div>
            <div className="border border-border rounded-[18px] p-6 bg-card flex items-center justify-center text-center">
              <div>
                <p className="text-sm text-muted-foreground italic max-w-xs mx-auto leading-relaxed">
                  &ldquo;Nous construisons l&apos;infrastructure de collecte de données dont l&apos;Afrique francophone a besoin.
                  Pas un outil occidental adapté, mais une solution native pour notre façon de communiquer : WhatsApp.&rdquo;
                </p>
                <p className="text-xs font-semibold text-foreground mt-4">— Mariuse, Fondateur de Kamforms</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chiffres */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-heading font-extrabold tracking-[-0.04em] mb-8">Kamtech en bref</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '2026', label: 'Lancement public' },
              { number: '5 000+', label: 'Formulaires créés' },
              { number: '15+', label: 'Pays africains' },
              { number: 'Self-host', label: 'Disponible' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl font-heading font-extrabold text-foreground">{stat.number}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="pb-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.1] text-balance mb-4">
            Une question ? Une idée ?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            On répond en français, par email ou sur WhatsApp. Pas de chatbot.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="mailto:contact@kamtech.online" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
              contact@kamtech.online
            </a>
            <a href="https://kamtech.online" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }))}>
              kamtech.online <Globe size={14} className="ml-2" />
            </a>
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={12} /> Yaoundé, Cameroun
          </div>
        </div>
      </section>
    </PublicPageShell>
  )
}
