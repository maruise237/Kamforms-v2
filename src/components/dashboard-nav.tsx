'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Settings, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'Formulaires', icon: FileText, exact: true },
  { href: '/dashboard/reponses', label: 'Réponses', icon: Inbox, exact: false },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings, exact: false },
]

export function DashboardNav({ mode }: { mode: 'sidebar' | 'bottom' }) {
  const pathname = usePathname()

  if (mode === 'sidebar') {
    return (
      <>
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors',
                active
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </>
    )
  }

  return (
    <>
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-8 py-2 transition-colors',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </>
  )
}
