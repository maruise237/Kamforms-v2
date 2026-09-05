'use client'

import { motion } from 'framer-motion'
import { Sparkles, Share2, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

const STEPS = [
  { icon: Sparkles, title: 'Crée avec l\'IA', desc: 'Décris ton formulaire en une phrase, les champs sont générés automatiquement.' },
  { icon: Share2, title: 'Partage le lien', desc: 'Copie le lien public et envoie-le sur WhatsApp, par email ou sur les réseaux.' },
  { icon: Bell, title: 'Reçois les réponses', desc: 'Chaque réponse arrive en privé sur ton téléphone, pas dans un groupe.' },
]

export function StepBienvenue({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col items-center text-center max-w-sm mx-auto w-full"
    >
      <div className="mb-4">
        <Logo size={40} />
      </div>
      <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground mb-4">
        Bienvenue
      </span>
      <h1 className="text-xl font-semibold text-foreground tracking-tight mb-2">
        Bienvenue sur Kamforms
      </h1>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Crée des formulaires professionnels en quelques secondes avec l&apos;IA.
        Reçois chaque réponse en privé sur WhatsApp.
      </p>
      <div className="w-full space-y-2 mb-6">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card px-3.5 py-3 text-left">
            <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
              <step.icon size={14} className="text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full flex flex-col gap-2">
        <Button onClick={onNext} className="w-full">
          Créer mon premier formulaire
        </Button>
        <Button variant="ghost" onClick={onSkip} className="w-full text-xs text-muted-foreground">
          Découvrir le tableau de bord
        </Button>
      </div>
    </motion.div>
  )
}
