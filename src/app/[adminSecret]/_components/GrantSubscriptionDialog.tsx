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
import { Gift, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type PlanOption = 'pro' | 'business'

const PRESET_DAYS = [7, 14, 30, 90]

export function GrantSubscriptionDialog({
  adminSecret,
  prefillUserId,
  children,
}: {
  adminSecret: string
  prefillUserId?: string
  children?: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState(prefillUserId ?? '')
  const [plan, setPlan] = useState<PlanOption>('pro')
  const [days, setDays] = useState<number>(7)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!userId.trim()) {
      toast.error("Veuillez renseigner l'ID utilisateur")
      return
    }
    if (days < 1 || days > 365) {
      toast.error('La durée doit être entre 1 et 365 jours')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(
        `/api/admin/assign-subscription?adminSecret=${adminSecret}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'assign',
            userId: userId.trim(),
            plan,
            days,
            message: message.trim() || undefined,
          }),
        },
      )

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de l'attribution")
        return
      }

      toast.success(
        `Abonnement ${plan === 'pro' ? 'Pro' : 'Business'} attribué pour ${days} jours`,
      )
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (children as React.ReactElement) ?? (
            <Button variant="default" size="sm">
              <Gift className="size-3.5" />
              Attribuer un abonnement
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attribuer un abonnement</DialogTitle>
          <DialogDescription>
            Offrez un accès Pro ou Business à un utilisateur pour une durée
            déterminée.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ID Utilisateur */}
          <div className="space-y-1.5">
            <Label htmlFor="user-id">ID utilisateur</Label>
            <Input
              id="user-id"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="user_2abc123..."
              disabled={!!prefillUserId}
              className="font-mono text-xs"
            />
          </div>

          {/* Plan */}
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={plan === 'pro' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlan('pro')}
                className="flex-1"
              >
                Pro
              </Button>
              <Button
                type="button"
                variant={plan === 'business' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlan('business')}
                className="flex-1"
              >
                Business
              </Button>
            </div>
          </div>

          {/* Durée */}
          <div className="space-y-1.5">
            <Label htmlFor="days">Durée (jours)</Label>
            <div className="flex gap-2">
              {PRESET_DAYS.map(d => (
                <Button
                  key={d}
                  type="button"
                  variant={days === d ? 'default' : 'outline'}
                  size="xs"
                  onClick={() => setDays(d)}
                  className="flex-1"
                >
                  {d}j
                </Button>
              ))}
            </div>
            <Input
              id="days"
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          {/* Message optionnel */}
          <div className="space-y-1.5">
            <Label htmlFor="message">
              Message (optionnel, envoyé par email)
            </Label>
            <Input
              id="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Je vous offre un essai Pro..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Attribution…
              </>
            ) : (
              'Attribuer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
