import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/blog(.*)',
  '/fonctionnalites',
  '/contact',
  '/a-propos',
  '/privacy',
  '/terms',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/admin(.*)',
  '/pays(.*)',
  '/etudes-de-cas(.*)',
  '/comparatif(.*)',
  '/alternative-a-google-forms',
  '/tarifs',
  '/f/(.*)',
  '/api/submit/(.*)',
  '/sitemap.xml',
  '/robots.txt',
  '/llms.txt',
  '/google(.*)\\.html',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt)).*)',
    '/(api|trpc)(.*)',
  ],
}
