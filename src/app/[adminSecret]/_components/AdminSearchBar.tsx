'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function AdminSearchBar({
  value,
  onChange,
  placeholder = 'Rechercher…',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-full max-w-xs pl-8 pr-3 text-sm"
      />
    </div>
  )
}
