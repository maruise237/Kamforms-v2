import { TableCell, TableRow } from '@/components/ui/table'
import { getAdminUsage, getBillingStatusLabel, getPlanName } from '@/lib/admin-dashboard'
import { AdminTable, PageHeader, StatusBadge, UsageBar } from '../_components/admin-ui'

export const dynamic = 'force-dynamic'

export default async function AdminUsagePage() {
  const usageRows = await getAdminUsage()

  // Stats
  const nearLimit = usageRows.filter(r => {
    const formsRatio = r.usage.activeForms / r.limits.activeForms
    const whatsappRatio = r.usage.whatsappNotifications / r.limits.whatsappNotifications
    const collabRatio = r.limits.collaborators
      ? r.usage.collaborators / r.limits.collaborators
      : 0
    return [formsRatio, whatsappRatio, collabRatio].some(ratio => ratio >= 0.8)
  }).length

  return (
    <div>
      <PageHeader
        eyebrow="Consommation"
        title="Limites et usage mensuel"
        description="Contrôle des formulaires actifs, notifications WhatsApp et collaborateurs consommés par compte."
      />

      {/* Indicateur */}
      {nearLimit > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          ⚠ {nearLimit} compte{ nearLimit > 1 ? 's' : ''} proche{ nearLimit > 1 ? 's' : ''} des limites
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-2">
        <AdminTable
          heads={['Client', 'Plan', 'Statut', 'Formulaires', 'WhatsApp', 'Collaborateurs']}
          rows={usageRows.map(row => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.id}</TableCell>
              <TableCell>{getPlanName(row.plan)}</TableCell>
              <TableCell><StatusBadge status={getBillingStatusLabel(row.billingStatus)} /></TableCell>
              <TableCell className="min-w-44">
                <UsageBar label="Actifs" value={row.usage.activeForms} max={row.limits.activeForms} />
              </TableCell>
              <TableCell className="min-w-52">
                <UsageBar label="Mois courant" value={row.usage.whatsappNotifications} max={row.limits.whatsappNotifications} />
              </TableCell>
              <TableCell className="min-w-44">
                <UsageBar label="Assignés" value={row.usage.collaborators} max={row.limits.collaborators} />
              </TableCell>
            </TableRow>
          ))}
        />
      </div>
    </div>
  )
}
