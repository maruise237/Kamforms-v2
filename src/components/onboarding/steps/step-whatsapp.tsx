'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const COUNTRIES = [
  { code: '+225', label: 'Côte d\'Ivoire' },
  { code: '+221', label: 'Sénégal' },
  { code: '+237', label: 'Cameroun' },
  { code: '+223', label: 'Mali' },
]

export function StepWhatsapp({
  initialPhone,
  onNext,
  onSkip,
  onData,
}: {
  initialPhone: string
  onNext: () => void
  onSkip: () => void
  onData: (phone: string) => void
}) {
  const [state, setState] = useState<'phone' | 'code' | 'verifying' | 'success'>('phone')
  const [countryIndex, setCountryIndex] = useState(0)
  const [phone, setPhone] = useState(initialPhone)
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(30)
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  const isValid = phone.replace(/\s/g, '').length >= 8
  const phoneDisplay = `${COUNTRIES[countryIndex].code} ${phone}`

  useEffect(() => {
    if (state !== 'code') return
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown(prev => prev - 1), 1000)
    return () => clearInterval(t)
  }, [state, countdown])

  function handleRequestCode() {
    if (!isValid) return
    setState('code')
    setCountdown(30)
    setDigits(['', '', '', '', '', ''])
    setTimeout(() => codeRefs.current[0]?.focus(), 100)
  }

  function handleDigitChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text')
    const nums = text.replace(/\D/g, '').slice(0, 6).split('')
    if (nums.length === 6) {
      setDigits(nums)
      setTimeout(() => {
        setState('verifying')
        setTimeout(() => {
          setState('success')
          onData(`${COUNTRIES[countryIndex].code} ${phone}`)
        }, 800)
      }, 400)
    }
  }

  function handleVerify() {
    if (digits.join('').length < 6) return
    setState('verifying')
    setTimeout(() => {
      setState('success')
      onData(`${COUNTRIES[countryIndex].code} ${phone}`)
    }, 800)
  }

  function handleResend() {
    setCountdown(30)
    setDigits(['', '', '', '', '', ''])
    setTimeout(() => codeRefs.current[0]?.focus(), 100)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col max-w-sm mx-auto w-full"
    >
      <div className="text-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
          <Smartphone size={18} className="text-foreground" />
        </div>
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Connecte ton WhatsApp</h1>
      </div>

      {state === 'phone' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            Chaque réponse arrivera en privé sur ton WhatsApp.
            Pas dans un groupe.
          </p>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Numéro WhatsApp</label>
            <div className="flex gap-1.5">
              <div className="relative">
                <select
                  value={countryIndex}
                  onChange={e => setCountryIndex(Number(e.target.value))}
                  className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs appearance-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
                >
                  {COUNTRIES.map((c, i) => (
                    <option key={i} value={i}>{c.code}</option>
                  ))}
                </select>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="01 02 03 04 05"
                className="flex-1 h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
                onKeyDown={e => { if (e.key === 'Enter') handleRequestCode() }}
              />
            </div>
          </div>
          <Button onClick={handleRequestCode} disabled={!isValid} className="w-full">
            Recevoir le code
          </Button>
          <Button variant="ghost" onClick={onSkip} className="w-full text-xs text-muted-foreground">
            Configurer plus tard
          </Button>
        </div>
      )}

      {state === 'code' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Code envoyé par SMS au <strong className="text-foreground">{phoneDisplay}</strong>
          </p>
          <div className="flex justify-center gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { codeRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="w-10 h-11 text-center text-sm font-semibold rounded-lg border border-input bg-transparent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
              />
            ))}
          </div>
          <Button onClick={handleVerify} disabled={digits.join('').length < 6} className="w-full">
            Vérifier
          </Button>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setState('phone')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Modifier le numéro
            </button>
            {countdown > 0 ? (
              <span className="text-xs text-muted-foreground">Renvoyer dans {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-xs text-foreground font-medium hover:underline"
              >
                Renvoyer le code
              </button>
            )}
          </div>
          <Button variant="ghost" onClick={onSkip} className="w-full text-xs text-muted-foreground">
            Configurer plus tard
          </Button>
        </div>
      )}

      {state === 'verifying' && (
        <div className="flex flex-col items-center py-10">
          <Loader2 size={24} className="animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Vérification...</p>
        </div>
      )}

      {state === 'success' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center py-4 text-center"
        >
          <svg className="w-12 h-12 mb-3" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" className="text-emerald-500 animate-success-circle" />
            <path d="M16 24L22 30L32 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 animate-success-check" />
          </svg>
          <h2 className="text-base font-semibold text-foreground mb-1">WhatsApp connecté</h2>
          <p className="text-sm text-muted-foreground mb-5">{phoneDisplay}</p>
          <Button onClick={onNext} className="w-full">
            Continuer
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
