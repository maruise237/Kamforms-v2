'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, FileText, Smartphone, Share2, MessageCircle, Users, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TASKS = [
  { id: 'create-form', label: 'Créer ton premier formulaire', icon: FileText },
  { id: 'connect-whatsapp', label: 'Connecter ton WhatsApp', icon: Smartphone },
  { id: 'share-link', label: 'Partager le lien', icon: Share2 },
  { id: 'get-response', label: 'Recevoir ta première réponse', icon: MessageCircle },
  { id: 'invite-team', label: 'Inviter un coéquipier', icon: Users, disabled: true, soon: 'Bientôt disponible' },
]

interface DashboardStepProps {
  hasForm: boolean
  hasWhatsapp: boolean
  hasShared: boolean
  onComplete: () => void
  formSlug: string
}

export function StepTableauDeBord({ hasForm, hasWhatsapp, hasShared, onComplete, formSlug }: DashboardStepProps) {
  const [activeTab, setActiveTab] = useState<'forms' | 'reponses' | 'settings'>('forms')
  const [responseArrived, setResponseArrived] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const doneMap = { 'create-form': hasForm, 'connect-whatsapp': hasWhatsapp, 'share-link': hasShared, 'get-response': false, 'invite-team': false }
  const doneCount = Object.values(doneMap).filter(Boolean).length
  const progress = Math.round((doneCount / TASKS.length) * 100)

  useEffect(() => {
    const t = setTimeout(() => {
      setResponseArrived(true)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 5000)
    }, 6000)
    return () => clearTimeout(t)
  }, [])

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'
  const publicUrl = formSlug ? `${APP_URL}/f/${formSlug}` : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col max-w-2xl mx-auto w-full"
    >
      <div className="text-center mb-5">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          Ton espace est prêt
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Voici ton tableau de bord. Les réponses arriveront ici et sur WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6 shrink-0">
                  <svg className="w-6 h-6 -rotate-90" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-border" />
                    <circle
                      cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * 6.5}`}
                      strokeDashoffset={`${2 * Math.PI * 6.5 * (1 - progress / 100)}`}
                      className="text-foreground transition-all duration-700"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-foreground">
                    {doneCount}
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground">Démarrage</p>
              </div>
            </div>
            <div className="p-2 space-y-0.5">
              {TASKS.map(task => {
                const done = doneMap[task.id as keyof typeof doneMap]
                return (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 transition-all',
                      done ? 'opacity-50' : '',
                    )}
                  >
                    <div className={cn(
                      'w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all',
                      done ? 'bg-foreground border-foreground text-background' : 'border-muted-foreground/30',
                    )}>
                      {done && <Check size={8} strokeWidth={3} />}
                    </div>
                    <task.icon size={11} className={cn('shrink-0', done ? 'text-muted-foreground' : 'text-foreground/60')} />
                    <span className={cn('text-[11px]', done ? 'text-muted-foreground line-through' : 'text-foreground')}>
                      {task.label}
                    </span>
                    {task.soon && (
                      <span className="ml-auto text-[10px] text-muted-foreground/50">{task.soon}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex border-b border-border">
              {(['forms', 'reponses', 'settings'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'flex-1 px-3 py-2 text-xs font-medium transition-colors relative',
                    activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab === 'forms' ? 'Formulaires' : tab === 'reponses' ? 'Réponses' : 'Paramètres'}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-sm bg-foreground" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === 'forms' && (
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{formSlug ? 'Mon formulaire' : 'Aucun formulaire'}</p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      <Check size={8} /> En ligne
                    </span>
                  </div>
                  {publicUrl && (
                    <p className="text-xs text-muted-foreground truncate mb-2">{publicUrl}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageCircle size={11} />
                    <span>{responseArrived ? '1 réponse' : '0 réponse'}</span>
                  </div>
                </div>
              )}

              {activeTab === 'reponses' && (
                <AnimatePresence mode="wait">
                  {responseArrived ? (
                    <motion.div
                      key="response"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-border bg-muted/20 p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-foreground">AK</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">Awa Koné</p>
                          <p className="text-[11px] text-muted-foreground">Il y a quelques secondes · via WhatsApp</p>
                          <p className="text-xs text-muted-foreground mt-1">Bonjour, je souhaiterais avoir plus d&apos;informations sur vos services.</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <MessageCircle size={20} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">Aucune réponse pour l&apos;instant.</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1">Partage ton formulaire pour recevoir ta première réponse.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                    <div className="flex items-center gap-2">
                      <Smartphone size={13} className="text-muted-foreground" />
                      <span className="text-xs text-foreground">WhatsApp</span>
                    </div>
                    <span className={cn(
                      'text-[11px] font-medium',
                      hasWhatsapp ? 'text-emerald-500' : 'text-muted-foreground',
                    )}>
                      {hasWhatsapp ? 'Connecté' : 'Non connecté'}
                    </span>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-3">
                    <p className="text-xs font-medium text-foreground mb-1">Plan Gratuit</p>
                    <div className="space-y-1 text-[11px] text-muted-foreground">
                      <p>1 formulaire actif</p>
                      <p>100 notifications WhatsApp / mois</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 text-center">
        <Button onClick={onComplete} className="w-full max-w-xs">
          {responseArrived ? 'Terminer' : 'Aller au tableau de bord'}
        </Button>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg border border-border bg-card shadow-lg px-4 py-2.5"
          >
            <Bell size={13} className="text-foreground shrink-0" />
            <p className="text-xs text-foreground">
              Nouvelle réponse reçue sur WhatsApp
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
