/**
 * Fonctions d'affichage pures — utilisables côté client et serveur.
 * Contrairement à admin-dashboard.ts, ce fichier n'a PAS de directive `server-only`.
 */

export function formatCompactDate(date: Date | string | null) {
  if (!date) return 'Non défini'
  const d = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatCurrencyFcfa(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

export function getPlanName(plan: string) {
  if (plan === 'pro') return 'Pro'
  if (plan === 'business') return 'Business'
  return 'Gratuit'
}

export function getBillingStatusLabel(status: string) {
  const labels: Record<string, string> = {
    active: 'Actif',
    pending: 'En attente',
    expired: 'Expiré',
    failed: 'Échec',
    cancelled: 'Annulé',
    free: 'Gratuit',
  }

  return labels[status] ?? status
}

function getPlanPrice(planId: string | null) {
  if (!planId) return 'Non facturé'
  // Version statique sans import de billing-plans (évite les dépendances serveur)
  const prices: Record<string, string> = {
    pro_monthly: '3 900 FCFA/mois',
    pro_annual: '39 000 FCFA/an',
    business_monthly: '29 000 FCFA/mois',
    business_annual: '290 000 FCFA/an',
  }
  return prices[planId] ?? planId
}

function getDaysUntil(date: Date | string | null) {
  if (!date) return null

  const now = new Date()
  const target = typeof date === 'string' ? new Date(date) : date

  // Normaliser à minuit
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate())

  return Math.ceil((targetDay.getTime() - today.getTime()) / 86_400_000)
}
