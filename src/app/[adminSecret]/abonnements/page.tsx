import { TableCell, TableRow } from '@/components/ui/table'
import { CreditCard, Users } from 'lucide-react'
import {
  formatCompactDate,
  getAdminSubscriptions,
  getBillingStatusLabel,
  getPlanName,
  getPlanPrice,
} from '@/lib/admin-dashboard'
import { AdminTable, PageHeader, StatusBadge } from '../_components/admin-ui'

export const dynamic = 'force-dynamic'

export default async function AdminSubscriptionsPage() {
  const subscriptions = await getAdminSubscriptions()

  // Stats
  const activeCount = subscriptions.filter(s => s.billingStatus === 'active').length
  const pendingCount = subscriptions.filter(s => s.billingStatus === 'pending').length
  const expiredCount = subscriptions.filter(s => s.billingStatus === 'expired' || s.billingStatus === 'failed').length

  return (
    <div>
      <PageHeader
        eyebrow="Abonnements"
        title="Facturation et activation"
        description="Suivi des plans payants, références GeniusPay, échéances et paiements en attente."
      />

      {/* Barre de stats */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <Users className="size-4 text-muted-foreground" />
          <span className="font-medium">{activeCount}</span>
          <span className="text-muted-foreground">actifs</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <CreditCard className="size-4 text-amber-500" />
          <span className="font-medium">{pendingCount}</span>
          <span className="text-muted-foreground">en attente</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <CreditCard className="size-4 text-red-500" />
          <span className="font-medium">{expiredCount}</span>
          <span className="text-muted-foreground">expirés/échecs</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-2">
        <AdminTable
          heads={['Client', 'Plan', 'Offre', 'Statut', 'Référence', 'Activation', 'Expiration']}
          rows={subscriptions.map(subscription => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">{subscription.id}</TableCell>
              <TableCell>{getPlanName(subscription.plan)}</TableCell>
              <TableCell>{getPlanPrice(subscription.billingPlanId)}</TableCell>
              <TableCell><StatusBadge status={getBillingStatusLabel(subscription.billingStatus)} /></TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {subscription.billingReference ?? '-'}
              </TableCell>
              <TableCell>{formatCompactDate(subscription.planActivatedAt)}</TableCell>
              <TableCell>{formatCompactDate(subscription.planExpiresAt)}</TableCell>
            </TableRow>
          ))}
        />
      </div>
    </div>
  )
}
