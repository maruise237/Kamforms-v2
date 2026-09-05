'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CreditCard,
  FileText,
  Gauge,
  LayoutDashboard,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { GrantSubscriptionDialog } from './GrantSubscriptionDialog'
import { StatusDot } from './StatusDot'

const NAV_ITEMS = [
  { href: '', label: 'Vue générale', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/abonnements', label: 'Abonnements', icon: CreditCard },
  { href: '/formulaires', label: 'Formulaires', icon: FileText },
  { href: '/usage', label: 'Usage', icon: Gauge },
]

export function AdminShell({
  basePath,
  adminEmail,
  children,
}: {
  basePath: string
  adminEmail: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const secret = basePath.replace(/^\//, '')

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header sticky ─────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  <StatusDot status="success" className="mr-1" />
                  Interne
                </Badge>
                <span className="text-xs text-muted-foreground">Kamforms Control Room</span>
              </div>
              <h1 className="mt-1 text-xl font-semibold tracking-tight lg:text-2xl">
                Dashboard admin
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GrantSubscriptionDialog adminSecret={secret} />
            <div className="hidden text-right text-xs text-muted-foreground sm:block">
              <div className="text-sm font-medium text-foreground">{adminEmail}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body : sidebar + contenu ──────────────────── */}
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] lg:px-6">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <nav className="grid gap-1 rounded-xl border border-border bg-card p-2">
            {NAV_ITEMS.map(item => {
              const href = `${basePath}${item.href}`
              const active = href === pathname

              return (
                <AdminNavLink
                  key={item.label}
                  href={href}
                  label={item.label}
                  icon={item.icon}
                  active={active}
                />
              )
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}

function AdminNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-accent font-medium text-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className={cn('size-4', active && 'text-foreground')} />
      {label}
    </Link>
  )
}
