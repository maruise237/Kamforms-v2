import Link from 'next/link'
import {
  Activity,
  Bell,
  CreditCard,
  FileText,
  Gauge,
  LucideIcon,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatCurrencyFcfa } from '@/lib/admin-display'
import { StatusDot } from './StatusDot'

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function KpiGrid({
  items,
}: {
  items: Array<{
    label: string
    value: React.ReactNode
    helper: string
    icon: LucideIcon
    trend?: 'up' | 'down' | 'neutral'
    trendLabel?: string
  }>
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map(item => (
        <div
          key={item.label}
          className="relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">{item.label}</div>
            <div className="rounded-lg bg-muted p-1.5">
              <item.icon className="size-4 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {item.trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                  item.trend === 'up' && 'bg-emerald-500/10 text-emerald-600',
                  item.trend === 'down' && 'bg-red-500/10 text-red-600',
                  item.trend === 'neutral' && 'bg-muted text-muted-foreground',
                )}
              >
                {item.trend === 'up' && '↑'}
                {item.trend === 'down' && '↓'}
                {item.trend === 'neutral' && '→'}
                {item.trendLabel}
              </span>
            )}
            <span>{item.helper}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

export function EmptyState({
  label,
  icon: Icon,
  action,
}: {
  label: string
  icon?: LucideIcon
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-4 py-10 text-center">
      {Icon && (
        <div className="rounded-full bg-muted p-3">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      )}
      <p className="text-sm text-muted-foreground">{label}</p>
      {action}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const variant =
    normalized === 'actif' || normalized === 'active'
      ? 'default'
      : normalized === 'en attente' || normalized === 'pending'
        ? 'secondary'
        : normalized === 'echec' ||
            normalized === 'failed' ||
            normalized === 'expire' ||
            normalized === 'expired'
          ? 'destructive'
          : 'outline'

  return (
    <span className="inline-flex items-center gap-1.5">
      <StatusDot status={normalized} />
      <Badge variant={variant}>{status}</Badge>
    </span>
  )
}

export function UsageBar({
  value,
  max,
  label,
}: {
  value: number
  max: number
  label: string
}) {
  const ratio = max > 0 ? Math.min(value / max, 1) : value > 0 ? 1 : 0
  const percent = Math.round(ratio * 100)

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            percent >= 100
              ? 'bg-destructive'
              : percent >= 80
                ? 'bg-amber-500'
                : 'bg-primary',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {percent >= 80 && (
        <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-amber-600">
          <span>⚠</span>
          <span>
            {percent >= 100
              ? 'Limite atteinte'
              : 'Presque à la limite'}
          </span>
        </div>
      )}
    </div>
  )
}

export function AdminTable({
  heads,
  rows,
}: {
  heads: string[]
  rows: React.ReactNode[]
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        label="Aucune donnée pour le moment."
        icon={Activity}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {heads.map(head => (
              <TableHead key={head}>{head}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{rows}</TableBody>
      </Table>
    </div>
  )
}

export function MetricListItem({
  icon: Icon = Activity,
  title,
  description,
  badge,
}: {
  icon?: LucideIcon
  title: string
  description: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50">
      <div className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      {badge}
    </div>
  )
}

export const adminIcons = {
  users: Users,
  paid: CreditCard,
  revenue: Bell,
  forms: FileText,
  submissions: Activity,
  usage: Gauge,
}

export function FormattedMrr({ value }: { value: number }) {
  return <>{formatCurrencyFcfa(value)}</>
}
