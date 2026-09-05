import { sendEmail, parseEmail, parseEmailName } from './email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''
const DEFAULT_FROM = process.env.EMAIL_FROM ?? 'Kamforms <noreply@kamforms.com>'

async function send(fromRaw: string, to: string, subject: string, html: string) {
  return sendEmail({
    to,
    subject,
    from: fromRaw,
    html: layout(html),
  })
}

function layout(body: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width:100%">
      <tr><td align="center" style="padding:0">
        <table role="presentation" width="100%" style="max-width:560px;margin:0 auto">
          <tr>
            <td style="height:4px;background:#18181b;font-size:0;line-height:0" height="4">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 32px 0;background:#ffffff;border-radius:12px 12px 0 0">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle" style="padding-right:10px">
                    <svg width="24" height="24" viewBox="0 0 510 510" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g fill="#18181b">
                        <rect x="28" y="33" width="130" height="447" rx="22"/>
                        <path d="M 240,48 L 390,48 Q 415,48 411,73 L 395,160 Q 390,185 365,185 L 215,185 Q 190,185 195,160 L 211,73 Q 215,48 240,48 Z"/>
                        <g transform="translate(302, 342) rotate(28)">
                          <rect x="-140" y="-82" width="280" height="164" rx="80"/>
                        </g>
                      </g>
                    </svg>
                  </td>
                  <td valign="middle"><span style="font-size:15px;font-weight:700;color:#18181b;letter-spacing:-0.3px">Kamforms</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px;background:#ffffff">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:#fafafa;border-radius:0 0 12px 12px;text-align:center">
              <p style="margin:0 0 6px;font-size:11px;color:#a1a1aa">Kamforms &mdash; Formulaires intelligents</p>
              <p style="margin:6px 0 0;font-size:10px;color:#d4d4d8">
                <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none">kamforms.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>`
}

function btn(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px;background:#18181b"><a href="${url}" style="display:inline-block;padding:11px 22px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;background:#18181b">${label}</a></td></tr></table>`
}

function section(title: string, body: string, cta?: { label: string; url: string }): string {
  return `
    <h2 style="font-size:18px;font-weight:700;color:#18181b;margin:24px 0 8px;line-height:1.3">${title}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#52525b;line-height:1.6">${body}</p>
    ${cta ? `<p style="margin:0 0 8px">${btn(cta.url, cta.label)}</p>` : ''}
  `
}

// ─── CYCLES ─────────────────────────────────────────────────────────────

/** Cycle Conversion : limite de forfaits atteinte */
export async function sendLimitReached(to: string, plan: string, limitType: string) {
  const labels: Record<string, string> = {
    activeForms: 'formulaires actifs',
    whatsappNotifications: 'notifications WhatsApp',
    collaborators: 'collaborateurs',
  }
  await send(DEFAULT_FROM, to,
    `Limite atteinte — Passez à ${plan === 'pro' ? 'Business' : 'une offre supérieure'}`,
    section('Limite atteinte 🚀',
      `Vous avez atteint la limite de ${labels[limitType] ?? limitType} de votre formule ${plan === 'pro' ? 'Pro' : 'actuelle'}. ` +
      `Passez à ${plan === 'pro' ? 'Business' : 'Pro'} pour continuer à recevoir des réponses sans interruption.`,
      { label: plan === 'pro' ? 'Découvrir Business' : 'Passer à Pro', url: `${APP_URL}/dashboard/settings` })
  )
}

/** Cycle Conversion : essai transformé (X réponses reçues) */
export async function sendUsageMilestone(to: string, plan: string, submissions: number) {
  await send(DEFAULT_FROM, to,
    `${submissions} réponses reçues — Vous déchirez !`,
    section(`${submissions} réponses collectées 🎉`,
      `Vous avez reçu ${submissions} réponses sur vos formulaires. ` +
      (plan === 'free'
        ? `Pour aller plus loin, le plan Pro vous débloque 5 formulaires actifs, 1 000 notifications WhatsApp/mois et des collaborateurs.`
        : `Continuez sur votre lancée. Le plan ${plan === 'pro' ? 'Business' : 'Enterprise'} vous donne encore plus de capacité.`),
      plan === 'free'
        ? { label: 'Passer à Pro', url: `${APP_URL}/dashboard/settings` }
        : { label: 'Voir mes statistiques', url: `${APP_URL}/dashboard` })
  )
}

/** Cycle Conversion : feature tease */
export async function sendFeatureTease(to: string, plan: string) {
  const features = plan === 'free'
    ? [
        { icon: '📊', label: 'Collaborateurs', desc: 'Invitez votre équipe à consulter les réponses' },
        { icon: '📥', label: 'Import Google Forms', desc: 'Migrez vos formulaires existants en un clic' },
        { icon: '📋', label: 'Export CSV', desc: 'Téléchargez toutes vos réponses structurées' },
      ]
    : [
        { icon: '📈', label: 'Analytique avancée', desc: 'Taux de complétion, temps de réponse, tendances' },
        { icon: '👥', label: '20 collaborateurs', desc: 'Toute votre équipe peut suivre les réponses' },
        { icon: '⭐', label: 'Support prioritaire', desc: 'Réponse sous 24h' },
      ]

  await send(DEFAULT_FROM, to,
    `Une fonctionnalité pourrait vous intéresser`,
    section('Des fonctionnalités que vous n\'utilisez pas encore',
      plan === 'free'
        ? `Le plan Pro débloque des fonctionnalités qui vous feront gagner du temps au quotidien.`
        : `Le plan Business est conçu pour les équipes qui montent en puissance.`,
      { label: plan === 'free' ? 'Voir les plans' : 'Découvrir Business', url: `${APP_URL}/dashboard/settings` }) +
    `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin:16px 0">
      ${features.map(f => `
        <tr><td style="padding:12px 14px;border-bottom:1px solid #f4f4f5;font-size:13px;color:#18181b">
          ${f.icon} <strong>${f.label}</strong>
          <span style="display:block;font-size:12px;color:#71717a;margin-top:2px">${f.desc}</span>
        </td></tr>`).join('')}
    </table>`
  )
}

/** Cycle Rétention : astuce personnalisée selon le comportement */
export async function sendTip(to: string, tipType: string) {
  const tips: Record<string, { subject: string; title: string; body: string; cta: { label: string; url: string } }> = {
    multi_step: {
      subject: 'Multi-étapes : jusqu\'à 40% de réponses en plus',
      title: 'Passez vos formulaires en mode multi-étapes',
      body: 'Les formulaires qui posent une question à la fois ont un taux de complétion jusqu\'à 40% supérieur. Essayez le mode Tally-style sur votre prochain formulaire.',
      cta: { label: 'Créer un formulaire multi-étapes', url: `${APP_URL}/dashboard/forms/new` },
    },
    theme: {
      subject: 'Personnalisez l\'apparence de vos formulaires',
      title: 'Donnez les couleurs de votre marque',
      body: 'Ajoutez votre logo, choisissez une couleur d\'accentuation et une bannière. Vos formulaires auront l\'air professionnels en quelques clics.',
      cta: { label: 'Personnaliser un formulaire', url: `${APP_URL}/dashboard` },
    },
    ending: {
      subject: 'Que voir vos répondants après avoir soumis ?',
      title: 'Personnalisez le message de fin',
      body: 'Remplacez le message par défaut par un remerciement personnalisé, un lien vers votre site ou une invitation à vous suivre.',
      cta: { label: 'Configurer la fin', url: `${APP_URL}/dashboard` },
    },
    template: {
      subject: '14 modèles prêts à l\'emploi',
      title: 'Gagnez du temps avec nos modèles',
      body: 'Devis, satisfaction client, inscription événement, newsletter — choisissez un modèle et adaptez-le en quelques secondes.',
      cta: { label: 'Voir les modèles', url: `${APP_URL}/dashboard/forms/new` },
    },
  }

  const tip = tips[tipType]
  if (!tip) return

  await send(DEFAULT_FROM, to, tip.subject,
    section(tip.title, tip.body, tip.cta)
  )
}

/** Cycle Réengagement : utilisateur inactif */
export async function sendReengage(to: string, daysSinceLogin: number, formsCount: number) {
  const soft = daysSinceLogin <= 14
  await send(DEFAULT_FROM, to,
    soft ? 'Vous nous manquez déjà' : 'On aimerait vous revoir',
    soft
      ? section('Ça fait un moment 👋',
          `Cela fait ${daysSinceLogin} jours que vous n'êtes pas venu. ${formsCount > 0 ? 'Vos formulaires collectent toujours des réponses.' : 'Vous n\'avez pas encore créé de formulaire.'} Revenez en quelques clics.`,
          { label: formsCount > 0 ? 'Voir mes réponses' : 'Créer mon premier formulaire', url: formsCount > 0 ? `${APP_URL}/dashboard` : `${APP_URL}/dashboard/forms/new` })
      : section('On tente un dernier message',
          `Cela fait ${daysSinceLogin} jours. Nous avons conservé vos données. Si vous souhaitez reprendre, tout est là. Sinon, vous pouvez nous dire ce qui n'a pas fonctionné.`,
          { label: 'Reprendre', url: `${APP_URL}/dashboard` })
  )
}

/** Cycle Réengagement : formulaire sans réponse */
export async function sendFormAbandoned(to: string, formTitle: string, formUrl: string) {
  await send(DEFAULT_FROM, to,
    `"${formTitle}" attend toujours sa première réponse`,
    section(`Votre formulaire est prêt, pas encore de réponse`,
      `"${formTitle}" a été créé mais n'a reçu aucune réponse. Partagez le lien dès maintenant pour commencer à collecter.`,
      { label: 'Copier le lien', url: formUrl })
  )
}
