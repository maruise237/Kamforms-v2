import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronRight, Inbox } from 'lucide-react'

export default async function ReponsesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const forms = await prisma.form.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      slug: true,
      active: true,
      createdAt: true,
      _count: { select: { submissions: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const totalResponses = forms.reduce((sum, f) => sum + f._count.submissions, 0)

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-heading font-bold text-foreground tracking-tight">Réponses</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {totalResponses} réponse{totalResponses !== 1 ? 's' : ''} · {forms.length} formulaire{forms.length !== 1 ? 's' : ''}
        </p>
      </div>

      {forms.length === 0 ? (
        <div className="rounded-xl bg-card ring-1 ring-border/40 p-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3">
            <Inbox size={18} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Aucun formulaire</p>
          <p className="text-xs text-muted-foreground">
            Crée d&apos;abord un formulaire pour voir les réponses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((f, i) => (
            <Link
              key={f.id}
              href={`/dashboard/forms/${f.id}/submissions?from=reponses`}
              className="group relative block rounded-xl bg-card ring-1 ring-border/40
                         hover:ring-border/80 hover:shadow-sm hover:-translate-y-0.5
                         transition-all duration-200 overflow-hidden"
            >
              {/* Accent top bar */}
              <div className={`absolute inset-x-0 top-0 h-0.5 ${
                f.active ? 'bg-emerald-500/60' : 'bg-muted-foreground/20'
              }`} />

              <div className="p-5 flex flex-col gap-4">
                {/* Header: icon + status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0
                                  group-hover:bg-accent/80 transition-colors">
                      <Inbox size={16} className="text-foreground/70" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate
                                     group-hover:text-foreground/80 transition-colors">
                        {f.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Créé le {new Intl.DateTimeFormat('fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }).format(f.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                    f.active ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-muted-foreground/30'
                  }`} title={f.active ? 'Actif' : 'Inactif'} />
                </div>

                {/* Response count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground tabular-nums tracking-tight leading-none">
                      {f._count.submissions}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      réponse{f._count.submissions !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground
                                   group-hover:text-foreground transition-colors">
                    Voir
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
