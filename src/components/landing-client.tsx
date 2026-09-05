'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Star, ChevronDown, ArrowLeft, Phone, Video, MoreVertical, Smile, Paperclip, Mic, Zap, ClipboardList, BarChart2, Settings2, Mail, Banknote, CalendarCheck, User, PartyPopper, Lock, Minus, Download, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { BlurFade } from '@/components/ui/blur-fade'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { Marquee } from '@/components/ui/marquee'

// ── Hooks ──────────────────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(e.target) } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useTilt(strength = 7) {
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef<number>(0)
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const el = ref.current; if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transition = 'transform 0.12s ease-out'
      el.style.transform = `perspective(800px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg) scale3d(1.02,1.02,1.02)`
    })
  }, [strength])
  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(raf.current)
    const el = ref.current; if (!el) return
    el.style.transition = 'transform 0.5s cubic-bezier(.23,1,.32,1)'
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
  }, [])
  return { ref, onMouseMove, onMouseLeave }
}

// ── AnimSection ────────────────────────────────────────────────────────────

function AnimSection({ children, className, from = 'bottom', delay = 0 }: {
  children: React.ReactNode; className?: string
  from?: 'bottom' | 'left' | 'right' | 'scale'; delay?: number
}) {
  const { ref, inView } = useInView()
  const hidden = { bottom: 'opacity-0 translate-y-11', left: 'opacity-0 -translate-x-8', right: 'opacity-0 translate-x-8', scale: 'opacity-0 scale-95' }[from]
  return (
    <div ref={ref} style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
      className={cn('transition-all duration-700 ease-out', inView ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : hidden, className)}>
      {children}
    </div>
  )
}

// ── TiltCard ───────────────────────────────────────────────────────────────

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt()
  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      className={cn('will-change-transform', className)} style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  )
}

// ── Browser Dashboard Mockup ───────────────────────────────────────────────

function BrowserMockup() {
  return (
    <div className="relative" style={{ perspective: '1000px' }}>
      {/* AI chip */}
      <div className="lp-chip-tl absolute -top-4 -left-4 bg-popover border border-border rounded-xl px-3 py-2 shadow-xl flex items-center gap-2 z-10 whitespace-nowrap">
        <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0"><Zap size={12} className="text-white" /></div>
        <div>
          <p className="text-xs font-semibold text-foreground leading-tight">Formulaire généré</p>
          <p className="text-[10px] text-muted-foreground">En 8 secondes par l'IA</p>
        </div>
      </div>

      {/* Browser */}
      <div className="lp-browser rounded-2xl overflow-hidden border border-white/10 bg-white"
        style={{ boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.04)' }}>
        {/* Browser bar */}
        <div className="bg-[#f2f2f2] px-3 py-2.5 flex items-center gap-2.5 border-b border-[#e5e5e5]">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28ca41]" />
          </div>
          <div className="flex-1 bg-[#e8e8e8] rounded-md px-2.5 py-0.5 text-[10px] text-[#666] font-['Inter',sans-serif]">
            kamforms.app/dashboard
          </div>
        </div>
        {/* Dashboard UI */}
        <div className="flex" style={{ height: 300 }}>
          {/* Sidebar */}
          <div className="w-[140px] shrink-0 bg-[#fafafa] border-r border-[#ebebeb] p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 px-1.5 py-1 mb-2">
              <div className="w-4 h-4 bg-[#18181b] rounded-[3px] flex items-center justify-center">
                <svg width="9" height="9" viewBox="0 0 32 32" fill="none"><path d="M9 7v18M9 16l12-9M9 16l12 9" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="text-[10px] font-bold text-[#18181b]">Kamforms</span>
            </div>
            {([{ Icon: ClipboardList, label: 'Formulaires', active: true }, { Icon: BarChart2, label: 'Réponses', active: false }, { Icon: Settings2, label: 'Paramètres', active: false }] as const).map(item => (
              <div key={item.label} className={cn('flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium', item.active ? 'bg-[#f4f4f5] text-[#18181b]' : 'text-[#71717a]')}>
                <item.Icon size={10} />{item.label}
              </div>
            ))}
          </div>
          {/* Main */}
          <div className="flex-1 p-4 overflow-hidden bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-semibold text-[#18181b]">Formulaires</span>
              <span className="bg-[#18181b] text-white text-[9px] font-semibold px-2 py-1 rounded-md">+ Nouveau</span>
            </div>
            {[
              { title: 'Formulaire de devis', meta: "Créé avec l'IA · il y a 2 jours", count: '47 réponses', on: true },
              { title: 'Demande de contact', meta: 'Importé Google Forms · 5 champs', count: '128 réponses', on: true },
              { title: 'Satisfaction client', meta: 'Modèle · Multi-étapes', count: '12 réponses', on: false },
            ].map(card => (
              <div key={card.title} className="border border-[#ebebeb] rounded-lg px-3 py-2 mb-1.5 flex items-center justify-between bg-white">
                <div>
                  <p className="text-[10.5px] font-semibold text-[#18181b]">{card.title}</p>
                  <p className="text-[8.5px] text-[#a1a1aa]">{card.meta}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8.5px] text-[#71717a] bg-[#f4f4f5] px-2 py-0.5 rounded-full">{card.count}</span>
                  <div className={cn('w-6 h-3 rounded-full relative', card.on ? 'bg-[#18181b]' : 'bg-[#e4e4e7]')}>
                    <div className={cn('absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all', card.on ? 'right-0.5' : 'left-0.5')} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WhatsApp chip */}
      <div className="lp-chip-br absolute -bottom-4 -right-4 bg-popover border border-border rounded-xl px-3 py-2.5 shadow-xl flex items-center gap-2.5 z-10 whitespace-nowrap">
        <div className="w-7 h-7 rounded-full bg-[#25d366] flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">Nouvelle réponse reçue</p>
          <p className="text-[10px] text-muted-foreground">Maintenant · Formulaire de devis</p>
        </div>
      </div>
    </div>
  )
}

// ── Phone Mockup ───────────────────────────────────────────────────────────

const WA_MSG = [
  { k: 'Nom',    v: 'Marie Dupont' },
  { k: 'Email',  v: 'marie@studio.fr' },
  { k: 'Budget', v: '500 – 2 000 €' },
  { k: 'Délai',  v: '2 semaines' },
  { k: 'Style',  v: 'Minimaliste' },
]

function TypingDots() {
  return (
    <div className="flex items-center gap-[3px] px-2 py-1.5">
      {[0, 1, 2].map(i => (
        <motion.span key={i} className="w-[5px] h-[5px] rounded-full bg-[#9e9e9e]"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function PhoneMockup() {
  const [phase, setPhase] = useState<'typing' | 'msg' | 'blue'>('typing')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('msg'),  2200)
    const t2 = setTimeout(() => setPhase('blue'), 3400)
    const t3 = setTimeout(() => { setPhase('typing') }, 6000)
    const t4 = setTimeout(() => setPhase('msg'),  8200)
    const t5 = setTimeout(() => setPhase('blue'), 9400)
    // loop
    const loop = setInterval(() => {
      setPhase('typing')
      setTimeout(() => setPhase('msg'),  2200)
      setTimeout(() => setPhase('blue'), 3400)
    }, 12000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearInterval(loop) }
  }, [])

  const ticks = phase === 'blue'
    ? <span className="text-[#53bdeb]">✓✓</span>
    : <span className="text-[#999]">✓✓</span>

  return (
    <div className="relative mx-auto select-none" style={{ width: 248 }}>
      {/* Side buttons */}
      <div className="absolute left-[-4px] top-[88px] w-[4px] h-7 bg-[#2a2a2a] rounded-l-sm" />
      <div className="absolute left-[-4px] top-[124px] w-[4px] h-10 bg-[#2a2a2a] rounded-l-sm" />
      <div className="absolute left-[-4px] top-[172px] w-[4px] h-10 bg-[#2a2a2a] rounded-l-sm" />
      <div className="absolute right-[-4px] top-[120px] w-[4px] h-14 bg-[#2a2a2a] rounded-r-sm" />

      {/* Frame */}
      <div className="rounded-[42px] overflow-hidden"
        style={{
          background: 'linear-gradient(160deg,#2e2e2e 0%,#1a1a1a 100%)',
          boxShadow: '0 0 0 1px #3a3a3a, 0 32px 64px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
          padding: '10px 6px 12px',
        }}>

        {/* Screen */}
        <div className="rounded-[34px] overflow-hidden bg-black" style={{ minHeight: 490 }}>

          {/* Status bar */}
          <div className="bg-[#075E54] px-4 pt-2 pb-0 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-white">14:32</span>
            {/* Dynamic island-style pill */}
            <div className="w-16 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-[10px]" style={{ width: 60 }} />
            <div className="flex items-center gap-1">
              <svg width="12" height="9" viewBox="0 0 12 9" fill="white" opacity={0.9}>
                <rect x="0" y="4" width="2" height="5" rx="0.5"/>
                <rect x="3.5" y="2.5" width="2" height="6.5" rx="0.5"/>
                <rect x="7" y="1" width="2" height="8" rx="0.5"/>
                <rect x="10.5" y="0" width="1.5" height="9" rx="0.5"/>
              </svg>
              <svg width="10" height="9" viewBox="0 0 10 9" fill="white" opacity={0.9}>
                <path d="M5 1.5 C2.5 1.5 0.5 3.5 0.5 5.5 L2 4.5 C2 3.4 3.3 2.5 5 2.5 C6.7 2.5 8 3.4 8 4.5 L9.5 5.5 C9.5 3.5 7.5 1.5 5 1.5Z"/>
                <circle cx="5" cy="6.5" r="1.2"/>
              </svg>
              <div className="flex items-center gap-0.5">
                <div className="w-5 h-2.5 rounded-sm border border-white/70 relative">
                  <div className="absolute inset-[1.5px] right-[1.5px] bg-white rounded-[1px]" style={{ right: '30%' }} />
                </div>
                <div className="w-[2px] h-1.5 bg-white/70 rounded-r-sm" />
              </div>
            </div>
          </div>

          {/* WA Header */}
          <div className="bg-[#075E54] px-3 py-2 flex items-center gap-2.5">
            <ArrowLeft size={16} className="text-white shrink-0" />
            <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm">K</div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white leading-tight">Kamforms</p>
              <p className="text-[10px] text-[#b2dfdb]">en ligne</p>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Video size={16} />
              <Phone size={15} />
              <MoreVertical size={16} />
            </div>
          </div>

          {/* Chat area */}
          <div className="flex flex-col flex-1 relative"
            style={{ background: '#ECE5DD', backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5b8a8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, minHeight: 340 }}>

            {/* Date badge */}
            <div className="flex justify-center pt-3 pb-1">
              <span className="bg-[#e1d9cf] text-[#7a7168] text-[9px] px-3 py-0.5 rounded-full shadow-sm">AUJOURD'HUI</span>
            </div>

            <div className="px-2 pb-2 flex-1">
              <AnimatePresence mode="wait">
                {phase === 'typing' && (
                  <motion.div key="typing"
                    initial={{ opacity: 0, scale: 0.85, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-[78%] bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-sm w-fit"
                    style={{ borderRadius: '2px 16px 16px 16px' }}
                  >
                    <TypingDots />
                  </motion.div>
                )}

                {(phase === 'msg' || phase === 'blue') && (
                  <motion.div key="msg"
                    initial={{ opacity: 0, y: 12, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="max-w-[88%] bg-white shadow-sm"
                    style={{ borderRadius: '2px 14px 14px 14px' }}
                  >
                    <div className="px-2.5 pt-2 pb-1">
                      <p className="text-[8.5px] font-bold text-[#128C7E] mb-1.5 flex items-center gap-1">
                        <ClipboardList size={9} /> Nouvelle réponse · Devis
                      </p>
                      <div className="space-y-[3px] mb-2">
                        {WA_MSG.map(({ k, v }) => (
                          <div key={k} className="flex items-baseline gap-1.5">
                            <span className="text-[7px] font-semibold text-[#9e9e9e] w-[34px] shrink-0">{k}</span>
                            <span className="text-[7.5px] text-[#111]">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-[#f0f0f0] pt-1.5">
                        <p className="text-[7px] text-[#9e9e9e] font-semibold mb-0.5">Projet</p>
                        <p className="text-[7px] text-[#333] leading-[1.4]">Refonte de mon site portfolio avec 5 pages + charte graphique.</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1 px-2.5 pb-1.5">
                      <span className="text-[7px] text-[#9e9e9e]">14:32</span>
                      <motion.span key={String(phase === 'blue')}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className={cn('text-[8px]', phase === 'blue' ? 'text-[#53bdeb]' : 'text-[#9e9e9e]')}
                      >✓✓</motion.span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Input bar */}
          <div className="bg-[#f0f0f0] flex items-center gap-2 px-2 py-2">
            <div className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm">
              <Smile size={13} className="text-[#999] shrink-0" />
              <span className="text-[9px] text-[#bbb] flex-1">Message</span>
              <Paperclip size={11} className="text-[#999] shrink-0" />
            </div>
            <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm shrink-0">
              <Mic size={12} className="text-white" />
            </div>
          </div>

        </div>
        {/* Home indicator */}
        <div className="flex justify-center pt-2.5 pb-0.5">
          <div className="w-20 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ── Create Modes Tabs ──────────────────────────────────────────────────────

function CreateModes() {
  const [active, setActive] = useState<'ai' | 'tmpl' | 'imp'>('ai')
  const activeNote = {
    ai: "L'IA prépare le brouillon, vous gardez le dernier mot.",
    tmpl: 'Un modèle propre, prêt à être adapté en quelques clics.',
    imp: 'On récupère votre ancien formulaire sans casser vos habitudes.',
  }[active]

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-5 bg-muted/30 border border-border rounded-xl p-1">
        {([
          { id: 'ai',   Icon: Zap,           label: 'Générer par IA' },
          { id: 'tmpl', Icon: ClipboardList, label: 'Modèles'        },
          { id: 'imp',  Icon: Download,      label: 'Import'         },
        ] as const).map(({ id, Icon, label }) => (
          <button key={id} onClick={() => setActive(id)}
            className={cn('flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200',
              active === id ? 'bg-card border border-border text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            <Icon size={11} />{label}
          </button>
        ))}
      </div>
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        aria-live="polite"
        className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-[11px] text-muted-foreground shadow-sm"
      >
        <Sparkles size={13} className="text-amber-500" />
        <span>{activeNote}</span>
      </motion.div>

      {active === 'ai' && (
        <div className="border border-border rounded-2xl bg-card p-5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Type de formulaire</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[['Page unique', 'Simple et rapide', true], ['Multi-étapes', 'Meilleur taux de complétion', false]].map(([t, s, sel]) => (
              <div key={String(t)} className={cn('border rounded-lg p-2.5 cursor-pointer', sel ? 'border-foreground/30 bg-muted/30' : 'border-border')}>
                <p className="text-[10px] font-semibold text-foreground">{t}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{s}</p>
              </div>
            ))}
          </div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Décrivez votre formulaire</p>
          <textarea readOnly className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-[11px] text-foreground resize-none h-16 outline-none mb-2.5 font-sans"
            defaultValue="Formulaire de devis pour graphiste — budget, délai, style et références" />
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground">Ctrl+Entrée pour générer</span>
            <button className="whimsy-button bg-foreground text-background text-[9px] font-semibold px-3 py-1.5 rounded-md">Générer →</button>
          </div>
          <div className="whimsy-ready border border-border rounded-xl bg-muted/20 p-3 mt-3">
            <p className="text-[8.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles size={10} className="text-amber-500" />
              6 champs générés · prêt à publier
            </p>
            {[['text', 'Nom complet', true], ['email', 'Email', true], ['select', 'Budget estimé', true], ['select', 'Délai souhaité', false], ['radio', 'Style préféré', true], ['textarea', 'Description du projet', true]].map(([type, label, req]) => (
              <div key={String(label)} className="flex items-center gap-1.5 mb-1">
                <span className="text-[8px] bg-muted text-muted-foreground px-1.5 py-px rounded font-mono shrink-0">{type}</span>
                <span className="text-[10px] text-foreground">{label}</span>
                {req && <span className="text-[9px] text-muted-foreground">*</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {active === 'tmpl' && (
        <div className="border border-border rounded-2xl bg-card p-5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">14 modèles prêts à l'emploi</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { Icon: Mail,          n: 'Contact',    d: 'Nom, email, message'    },
              { Icon: Banknote,      n: 'Devis',      d: 'Qualification prospect' },
              { Icon: Star,          n: 'Satisfaction',d: 'NPS + retour client'   },
              { Icon: CalendarCheck, n: 'Rendez-vous', d: 'Disponibilités + objet'},
              { Icon: User,          n: 'Candidature', d: 'CV, motivation, poste' },
              { Icon: PartyPopper,   n: 'Événement',  d: 'Inscription + infos'   },
            ] as const).map(({ Icon, n, d }) => (
              <div key={n} className="whimsy-template border border-border rounded-xl p-2.5 cursor-pointer hover:border-foreground/20 hover:bg-muted/20 transition-all">
                <div className="mb-1.5"><Icon size={14} className="text-muted-foreground" /></div>
                <p className="text-[10px] font-semibold text-foreground">{n}</p>
                <p className="text-[8.5px] text-muted-foreground mt-0.5 leading-snug">{d}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === 'imp' && (
        <div className="border border-border rounded-2xl bg-card p-5">
          <p className="text-[10px] font-semibold text-foreground mb-1">URL du formulaire Google Forms</p>
          <p className="text-[9px] text-muted-foreground mb-2.5 leading-relaxed">Le formulaire doit être public (sans connexion requise).</p>
          <input readOnly className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-[10px] text-muted-foreground outline-none mb-2.5 font-sans"
            placeholder="https://docs.google.com/forms/d/e/…/viewform" />
          <button className="whimsy-button w-full bg-foreground text-background text-[9px] font-semibold py-2 rounded-lg">Importer →</button>
          <div className="border-t border-border mt-4 pt-4 flex flex-col gap-2.5">
            {[['1','Collez l\'URL de votre formulaire Google','Le formulaire doit être accessible publiquement'],['2','Kamforms importe les champs automatiquement','Questions, options, logique conditionnelle'],['3','Publiez et recevez les réponses sur WhatsApp','Zéro reconfiguration']].map(([n,t,s]) => (
              <div key={n} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0 mt-0.5">{n}</div>
                <div>
                  <p className="text-[10px] font-medium text-foreground">{t}</p>
                  <p className="text-[8.5px] text-muted-foreground mt-0.5">{s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Form Preview Mockup ────────────────────────────────────────────────────

function FormPreview() {
  return (
    <div className="border border-border rounded-2xl bg-card p-7 max-w-sm">
      <div className="h-0.5 bg-border rounded-full mb-5 overflow-hidden">
        <div className="whimsy-progress h-full w-[65%] bg-foreground rounded-full" />
      </div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">4 <span className="opacity-40">/</span> 6</p>
        <span className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Presque prêt
        </span>
      </div>
      <p className="text-lg font-semibold text-foreground leading-snug mb-5">
        Budget estimé pour votre projet ?<span className="text-muted-foreground font-normal"> *</span>
      </p>
      <div className="flex flex-col gap-2.5">
        {[['A','Moins de 500 €',false],['B','500 € – 2 000 €',true],['C','2 000 € – 10 000 €',false],['D','Plus de 10 000 €',false]].map(([k,v,sel]) => (
          <label key={String(k)} className={cn('flex items-center gap-2.5 cursor-pointer rounded-lg transition-colors', sel && 'bg-muted/20')}>
            <div className={cn('w-6 h-6 rounded-md border flex items-center justify-center text-[10px] font-bold shrink-0',
              sel ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground')}>
              {k}
            </div>
            <span className={cn('text-sm', sel ? 'text-foreground font-medium' : 'text-foreground')}>{v}</span>
            {sel && <span className="ml-auto pr-2 text-[10px] text-muted-foreground">bon choix</span>}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2.5 mt-5">
        <div className="whimsy-button bg-foreground text-background px-3.5 py-1.5 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-1.5">OK <Check size={12} /></div>
        <span className="text-[11px] text-muted-foreground">ou <kbd className="bg-muted border border-border rounded px-1 py-px font-sans text-[11px]">Entrée ↵</kbd></span>
      </div>
    </div>
  )
}

// ── FAQ ────────────────────────────────────────────────────────────────────

const FAQS = [
  ['Peut-on importer depuis Google Forms ?', 'Oui. Kamforms importe vos formulaires Google Forms existants en quelques clics. Questions, options et logique conditionnelle sont transférées automatiquement.'],
  ['Comment fonctionne la génération par IA ?', 'Décrivez votre besoin en une phrase. L\'IA génère automatiquement les champs, la logique conditionnelle et la validation en moins de 10 secondes.'],
  ['Comment recevoir les réponses sur WhatsApp ?', 'Connectez votre numéro WhatsApp dans les paramètres. À chaque soumission, vous recevez une notification avec toutes les réponses formatées.'],
  ['Peut-on utiliser KamForms pour collecter des infos auprès d\'une équipe ou de partenaires (pas seulement des clients) ?', 'Oui. KamForms est aussi conçu pour les groupes fermés — équipes, partenaires, intervenants, participants. Partagez un lien ciblé, collectez des réponses structurées, recevez tout sur WhatsApp. La fonction collaborateurs vous permet de partager l\'accès aux réponses avec les membres de votre équipe selon votre plan.'],
  ['Peut-on personnaliser l\'apparence du questionnaire ?', 'Oui. Couleur d\'accentuation, bannière, mode clair ou sombre. Le questionnaire s\'adapte à votre identité visuelle.'],
  ['Est-il possible d\'héberger sur sa propre infrastructure ?', 'Oui. Une option self-hosting est disponible. Contactez-nous — nous accompagnons votre déploiement et configuration.'],
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left text-sm font-medium text-foreground hover:opacity-75 transition-opacity">
        {q}
        <div className={cn('w-5 h-5 rounded-full border border-border flex items-center justify-center shrink-0 transition-transform duration-300', open && 'rotate-180')}>
          <ChevronDown size={11} className="text-muted-foreground" />
        </div>
      </button>
      <div className={cn('overflow-hidden transition-all duration-500 ease-out', open ? 'max-h-72 pb-5' : 'max-h-0')}>
        <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

// ── Data ───────────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = ['Génération IA','WhatsApp natif','Import Google Forms','Multi-étapes','14 modèles','Sans code','Self-hosting','RGPD','Logique conditionnelle','Export CSV','Thèmes personnalisés','Notifications instantanées']

type LandingFeature = {
  iconSrc: string
  title: string
  body: string
  items?: string[]
}

// Lordicon animated icon sources — verify/replace from lordicon.com
const FEATURES: LandingFeature[] = [
  { iconSrc: 'https://cdn.lordicon.com/lupuorrc.json', title: 'Génération IA', body: "Décrivez votre besoin en une phrase, obtenez un questionnaire complet avec champs, validation et logique conditionnelle." },
  { iconSrc: 'https://cdn.lordicon.com/yqzmiobz.json', title: 'WhatsApp natif', body: "Notifications instantanées à chaque soumission. Traitez chaque demande en moins de 2 minutes." },
  { iconSrc: 'https://cdn.lordicon.com/lomfljuq.json', title: 'Import Google Forms', body: "Migrez vos questionnaires existants en quelques clics. Champs, options et logique transférés automatiquement." },
  { iconSrc: 'https://cdn.lordicon.com/sbiheqdr.json', title: 'Multi-étapes', body: "Une question à la fois, barre de progression, navigation clavier. Taux de complétion jusqu'à 40% supérieur." },
  { iconSrc: 'https://cdn.lordicon.com/iiixliqb.json', title: 'Identité visuelle', body: "Couleur d'accentuation, bannière, mode clair ou sombre. Vos pages de collecte reflètent votre marque." },
  { iconSrc: 'https://cdn.lordicon.com/lenjvibx.json', title: 'Accès collaborateurs', body: "Invitez votre équipe ou vos partenaires à accéder aux réponses. Jusqu'à 20 collaborateurs selon votre plan. Chacun voit ce dont il a besoin." },
  { iconSrc: 'https://cdn.lordicon.com/kbtmbyzy.json', title: 'Self-hosting', body: "Hébergez Kamforms sur votre propre infrastructure. Données 100% sous votre contrôle." },
]

const USE_CASES = [
  { Icon: Banknote, title: 'Formulaire de devis', body: 'Collectez budget, délai, besoin et coordonnées, puis rappelez pendant que le prospect est encore chaud.' },
  { Icon: User, title: 'Inscription formation', body: 'Centralisez les inscriptions, niveaux, moyens de paiement et préférences avant de confirmer sur WhatsApp.' },
  { Icon: CalendarCheck, title: 'Demande de rendez-vous', body: 'Recevez les disponibilités, motifs et informations utiles pour confirmer sans échange interminable.' },
  { Icon: ClipboardList, title: 'Commande client', body: 'Prenez les demandes traiteur, restaurant ou boutique avec détails, quantité et contact en un seul message.' },
  { Icon: Settings2, title: 'Support SAV', body: 'Transformez les demandes de support en tickets lisibles avec pièces, urgence et historique client.' },
]

const TEAM_USE_CASES = [
  {
    Icon: ClipboardList,
    title: 'Brief client récurrent',
    body: 'Envoyez un formulaire de brief à chaque client avant de démarrer un projet. Vous recevez les infos complètes sur WhatsApp. Zéro aller-retour.',
  },
  {
    Icon: User,
    title: 'Questionnaire participants formation',
    body: 'Collectez le niveau, les objectifs et les contraintes de vos participants avant chaque session. Arrivez préparé, sans avoir posé la question 15 fois.',
  },
  {
    Icon: PartyPopper,
    title: 'Collecte infos intervenants événement',
    body: 'Bio, photo, besoins logistiques — envoyez un formulaire à chaque intervenant. Tout arrive centralisé, exportable en CSV.',
  },
]

const TESTIMONIALS = [
  { quote: "J'ai remplacé mes formulaires Google en 20 minutes. Le WhatsApp, c'est game-changer — je réponds à mes clients depuis mon téléphone.", name: 'Sophie M.', role: 'Graphiste indépendante' },
  { quote: "L'IA génère exactement ce qu'il faut, et les notifs WhatsApp permettent de répondre en temps réel. Aucun compromis.", name: 'Karim B.', role: 'Directeur, agence digitale' },
  { quote: "Formulaire de devis créé en 30 secondes. On reçoit les demandes sur WhatsApp et rappelle dans la foulée. Nos concurrents envoient des PDFs.", name: 'Amandine L.', role: 'Fondatrice, studio créatif' },
  { quote: "J'envoie un formulaire de diagnostic à mes participants la veille de chaque formation. Je n'ai plus à poser les mêmes questions à chaque fois. Le gain de temps est énorme.", name: 'Didier K.', role: 'Formateur en management' },
]

// ── LandingClient ──────────────────────────────────────────────────────────

export function LandingClient() {
  const { resolvedTheme } = useTheme()
  const [pricingCurrency, setPricingCurrency] = useState<'usd' | 'fcfa'>('fcfa')
  const [pricingBilling, setPricingBilling] = useState<'monthly' | 'annual'>('monthly')
  const showFcfa = pricingCurrency === 'fcfa'
  const showAnnual = pricingBilling === 'annual'
  const lordIconColor = resolvedTheme === 'dark' ? 'primary:#e4e4e7' : 'primary:#18181b'

  // Load Lordicon web component (landing page only)
  useEffect(() => {
    if (!document.getElementById('lordicon-script')) {
      const s = document.createElement('script')
      s.id = 'lordicon-script'
      s.src = 'https://cdn.lordicon.com/lordicon.js'
      document.head.appendChild(s)
    }
  }, [])

  // Browser tilt on scroll
  const browserRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const el = browserRef.current; if (!el) return
          const p = Math.min(scrollY / 600, 1)
          el.style.transform = `perspective(1000px) rotateY(${-4 + p * 8}deg) rotateX(${2 - p * 4}deg) translateY(${-p * 20}px)`
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        @keyframes lp-float-browser {
          0%,100% { transform: perspective(1000px) rotateY(-4deg) rotateX(2deg) translateY(0); }
          50%      { transform: perspective(1000px) rotateY(-5deg) rotateX(1.5deg) translateY(-12px); }
        }
        @keyframes lp-chip-tl {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes lp-chip-br {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes lp-pip {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(.6); opacity:.5; }
        }
        .lp-browser       { animation: lp-float-browser 7s ease-in-out infinite; }
        .lp-chip-tl       { animation: lp-chip-tl 6s ease-in-out infinite .3s; }
        .lp-chip-br       { animation: lp-chip-br 5s ease-in-out infinite 1s; }
        .lp-pip           { animation: lp-pip 2s ease-in-out infinite; }
        .whimsy-button {
          position: relative;
          overflow: hidden;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .whimsy-button::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-120%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.24), transparent);
          transition: transform .55s ease;
        }
        .whimsy-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(0,0,0,.14);
        }
        .whimsy-button:hover::after { transform: translateX(120%); }
        .whimsy-ready {
          box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(245,158,11,.06);
        }
        .whimsy-template:hover svg { transform: rotate(-8deg) scale(1.08); }
        .whimsy-template svg { transition: transform .2s ease; }
        .whimsy-progress {
          box-shadow: 0 0 18px rgba(245,158,11,.2);
        }
        @media (max-width: 639px) {
          .lp-mobile-cta {
            width: calc(100vw - 3rem) !important;
            max-width: calc(100vw - 3rem) !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .lp-browser, .lp-chip-tl, .lp-chip-br, .lp-pip { animation: none; }
          .whimsy-button,
          .whimsy-template svg {
            transition: none;
          }
          .whimsy-button:hover,
          .whimsy-template:hover svg {
            transform: none;
          }
        }
      `}</style>

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="min-h-[100svh] flex items-center px-6 md:px-[clamp(1.5rem,4vw,3.5rem)] pt-20 overflow-hidden">
        <div className="max-w-[1180px] w-full mx-auto grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-14 items-center py-16">

          {/* Copy */}
          <div>
            <BlurFade delay={0}>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground border border-border rounded-full px-3 py-1.5 mb-6 bg-card">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <span className="lp-pip block w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <AnimatedGradientText>Formulaires clients · Équipes · Partenaires</AnimatedGradientText>
              </div>
            </BlurFade>

            <BlurFade delay={0.1}>
              <h1 className="font-heading text-[clamp(2.2rem,4.5vw,4.2rem)] font-extrabold tracking-[-0.04em] leading-[1.05] mb-5 text-balance">
                Collectez les réponses<br />sans perdre le fil<br /><span className="text-muted-foreground">sur WhatsApp.</span>
              </h1>
            </BlurFade>

            <BlurFade delay={0.15}>
              <p className="text-sm font-medium text-muted-foreground/80 mb-6">
                T&rsquo;en as marre de poser les mêmes questions dans ton groupe WhatsApp&nbsp;? Un lien suffit.
              </p>
            </BlurFade>

            <BlurFade delay={0.2}>
              <p className="text-[0.975rem] text-muted-foreground leading-[1.75] mb-8 max-w-[440px]">
                Clients, participants, intervenants ou équipe : partagez un lien, recevez des réponses propres en privé, sans messages éparpillés dans vos groupes.
              </p>
            </BlurFade>

            <BlurFade delay={0.28}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 mb-5">
                <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }), 'lp-mobile-cta whimsy-button gap-2 sm:w-auto')}>
                  <span className="hidden sm:inline">Créer mon lien de collecte</span>
                  <span className="sm:hidden">Créer mon lien</span>
                  <ArrowRight size={15} />
                </Link>
                <Link href="#team-partners" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'lp-mobile-cta sm:w-auto')}>
                  Collecter les infos de mon équipe
                </Link>
              </div>
              <div className="flex flex-wrap gap-4">
                {([
                  { Icon: Check, label: 'Gratuit pour commencer' },
                  { Icon: Check, label: 'Aucune carte'           },
                  { Icon: Lock,  label: 'RGPD'                   },
                ] as const).map(({ Icon, label }) => (
                  <span key={label} className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                    <Icon size={11} />{label}
                  </span>
                ))}
              </div>
            </BlurFade>
          </div>

          {/* Browser mockup — desktop only */}
          <div className="hidden lg:block relative">
            <BlurFade delay={0.15} yOffset={20}>
              <div ref={browserRef} style={{ transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg)', transition: 'transform 0.7s cubic-bezier(.23,1,.32,1)' }}>
                <BrowserMockup />
              </div>
            </BlurFade>
          </div>

          {/* WhatsApp phone mockup — mobile only */}
          <div className="lg:hidden flex justify-center mt-8">
            <BlurFade delay={0.15} yOffset={20}>
              <PhoneMockup />
            </BlurFade>
          </div>
        </div>
	      </section>

	      {/* ═══ STATS ══════════════════════════════════════════════════════════ */}
	      <section className="py-12 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)] border-b border-border">
	        <div className="max-w-[1100px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
	          {[
	            ['10 000+', 'Formulaires créés'],
	            ['250 000+', 'Réponses collectées'],
	            ['< 5s', 'Notification WhatsApp'],
	            ['4.9/5', 'Satisfaction utilisateur'],
	          ].map(([value, label]) => (
	            <div key={label} className="text-center">
	              <p className="text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
	              <p className="text-xs text-muted-foreground mt-1">{label}</p>
	            </div>
	          ))}
	        </div>
	      </section>

	      {/* ═══ MARQUEE ════════════════════════════════════════════════════════ */}
      <div className="border-y border-border py-4 overflow-hidden relative [--gap:2.5rem]">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <Marquee pauseOnHover repeat={3} className="[--duration:30s]">
          {MARQUEE_ITEMS.map((item) => (
            <span key={item} className="flex items-center gap-2 whitespace-nowrap text-xs font-medium text-muted-foreground mx-5">
              {item}<span className="text-muted-foreground/30 text-[9px]">◆</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ═══ CREATE MODES ════════════════════════════════════════════════════ */}
      <section id="create" className="py-28 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)] bg-muted/10">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div>
            <AnimSection from="left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-2.5">3 façons de créer</p>
              <h2 className="text-[clamp(1.9rem,3.2vw,2.8rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] mb-3 text-balance">
                Votre workflow,<br /><span className="text-muted-foreground">votre façon.</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-[1.72] mb-8 max-w-[380px]">
                IA, modèles prêts à l'emploi, ou migration directe depuis Google Forms. Vous choisissez.
              </p>
            </AnimSection>
            <AnimSection from="left" delay={100}>
              <CreateModes />
            </AnimSection>
          </div>

          <div>
            <AnimSection from="right" delay={100}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-2.5">Aperçu du formulaire</p>
              <h2 className="text-[clamp(1.9rem,3.2vw,2.8rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] mb-3 text-balance">
                Le formulaire<br /><span className="text-muted-foreground">vu par vos clients.</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-[1.72] mb-6 max-w-[360px]">
                Mode multi-étapes style Tally — une question à la fois, navigation clavier, barre de progression.
              </p>
              <FormPreview />
            </AnimSection>
          </div>
        </div>
      </section>

      {/* ═══ WHATSAPP ════════════════════════════════════════════════════════ */}
      <section id="whatsapp" className="py-28 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <AnimSection from="left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-2.5">Notifications WhatsApp</p>
            <h2 className="text-[clamp(1.9rem,3.2vw,2.8rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] mb-3 text-balance">
              Chaque réponse,<br /><span className="text-muted-foreground">dans votre poche.</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-[1.72] mb-8 max-w-[400px]">
              Fini de surveiller sa boîte mail. À chaque soumission, toutes les réponses arrivent sur votre WhatsApp — formatées, lisibles, prêtes à traiter.
            </p>
            <div className="flex flex-col gap-4">
              {[['Notification instantanée','Recevez le message en moins de 5 secondes après la soumission.'],['Format lisible','Chaque champ est affiché clairement — nom, email, budget, message.'],['Toujours accessible','Historique complet dans l\'app. Export CSV quand vous en avez besoin.']].map(([t,d]) => (
                <div key={String(t)} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl border border-border bg-card flex items-center justify-center shrink-0">
                    <Check size={14} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">{t}</p>
                    <p className="text-sm text-muted-foreground">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimSection>
          <AnimSection from="right" delay={100} className="hidden lg:flex justify-center">
            <PhoneMockup />
          </AnimSection>
        </div>
      </section>

      {/* ═══ FEATURES ════════════════════════════════════════════════════════ */}
      <section id="features" className="py-28 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)] bg-muted/10">
        <div className="max-w-[1100px] mx-auto">
          <AnimSection className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-2.5">Ce que vous obtenez</p>
            <h2 className="text-[clamp(1.9rem,3.2vw,2.8rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] text-balance">
              Tout ce dont vous<br /><span className="text-muted-foreground">avez besoin, rien de plus.</span>
            </h2>
          </AnimSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {FEATURES.map((feat, i) => (
              <AnimSection key={i} delay={i * 60}>
                <TiltCard className="h-full">
                  <div className="feature-card flex flex-col gap-3 border border-border rounded-[18px] p-6 bg-card h-full hover:border-foreground/20 transition-colors duration-300">
                    <div className="w-9 h-9 rounded-[9px] border border-border bg-muted/40 flex items-center justify-center shrink-0">
                      {/* @ts-expect-error — lord-icon is a web component declared in src/types/lordicon.d.ts */}
                      <lord-icon
                        src={feat.iconSrc}
                        trigger="hover"
                        colors={lordIconColor}
                        target=".feature-card"
                        style={{ width: 22, height: 22 }}
                      />
                    </div>
                    <h3 className="text-[0.875rem] font-semibold text-foreground">{feat.title}</h3>
                    <p className="text-[0.785rem] text-muted-foreground leading-[1.68]">{feat.body}</p>
                    {feat.items?.length ? (
                      <div className="mt-auto flex flex-col gap-1.5 pt-1">
                        {feat.items.map((item) => (
                          <div key={item} className="flex items-start gap-2 text-[0.735rem] text-muted-foreground leading-snug">
                            <Check size={10} className="mt-0.5 shrink-0 text-green-500" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </TiltCard>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ USE CASES ═════════════════════════════════════════════════════════ */}
      <section id="use-cases" className="py-28 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="max-w-[1100px] mx-auto">
          <AnimSection className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-2.5">Cas d&apos;usage</p>
            <h2 className="text-[clamp(1.9rem,3.2vw,2.8rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] text-balance">
              Pour toutes les demandes<br /><span className="text-muted-foreground">qui doivent arriver vite.</span>
            </h2>
          </AnimSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {USE_CASES.map(({ Icon, title, body }, i) => (
              <AnimSection key={title} delay={i * 60}>
                <div className="h-full border border-border rounded-[18px] p-5 bg-card hover:border-foreground/20 transition-colors duration-300">
                  <div className="w-9 h-9 rounded-[9px] border border-border bg-muted/40 flex items-center justify-center mb-4">
                    <Icon size={16} className="text-foreground" />
                  </div>
                  <h3 className="text-[0.875rem] font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-[0.785rem] text-muted-foreground leading-[1.68]">{body}</p>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEAM & PARTNERS ═════════════════════════════════════════════════════ */}
      <section id="team-partners" className="py-28 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)] bg-muted/10">
        <div className="max-w-[1100px] mx-auto">
          <AnimSection className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-2.5">Équipe &amp; Partenaires</p>
            <h2 className="text-[clamp(1.9rem,3.2vw,2.8rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] text-balance">
              Fini les questions en cascade<br /><span className="text-muted-foreground">sur WhatsApp.</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-[1.72] mt-4 max-w-[520px] mx-auto">
              Envoyez un lien. Ils remplissent. Vous recevez tout structuré — sans relancer personne.
            </p>
          </AnimSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {TEAM_USE_CASES.map(({ Icon, title, body }, i) => (
              <AnimSection key={title} delay={i * 70}>
                <div className="h-full border border-border rounded-[18px] p-6 bg-card hover:border-foreground/20 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-[10px] border border-border bg-muted/40 flex items-center justify-center mb-5">
                    <Icon size={17} className="text-foreground" />
                  </div>
                  <h3 className="text-[0.95rem] font-semibold text-foreground mb-2.5 leading-snug">{title}</h3>
                  <p className="text-[0.82rem] text-muted-foreground leading-[1.68]">{body}</p>
                </div>
              </AnimSection>
            ))}
          </div>
          <AnimSection delay={240} className="mt-10 flex justify-center">
            <Link href="/sign-up" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'lp-mobile-cta gap-2 sm:w-auto')}>
              Collecter les infos de mon équipe
              <ArrowRight size={15} />
            </Link>
          </AnimSection>
        </div>
      </section>

      {/* ═══ PRICING ═════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-28 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="max-w-[1100px] mx-auto">
          <AnimSection className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-2.5">Tarifs</p>
            <h2 className="text-[clamp(1.9rem,3.2vw,2.8rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] text-balance">
              Simple.<br /><span className="text-muted-foreground">Prêt à vendre.</span>
            </h2>
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="inline-flex rounded-full border border-border bg-muted/30 p-1">
                <button
                  type="button"
                  onClick={() => setPricingBilling('monthly')}
                  className={cn(
                    'h-8 rounded-full px-4 text-xs font-semibold transition-colors',
                    !showAnnual ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Mensuel
                </button>
                <button
                  type="button"
                  onClick={() => setPricingBilling('annual')}
                  className={cn(
                    'h-8 rounded-full px-4 text-xs font-semibold transition-colors',
                    showAnnual ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Annuel - 2 mois offerts
                </button>
              </div>
              <div className="inline-flex rounded-full border border-border bg-muted/30 p-1">
                <button
                  type="button"
                  onClick={() => setPricingCurrency('usd')}
                  className={cn(
                    'h-8 rounded-full px-4 text-xs font-semibold transition-colors',
                    !showFcfa ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Voir en $
                </button>
                <button
                  type="button"
                  onClick={() => setPricingCurrency('fcfa')}
                  className={cn(
                    'h-8 rounded-full px-4 text-xs font-semibold transition-colors',
                    showFcfa ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Voir en FCFA
                </button>
              </div>
            </div>
          </AnimSection>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Free */}
            <AnimSection delay={0}>
              <div className="border border-border rounded-[20px] p-7 bg-card flex flex-col gap-4 h-full">
                <p className="text-[13px] font-semibold text-muted-foreground">Gratuit</p>
                <div><span className="text-[2.2rem] font-extrabold tracking-[-0.05em]">{showFcfa ? '0 FCFA' : '0 $'}</span><span className="text-sm text-muted-foreground"> / {showAnnual ? 'an' : 'mois'}</span></div>
                <p className="text-xs text-muted-foreground">Pour un groupe. Zéro engagement.</p>
                <div className="flex flex-col gap-2 mt-1">
                  {([
                    [true,  '1 formulaire actif'                  ],
                    [true,  '100 notifications WhatsApp / mois'   ],
                    [true,  'Analytique'                          ],
                    [true,  'Génération IA'                       ],
                    [false, 'Collaborateurs'                      ],
                    [false, 'Import Google Forms'                 ],
                    [false, 'Export CSV'                          ],
                  ] as const).map(([ok, l]) => (
                    <div key={l} className="flex items-start gap-2 text-xs text-muted-foreground">
                      {ok
                        ? <Check size={11} className="text-green-500 shrink-0 mt-px" />
                        : <Minus size={11} className="text-muted-foreground/30 shrink-0 mt-px" />}
                      {l}
                    </div>
                  ))}
                </div>
                <Link href="/sign-up" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-auto text-center')}>Commencer gratuitement</Link>
              </div>
            </AnimSection>
            {/* Pro */}
            <AnimSection delay={100}>
              <div className="relative border border-purple-200/60 dark:border-purple-700/40 rounded-[20px] p-7 bg-card flex flex-col gap-4 h-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">Le plus populaire</div>
                <p className="text-[13px] font-semibold text-purple-600 dark:text-purple-400">Pro</p>
                <div>
                  <span className="text-[2.2rem] font-extrabold tracking-[-0.05em]">{showAnnual ? (showFcfa ? '39 000 FCFA' : '60 $') : (showFcfa ? '3 900 FCFA' : '6 $')}</span><span className="text-sm text-muted-foreground"> / {showAnnual ? 'an' : 'mois'}</span>
                  <p className="text-[11px] text-muted-foreground mt-1">{showAnnual ? '2 mois offerts · 5 formulaires actifs' : '5 formulaires actifs'}</p>
                </div>
                <p className="text-xs text-muted-foreground">Pour indépendants et petites équipes qui traitent leurs leads sur WhatsApp.</p>
                <div className="flex flex-col gap-2 mt-1">
                  {['5 formulaires actifs','1 000 notifications WhatsApp / mois','5 collaborateurs','Analytique','Génération IA','Import Google Forms','Export CSV'].map(l => (
                    <div key={l} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check size={11} className="text-green-500 shrink-0 mt-px" />{l}
                    </div>
                  ))}
                </div>
                <Link href="/sign-up" className={cn(buttonVariants({ size: 'sm', className: 'bg-purple-600 hover:bg-purple-700' }), 'mt-auto text-center')}>Passer Pro — {showAnnual ? (showFcfa ? '39 000 FCFA/an' : '60 $/an') : (showFcfa ? '3 900 FCFA/mois' : '6 $/mois')}</Link>
              </div>
            </AnimSection>
            {/* Business */}
            <AnimSection delay={200}>
              <div className="relative border-amber-400/50 dark:border-amber-600/40 rounded-[20px] p-7 bg-card flex flex-col gap-4 h-full shadow-[0_0_24px_-4px_rgba(217,119,6,0.08)] dark:shadow-[0_0_24px_-4px_rgba(217,119,6,0.04)]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">Pour équipes</div>
                <p className="text-[13px] font-semibold text-amber-600 dark:text-amber-400">Business</p>
                <div>
                  <span className="text-[2.2rem] font-extrabold tracking-[-0.05em]">{showAnnual ? (showFcfa ? '290 000 FCFA' : '490 $') : (showFcfa ? '29 000 FCFA' : '49 $')}</span><span className="text-sm text-muted-foreground"> / {showAnnual ? 'an' : 'mois'}</span>
                  <p className="text-[11px] text-muted-foreground mt-1">{showAnnual ? '2 mois offerts · 20 formulaires actifs' : '20 formulaires actifs'}</p>
                </div>
                <p className="text-xs text-muted-foreground">Pour agences, écoles, cliniques et PME avec plusieurs points de contact.</p>
                <div className="flex flex-col gap-2 mt-1">
                  {['20 formulaires actifs','10 000 notifications WhatsApp / mois','20 collaborateurs','Analytique avancée','Import Google Forms','Exports CSV','Support prioritaire'].map(l => (
                    <div key={l} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check size={11} className="text-green-500 shrink-0 mt-px" />{l}
                    </div>
                  ))}
                </div>
                <Link href="/sign-up" className={cn(buttonVariants({ size: 'sm', className: 'bg-amber-600 hover:bg-amber-700' }), 'mt-auto text-center')}>Choisir Business — {showAnnual ? (showFcfa ? '290 000 FCFA/an' : '490 $/an') : (showFcfa ? '29 000 FCFA/mois' : '49 $/mois')}</Link>
              </div>
            </AnimSection>
            {/* Self-hosting — masqué de la grille principale */}
            <div className="hidden">
              <AnimSection delay={300}>
              <div className="border border-border rounded-[20px] p-7 bg-card flex flex-col gap-4 h-full">
                <p className="text-[13px] font-semibold text-muted-foreground">Self-hosting</p>
                <div><span className="text-[1.7rem] font-extrabold tracking-[-0.04em]">Sur devis</span></div>
                <p className="text-xs text-muted-foreground leading-relaxed">Pour les entreprises souhaitant héberger Kamforms en interne.</p>
                <div className="flex flex-col gap-2 mt-1">
                  {['Toutes les fonctionnalités Pro','Analytique','Hébergement sur votre infra','Données 100% privées','Support dédié','Accompagnement déploiement'].map(l => (
                    <div key={l} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check size={11} className="text-green-500 shrink-0 mt-px" />{l}
                    </div>
                  ))}
                </div>
                <a href="mailto:contact@kamtech.online" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-auto text-center')}>Nous contacter</a>
              </div>
            </AnimSection>
          </div>
        </div>
      </div>
      </section>

      {/* ═══ TESTIMONIALS ════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)] bg-muted/10">
        <div className="max-w-[1100px] mx-auto">
          <AnimSection className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-2.5">Ils l'utilisent au quotidien</p>
            <h2 className="text-[clamp(1.9rem,3.2vw,2.8rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] text-balance">
              Pensé pour ceux qui<br /><span className="text-muted-foreground">n'ont pas de temps.</span>
            </h2>
          </AnimSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {TESTIMONIALS.map((t, i) => (
              <AnimSection key={i} delay={i * 100}>
                <TiltCard className="h-full">
                  <div className="flex flex-col gap-3.5 border border-border rounded-[18px] p-6 bg-card h-full hover:border-foreground/20 transition-colors duration-300">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => <Star key={s} size={12} className="text-amber-400" fill="currentColor" />)}
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-[1.72] flex-1">&laquo;&nbsp;{t.quote}&nbsp;&raquo;</p>
                    <div>
                      <p className="text-[13.5px] font-semibold text-foreground">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </TiltCard>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-28 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)]">
        <div className="max-w-[660px] mx-auto">
          <AnimSection className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-2.5">Questions fréquentes</p>
            <h2 className="text-[clamp(1.9rem,3.2vw,2.8rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] text-balance">
              Tout ce que vous<br /><span className="text-muted-foreground">devez savoir.</span>
            </h2>
          </AnimSection>
          <AnimSection delay={100}>
            <div className="border-t border-border">
              {FAQS.map(([q, a]) => <FaqItem key={q} q={q} a={a} />)}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════════════════════════ */}
      <section id="cta" className="py-28 px-6 md:px-[clamp(1.5rem,4vw,3.5rem)] bg-muted/10">
        <AnimSection from="scale" className="max-w-[760px] mx-auto">
          <div className="relative overflow-hidden border border-border rounded-[24px] py-20 px-8 md:px-20 text-center bg-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-4">Prêt à démarrer ?</p>
            <h2 className="font-heading text-[clamp(1.9rem,3.5vw,2.9rem)] font-extrabold tracking-[-0.05em] leading-[1.06] mb-3.5 text-balance">
              Recevez vos demandes<br />sur WhatsApp dès aujourd&apos;hui.
            </h2>
            <p className="text-sm text-muted-foreground mb-10 leading-[1.65] max-w-md mx-auto">
              Décrivez ce dont vous avez besoin. L&apos;IA s&apos;occupe du brouillon, puis choisissez un plan mensuel ou annuel.
            </p>
            <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }), 'lp-mobile-cta gap-2 text-sm sm:text-base px-5 sm:px-10 sm:w-auto')}>
              <span className="hidden sm:inline">Créer mon lien de collecte</span>
              <span className="sm:hidden">Créer mon lien</span>
              <ArrowRight size={16} />
            </Link>
            <div className="flex items-center justify-center gap-6 flex-wrap mt-6">
              {([
                { Icon: Check, label: 'Gratuit · aucune carte' },
                { Icon: Lock,  label: 'RGPD'                   },
                { Icon: Zap,   label: 'IA incluse'             },
              ] as const).map(({ Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
                  <Icon size={11} />{label}
                </span>
              ))}
            </div>
          </div>
        </AnimSection>
      </section>
    </>
  )
}
