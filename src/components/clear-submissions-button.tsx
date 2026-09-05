'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

interface ClearSubmissionsButtonProps {
  formId: string
  count: number
}

export function ClearSubmissionsButton({ formId, count }: ClearSubmissionsButtonProps) {
  const router = useRouter()
  const [loading, setLoading]   = useState(false)
  const [open, setOpen]         = useState(false)

  if (count === 0) return null

  async function handleClear() {
    setLoading(true)
    await fetch(`/api/forms/${formId}/submissions`, { method: 'DELETE' })
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        {loading ? (
          <Loader2 size={14} className="mr-1.5 animate-spin" />
        ) : (
          <Trash2 size={14} className="mr-1.5" />
        )}
        Vider
      </Button>

      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            Supprimer {count} réponse{count > 1 ? 's' : ''} ?
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Toutes les réponses seront définitivement supprimées.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Annuler
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={loading}
          >
            {loading ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
