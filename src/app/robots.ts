import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/sign-in', '/sign-up', '/f/'],
        disallow: ['/dashboard/', '/api/'],
      },
      // AI crawlers — autorisés à crawler le contenu public (recommendé pour AI Overviews)
      {
        userAgent: 'GPTBot',
        allow: ['/', '/blog/'],
        disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/blog/'],
        disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/blog/'],
        disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/blog/'],
        disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'],
      },
      // Google-Extended = Gemini training (bloquer n'affecte pas le classement Google Search)
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/blog/', '/pays/', '/fonctionnalites', '/a-propos', '/alternative-a-google-forms', '/comparatif/', '/etudes-de-cas/', '/tarifs'],
        disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'],
      },
      {
        userAgent: 'Applebot',
        allow: ['/', '/blog/', '/pays/', '/fonctionnalites', '/a-propos', '/comparatif/'],
        disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'],
      },
      {
        userAgent: 'Amazonbot',
        allow: ['/', '/blog/', '/pays/', '/comparatif/'],
        disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'],
      },
      // AI crawler générique — couvre les crawlers non listés
      {
        userAgent: 'OAI-SearchBot',
        allow: ['/', '/blog/', '/pays/', '/fonctionnalites', '/a-propos', '/alternative-a-google-forms', '/comparatif/', '/etudes-de-cas/', '/tarifs'],
        disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
