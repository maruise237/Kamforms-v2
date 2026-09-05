'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Ban, Clock, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export function AdminActions({
  adminSecret,
  userId,
  currentPlan,
  currentStatus,
}: {
  adminSecret: string
  userId: string
  currentPlan: string
  currentStatus: string
}) {
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [extendOpen, setExtendOpen] = useState(false)
  const [extendDays, setExtendDays] = useState(30)
  const [suspendOpen, setSuspendOpen] = useState(false)

  async function handleAction(action: string, body: Record<string, unknown> = {}) {
    setActionLoading(action)
    try {
      const res = await fetch(
        `/api/admin/assign-subscription?adminSecret=${adminSecret}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, userId, ...body }),
        },
      )
      const data = await res.json()
      if (res.ok) {
        toast.success('Action effectuée avec succès')
        setExtendOpen(false)
        setSuspendOpen(false)
        router.refresh()
      } else {
        toast.error(data.error ?? 'Erreur')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setActionLoading(null)
    }
  }

  const isActive = currentStatus === 'active' && (currentPlan === 'pro' || currentPlan === 'business')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 h-8 gap-1.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      >
        <MoreHorizontal className="size-3.5" />
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Prolonger */}
        <DropdownMenuItem onSelect={() => setExtendOpen(true)}>
          <Clock className="size-3.5" />
          Prolonger abonnement
        </DropdownMenuItem>

        {/* Forcer sync */}
        <DropdownMenuItem
          onSelect={() => handleAction('sync')}
          disabled={actionLoading === 'sync'}
        >
          {actionLoading === 'sync' ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Forcer sync paiement
        </DropdownMenuItem>

        {/* Suspendre */}
        {isActive && (
          <DropdownMenuItem
            onSelect={() => setSuspendOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="size-3.5" />
            Suspendre le compte
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>

      {/* Dialog Prolonger */}
      <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Prolonger abonnement</DialogTitle>
            <DialogDescription>
              Ajouter des jours à l&apos;abonnement actuel de cet utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="extend-days">Nombre de jours</Label>
            <Input
              id="extend-days"
              type="number"
              min={1}
              max={365}
              value={extendDays}
              onChange={e => setExtendDays(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => handleAction('extend', { extraDays: extendDays })}
              disabled={actionLoading === 'extend'}
            >
              {actionLoading === 'extend' ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : null}
              Prolonger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Suspendre */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Suspendre le compte</DialogTitle>
            <DialogDescription>
              Cette action désactivera l&apos;abonnement et tous les formulaires
              actifs de l&apos;utilisateur.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir suspendre <strong>{userId}</strong> ?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction('suspend')}
              disabled={actionLoading === 'suspend'}
            >
              {actionLoading === 'suspend' ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : null}
              Suspendre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}
