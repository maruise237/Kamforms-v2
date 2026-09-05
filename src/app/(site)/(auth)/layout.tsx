import Link from 'next/link'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft, Check } from 'lucide-react'

const FEATURES = [
  'Formulaire généré par IA en moins de 30 secondes',
  'Demandes clients envoyées sur WhatsApp',
  'Analytique incluse sur tous les tarifs',
  'Import automatique depuis Google Forms',
  'Self-hosting disponible pour les grandes équipes',
]

const TESTIMONIAL = {
  quote: "J'ai remplacé mes formulaires Google en 20 minutes. Le WhatsApp, c'est game-changer.",
  name: 'Sophie M.',
  role: 'Graphiste indépendante',
  initials: 'SM',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[1fr_1fr]">

      {/* Panneau gauche — branding (desktop uniquement) */}
      <div className="hidden lg:flex flex-col border-r border-border bg-foreground px-12 py-10 text-background dark:bg-card dark:text-card-foreground">
        <Link href="/" className="inline-flex items-center gap-2 mb-auto">
          <Logo size={22} />
          <span className="font-semibold tracking-tight">Kamforms</span>
        </Link>

        <div className="flex flex-col justify-center flex-1 max-w-[420px]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-55 mb-4">
            Formulaires clients + WhatsApp
          </p>
          <h1 className="font-heading text-[clamp(1.8rem,2.5vw,2.6rem)] font-extrabold leading-[1.1] tracking-[-0.04em] mb-6">
            Recevez vos demandes clients<br />au bon endroit.
          </h1>
          <p className="text-sm leading-relaxed mb-10 opacity-70">
            Créez ou importez votre formulaire, puis traitez les réponses plus vite avec WhatsApp et l&apos;analytique Kamforms.
          </p>

          <ul className="flex flex-col gap-3 mb-12">
            {FEATURES.map(feat => (
              <li key={feat} className="flex items-start gap-3">
                <span className="mt-0.5 w-4 h-4 rounded-full border border-current/20 flex items-center justify-center shrink-0">
                  <Check size={9} className="opacity-80" />
                </span>
                <span className="text-[13px] leading-snug opacity-75">{feat}</span>
              </li>
            ))}
          </ul>

          <div className="border border-current/10 rounded-2xl p-5 bg-current/[0.04]">
            <p className="text-sm leading-relaxed italic mb-4 opacity-75">
              &laquo;&nbsp;{TESTIMONIAL.quote}&nbsp;&raquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-current/15 flex items-center justify-center text-[11px] font-bold opacity-80 shrink-0">
                {TESTIMONIAL.initials}
              </div>
              <div>
                <p className="text-[13px] font-semibold opacity-90">{TESTIMONIAL.name}</p>
                <p className="text-[11px] opacity-50">{TESTIMONIAL.role}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] opacity-45 mt-auto pt-10">
          © {new Date().getFullYear()} Kamforms · Développé par Kamtech
        </p>
      </div>

      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2">
            <Logo size={20} />
            <span className="font-semibold text-foreground tracking-tight text-sm">Kamforms</span>
          </Link>
          <Link href="/" className="hidden lg:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={13} />
            Retour à l&apos;accueil
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          {children}
        </div>

        <p className="lg:hidden text-center text-[11px] text-muted-foreground/50 px-6 py-4">
          © {new Date().getFullYear()} Kamforms · Développé par Kamtech
        </p>
      </div>

    </div>
  )
}
