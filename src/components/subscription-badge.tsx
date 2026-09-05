import { cn } from '@/lib/utils'
import { Crown, Zap } from 'lucide-react'

interface Props {
  plan: string
  status?: string
  className?: string
  size?: 'sm' | 'md'
}

const styles: Record<string, { bg: string; text: string; ring: string; icon: typeof Crown | null }> = {
  free: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    ring: 'ring-border',
    icon: null,
  },
  pro: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    ring: 'ring-purple-200/60 dark:ring-purple-800/40',
    icon: Zap,
  },
  business: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-200/60 dark:ring-amber-700/40',
    icon: Crown,
  },
}

export function SubscriptionBadge({ plan, status, className, size = 'md' }: Props) {
  const s = styles[plan] ?? styles.free
  const Icon = s.icon
  const showStatus = status && status !== plan && status !== 'active'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full ring-1 font-medium leading-none',
        s.bg, s.text, s.ring,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
        className,
      )}
    >
      {Icon && <Icon size={size === 'sm' ? 10 : 11} className="shrink-0" />}
      <span className="capitalize">{plan}</span>
      {showStatus && (
        <>
          <span className="opacity-30 mx-0.5">·</span>
          <span className="opacity-70">{status}</span>
        </>
      )}
    </span>
  )
}
