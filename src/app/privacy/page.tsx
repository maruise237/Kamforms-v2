import type { Metadata } from 'next'
import { PublicPageShell } from '@/components/public-page-shell'

export const metadata: Metadata = {
  title: 'Politique de confidentialité de Kamforms',
  robots: { index: false },
}

export default function PrivacyPage() {
  return (
    <PublicPageShell>
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-2xl font-bold mb-8">Politique de confidentialité</h1>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p><strong>Dernière mise à jour :</strong> juin 2026</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">1. Collecte des données</h2>
          <p>Nous collectons les données suivantes lors de l&apos;utilisation de Kamforms :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Adresse email et nom (via Clerk pour l&apos;authentification)</li>
            <li>Numéro WhatsApp (si vous le fournissez pour les notifications)</li>
            <li>Contenu des formulaires que vous créez</li>
            <li>Réponses soumises à vos formulaires</li>
            <li>Données techniques : adresse IP, navigateur, pages visitées</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">2. Utilisation des données</h2>
          <p>Vos données sont utilisées uniquement pour :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vous fournir le service Kamforms</li>
            <li>Vous envoyer des notifications de réponses (WhatsApp ou email)</li>
            <li>Améliorer le service</li>
            <li>Assurer la sécurité et prévenir les abus</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">3. Partage des données</h2>
          <p>Nous ne vendons pas vos données. Elles peuvent être partagées uniquement avec :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Clerk (authentification)</li>
            <li>Plunk (envoi d&apos;emails)</li>
            <li>Evolution API (envoi WhatsApp)</li>
            <li>GeniusPay (paiements)</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">4. Hébergement</h2>
          <p>Kamforms peut être utilisé en SaaS ou en self-hosting. En mode SaaS, les données sont hébergées sur nos serveurs. En self-hosting, les données restent sous votre contrôle.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">5. Vos droits</h2>
          <p>Conformément au RGPD, vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données en nous contactant à contact@kamtech.online.</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">6. Contact</h2>
          <p>Pour toute question : <a href="mailto:contact@kamtech.online" className="text-foreground underline">contact@kamtech.online</a></p>
        </div>
      </div>
    </PublicPageShell>
  )
}
