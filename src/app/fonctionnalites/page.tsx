import type { Metadata } from 'next'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PublicPageShell } from '@/components/public-page-shell'
import { ArrowRight, Check, Zap, MessageSquare, Upload, Layers, Palette, Users, Shield, BarChart3 } from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export const metadata: Metadata = {
  title: 'Fonctionnalités',
  description:
    'Découvrez toutes les fonctionnalités de Kamforms : génération IA de formulaires, notifications WhatsApp instantanées, import Google Forms, formulaires multi-étapes, self-hosting et plus.',
  keywords: [
    'fonctionnalités formulaire WhatsApp',
    'génération IA formulaire',
    'notification WhatsApp formulaire',
    'formulaire multi-étapes',
    'self-hosting formulaire',
    'import Google Forms',
    'collecte structurée WhatsApp',
  ],
  alternates: {
    canonical: `${APP_URL}/fonctionnalites`,
    languages: {
      'fr-FR': `${APP_URL}/fonctionnalites`,
      'en': `${APP_URL}/en/fonctionnalites`,
    },
  },
  openGraph: {
    title: 'Fonctionnalités — Kamforms',
    description:
      'Génération IA, notifications WhatsApp, multi-étapes, self-hosting : tout ce dont vous avez besoin pour collecter des réponses structurées depuis WhatsApp.',
    url: `${APP_URL}/fonctionnalites`,
    locale: 'fr_FR',
    siteName: 'Kamforms',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Fonctionnalités Kamforms' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fonctionnalités — Kamforms',
    description:
      'Génération IA, notifications WhatsApp, multi-étapes, self-hosting : tout ce dont vous avez besoin pour collecter des réponses structurées depuis WhatsApp.',
    images: ['/opengraph-image'],
    creator: '@kamtech',
  },
}

const features = [
  {
    icon: Zap,
    title: 'Génération IA de formulaires',
    body: 'Décrivez votre besoin en une phrase. L\'intelligence artificielle génère automatiquement un formulaire complet avec champs, validation, logique conditionnelle et ordre optimal.',
    items: [
      'Reconnaissance du type de champ (texte, email, nombre, sélecteur, date)',
      'Validation automatique des données (format email, téléphone requis)',
      'Logique conditionnelle (afficher/cacher des champs selon les réponses)',
      'Optimisation mobile intégrée',
      'Suggestions adaptées à votre secteur d\'activité',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Notifications WhatsApp instantanées',
    body: 'Recevez chaque réponse de formulaire directement sur votre WhatsApp en moins de 5 secondes. Plus besoin de vérifier vos emails toutes les heures.',
    items: [
      'Notification en moins de 5 secondes après soumission',
      'Messages formatés avec le libellé et la réponse',
      'Trois modes : chaque réponse, première seulement, ou par paliers',
      'Numéro WhatsApp du propriétaire jamais visible par les répondants',
      'Double notification WhatsApp + email possible',
    ],
  },
  {
    icon: Upload,
    title: 'Import Google Forms',
    body: 'Migrez vos formulaires Google Forms existants en quelques clics. Toutes vos questions, options et logique conditionnelle sont transférées automatiquement.',
    items: [
      'Import en un clic depuis Google Forms',
      'Transfert automatique des questions et types de champ',
      'Conservation de la logique conditionnelle',
      'Aucune perte de données',
      'Prêt à l\'emploi en moins d\'une minute',
    ],
  },
  {
    icon: Layers,
    title: 'Formulaires multi-étapes',
    body: 'Augmentez votre taux de complétion jusqu\'à 40 % avec le format multi-étapes. Une question à la fois, barre de progression, auto-avancement et navigation clavier.',
    items: [
      'Taux de complétion jusqu\'à 40 % supérieur',
      'Barre de progression visible pour motiver le répondant',
      'Navigation au clavier (Entrée pour passer à la suite)',
      'Auto-avancement pour les questions à choix unique',
      'Design conversationnel type Tally / Typeform',
    ],
  },
  {
    icon: Palette,
    title: 'Personnalisation visuelle',
    body: 'Adaptez l\'apparence de vos formulaires à votre identité visuelle. Couleur d\'accentuation, bannière, thème clair ou sombre.',
    items: [
      'Couleur d\'accentuation personnalisable',
      'Bannière de formulaire',
      'Mode clair et mode sombre',
      'Aspect professionnel sans compétence en design',
    ],
  },
  {
    icon: Users,
    title: 'Accès collaborateurs',
    body: 'Invitez votre équipe ou vos partenaires à accéder aux réponses. Jusqu\'à 20 collaborateurs selon votre plan.',
    items: [
      'Invitation par email en un clic',
      'Rôles et permissions configurables',
      'Jusqu\'à 20 collaborateurs (plan Business)',
      'Chacun voit les réponses selon ses droits',
    ],
  },
  {
    icon: Shield,
    title: 'Self-hosting disponible',
    body: 'Hébergez Kamforms sur votre propre infrastructure pour un contrôle total de vos données. Idéal pour les entreprises soucieuses de souveraineté numérique.',
    items: [
      'Données 100 % sous votre contrôle',
      'Installation sur votre infrastructure',
      'Pas de dépendance serveur externe',
      'Support technique inclus',
    ],
  },
  {
    icon: BarChart3,
    title: 'Analytique des réponses',
    body: 'Suivez les performances de vos formulaires avec des statistiques détaillées : taux de complétion, vues, réponses par jour, export CSV.',
    items: [
      'Taux de complétion en temps réel',
      'Nombre de vues et de réponses',
      'Évolution quotidienne',
      'Export CSV des réponses',
      'Analyse des abandons par étape (multi-étapes)',
    ],
  },
]

export default function FonctionnalitesPage() {
  return (
    <PublicPageShell>
      {/* Hero */}
      <section className="py-20 md:py-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4">
            Tout ce dont vous avez besoin
          </p>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] text-balance mb-6">
            Des fonctionnalités conçues pour<br />
            <span className="text-muted-foreground">collecter sans effort.</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8">
            De la génération IA à l&apos;analytique avancée, chaque fonctionnalité est pensée pour vous faire gagner du temps et structurer vos données.
          </p>
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }))}>
            Essayer gratuitement <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Features grid */}
      <section className="pb-24 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, i) => (
            <div key={i} className="border border-border rounded-[18px] p-6 md:p-8 bg-card hover:border-foreground/20 transition-colors duration-300">
              <div className="w-10 h-10 rounded-[10px] border border-border bg-muted/40 flex items-center justify-center mb-4">
                <feat.icon size={18} className="text-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-3">{feat.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{feat.body}</p>
              {feat.items?.length ? (
                <div className="flex flex-col gap-2">
                  {feat.items.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-[0.8rem] text-muted-foreground leading-snug">
                      <Check size={12} className="mt-0.5 shrink-0 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.1] text-balance mb-4">
            Prêt à structurer votre collecte ?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Créez votre premier formulaire en 30 secondes, sans carte bancaire.
          </p>
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }))}>
            Commencer gratuitement <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>
    </PublicPageShell>
  )
}
