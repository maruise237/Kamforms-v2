# Plan de monitoring SEO — Kamforms

## Quotidien (automatisé)
- **Sentry** : vérifier les erreurs 500, 404 inattendues, et les baisses de performance
- **Umami** : consulter les pages vues, les pics de trafic et les sources d'acquisition
- **/api/health** : uptime DB + app (configurer uptime.kamtech.online ou BetterStack)

## Hebdomadaire
- **Google Search Console** :
  - Pages indexées vs en baisse vs exclues
  - Requêtes avec impressions mais sans clics (priorité)
  - Erreurs de crawling (404, 500, soft 404, redirects)
  - Core Web Vitals (LCP, INP, CLS) → agir si >10% "poor"
- **Pagespeed Insights** (ou Lighthouse CI) :
  - Tester les 5 pages les plus visitées
  - Cible : LCP < 2.5s, INP < 200ms, CLS < 0.1
- **Umami** : top 10 pages par trafic organique, taux de rebond estimé

## Mensuel
- **Indexation** :
  - Vérifier `site:kamforms.com` sur Google → nombre de pages indexées
  - Vérifier le rapport d'indexation complet dans GSC
- **Sitemap** : s'assurer que `/sitemap.xml` est valide et soumis
- **Liens internes** : audit des pages orphelines ou faiblement liées
- **Contenu** : mettre à jour les dates `lastModified` des articles stalés
- **Concurrents** : vérifier le classement pour les mots-clés cibles des concurrents

## Trimestriel
- **Audit backlinks** : utiliser un outil gratuit (Ahrefs Webmaster Tools, Ubersuggest) pour surveiller les backlinks entrants
- **GEO (AI Overviews)** : tester 5-10 requêtes cibles sur ChatGPT, Perplexity, Claude → Kamforms est-il cité ?
- **llms.txt** : vérifier que le fichier est à jour avec les nouvelles pages
- **Mise à jour technique** : vérifier les breaking changes Next.js, Prisma, dépendances

## Alertes à configurer
- **Sentry** : alerte email si erreur 500 > 0 sur une période de 24h
- **BetterStack / UptimeRobot** : alerte si `/api/health` retourne 503
- **Google Search Console** : activer les notifications email pour chute d'indexation ou nouveau problème

## Outils recommandés
- Google Search Console (gratuit)
- Pagespeed Insights (gratuit)
- Umami auto-hébergé ✅ déjà configuré
- Sentry ✅ déjà configuré
- BetterStack ou UptimeRobot pour l'uptime (gratuit)
- Ahrefs Webmaster Tools (gratuit) ou Ubersuggest (gratuit limité)
- Sitebulb ou Screaming Frog pour crawler complet (optionnel)
