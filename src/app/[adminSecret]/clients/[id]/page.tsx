import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, FileText, Activity, Gauge } from 'lucide-react'
import { requireHiddenAdminAccess } from '@/lib/admin-access'
import { formatCompactDate, getBillingStatusLabel, getPlanName, getPlanPrice } from '@/lib/admin-dashboard'
import { Button } from '@/components/ui/button'
import {
  PageHeader,
  KpiGrid,
  SectionCard,
  StatusBadge,
} from '../../_components/admin-ui'
import { GrantSubscriptionDialog } from '../../_components/GrantSubscriptionDialog'
import { AdminActions } from '../../_components/AdminActions'

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ adminSecret: string; id: string }>
}) {
  const { adminSecret, id } = await params

  // Vérifier l'accès admin
  await requireHiddenAdminAccess({ adminSecret }).catch(() => notFound())

  // Charger le client
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      plan: true,
      billingStatus: true,
      billingPeriod: true,
      billingPlanId: true,
      billingReference: true,
      planActivatedAt: true,
      planExpiresAt: true,
      createdAt: true,
      _count: { select: { forms: true, usageEvents: true } },
      forms: {
        select: {
          id: true,
          title: true,
          slug: true,
          active: true,
          createdAt: true,
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) notFound()

  const totalSubmissions = user.forms.reduce((sum, f) => sum + f._count.submissions, 0)
  const activeForms = user.forms.filter(f => f.active).length

  return (
    <div className="space-y-5">
      {/* Bouton retour */}
      <Link
        href={`/${adminSecret}/clients`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Retour aux clients
      </Link>

      {/* En-tête client */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Fiche client
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{user.id}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {getPlanName(user.plan)}
              </span>
              <span><StatusBadge status={getBillingStatusLabel(user.billingStatus)} /></span>
              {user.billingPeriod && (
                <span>{user.billingPeriod === 'manual' ? 'Attribution manuelle' : user.billingPeriod}</span>
              )}
              <span>Inscrit le {formatCompactDate(user.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <GrantSubscriptionDialog
              adminSecret={adminSecret}
              prefillUserId={user.id}
            >
              <Button variant="default" size="sm">
                Offrir un abonnement
              </Button>
            </GrantSubscriptionDialog>
            <AdminActions
              adminSecret={adminSecret}
              userId={user.id}
              currentPlan={user.plan}
              currentStatus={user.billingStatus}
            />
          </div>
        </div>

        {/* Infos abonnement */}
        <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">Plan</div>
            <div className="mt-0.5 text-sm font-medium">{getPlanName(user.plan)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Offre</div>
            <div className="mt-0.5 text-sm font-medium">
              {user.billingPlanId ? getPlanPrice(user.billingPlanId) : '-'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Référence</div>
            <div className="mt-0.5 font-mono text-xs text-muted-foreground">
              {user.billingReference ?? '-'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Activation</div>
            <div className="mt-0.5 text-sm font-medium">
              {formatCompactDate(user.planActivatedAt)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Expiration</div>
            <div className="mt-0.5 text-sm font-medium">
              {formatCompactDate(user.planExpiresAt)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Période</div>
            <div className="mt-0.5 text-sm font-medium">
              {user.billingPeriod === 'manual' ? 'Attribution manuelle' : user.billingPeriod ?? '-'}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <KpiGrid
        items={[
          {
            label: 'Formulaires',
            value: user._count.forms,
            helper: `${activeForms} actifs`,
            icon: FileText,
          },
          {
            label: 'Soumissions',
            value: totalSubmissions,
            helper: 'Toutes périodes',
            icon: Activity,
          },
          {
            label: 'Events usage',
            value: user._count.usageEvents,
            helper: 'Notifications et logs',
            icon: Gauge,
          },
        ]}
      />

      {/* Formulaires du client */}
      <SectionCard
        title="Formulaires"
        description={`${user.forms.length} formulaire(s)`}
      >
        {user.forms.length > 0 ? (
          <div className="space-y-2">
            {user.forms.map(form => (
              <div
                key={form.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{form.title}</span>
                    <StatusBadge status={form.active ? 'Actif' : 'Inactif'} />
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {form._count.submissions} réponse(s) · Créé le {formatCompactDate(form.createdAt)}
                  </div>
                </div>
                <Link
                  href={`/f/${form.slug}`}
                  target="_blank"
                  className="shrink-0 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Voir →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Ce client n&apos;a pas encore créé de formulaire.
          </div>
        )}
      </SectionCard>
    </div>
  )
}
