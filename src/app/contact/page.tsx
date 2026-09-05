'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PublicPageShell } from '@/components/public-page-shell'
import { Send, Check, Loader2, Mail, MessageSquare, User, Building2 } from 'lucide-react'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mojodzrr'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactPage() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('submitting')
    setErrorMsg('')

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de l\'envoi')
      }

      setState('success')
      setFormData({ name: '', email: '', company: '', subject: '', message: '' })
    } catch (err) {
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  if (state === 'success') {
    return (
      <PublicPageShell>
        <div className="mx-auto max-w-lg px-6 py-28 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <Check size={28} className="text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold tracking-[-0.04em] mb-3">Message envoyé ✅</h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
            Merci ! On vous répond dans les plus brefs délais. En général sous quelques heures.
          </p>
          <Link href="/" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </PublicPageShell>
    )
  }

  return (
    <PublicPageShell>
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground mb-3">Contact</p>
          <h1 className="text-[clamp(1.8rem,3vw,2.8rem)] font-heading font-extrabold tracking-[-0.048em] leading-[1.05] text-balance mb-3">
            On répond en français,<br />
            <span className="text-muted-foreground">pas de chatbot.</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Une question sur Kamforms, un bug, une suggestion, ou juste envie de dire bonjour ? 
            Remplissez le formulaire, on vous répond personnellement.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-medium text-foreground">Nom complet *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-foreground">Email *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="company" className="text-xs font-medium text-foreground">Entreprise / Organisation</label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Votre entreprise (optionnel)"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="subject" className="text-xs font-medium text-foreground">Sujet *</label>
            <div className="relative">
              <MessageSquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
              >
                <option value="">Choisissez un sujet</option>
                <option value="support">Support technique</option>
                <option value="bug">Signaler un bug</option>
                <option value="devis">Demande de devis / Self-hosting</option>
                <option value="partenariat">Partenariat</option>
                <option value="suggestion">Suggestion</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="message" className="text-xs font-medium text-foreground">Message *</label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="Dites-nous tout..."
              className="w-full resize-y rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 p-3 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
            />
          </div>

          {state === 'error' && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/20 px-4 py-3 text-xs text-red-700 dark:text-red-400">
              {errorMsg || 'Une erreur est survenue. Réessayez ou écrivez directement à contact@kamtech.online.'}
            </div>
          )}

          <button
            type="submit"
            disabled={state === 'submitting'}
            className={cn(
              buttonVariants({ size: 'lg' }),
              'w-full sm:w-auto cursor-pointer',
              state === 'submitting' && 'opacity-70 pointer-events-none'
            )}
          >
            {state === 'submitting' ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Envoi en cours...</>
            ) : (
              <><Send size={16} className="mr-2" /> Envoyer le message</>
            )}
          </button>

          <p className="text-xs text-muted-foreground pt-2">
            Ou écrivez-nous directement :{' '}
            <a href="mailto:contact@kamtech.online" className="text-foreground underline hover:no-underline">
              contact@kamtech.online
            </a>
          </p>
        </form>
      </div>
    </PublicPageShell>
  )
}
