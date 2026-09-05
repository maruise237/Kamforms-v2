export type CountryData = {
  slug: string
  nom: string
  gentile: string
  indicatif: string
  mobileMoney: string[]
  keyword: string
  metaTitle: string
  metaDesc: string
  h1: string
  intro: string
  features: { title: string; body: string }[]
  faqs: { q: string; r: string }[]
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kamforms.com'

export const COUNTRIES: CountryData[] = [
  {
    slug: 'cote-d-ivoire',
    nom: "C\u00f4te d'Ivoire",
    gentile: 'ivoiriens',
    indicatif: '+225',
    mobileMoney: ['Orange Money', 'MTN Mobile Money', 'Moov Money'],
    keyword: 'formulaire whatsapp cote d ivoire',
    metaTitle: 'Formulaire WhatsApp C\u00f4te d\u2019Ivoire \u2014 Cr\u00e9ez votre formulaire en 30s',
    metaDesc: 'Cr\u00e9ez un formulaire WhatsApp pour votre business en C\u00f4te d\u2019Ivoire. G\u00e9n\u00e9ration IA, notifications instantan\u00e9es, paiements Mobile Money (bientôt). Essai gratuit.',
    h1: 'Cr\u00e9ez votre formulaire WhatsApp en C\u00f4te d\u2019Ivoire',
    intro: "Vous \u00eates bas\u00e9 \u00e0 Abidjan, Bouak\u00e9 ou Yamoussoukro ? Kamforms vous permet de cr\u00e9er des formulaires de collecte de donn\u00e9es en quelques secondes, de les partager sur vos groupes WhatsApp, et de recevoir chaque r\u00e9ponse directement sur votre t\u00e9l\u00e9phone avec des notifications instantan\u00e9es. Id\u00e9al pour les PME ivoiriennes, les formateurs, les commer\u00e7ants et les agences.",
    features: [
      { title: 'Paiements Mobile Money (\u00e0 venir)', body: 'Bient\u00f4t : acceptez les paiements via Orange Money et MTN Mobile Money directement dans vos formulaires. Vos clients paieront depuis leur t\u00e9l\u00e9phone, vous recevrez la confirmation sur WhatsApp.' },
      { title: 'Notifi\u00e9s sur WhatsApp en 5s', body: 'Chaque r\u00e9ponse arrive sur votre WhatsApp priv\u00e9 en moins de 5 secondes. Fini les allers-retours dans les groupes WhatsApp.' },
      { title: 'G\u00e9n\u00e9ration IA en fran\u00e7ais', body: "D\u00e9crivez votre formulaire en fran\u00e7ais ivoirien. L\u2019IA g\u00e9n\u00e8re les champs automatiquement. Exemple : \u00ab Formulaire de commande pour restaurant \u00e0 Abidjan \u00bb" },
      { title: 'Collecte hors ligne possible', body: 'Vos clients remplissent le formulaire m\u00eame avec une connexion 3G instable. Les donn\u00e9es sont sauvegard\u00e9es et soumises d\u00e8s que la connexion revient.' },
    ],
    faqs: [
      { q: "Comment cr\u00e9er un formulaire WhatsApp en C\u00f4te d\u2019Ivoire ?", r: "Avec Kamforms, cr\u00e9ez votre formulaire en 30 secondes : d\u00e9crivez votre besoin \u00e0 l\u2019IA, configurez vos notifications WhatsApp avec votre num\u00e9ro, et partagez le lien sur votre groupe WhatsApp." },
      { q: "Puis-je accepter les paiements Orange Money dans mon formulaire ?", r: "Bient\u00f4t disponible. Kamforms int\u00e8grera Orange Money et MTN Mobile Money. Vous pourrez ajouter un paiement \u00e0 n\u2019importe quelle question de votre formulaire." },
      { q: "Combien co\u00fbte un formulaire WhatsApp en C\u00f4te d\u2019Ivoire ?", r: "Kamforms est gratuit pour commencer. Les plans Pro commencent \u00e0 3 500 FCFA/mois (6$/mois) avec des notifications WhatsApp illimit\u00e9es et plus de fonctionnalit\u00e9s." },
    ],
  },
  {
    slug: 'senegal',
    nom: 'S\u00e9n\u00e9gal',
    gentile: 's\u00e9n\u00e9galais',
    indicatif: '+221',
    mobileMoney: ['Orange Money', 'Wave', 'MTN Money'],
    keyword: 'formulaire whatsapp senegal',
    metaTitle: 'Formulaire WhatsApp S\u00e9n\u00e9gal \u2014 Cr\u00e9ez votre formulaire en 30s',
    metaDesc: 'Cr\u00e9ez un formulaire WhatsApp pour votre business au S\u00e9n\u00e9gal. G\u00e9n\u00e9ration IA, notifications WhatsApp, paiements Mobile Money (bientôt). Essai gratuit.',
    h1: 'Cr\u00e9ez votre formulaire WhatsApp au S\u00e9n\u00e9gal',
    intro: "Bas\u00e9 \u00e0 Dakar, Thi\u00e8s ou Saint-Louis ? Kamforms est l\u2019outil id\u00e9al pour les entrepreneurs s\u00e9n\u00e9galais : cr\u00e9ez des formulaires de devis, d\u2019inscription ou de commande en quelques secondes, partagez le lien sur WhatsApp et recevez chaque r\u00e9ponse en temps r\u00e9el sur votre t\u00e9l\u00e9phone.",
    features: [
      { title: 'Paiements Mobile Money (\u00e0 venir)', body: 'Bient\u00f4t : acceptez les paiements via Orange Money et Wave directement dans vos formulaires. Id\u00e9al pour les commer\u00e7ants et formateurs s\u00e9n\u00e9galais.' },
      { title: 'Notifications WhatsApp instantan\u00e9es', body: 'Recevez chaque r\u00e9ponse sur votre WhatsApp priv\u00e9 en moins de 5 secondes. Parfait pour les entrepreneurs s\u00e9n\u00e9galais toujours en d\u00e9placement.' },
      { title: 'G\u00e9n\u00e9ration IA adapt\u00e9e', body: "D\u00e9crivez votre besoin en fran\u00e7ais ou en wolof. L\u2019IA g\u00e9n\u00e8re automatiquement un formulaire complet avec les bons champs." },
      { title: 'Formulaires multi-\u00e9tapes', body: 'Augmentez vos taux de r\u00e9ponse avec des formulaires qui posent une question \u00e0 la fois. Barre de progression, auto-avancement.' },
    ],
    faqs: [
      { q: "Comment cr\u00e9er un formulaire WhatsApp au S\u00e9n\u00e9gal ?", r: "Avec Kamforms, cr\u00e9ez votre formulaire en 30 secondes : d\u00e9crivez votre besoin \u00e0 l\u2019IA, ajoutez votre num\u00e9ro WhatsApp +221 pour les notifications, et partagez le lien." },
      { q: "Wave est-il accept\u00e9 dans les formulaires ?", r: "Bient\u00f4t disponible. Wave sera int\u00e9gr\u00e9 dans Kamforms, ainsi qu\u2019Orange Money. Vos clients s\u00e9n\u00e9galais pourront payer depuis leur compte Wave directement depuis le formulaire." },
      { q: "Puis-je utiliser Kamforms pour mon commerce \u00e0 Dakar ?", r: "Absolument. Kamforms est utilis\u00e9 par des commer\u00e7ants, formateurs et agences \u00e0 Dakar pour les commandes, inscriptions et collecte de leads." },
    ],
  },
  {
    slug: 'cameroun',
    nom: 'Cameroun',
    gentile: 'camerounais',
    indicatif: '+237',
    mobileMoney: ['MTN Mobile Money', 'Orange Money', 'Yoomee'],
    keyword: 'formulaire whatsapp cameroun',
    metaTitle: 'Formulaire WhatsApp Cameroun \u2014 Cr\u00e9ez votre formulaire en 30s',
    metaDesc: 'Cr\u00e9ez un formulaire WhatsApp pour votre business au Cameroun. G\u00e9n\u00e9ration IA, notifications WhatsApp, paiements Mobile Money (bientôt). Essai gratuit.',
    h1: 'Cr\u00e9ez votre formulaire WhatsApp au Cameroun',
    intro: "Bas\u00e9 \u00e0 Douala, Yaound\u00e9 ou Bafoussam ? Kamforms vous aide \u00e0 structurer votre collecte de donn\u00e9es sur WhatsApp. Cr\u00e9ez des formulaires en 30 secondes avec l\u2019IA, partagez le lien et recevez les r\u00e9ponses directement sur votre WhatsApp. Pens\u00e9 pour les PME camerounaises.",
    features: [
      { title: 'Paiements Mobile Money (\u00e0 venir)', body: 'Bient\u00f4t : acceptez les paiements MTN Mobile Money et Orange Money dans vos formulaires. Id\u00e9al pour les commerces et services au Cameroun.' },
      { title: 'Notifications WhatsApp en temps r\u00e9el', body: 'Soyez alert\u00e9 imm\u00e9diatement \u00e0 chaque nouvelle r\u00e9ponse. Plus besoin de v\u00e9rifier vos emails ou vos groupes.' },
      { title: 'G\u00e9n\u00e9ration IA', body: "D\u00e9crivez votre formulaire en fran\u00e7ais ou en pidgin. L\u2019IA g\u00e9n\u00e8re automatiquement les champs pertinents pour votre activit\u00e9." },
      { title: 'Self-hosting disponible', body: 'Les entreprises camerounaises soucieuses de leurs donn\u00e9es peuvent h\u00e9berger Kamforms sur leur propre infrastructure.' },
    ],
    faqs: [
      { q: "Comment cr\u00e9er un formulaire WhatsApp au Cameroun ?", r: "Cr\u00e9ez votre formulaire en 30 secondes avec Kamforms : d\u00e9crivez votre besoin \u00e0 l\u2019IA, configurez les notifications WhatsApp avec votre num\u00e9ro +237, et partagez le lien." },
      { q: "MTN Mobile Money est-il accept\u00e9 ?", r: "Bient\u00f4t disponible. MTN Mobile Money et Orange Money seront int\u00e9gr\u00e9s dans Kamforms. Vos clients camerounais pourront payer depuis leur compte Mobile Money." },
      { q: "Y a-t-il une option self-hosting au Cameroun ?", r: "Oui. Kamforms propose une option self-hosting pour les entreprises qui souhaitent garder le contr\u00f4le total de leurs donn\u00e9es sur leurs serveurs." },
    ],
  },
  {
    slug: 'mali',
    nom: 'Mali',
    gentile: 'maliens',
    indicatif: '+223',
    mobileMoney: ['Orange Money', 'Moov Money'],
    keyword: 'formulaire whatsapp mali',
    metaTitle: 'Formulaire WhatsApp Mali \u2014 Cr\u00e9ez votre formulaire en 30s',
    metaDesc: 'Cr\u00e9ez un formulaire WhatsApp pour votre business au Mali. G\u00e9n\u00e9ration IA, notifications WhatsApp, paiements Mobile Money (bientôt). Essai gratuit.',
    h1: 'Cr\u00e9ez votre formulaire WhatsApp au Mali',
    intro: "Bas\u00e9 \u00e0 Bamako, Sikasso ou S\u00e9gou ? Kamforms vous permet de cr\u00e9er des formulaires de collecte de donn\u00e9es en quelques secondes, de les partager sur WhatsApp et de recevoir chaque r\u00e9ponse directement sur votre t\u00e9l\u00e9phone.",
    features: [
      { title: 'Paiements Mobile Money (\u00e0 venir)', body: 'Bient\u00f4t : acceptez les paiements Orange Money directement dans vos formulaires. Id\u00e9al pour les commer\u00e7ants et prestataires maliens.' },
      { title: 'Notifications WhatsApp', body: "Chaque r\u00e9ponse arrive sur votre WhatsApp en moins de 5 secondes. Plus d\u2019infos qui se perdent dans les groupes." },
      { title: 'G\u00e9n\u00e9ration IA', body: "D\u00e9crivez votre formulaire en fran\u00e7ais ou en bambara. L\u2019IA cr\u00e9e automatiquement les champs adapt\u00e9s \u00e0 votre besoin." },
      { title: 'Export CSV', body: 'Exportez toutes vos r\u00e9ponses en CSV pour les analyser dans Excel ou Google Sheets.' },
    ],
    faqs: [
      { q: "Comment cr\u00e9er un formulaire WhatsApp au Mali ?", r: "Avec Kamforms, d\u00e9crivez votre besoin \u00e0 l\u2019IA, ajoutez votre num\u00e9ro WhatsApp +223, et partagez le lien sur vos groupes WhatsApp. Gratuit pour commencer." },
      { q: "Puis-je recevoir des paiements Orange Money ?", r: "Bient\u00f4t disponible. Orange Money sera int\u00e9gr\u00e9 dans Kamforms. Vos clients maliens pourront payer depuis leur compte Orange Money." },
    ],
  },
  {
    slug: 'burkina-faso',
    nom: 'Burkina Faso',
    gentile: 'burkinab\u00e9s',
    indicatif: '+226',
    mobileMoney: ['Orange Money', 'Moov Money'],
    keyword: 'formulaire whatsapp burkina faso',
    metaTitle: 'Formulaire WhatsApp Burkina Faso \u2014 Cr\u00e9ez votre formulaire en 30s',
    metaDesc: 'Cr\u00e9ez un formulaire WhatsApp pour votre business au Burkina Faso. G\u00e9n\u00e9ration IA, notifications WhatsApp, paiements Mobile Money (bientôt). Essai gratuit.',
    h1: 'Cr\u00e9ez votre formulaire WhatsApp au Burkina Faso',
    intro: "Bas\u00e9 \u00e0 Ouagadougou, Bobo-Dioulasso ou Koudougou ? Kamforms simplifie la collecte de donn\u00e9es sur WhatsApp pour les PME burkinab\u00e9s. Cr\u00e9ez des formulaires en 30 secondes, recevez les r\u00e9ponses en temps r\u00e9el.",
    features: [
      { title: 'Paiements Mobile Money (\u00e0 venir)', body: 'Bient\u00f4t : acceptez les paiements Orange Money dans vos formulaires. Solution id\u00e9ale pour les commer\u00e7ants burkinab\u00e9s.' },
      { title: 'Notifications WhatsApp', body: 'Recevez chaque r\u00e9ponse directement sur votre WhatsApp priv\u00e9. Fini les messages noy\u00e9s dans les groupes.' },
      { title: 'G\u00e9n\u00e9ration IA', body: "D\u00e9crivez votre besoin en fran\u00e7ais ou en moor\u00e9. L\u2019IA g\u00e9n\u00e8re automatiquement un formulaire complet." },
      { title: 'Formulaires multi-\u00e9tapes', body: 'Augmentez vos taux de r\u00e9ponse avec des formulaires qui posent une question \u00e0 la fois.' },
    ],
    faqs: [
      { q: "Comment cr\u00e9er un formulaire WhatsApp au Burkina Faso ?", r: "Avec Kamforms, cr\u00e9ez votre formulaire en 30 secondes : d\u00e9crivez votre besoin \u00e0 l\u2019IA, ajoutez votre num\u00e9ro +226, et partagez le lien." },
      { q: "Orange Money est-il disponible ?", r: "Bient\u00f4t disponible. Orange Money sera int\u00e9gr\u00e9 dans Kamforms pour les paiements. Vos clients burkinab\u00e9s pourront payer depuis leur t\u00e9l\u00e9phone." },
    ],
  },
  {
    slug: 'togo',
    nom: 'Togo',
    gentile: 'togolais',
    indicatif: '+228',
    mobileMoney: ['T-Money', 'Moov Money'],
    keyword: 'formulaire whatsapp togo',
    metaTitle: 'Formulaire WhatsApp Togo \u2014 Cr\u00e9ez votre formulaire en 30s',
    metaDesc: 'Cr\u00e9ez un formulaire WhatsApp pour votre business au Togo. G\u00e9n\u00e9ration IA, notifications WhatsApp, paiements Mobile Money (bientôt). Essai gratuit.',
    h1: 'Cr\u00e9ez votre formulaire WhatsApp au Togo',
    intro: "Bas\u00e9 \u00e0 Lom\u00e9, Kara ou Sokod\u00e9 ? Kamforms vous permet de cr\u00e9er des formulaires professionnels en quelques secondes, de les partager sur WhatsApp et de recevoir chaque r\u00e9ponse directement sur votre t\u00e9l\u00e9phone.",
    features: [
      { title: 'Paiements Mobile Money (\u00e0 venir)', body: 'Bient\u00f4t : acceptez les paiements T-Money et Moov Money directement dans vos formulaires. Id\u00e9al pour les commer\u00e7ants togolais.' },
      { title: 'Notifications WhatsApp', body: 'Soyez notifi\u00e9 \u00e0 chaque r\u00e9ponse en moins de 5 secondes sur votre WhatsApp priv\u00e9.' },
      { title: 'G\u00e9n\u00e9ration IA', body: "D\u00e9crivez votre formulaire en fran\u00e7ais ou en \u00e9w\u00e9. L\u2019IA g\u00e9n\u00e8re les champs automatiquement." },
      { title: 'Gratuit pour commencer', body: 'Commencez avec le plan Gratuit, sans carte bancaire. Passez \u00e0 Pro quand vous \u00eates pr\u00eat.' },
    ],
    faqs: [
      { q: "Comment cr\u00e9er un formulaire WhatsApp au Togo ?", r: "Cr\u00e9ez votre formulaire en 30 secondes : tapez votre besoin \u00e0 l\u2019IA, configurez votre num\u00e9ro +228, partagez le lien WhatsApp." },
      { q: "T-Money est-il accept\u00e9 dans les formulaires ?", r: "Bient\u00f4t disponible. T-Money et Moov Money seront int\u00e9gr\u00e9s dans Kamforms." },
    ],
  },
  {
    slug: 'benin',
    nom: 'B\u00e9nin',
    gentile: 'b\u00e9ninois',
    indicatif: '+229',
    mobileMoney: ['MTN Mobile Money', 'Moov Money'],
    keyword: 'formulaire whatsapp benin',
    metaTitle: 'Formulaire WhatsApp B\u00e9nin \u2014 Cr\u00e9ez votre formulaire en 30s',
    metaDesc: 'Cr\u00e9ez un formulaire WhatsApp pour votre business au B\u00e9nin. G\u00e9n\u00e9ration IA, notifications WhatsApp, paiements Mobile Money (bientôt). Essai gratuit.',
    h1: 'Cr\u00e9ez votre formulaire WhatsApp au B\u00e9nin',
    intro: "Bas\u00e9 \u00e0 Cotonou, Porto-Novo ou Parakou ? Kamforms vous aide \u00e0 collecter des donn\u00e9es structur\u00e9es depuis WhatsApp. Cr\u00e9ez des formulaires avec l\u2019IA en 30 secondes, recevez les r\u00e9ponses en priv\u00e9.",
    features: [
      { title: 'Paiements Mobile Money (\u00e0 venir)', body: 'Bient\u00f4t : acceptez les paiements MTN Mobile Money et Moov Money dans vos formulaires.' },
      { title: 'Notifications WhatsApp', body: "Chaque r\u00e9ponse arrive sur votre WhatsApp. Plus besoin de v\u00e9rifier vos groupes constamment." },
      { title: 'G\u00e9n\u00e9ration IA', body: "D\u00e9crivez votre besoin en fran\u00e7ais ou en fon. L\u2019IA g\u00e9n\u00e8re automatiquement un formulaire complet." },
      { title: 'Import Google Forms', body: "Vous avez d\u00e9j\u00e0 un formulaire Google Forms ? Importez-le en un clic avec toutes vos questions." },
    ],
    faqs: [
      { q: "Comment cr\u00e9er un formulaire WhatsApp au B\u00e9nin ?", r: "Avec Kamforms, d\u00e9crivez votre besoin \u00e0 l\u2019IA en 30 secondes, ajoutez votre num\u00e9ro +229, et partagez le lien sur WhatsApp." },
      { q: "MTN Mobile Money est-il disponible ?", r: "Bient\u00f4t disponible. MTN Mobile Money et Moov Money seront int\u00e9gr\u00e9s dans Kamforms." },
    ],
  },
  {
    slug: 'niger',
    nom: 'Niger',
    gentile: 'nig\u00e9riens',
    indicatif: '+227',
    mobileMoney: ['Orange Money', 'Moov Money'],
    keyword: 'formulaire whatsapp niger',
    metaTitle: 'Formulaire WhatsApp Niger \u2014 Cr\u00e9ez votre formulaire en 30s',
    metaDesc: 'Cr\u00e9ez un formulaire WhatsApp pour votre business au Niger. G\u00e9n\u00e9ration IA, notifications WhatsApp, paiements Mobile Money (bientôt). Essai gratuit.',
    h1: 'Cr\u00e9ez votre formulaire WhatsApp au Niger',
    intro: "Bas\u00e9 \u00e0 Niamey, Zinder ou Maradi ? Kamforms vous permet de cr\u00e9er des formulaires de collecte de donn\u00e9es en quelques secondes, optimis\u00e9s pour le march\u00e9 nig\u00e9rien.",
    features: [
      { title: 'Paiements Mobile Money (\u00e0 venir)', body: 'Bient\u00f4t : acceptez les paiements Orange Money directement dans vos formulaires. Id\u00e9al pour les commer\u00e7ants nig\u00e9riens.' },
      { title: 'Notifications WhatsApp', body: 'Recevez chaque r\u00e9ponse sur votre WhatsApp en moins de 5 secondes.' },
      { title: 'G\u00e9n\u00e9ration IA', body: "D\u00e9crivez votre besoin en fran\u00e7ais ou en haoussa. L\u2019IA cr\u00e9e automatiquement les champs adapt\u00e9s." },
      { title: 'Optimis\u00e9 mobile', body: 'Vos formulaires sont optimis\u00e9s pour les connexions mobiles et les petits \u00e9crans.' },
    ],
    faqs: [
      { q: "Comment cr\u00e9er un formulaire WhatsApp au Niger ?", r: "Cr\u00e9ez votre formulaire en 30 secondes : d\u00e9crivez votre besoin \u00e0 l\u2019IA, ajoutez votre num\u00e9ro +227, partagez le lien sur vos groupes WhatsApp." },
      { q: "Orange Money est-il accept\u00e9 ?", r: "Bient\u00f4t disponible. Orange Money sera int\u00e9gr\u00e9 dans Kamforms pour les paiements au Niger." },
    ],
  },
  {
    slug: 'guinee',
    nom: 'Guin\u00e9e',
    gentile: 'guin\u00e9ens',
    indicatif: '+224',
    mobileMoney: ['Orange Money', 'MTN Mobile Money'],
    keyword: 'formulaire whatsapp guinee',
    metaTitle: 'Formulaire WhatsApp Guin\u00e9e \u2014 Cr\u00e9ez votre formulaire en 30s',
    metaDesc: 'Cr\u00e9ez un formulaire WhatsApp pour votre business en Guin\u00e9e. G\u00e9n\u00e9ration IA, notifications WhatsApp, paiements Mobile Money (bientôt). Essai gratuit.',
    h1: 'Cr\u00e9ez votre formulaire WhatsApp en Guin\u00e9e',
    intro: "Bas\u00e9 \u00e0 Conakry, Kankan ou N\u2019Z\u00e9r\u00e9kor\u00e9 ? Kamforms vous aide \u00e0 collecter des donn\u00e9es structur\u00e9es sur WhatsApp. Cr\u00e9ez des formulaires en 30 secondes, recevez les r\u00e9ponses en temps r\u00e9el.",
    features: [
      { title: 'Paiements Mobile Money (\u00e0 venir)', body: 'Bient\u00f4t : acceptez les paiements Orange Money et MTN Mobile Money dans vos formulaires guin\u00e9ens.' },
      { title: 'Notifications WhatsApp', body: 'Soyez alert\u00e9 imm\u00e9diatement \u00e0 chaque nouvelle soumission sur votre WhatsApp priv\u00e9.' },
      { title: 'G\u00e9n\u00e9ration IA', body: "D\u00e9crivez votre formulaire en fran\u00e7ais ou en poular. L\u2019IA g\u00e9n\u00e8re automatiquement les champs." },
      { title: 'Support en fran\u00e7ais', body: 'Notre \u00e9quipe vous r\u00e9pond en fran\u00e7ais, pas de chatbot. Support humain pour les entrepreneurs guin\u00e9ens.' },
    ],
    faqs: [
      { q: "Comment cr\u00e9er un formulaire WhatsApp en Guin\u00e9e ?", r: "Avec Kamforms, d\u00e9crivez votre besoin \u00e0 l\u2019IA, ajoutez votre num\u00e9ro +224, et partagez le lien sur vos groupes WhatsApp. Gratuit pour commencer." },
      { q: "Orange Money est-il disponible en Guin\u00e9e ?", r: "Bient\u00f4t disponible. Orange Money et MTN Mobile Money seront int\u00e9gr\u00e9s dans Kamforms pour la Guin\u00e9e." },
    ],
  },
  {
    slug: 'rca',
    nom: 'R\u00e9publique Centrafricaine',
    gentile: 'centrafricains',
    indicatif: '+236',
    mobileMoney: ['Orange Money', 'Moov Money'],
    keyword: 'formulaire whatsapp centrafrique',
    metaTitle: 'Formulaire WhatsApp Centrafrique \u2014 Cr\u00e9ez votre formulaire en 30s',
    metaDesc: 'Cr\u00e9ez un formulaire WhatsApp pour votre business en Centrafrique. G\u00e9n\u00e9ration IA, notifications WhatsApp, paiements Mobile Money (bientôt). Essai gratuit.',
    h1: 'Cr\u00e9ez votre formulaire WhatsApp en Centrafrique',
    intro: "Bas\u00e9 \u00e0 Bangui ou Bambari ? Kamforms vous permet de cr\u00e9er des formulaires de collecte de donn\u00e9es en quelques secondes, optimis\u00e9s pour le march\u00e9 centrafricain.",
    features: [
      { title: 'Paiements Mobile Money (\u00e0 venir)', body: 'Bient\u00f4t : acceptez les paiements Orange Money directement dans vos formulaires.' },
      { title: 'Notifications WhatsApp', body: 'Chaque r\u00e9ponse arrive sur votre WhatsApp priv\u00e9 en moins de 5 secondes.' },
      { title: 'G\u00e9n\u00e9ration IA', body: "D\u00e9crivez votre besoin en fran\u00e7ais ou en sango. L\u2019IA g\u00e9n\u00e8re automatiquement un formulaire complet." },
      { title: 'Gratuit pour d\u00e9marrer', body: 'Commencez sans carte bancaire. Cr\u00e9ez votre premier formulaire en 30 secondes.' },
    ],
    faqs: [
      { q: "Comment cr\u00e9er un formulaire WhatsApp en Centrafrique ?", r: "Avec Kamforms, d\u00e9crivez votre besoin \u00e0 l\u2019IA, ajoutez votre num\u00e9ro +236, et partagez le lien sur vos groupes WhatsApp." },
      { q: "Orange Money est-il accept\u00e9 ?", r: "Bient\u00f4t disponible. Orange Money sera int\u00e9gr\u00e9 dans Kamforms pour les paiements en Centrafrique." },
    ],
  },
]

export function getCountryBySlug(slug: string) {
  return COUNTRIES.find(c => c.slug === slug) ?? null
}

export function getCountryCanonical(slug: string) {
  return `${APP_URL}/pays/${slug}`
}
