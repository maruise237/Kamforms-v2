'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Copy, ExternalLink, CopyPlus, Trash2, MoreHorizontal, Loader2, Share2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FormCardProps {
  form: {
    id: string
    title: string
    slug: string
    active: boolean
    _count: { submissions: number }
    createdAt: string
  }
  onDeleted: (id: string) => void
  onToggled: (id: string, active: boolean) => void
}

export function FormCard({ form, onDeleted, onToggled }: FormCardProps) {
  const router = useRouter()
  const [copied, setCopied]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [cloning, setCloning]   = useState(false)

  const publicLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/f/${form.slug}`

  function copyLink(e: React.MouseEvent) {
    e.preventDefault()
    navigator.clipboard.writeText(publicLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: form.title,
          text: `Réponds à mon formulaire : ${form.title}`,
          url: publicLink,
        })
      } catch { /* user canceled */ }
    } else {
      copyLink(e)
      toast.success('Lien copié !')
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/forms/${form.id}`, { method: 'DELETE' })
    if (!res.ok) { setDeleting(false); toast.error('Erreur lors de la suppression.'); return }
    toast.success('Formulaire supprimé.')
    onDeleted(form.id)
  }

  async function handleClone() {
    setCloning(true)
    const res = await fetch(`/api/forms/${form.id}/clone`, { method: 'POST' })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setCloning(false)
      toast.error(data?.error ?? 'Erreur lors de la duplication.')
      return
    }
    const clone = await res.json()
    setCloning(false)
    toast.success('Formulaire dupliqué.')
    router.push(`/dashboard/forms/${clone.id}`)
  }

  async function handleToggle() {
    setToggling(true)
    const res = await fetch(`/api/forms/${form.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !form.active }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setToggling(false)
      toast.error(data?.error ?? 'Erreur lors du changement de statut.')
      return
    }
    const updated = await res.json()
    setToggling(false)
    toast.success(updated.active ? 'Formulaire activé.' : 'Formulaire désactivé.')
    onToggled(form.id, updated.active)
  }

  return (
    <div className={cn(
      'bg-card border border-border rounded-lg px-3 py-2.5 md:px-4 md:py-3 flex items-center gap-3',
      'hover:border-foreground/20 transition-colors',
      deleting && 'opacity-50 pointer-events-none'
    )}>
      {/* Info */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/dashboard/forms/${form.id}`}
          className="font-medium text-[13.5px] text-foreground hover:underline block truncate"
        >
          {form.title}
        </Link>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Link
            href={`/dashboard/forms/${form.id}/submissions`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {form._count.submissions} réponse{form._count.submissions !== 1 ? 's' : ''}
          </Link>

          <button
            onClick={handleToggle}
            disabled={toggling}
            title="Activer / désactiver"
            className={cn(
              'inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer transition-all',
              form.active
                ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
              toggling && 'opacity-60'
            )}
          >
            <span className={cn(
              'w-[5px] h-[5px] rounded-full shrink-0',
              form.active ? 'bg-green-500 dark:bg-green-400' : 'bg-muted-foreground/40'
            )} />
            {form.active ? 'Actif' : 'Inactif'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0 shrink-0" onClick={e => e.preventDefault()}>
        {/* Share — mobile uses Web Share API */}
        <button
          onClick={handleShare}
          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors md:hidden"
          title="Partager"
          aria-label="Partager le formulaire"
        >
          <Share2 size={14} />
        </button>

        {/* Copy link — primary quick action */}
        <button
          onClick={copyLink}
          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors"
          title="Copier le lien public"
          aria-label="Copier le lien public"
        >
          {copied ? <Check size={14} className="text-foreground" /> : <Copy size={14} />}
        </button>

        {/* Overflow menu — secondary actions */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Actions du formulaire"
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors bg-transparent border-0 cursor-pointer"
          >
            {cloning || deleting
              ? <Loader2 size={14} className="animate-spin" />
              : <MoreHorizontal size={14} />}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => window.open(publicLink, '_blank')} className="flex items-center gap-2 cursor-pointer">
              <ExternalLink size={13} />
              Ouvrir le formulaire
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleClone} className="flex items-center gap-2 cursor-pointer">
              <CopyPlus size={13} />
              Dupliquer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 size={13} />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
