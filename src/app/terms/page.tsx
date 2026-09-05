import type { Metadata } from 'next'
import { PublicPageShell } from '@/components/public-page-shell'

export const metadata: Metadata = {
  title: "Conditions d'utilisation de Kamforms",
  robots: { index: false },
}

export default function TermsPage() {
  return (
    <PublicPageShell>
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-2xl font-bold mb-8">Conditions d&apos;utilisation</h1>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p><strong>Dernière mise à jour :</strong> juin 2026</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">1. Service</h2>
          <p>Kamforms est un outil de création de formulaires et de collecte de réponses avec notifications WhatsApp et email, édité par Kamtech.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">2. Compte</h2>
          <p>Vous êtes responsable de la confidentialité de votre compte. Vous devez fournir des informations exactes lors de l&apos;inscription.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">3. Utilisation acceptable</h2>
          <p>Vous vous engagez à ne pas utiliser Kamforms pour :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Collecter des données frauduleuses ou illégales</li>
            <li>Envoyer du spam via les formulaires</li>
            <li>Porter atteinte aux droits des répondants</li>
            <li>Tenter de contourner les limitations techniques</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">4. Paiements</h2>
          <p>Les paiements sont traités par GeniusPay. Les abonnements sont renouvelés automatiquement sauf annulation. Remboursement sous 14 jours.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">5. Responsabilité</h2>
          <p>Kamforms est fourni &quot;en l&apos;état&quot;. Nous ne sommes pas responsables des données collectées via vos formulaires ni de l&apos;utilisation que vous en faites.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">6. Contact</h2>
          <p><a href="mailto:contact@kamtech.online" className="text-foreground underline">contact@kamtech.online</a></p>
        </div>
      </div>
    </PublicPageShell>
  )
}
