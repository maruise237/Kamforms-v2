import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'

type Props = {
  children: React.ReactNode
}

const NAV_LINKS = [
  { href: '/fonctionnalites', label: 'Fonctionnalit\u00e9s' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/blog', label: 'Blog' },
  { href: '/etudes-de-cas', label: '\u00c9tudes de cas' },
  { href: '/contact', label: 'Contact' },
  { href: '/a-propos', label: '\u00c0 propos' },
]

const FOOTER_LINKS = {
  produit: [
    { href: '/fonctionnalites', label: 'Fonctionnalit\u00e9s' },
    { href: '/tarifs', label: 'Tarifs' },
    { href: '/alternative-a-google-forms', label: 'Alternative Google Forms' },
    { href: '/comparatif', label: 'Comparatifs' },
    { href: '/etudes-de-cas', label: '\u00c9tudes de cas' },
    { href: '/contact', label: 'Contact' },
    { href: '/a-propos', label: '\u00c0 propos' },
    { href: '/#faq', label: 'FAQ' },
    { href: '/blog', label: 'Blog' },
  ],
  pays: [
    { href: '/pays/cote-d-ivoire', label: 'C\u00f4te d\'Ivoire' },
    { href: '/pays/senegal', label: 'S\u00e9n\u00e9gal' },
    { href: '/pays/cameroun', label: 'Cameroun' },
    { href: '/pays/mali', label: 'Mali' },
    { href: '/pays/burkina-faso', label: 'Burkina Faso' },
    { href: '/pays/togo', label: 'Togo' },
    { href: '/pays/benin', label: 'B\u00e9nin' },
    { href: '/pays/niger', label: 'Niger' },
    { href: '/pays/guinee', label: 'Guin\u00e9e' },
    { href: '/pays/rca', label: 'Centrafrique' },
  ],
  compte: [
    { href: '/sign-up', label: 'Créer un compte' },
    { href: '/sign-in', label: 'Connexion' },
    { href: '/contact', label: 'Support' },
  ],
  legal: [
    { href: '/privacy', label: 'Politique de confidentialité' },
    { href: '/terms', label: "Conditions d'utilisation" },
    { href: 'https://kamtech.online', label: 'Kamtech', external: true },
  ],
}

export function PublicPageShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed header */}
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={20} wordmark />
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-xs')}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link href="/sign-in" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-xs')}>
            Connexion
          </Link>
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'sm' }), 'text-xs')}>
            S&apos;inscrire
          </Link>
        </nav>
        {/* Mobile nav — compact */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <Link href="/sign-in" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-xs')}>
            Connexion
          </Link>
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'sm' }), 'text-xs')}>
            S&apos;inscrire
          </Link>
        </div>
      </header>

      {/* Main content — offset for fixed header */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Footer */}
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
              <Link href="/contact" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-xs')}>
                Nous contacter
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-foreground">Produit</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {FOOTER_LINKS.produit.map(link => (
                <Link key={link.href} href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-foreground">Compte</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {FOOTER_LINKS.compte.map(link => (
                <Link key={link.href} href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-foreground">Légal</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {FOOTER_LINKS.legal.map(link => (
                link.external ? (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href} className="hover:text-foreground">
                    {link.label}
                  </Link>
                )
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-foreground">Par pays</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              {FOOTER_LINKS.pays.map(link => (
                <Link key={link.href} href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              ))}
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
