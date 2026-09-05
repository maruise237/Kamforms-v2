import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500',
  pending: 'bg-amber-400',
  expired: 'bg-red-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-400',
  free: 'bg-blue-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-400',
  danger: 'bg-red-500',
  info: 'bg-blue-400',
}

export function StatusDot({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const normalized = status.toLowerCase()
  const color = statusColors[normalized] ?? 'bg-gray-300'

  return (
    <span
      className={cn(
        'inline-block size-1.5 rounded-full',
        color,
        className,
      )}
      aria-hidden
    />
  )
}
