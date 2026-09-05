import { CreditCard, FileText, Gauge, Timer, Users, AlertTriangle, CheckCircle2, Database } from 'lucide-react'
import {
  adminIcons,
  EmptyState,
  FormattedMrr,
  KpiGrid,
  MetricListItem,
  PageHeader,
  SectionCard,
  StatusBadge,
  UsageBar,
} from './_components/admin-ui'
import {
  formatCompactDate,
  getAdminOverview,
  getBillingStatusLabel,
  getDaysUntil,
  getPlanName,
  getPlanPrice,
} from '@/lib/admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function HiddenAdminPage() {
  const overview = await getAdminOverview()

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Pilotage SaaS"
        title="Vue d'ensemble"
        description="Les signaux fondateurs pour voir qui paie, qui consomme, quels paiements bloquent et quels comptes risquent de basculer au gratuit."
      />

      {/* ── Barre d'alerte système ─────────────────────── */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-3 text-sm">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="size-4" />
          <span className="font-medium">Système OK</span>
        </div>
        <span className="text-muted-foreground">·</span>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Database className="size-3.5" />
          <span>Base de données connectée</span>
        </div>
        <span className="text-muted-foreground">·</span>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="size-3.5" />
          <span>{overview.kpis.usersTotal} utilisateurs</span>
        </div>
      </div>

      {/* ── KPIS ──────────────────────────────────────── */}
      <KpiGrid
        items={[
          {
            label: 'Utilisateurs',
            value: overview.kpis.usersTotal,
            helper: 'Comptes Clerk synchronisés en base',
            icon: adminIcons.users,
          },
          {
            label: 'Payants actifs',
            value: overview.kpis.activePaidUsers,
            helper: 'Pro et Business non expirés',
            icon: adminIcons.paid,
            trend: overview.kpis.activePaidUsers > 0 ? 'up' : 'neutral',
            trendLabel: overview.kpis.activePaidUsers > 0 ? 'Actifs' : 'Aucun',
          },
          {
            label: 'MRR directionnel',
            value: <FormattedMrr value={overview.kpis.mrr} />,
            helper: 'Annualisé ramené au mois',
            icon: CreditCard,
          },
          {
            label: 'Formulaires actifs',
            value: overview.kpis.activeForms,
            helper: 'Tous comptes confondus',
            icon: FileText,
          },
          {
            label: 'Réponses 7 jours',
            value: overview.kpis.submissions7Days,
            helper: 'Activité formulaire récente',
            icon: Timer,
            trend: overview.kpis.submissions7Days > 10 ? 'up' : overview.kpis.submissions7Days > 0 ? 'neutral' : 'down',
            trendLabel: overview.kpis.submissions7Days > 10 ? 'Élevée' : overview.kpis.submissions7Days > 0 ? 'Modérée' : 'Faible',
          },
          {
            label: 'WhatsApp ce mois',
            value: overview.kpis.whatsappThisMonth,
            helper: 'Notifications consommées',
            icon: Gauge,
          },
        ]}
      />

      {/* ── Alertes ──────────────────────────────────── */}
      {(overview.pendingPayments.length > 0 || overview.expiringSoon.length > 0) && (
        <SectionCard title="Alertes" description="Actions recommandées">
          <div className="space-y-2">
            {overview.pendingPayments.length > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/30">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <div>
                  <span className="font-medium text-amber-800 dark:text-amber-300">
                    {overview.pendingPayments.length} paiement{overview.pendingPayments.length > 1 ? 's' : ''} en attente
                  </span>
                  <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                    Des transactions nécessitent votre vérification dans la section Abonnements.
                  </p>
                </div>
              </div>
            )}
            {overview.expiringSoon.length > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/30">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
                <div>
                  <span className="font-medium text-red-800 dark:text-red-300">
                    {overview.expiringSoon.length} abonnement{overview.expiringSoon.length > 1 ? 's' : ''} expir{overview.expiringSoon.length > 1 ? 'ent' : 'e'} bientôt
                  </span>
                  <p className="mt-0.5 text-red-700 dark:text-red-400">
                    Ces comptes payants expirent sous 30 jours. Pensez à relancer.
                  </p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* ── Paiements / Expirations / Limites ─────────── */}
      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard title="Paiements en attente" description="Transactions à vérifier ou relancer.">
          <div className="space-y-2">
            {overview.pendingPayments.length ? overview.pendingPayments.map(user => (
              <MetricListItem
                key={user.id}
                icon={CreditCard}
                title={user.id}
                description={`${getPlanName(user.plan)} · ${getPlanPrice(user.billingPlanId)} · ref ${user.billingReference ?? 'absente'}`}
                badge={<StatusBadge status={getBillingStatusLabel('pending')} />}
              />
            )) : <EmptyState label="Aucun paiement en attente." icon={CreditCard} />}
          </div>
        </SectionCard>

        <SectionCard title="Expirations proches" description="Comptes payants qui expirent sous 30 jours.">
          <div className="space-y-2">
            {overview.expiringSoon.length ? overview.expiringSoon.map(user => {
              const days = getDaysUntil(user.planExpiresAt)

              return (
                <MetricListItem
                  key={user.id}
                  icon={Timer}
                  title={user.id}
                  description={`${getPlanName(user.plan)} expire le ${formatCompactDate(user.planExpiresAt)}`}
                  badge={<StatusBadge status={days === null ? 'À vérifier' : `${days} jours`} />}
                />
              )
            }) : <EmptyState label="Aucune expiration proche." icon={Timer} />}
          </div>
        </SectionCard>

        <SectionCard title="Comptes proches des limites" description="Usage à surveiller pour upsell ou support.">
          <div className="space-y-4">
            {overview.nearLimits.length ? overview.nearLimits.map(row => (
              <div key={row.id} className="space-y-3 rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-medium">{row.id}</div>
                  <StatusBadge status={getPlanName(row.plan)} />
                </div>
                <UsageBar label="Formulaires" value={row.usage.activeForms} max={row.limits.activeForms} />
                <UsageBar label="WhatsApp" value={row.usage.whatsappNotifications} max={row.limits.whatsappNotifications} />
                <UsageBar label="Collaborateurs" value={row.usage.collaborators} max={row.limits.collaborators} />
              </div>
            )) : <EmptyState label="Aucun compte proche des limites." icon={Gauge} />}
          </div>
        </SectionCard>
      </div>

      {/* ── Activité récente ─────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard title="Nouveaux clients">
          <div className="space-y-2">
            {overview.recentActivity.users.length ? overview.recentActivity.users.map(user => (
              <MetricListItem
                key={user.id}
                icon={Users}
                title={user.id}
                description={`${getPlanName(user.plan)} · ${getBillingStatusLabel(user.billingStatus)} · ${user._count.forms} formulaire(s)`}
              />
            )) : <EmptyState label="Aucun nouveau client récent." icon={Users} />}
          </div>
        </SectionCard>
        <SectionCard title="Formulaires récents">
          <div className="space-y-2">
            {overview.recentActivity.forms.length ? overview.recentActivity.forms.map(form => (
              <MetricListItem
                key={form.id}
                icon={FileText}
                title={form.title}
                description={`${form.user.id} · ${form._count.submissions} réponse(s) · ${form.active ? 'actif' : 'inactif'}`}
              />
            )) : <EmptyState label="Aucun formulaire récent." icon={FileText} />}
          </div>
        </SectionCard>
        <SectionCard title="Réponses récentes">
          <div className="space-y-2">
            {overview.recentActivity.submissions.length ? overview.recentActivity.submissions.map(submission => (
              <MetricListItem
                key={submission.id}
                title={submission.form.title}
                description={`${submission.form.userId} · ${formatCompactDate(submission.createdAt)}`}
              />
            )) : <EmptyState label="Aucune réponse récente." icon={FileText} />}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
