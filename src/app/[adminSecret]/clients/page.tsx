'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { MoreHorizontal, Eye, Gift, ExternalLink, Loader2 } from 'lucide-react'
import { formatCompactDate, getBillingStatusLabel, getPlanName } from '@/lib/admin-display'
import { AdminTable, PageHeader, StatusBadge } from '../_components/admin-ui'
import { AdminSearchBar } from '../_components/AdminSearchBar'
import { ExportCsvButton } from '../_components/ExportCsvButton'
import { GrantSubscriptionDialog } from '../_components/GrantSubscriptionDialog'

interface Client {
  id: string
  plan: string
  billingStatus: string
  billingPeriod: string | null
  billingPlanId: string | null
  planActivatedAt: string | null
  planExpiresAt: string | null
  createdAt: string
  _count: { forms: number; usageEvents: number }
}

export default function AdminClientsPage() {
  const params = useParams()
  const adminSecret = params.adminSecret as string

  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const perPage = 25

  useEffect(() => {
    fetch(`/api/admin/clients?adminSecret=${adminSecret}`)
      .then(res => res.json())
      .then(data => {
        setClients(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [adminSecret])

  const filtered = useMemo(() => {
    return clients.filter(c => {
      if (search) {
        const q = search.toLowerCase()
        if (!c.id.toLowerCase().includes(q)) return false
      }
      if (planFilter !== 'all' && c.plan !== planFilter) return false
      if (statusFilter !== 'all' && c.billingStatus !== statusFilter) return false
      return true
    })
  }, [clients, search, planFilter, statusFilter])

  const paginated = filtered.slice(0, page * perPage)
  const hasMore = paginated.length < filtered.length

  if (loading) {
    return (
      <div>
        <PageHeader
          eyebrow="Clients"
          title="Comptes utilisateurs"
          description="Liste des comptes, statut de facturation et volume de formulaires."
        />
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Chargement…
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Clients"
        title="Comptes utilisateurs"
        description="Lecture rapide des comptes, de leur statut de facturation et du volume de formulaires attachés."
        action={
          <div className="flex items-center gap-2">
            <ExportCsvButton
              data={filtered.map(c => ({
                ID: c.id,
                Plan: getPlanName(c.plan),
                Statut: getBillingStatusLabel(c.billingStatus),
                Période: c.billingPeriod ?? '',
                Formulaires: c._count.forms,
                'Events usage': c._count.usageEvents,
                Inscrit: formatCompactDate(new Date(c.createdAt)),
                Expiration: formatCompactDate(c.planExpiresAt ? new Date(c.planExpiresAt) : null),
              }))}
              filename="clients.csv"
              headers={['ID', 'Plan', 'Statut', 'Période', 'Formulaires', 'Events usage', 'Inscrit', 'Expiration']}
            />
            <GrantSubscriptionDialog adminSecret={adminSecret} />
          </div>
        }
      />

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearchBar
          value={search}
          onChange={v => { setSearch(v); setPage(1) }}
          placeholder="Rechercher par ID utilisateur…"
        />
        <select
          value={planFilter}
          onChange={e => { setPlanFilter(e.target.value); setPage(1) }}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">Tous les plans</option>
          <option value="free">Gratuit</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="pending">En attente</option>
          <option value="expired">Expiré</option>
          <option value="free">Gratuit</option>
        </select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} client{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tableau */}
      <div className="rounded-xl border border-border bg-card p-2">
        <AdminTable
          heads={['Client', 'Plan', 'Statut', 'Période', 'Formulaires', 'Usage events', 'Inscrit le', 'Expiration', 'Actions']}
          rows={paginated.map(client => (
            <ClientRow
              key={client.id}
              client={client}
              adminSecret={adminSecret}
            />
          ))}
        />
      </div>

      {/* Pagination */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>
            Afficher plus ({filtered.length - paginated.length} restants)
          </Button>
        </div>
      )}
    </div>
  )
}

function ClientRow({
  client,
  adminSecret,
}: {
  client: Client
  adminSecret: string
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function handleQuickTrial() {
    setActionLoading('trial')
    try {
      const res = await fetch(
        `/api/admin/assign-subscription?adminSecret=${adminSecret}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'assign',
            userId: client.id,
            plan: 'pro',
            days: 7,
          }),
        },
      )
      if (res.ok) {
        toast.success('Essai Pro 7 jours attribué')
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Erreur')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setActionLoading(null)
    }
  }

  const isFree = client.plan === 'free' || client.billingStatus === 'free'

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link
          href={`/${adminSecret}/clients/${client.id}`}
          className="flex items-center gap-1.5 hover:text-primary hover:underline"
        >
          {client.id}
          <ExternalLink className="size-3 text-muted-foreground" />
        </Link>
      </TableCell>
      <TableCell>{getPlanName(client.plan)}</TableCell>
      <TableCell>
        <StatusBadge status={getBillingStatusLabel(client.billingStatus)} />
      </TableCell>
      <TableCell>{client.billingPeriod ?? '-'}</TableCell>
      <TableCell>{client._count.forms}</TableCell>
      <TableCell>{client._count.usageEvents}</TableCell>
      <TableCell>{formatCompactDate(new Date(client.createdAt))}</TableCell>
      <TableCell>{formatCompactDate(client.planExpiresAt ? new Date(client.planExpiresAt) : null)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {isFree && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleQuickTrial}
              disabled={actionLoading === 'trial'}
              title="Essai Pro 7 jours"
            >
              {actionLoading === 'trial' ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Gift className="size-3" />
              )}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Actions"
              className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors bg-transparent border-0 cursor-pointer"
            >
              <MoreHorizontal className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => window.location.href = `/${adminSecret}/clients/${client.id}`}
              >
                <Eye className="size-3.5" />
                Voir détails
              </DropdownMenuItem>
              <GrantSubscriptionDialog
                adminSecret={adminSecret}
                prefillUserId={client.id}
              >
                <button className="flex w-full items-center gap-2 px-2 py-1.5 text-sm">
                  <Gift className="size-3.5" />
                  Offrir un abonnement
                </button>
              </GrantSubscriptionDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}
