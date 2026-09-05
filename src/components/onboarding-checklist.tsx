'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, ChevronUp, FileText, Smartphone, Share2, Mail, MessageCircle, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'kamforms-onboarding-checklist-completed'

interface Task {
  id: string
  label: string
  icon: typeof FileText
  href?: string
  detect: boolean
  soon?: string
}

interface Props {
  hasForms: boolean
  hasWhatsapp: boolean
  hasEmail: boolean
  hasSubmissions: boolean
  hasCustomizedTheme: boolean
  hasShared?: boolean
}

export function OnboardingChecklist({
  hasForms,
  hasWhatsapp,
  hasEmail,
  hasSubmissions,
  hasCustomizedTheme,
  hasShared = false,
}: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()

  const tasks: Task[] = [
    {
      id: 'create-form',
      label: 'Créer ton premier formulaire',
      icon: FileText,
      href: '/dashboard/forms/new',
      detect: hasForms,
    },
    {
      id: 'customize-theme',
      label: 'Personnaliser l\'apparence',
      icon: Palette,
      href: undefined,
      detect: hasCustomizedTheme,
    },
    {
      id: 'setup-whatsapp',
      label: 'Connecter WhatsApp',
      icon: Smartphone,
      href: '/dashboard/settings',
      detect: hasWhatsapp,
    },
    {
      id: 'share-link',
      label: 'Partager le lien',
      icon: Share2,
      href: '/dashboard',
      detect: hasShared,
    },
    {
      id: 'setup-email',
      label: 'Configurer l\'email',
      icon: Mail,
      href: '/dashboard/settings',
      detect: hasEmail,
    },
    {
      id: 'get-submission',
      label: 'Recevoir ta première réponse',
      icon: MessageCircle,
      href: undefined,
      detect: hasSubmissions,
    },
  ]

  const completedCount = tasks.filter(t => t.detect).length
  const isComplete = completedCount >= tasks.length
  const progressPct = Math.round((completedCount / tasks.length) * 100)

  useEffect(() => {
    if (isComplete) {
      const t = setTimeout(() => setDismissed(true), 4000)
      return () => clearTimeout(t)
    }
  }, [isComplete])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true' || isComplete) setDismissed(true)
  }, [isComplete])

  if (dismissed) return null

  return (
    <div className={cn(
      'rounded-lg border border-border bg-card overflow-hidden transition-all duration-300',
      collapsed ? 'max-h-12' : 'max-h-[500px]',
    )}>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-4 h-4 shrink-0">
            <svg className="w-4 h-4 -rotate-90" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-border" />
              <circle
                cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 6.5}`}
                strokeDashoffset={`${2 * Math.PI * 6.5 * (1 - progressPct / 100)}`}
                className="text-foreground transition-all duration-700"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-foreground">
              {completedCount}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground">
              {isComplete ? 'Prêt · Toutes les étapes sont complétées' : 'Démarrage'}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isComplete ? '' : `${completedCount}/${tasks.length} étapes`}
            </p>
          </div>
        </div>
        {collapsed ? <ChevronDown size={13} className="text-muted-foreground shrink-0" /> : <ChevronUp size={13} className="text-muted-foreground shrink-0" />}
      </button>

      {!collapsed && (
        <div className="px-3 pb-3 space-y-0.5">
          {tasks.map((task) => {
            const done = task.detect
            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-all',
                  done ? 'opacity-50' : 'hover:bg-muted/30',
                )}
              >
                <div className={cn(
                  'w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all',
                  done
                    ? 'bg-foreground border-foreground text-background'
                    : 'border-muted-foreground/30',
                )}>
                  {done && <Check size={8} strokeWidth={3} />}
                </div>
                <task.icon size={12} className={cn(
                  'shrink-0',
                  done ? 'text-muted-foreground' : 'text-foreground/60',
                )} />
                <span className={cn(
                  'text-xs',
                  done ? 'text-muted-foreground line-through' : 'text-foreground',
                )}>
                  {task.label}
                </span>
                {!done && task.href && (
                  <Button
                    variant="outline"
                    size="xs"
                    className="ml-auto shrink-0"
                    onClick={() => router.push(task.href!)}
                  >
                    {task.id === 'create-form' ? 'Créer' : task.id === 'share-link' ? 'Partager' : 'Configurer'}
                  </Button>
                )}
              </div>
            )
          })}

          {isComplete && (
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(STORAGE_KEY, 'true')
                setDismissed(true)
              }}
              className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors pt-1.5 pb-0.5"
            >
              Masquer
            </button>
          )}
        </div>
      )}
    </div>
  )
}
