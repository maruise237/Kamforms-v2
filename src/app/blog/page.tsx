import type { Metadata } from 'next'
import Link from 'next/link'
import { ARTICLES } from '@/lib/blog/articles'
import { Calendar, Clock } from 'lucide-react'
import { PublicPageShell } from '@/components/public-page-shell'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export const metadata: Metadata = {
  title: 'Blog Kamforms — Formulaires, WhatsApp & IA',
  description: 'Découvrez nos articles sur la création de formulaires en ligne, les notifications WhatsApp, la génération par IA et les bonnes pratiques pour collecter des données en Afrique.',
  alternates: {
    canonical: `${APP_URL}/blog`,
    languages: {
      'fr-FR': `${APP_URL}/blog`,
      'en': `${APP_URL}/en/blog`,
    },
  },
  openGraph: {
    title: 'Blog Kamforms — Formulaires, WhatsApp & IA',
    description: 'Astuces et guides pour créer des formulaires intelligents avec notifications WhatsApp.',
    url: `${APP_URL}/blog`,
    locale: 'fr_FR',
    siteName: 'Kamforms',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Blog Kamforms - Formulaires, WhatsApp & IA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Kamforms — Formulaires, WhatsApp & IA',
    description: 'Astuces et guides pour créer des formulaires intelligents avec notifications WhatsApp.',
    images: ['/opengraph-image'],
    creator: '@kamtech',
  },
}

export default function BlogPage() {
  return (
    <PublicPageShell>
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-12">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Accueil
          </Link>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Le blog Kamforms</h1>
        <p className="text-muted-foreground mb-12 max-w-xl">
          Guides, astuces et bonnes pratiques pour créer des formulaires intelligents et recevoir les réponses sur WhatsApp.
        </p>

        <div className="space-y-8">
          {ARTICLES.map((article) => (
            <article key={article.slug} className="border-b border-border pb-8 last:border-0">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1"><Calendar size={12} />{new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Clock size={12} />{article.readingTime}</span>
                <span className="text-foreground/20">·</span>
                <span>{article.author}</span>
              </div>
              <Link href={`/blog/${article.slug}`} className="group">
                <h2 className="text-xl font-semibold text-foreground group-hover:text-foreground/70 transition-colors mb-1.5">
                  {article.title}
                </h2>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{article.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {article.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </PublicPageShell>
  )
}
