export type CaseStudy = {
  slug: string
  title: string
  description: string
  clientName: string
  clientBusiness: string
  clientLocation: string
  date: string
  author: string
  tags: string[]
  readingTime: string
  problem: string
  solution: string
  results: { metric: string; value: string }[]
  testimonial: string
  body: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'coach-business-abidjan',
    title: 'Comment une consultante en coaching a multipli\u00e9 ses devis par 4 avec Kamforms',
    description: 'Bas\u00e9e \u00e0 Abidjan, Amina utilisait les groupes WhatsApp pour collecter les informations de ses prospects. Elle perdait des heures \u00e0 recopier les donn\u00e9es. Kamforms a chang\u00e9 son quotidien.',
    clientName: 'Amina K.',
    clientBusiness: 'Consultante en coaching',
    clientLocation: 'Abidjan, C\u00f4te d\'Ivoire',
    date: '2026-07-15',
    author: 'Mariuse',
    tags: ['cas client', 'coaching', 'Abidjan', 'formulaire devis', 'productivit\u00e9'],
    readingTime: '4 min',
    problem: 'Amina est consultante en coaching \u00e0 Abidjan. Chaque semaine, elle recevait des demandes de devis dans son groupe WhatsApp. Les messages se m\u00e9langeaient, les prospects oubliaient de pr\u00e9ciser leur budget ou leurs objectifs, et elle passait en moyenne 30 minutes par prospect \u00e0 poser les m\u00eames questions de qualification par messages s\u00e9par\u00e9s.',
    solution: 'Amina a cr\u00e9\u00e9 un formulaire de qualification client avec Kamforms en 30 secondes. Le formulaire collecte automatiquement le nom, le budget mensuel, les objectifs, la disponibilit\u00e9 et le secteur d\'activit\u00e9. Chaque r\u00e9ponse arrive sur son WhatsApp priv\u00e9 en moins de 5 secondes, avec toutes les informations structur\u00e9es.',
    results: [
      { metric: 'Temps gagn\u00e9 par prospect', value: '25 min' },
      { metric: 'Devis par semaine', value: '3 \u2192 12' },
      { metric: 'Taux de r\u00e9ponse formulaire', value: '85%' },
      { metric: 'Taux de transformation', value: '+40%' },
    ],
    testimonial: 'Je ne peux plus revenir en arri\u00e8re. Avant, je passais mes apr\u00e8s-midis \u00e0 relancer les prospects sur WhatsApp pour avoir les informations de base. Maintenant, ils remplissent le formulaire en 2 minutes, et j\'ai toutes les infos pour \u00e9tablir un devis personnalis\u00e9. J\'ai multipli\u00e9 mes devis par 4 en 2 semaines.',
    body: `
<p>Amina K. est consultante en coaching \u00e0 Abidjan, sp\u00e9cialis\u00e9e dans l'accompagnement des entrepreneurs ivoiriens. Avant Kamforms, son processus de qualification client \u00e9tait un vrai casse-t\u00eate : elle devait poser les m\u00eames questions \u00e0 chaque prospect, les informations se perdaient dans les discussions WhatsApp, et elle passait des heures \u00e0 reconstituer les profils.</p>
<p>Aujourd'hui, elle cr\u00e9e un formulaire de qualification en 30 secondes avec l'IA, partage le lien sur son statut WhatsApp, et chaque r\u00e9ponse arrive proprement format\u00e9e sur son t\u00e9l\u00e9phone. Le r\u00e9sultat : 12 devis par semaine au lieu de 3, et un taux de transformation en hausse de 40%.</p>
<p><a href="/sign-up">Cr\u00e9ez votre formulaire de qualification comme Amina \u2192</a></p>`,
  },
  {
    slug: 'formateur-dakar-inscriptions',
    title: 'Un formateur \u00e0 Dakar automatise ses inscriptions avec Kamforms',
    description: 'Seydou organisait des formations en pr\u00e9sentiel \u00e0 Dakar sans outil de collecte. Il perdait des inscriptions et de l\'argent. Kamforms lui a fait gagner 10h par semaine.',
    clientName: 'Seydou N.',
    clientBusiness: 'Formateur ind\u00e9pendant',
    clientLocation: 'Dakar, S\u00e9n\u00e9gal',
    date: '2026-07-10',
    author: 'Mariuse',
    tags: ['cas client', 'formation', 'Dakar', 'inscription', 'automatisation'],
    readingTime: '4 min',
    problem: 'Seydou organise des formations en pr\u00e9sentiel \u00e0 Dakar (marketing digital, gestion de projet). Avant, il collectait les inscriptions via les commentaires Facebook et les messages WhatsApp. R\u00e9sultat : 30% des inscriptions n\'avaient pas de num\u00e9ro de t\u00e9l\u00e9phone valide, 20% des participants ne se rappelaient pas s\'\u00eatre inscrits, et il passait 10h par semaine \u00e0 relancer les gens.',
    solution: 'Seydou a cr\u00e9\u00e9 un formulaire d\'inscription Kamforms. Les participants remplissent nom, t\u00e9l\u00e9phone, email et niveau directement depuis le formulaire. Seydou re\u00e7oit une notification WhatsApp \u00e0 chaque inscription. Les paiements Mobile Money seront bient\u00f4t disponibles pour les inscriptions.',
    results: [
      { metric: 'Heures gagn\u00e9es par semaine', value: '10h' },
      { metric: 'Taux de compl\u00e9tion inscription', value: '95%' },
      { metric: 'Participants par formation', value: '+60%' },
      { metric: 'Absent\u00e9isme', value: '-70%' },
    ],
    testimonial: 'Avant, je devais relancer chaque personne individuellement pour confirmer son inscription. Maintenant, le formulaire fait tout le travail. Les participants remplissent leurs infos, et je re\u00e7ois la notification sur WhatsApp. J\'ai gagn\u00e9 10 heures par semaine et je ne perds plus d\'inscriptions. Les paiements Mobile Money arrivent bient\u00f4t pour passer \u00e0 la vitesse sup\u00e9rieure.',
    body: `
<p>Seydou N. est formateur ind\u00e9pendant \u00e0 Dakar, S\u00e9n\u00e9gal. Sp\u00e9cialis\u00e9 dans les formations en marketing digital et gestion de projet, il organisait ses inscriptions via Facebook et WhatsApp. Un processus manuel qui lui co\u00fbtait 10 heures par semaine et lui faisait perdre des inscriptions.</p>
<p>En adoptant Kamforms, Seydou a automatis\u00e9 l'ensemble de son processus d'inscription. Les participants remplissent un formulaire, et tout arrive sur son WhatsApp. Le taux de compl\u00e9tion est pass\u00e9 \u00e0 95% et l'absent\u00e9isme a chut\u00e9 de 70%. Les paiements Mobile Money seront bient\u00f4t activ\u00e9s pour permettre aux participants de payer directement depuis le formulaire.</p>
<p><a href="/sign-up">Cr\u00e9ez votre formulaire d'inscription comme Seydou \u2192</a></p>`,
  },
  {
    slug: 'restaurant-douala-commandes',
    title: 'Un restaurant \u00e0 Douala digitalise ses commandes avec Kamforms',
    description: 'Le restaurant Chez Mado recevait les commandes par t\u00e9l\u00e9phone et WhatsApp. Les erreurs de saisie \u00e9taient fr\u00e9quentes. Kamforms a structur\u00e9 le processus en 24h.',
    clientName: 'Chez Mado Restaurant',
    clientBusiness: 'Restaurant traditionnel',
    clientLocation: 'Douala, Cameroun',
    date: '2026-07-05',
    author: 'Mariuse',
    tags: ['cas client', 'restaurant', 'Douala', 'commande en ligne', 'paiement mobile money'],
    readingTime: '4 min',
    problem: 'Chez Mado, restaurant traditionnel \u00e0 Douala, recevait les commandes par t\u00e9l\u00e9phone et WhatsApp. Les commandes \u00e9taient not\u00e9es sur papier, les erreurs de saisie \u00e9taient fr\u00e9quentes (mauvais plat, mauvaise adresse), et il \u00e9tait impossible de suivre l\'historique des commandes. En moyenne, 15% des commandes contenaient une erreur.',
    solution: 'Le restaurant a cr\u00e9\u00e9 un formulaire de commande Kamforms avec la liste des plats et les options de livraison. Le lien WhatsApp est partag\u00e9 dans le statut et le groupe WhatsApp du restaurant. Chaque commande arrive sur le t\u00e9l\u00e9phone du g\u00e9rant avec tous les d\u00e9tails. Le paiement MTN Mobile Money sera bient\u00f4t disponible.',
    results: [
      { metric: 'Erreurs de commande', value: '15% \u2192 0%' },
      { metric: 'Temps de traitement', value: '-60%' },
      { metric: 'Commandes par jour', value: '+45%' },
      { metric: 'Paiements Mobile Money', value: '\u00c0 venir' },
    ],
    testimonial: 'Les erreurs de commande, c\u2019\u00e9tait notre cauchemar. Un client commandait poulet brais\u00e9 et on lui pr\u00e9parait du poisson. Avec Kamforms, le client choisit lui-m\u00eame son plat dans la liste, et la commande arrive sans erreur. Les paiements Mobile Money arrivent bient\u00f4t pour permettre aux clients de payer en m\u00eame temps qu\u2019ils commandent.',
    body: `
<p>Chez Mado est un restaurant traditionnel situ\u00e9 \u00e0 Douala, Cameroun. Avec une client\u00e8le fid\u00e8le qui commande principalement par t\u00e9l\u00e9phone et WhatsApp, le restaurant faisait face \u00e0 un probl\u00e8me majeur : les erreurs de saisie des commandes.</p>
<p>En 24 heures, le restaurant a mis en place un formulaire de commande Kamforms avec la carte compl\u00e8te et les options de livraison. R\u00e9sultat : z\u00e9ro erreur de commande, 45% de commandes en plus. Les paiements MTN Mobile Money seront bient\u00f4t disponibles pour permettre aux clients de payer directement depuis le formulaire.</p>
<p><a href="/sign-up">Digitalisez vos commandes comme Chez Mado \u2192</a></p>`,
  },
]
