import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, MessageSquare, Zap, Shield, Smartphone, ChevronDown } from 'lucide-react'
import { COUNTRIES, getCountryCanonical } from '@/lib/pays-data'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PublicPageShell } from '@/components/public-page-shell'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export async function generateStaticParams() {
  return COUNTRIES.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const country = COUNTRIES.find(c => c.slug === slug)
  if (!country) return { title: 'Page introuvable' }
  const canonical = getCountryCanonical(slug)
  return {
    title: country.metaTitle,
    description: country.metaDesc,
    alternates: { canonical },
    openGraph: {
      title: country.metaTitle,
      description: country.metaDesc,
      url: canonical,
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Kamforms',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: country.h1 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: country.metaTitle,
      description: country.metaDesc,
      images: ['/opengraph-image'],
      creator: '@kamtech',
    },
  }
}

const iconMap = [Zap, MessageSquare, Smartphone, Shield]

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const country = COUNTRIES.find(c => c.slug === slug)
  if (!country) notFound()

  const canonical = getCountryCanonical(slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: APP_URL },
          { '@type': 'ListItem', position: 2, name: `Formulaire WhatsApp ${country.nom}`, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: country.faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.r },
        })),
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Kamforms',
        url: APP_URL,
        description: country.metaDesc,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        inLanguage: 'fr-FR',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    ],
  }

  return (
    <PublicPageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="py-20 md:py-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4">
            Formulaire WhatsApp {country.nom}
          </p>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] text-balance mb-6">
            {country.h1}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            {country.intro}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }))}>
              Créer mon formulaire gratuit <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link href="/fonctionnalites" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
              Voir les fonctionnalités
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Gratuit pour commencer · Paiements {country.mobileMoney.slice(0, 2).join(' et ')}
          </p>
        </div>
      </section>

      <section className="pb-24 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4 text-center">
            Fonctionnalités
          </p>
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.1] text-balance mb-8 text-center">
            Tout ce dont vous avez besoin pour <span className="text-muted-foreground">collecter au {country.nom}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {country.features.map((feat, i) => {
              const Icon = iconMap[i % iconMap.length]
              return (
                <div key={i} className="border border-border rounded-[18px] p-6 md:p-8 bg-card hover:border-foreground/20 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-[10px] border border-border bg-muted/40 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="pb-24 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4 text-center">
            Paiements Mobile Money
          </p>
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.1] text-balance mb-6 text-center">
            Acceptez les paiements <span className="text-muted-foreground">via {country.mobileMoney.join(', ')}</span>
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mb-8">
            Intégrez les paiements mobile directement dans vos formulaires. {country.nom === "C\u00f4te d'Ivoire" ? 'Orange Money et MTN Mobile Money' : country.mobileMoney.slice(0, 2).join(' et ')} sont supportés nativement.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {country.mobileMoney.map(m => (
              <span key={m} className="rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-medium text-foreground">{m}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4 text-center">FAQ</p>
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.1] text-balance mb-8 text-center">
            Questions fréquentes sur <span className="text-muted-foreground">les formulaires WhatsApp au {country.nom}</span>
          </h2>
          <div className="space-y-4">
            {country.faqs.map((faq, i) => (
              <details key={i} className="group border border-border rounded-[14px] p-5 open:bg-muted/20 transition-colors">
                <summary className="text-sm font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronDown size={16} className="text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{faq.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.1] text-balance mb-4">
            Prêt à structurer votre collecte <span className="text-muted-foreground">au {country.nom} ?</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Créez votre premier formulaire en 30 secondes. Gratuit, sans carte bancaire.
          </p>
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }))}>
            Créer mon formulaire gratuit <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>
    </PublicPageShell>
  )
}


