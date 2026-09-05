import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Linkedin, Github, Twitter } from 'lucide-react'
import { ARTICLES } from '@/lib/blog/articles'
import { PublicPageShell } from '@/components/public-page-shell'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export async function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = ARTICLES.find(a => a.slug === slug)
  if (!article) return { title: 'Article introuvable' }
  const articleUrl = `${APP_URL}/blog/${slug}`
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: articleUrl,
      languages: {
        'fr-FR': articleUrl,
        'en': `${APP_URL}/en/blog/${slug}`,
      },
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: articleUrl,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      locale: 'fr_FR',
      siteName: 'Kamforms',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: ['/opengraph-image'],
      creator: '@kamtech',
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = ARTICLES.find(a => a.slug === slug)
  if (!article) notFound()

  const articleUrl = `${APP_URL}/blog/${slug}`

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${articleUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: APP_URL },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${APP_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: article.title },
        ],
      },
      {
        '@type': 'BlogPosting',
        '@id': `${articleUrl}#article`,
        headline: article.title,
        description: article.description,
        datePublished: article.date,
        dateModified: article.lastModified,
        author: {
          '@type': 'Person',
          name: article.author,
          description: article.authorBio,
          url: `${APP_URL}/a-propos`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Kamtech',
          url: APP_URL,
          logo: `${APP_URL}/icon.svg`,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleUrl,
        },
        image: `${APP_URL}/opengraph-image`,
        keywords: article.tags.join(', '),
        inLanguage: 'fr-FR',
        wordCount: article.body.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length,
      },
      ...(article.faqs?.length
        ? [
          {
            '@type': 'FAQPage',
            '@id': `${articleUrl}#faq`,
            mainEntity: article.faqs.map((f: { q: string; r: string }) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.r },
            })),
          },
        ]
        : []),
    ],
  }

  return (
    <PublicPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} />
          Retour au blog
        </Link>

        <article>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><Calendar size={12} />{new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            {article.lastModified !== article.date && (
              <span className="text-muted-foreground/60">Mis à jour le {new Date(article.lastModified).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            )}
            <span className="flex items-center gap-1"><Clock size={12} />{article.readingTime}</span>
            <span className="text-foreground/20">·</span>
            <span>{article.author}</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap gap-1.5 mb-8">
            {article.tags.map(tag => (
              <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>

          <div
            className="prose prose-sm prose-neutral dark:prose-invert max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        </article>

        {/* Auteur */}
        <div className="mt-12 border border-border rounded-[18px] p-6 bg-muted/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-heading font-bold shrink-0">
              M
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Écrit par {article.author}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{article.authorBio}</p>
              <div className="flex gap-3 mt-2">
                <a href="https://x.com/kamtech" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Twitter size={12} /> @kamtech
                </a>
                <a href="https://github.com/maruise237/kamforms" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Github size={12} /> GitHub
                </a>
                <a href="https://linkedin.com/in/maruise237" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Linkedin size={12} /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation entre articles — liens internes SEO */}
        <nav className="mt-12 border-t border-border pt-8">
          <h2 className="text-sm font-semibold text-foreground mb-4">Lire aussi</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ARTICLES.filter(a => a.slug !== slug).slice(0, 2).map(related => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
              >
                <p className="text-sm font-medium text-foreground group-hover:text-foreground/70 transition-colors">
                  {related.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{related.description}</p>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </PublicPageShell>
  )
}
