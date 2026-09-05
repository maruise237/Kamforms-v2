import { Loader2 } from 'lucide-react'

export default function AbonnementsLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">Chargement des abonnements…</p>
      </div>
    </div>
  )
}
