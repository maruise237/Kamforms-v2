import Link from 'next/link'
import { TableCell, TableRow } from '@/components/ui/table'
import { Copy, ExternalLink } from 'lucide-react'
import { formatCompactDate, getAdminForms, getBillingStatusLabel, getPlanName } from '@/lib/admin-dashboard'
import { AdminTable, PageHeader, StatusBadge } from '../_components/admin-ui'

export const dynamic = 'force-dynamic'

export default async function AdminFormsPage() {
  const forms = await getAdminForms()

  return (
    <div>
      <PageHeader
        eyebrow="Formulaires"
        title="Production client"
        description="Vue lecture seule sur les formulaires actifs, notifications, propriétaires et volumes de réponses."
      />
      <div className="rounded-xl border border-border bg-card p-2">
        <AdminTable
          heads={['Formulaire', 'Lien', 'Client', 'Plan', 'Client statut', 'État', 'Notifications', 'Réponses', 'Créé', 'Modifié']}
          rows={forms.map(form => (
            <TableRow key={form.id}>
              <TableCell className="font-medium">
                <div className="truncate max-w-48">{form.title}</div>
              </TableCell>
              <TableCell>
                <Link
                  href={`/f/${form.slug}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  target="_blank"
                >
                  /f/{form.slug}
                  <ExternalLink className="size-3" />
                </Link>
              </TableCell>
              <TableCell>{form.user.id}</TableCell>
              <TableCell>
                <StatusBadge status={getPlanName(form.user.plan)} />
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {getBillingStatusLabel(form.user.billingStatus)}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={form.active ? 'Actif' : 'Inactif'} />
              </TableCell>
              <TableCell className="text-xs">
                {form.notificationsEnabled ? form.notificationMode : 'Coupées'}
              </TableCell>
              <TableCell>{form._count.submissions}</TableCell>
              <TableCell>{formatCompactDate(form.createdAt)}</TableCell>
              <TableCell>{formatCompactDate(form.updatedAt)}</TableCell>
            </TableRow>
          ))}
        />
      </div>
    </div>
  )
}
