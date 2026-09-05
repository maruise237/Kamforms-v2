# Plan d'action GEO — Apparaître dans ChatGPT / AI Overviews

## Diagnostic (basé sur 20+ requêtes testées)

### Requêtes où ChatGPT cite des sources web

| Requête | Sources citées | Kamforms ? |
|---|---|---|
| Meilleur outil formulaire WhatsApp | WATI, Respond.io, Typeform, Jotform, Tally, ManyChat | ❌ |
| Alternative à Google Forms pour WhatsApp | Typeform, Tally, Jotform, Fillout, Landbot, WATI | ❌ |
| Alternative à Typeform pour l'Afrique | Jotform, Tally, Fillout, Formbricks, HeyForm | ❌ |
| Outil low-cost formulaires Afrique | Tally, Formbricks, Google Forms | ❌ |
| Meilleurs outils digitaux PME Cameroun | Odoo, Ngavix, GestioPro, Google Forms, Trello | ❌ |
| Best lead gen via WhatsApp Africa | ManyChat, Respond.io, WATI, BuzzBip, Fiitsa | ❌ |
| WhatsApp survey tool African SMEs | WATI, Respond.io, Jotform, Fillout, Tally, WhatsForm | ❌ |
| No-code form builder WhatsApp | Typeform, Fillout, Respond.io, WATI, Jotform, Tally, Interakt | ❌ |

### Concurrents cités vs Kamforms

| Concurrent | Pages ChatGPT consulte | Ce qu'il faut faire |
|---|---|---|
| **WATI** | wati.io, blog.wati.io | Créer page "Kamforms vs WATI" |
| **Respond.io** | respond.io, docs.respond.io | Créer page "Kamforms vs Respond.io" |
| **Tally** | tally.so, blog.tally.so | Créer page "Kamforms vs Tally" |
| **Jotform** | jotform.com, jotform.com/blog | Page already exists in alt-google-forms |
| **Fillout** | fillout.com | Créer page "Kamforms vs Fillout" |
| **Typeform** | typeform.com, typeform.com/blog | Page already exists |
| **Formbricks** | formbricks.com, github.com/formbricks | Mentionner dans comparatif |
| **ManyChat** | manychat.com | Créer page "WhatsApp forms vs chatbots" |
| **Interakt** | interakt.ai | Créer page "Kamforms vs Interakt" |

---

## Actions techniques (à faire en code)

### 1. Pages comparatifs manquants (priorité haute)
- `src/app/comparatif/kamforms-vs-jotform/page.tsx`
- `src/app/comparatif/kamforms-vs-tally/page.tsx`
- `src/app/comparatif/kamforms-vs-fillout/page.tsx`
- `src/app/comparatif/kamforms-vs-wati/page.tsx`
- `src/app/comparatif/kamforms-vs-respond-io/page.tsx`

Chaque page doit avoir : tableau comparatif, JSON-LD Product + FAQPage, WhatsApp + Mobile Money comme différenciateurs clés.

### 2. Ajouter le balisage d'entité SoftwareApplication
- Ajouter `@type: SoftwareApplication` + `applicationCategory: "FormBuilder"` + `operatingSystem: "Web"` sur les pages clés
- Utiliser `sameAs` pour lier les profils réseaux

### 3. Créer une page "Presse / Mentions / Annexes"
- Page qui liste les fonctionnalités clés dans un format facilement extractible par les IA
- Inclure les stats produit (nombre d'utilisateurs, pays couverts, etc.)

### 4. Enrichir les pages comparatifs existantes
- Ajouter plus de concurrents dans le tableau de `alternative-a-google-forms`
- Ajouter une section "Kamforms vs les autres"

### 5. Ajouter une page dédiée "Alternatives à Typeform en Afrique"
- Landing dédiée avec tous les comparatifs en un seul endroit

---

## Actions manuelles (à faire par toi)

### Soumissions aux annuaires SaaS (PRIORITÉ MAX)
Ces plateformes sont régulièrement crawlées par ChatGPT :

| Annuaire | URL soumission | Priorité |
|---|---|---|
| **G2** | g2.com/products/new | 🔴 Haute |
| **Capterra** | capterra.com/write-a-review | 🔴 Haute |
| **AlternativeTo** | alternativeto.net/submit | 🔴 Haute |
| **SaaSHub** | saashub.com/submit | 🟡 Moyenne |
| **Product Hunt** | producthunt.com/posts/new | 🟡 Moyenne (post-launch) |
| **BetaList** | betalist.com/submit | 🟡 Moyenne |
| **Crunchbase** | crunchbase.com/add | 🟢 Faible |
| **StackShare** | stackshare.io/tools | 🟢 Faible |
| **There's An AI For That** | theresanaiforthat.com/submit | 🟢 Faible |

### Description à utiliser pour les soumissions :

**Tagline** : Kamforms — Formulaires WhatsApp intelligents pour PME africaines

**Description courte (50 mots)** :
> Kamforms est un créateur de formulaires en ligne avec génération IA et notifications WhatsApp instantanées. Créez des formulaires de devis, commande, inscription ou sondage en 30 secondes. Acceptez les paiements Orange Money, MTN Mobile Money et Wave. Pensé pour les PME africaines.

**Description longue (150 mots)** :
> Kamforms est la première plateforme de formulaires en ligne conçue spécifiquement pour les PME africaines. Avec la génération par IA, créez un formulaire complet en décrivant votre besoin en français — en 30 secondes chrono.
>
> Fonctionnalités clés :
> - Génération IA de formulaires en 30 secondes
> - Notifications WhatsApp instantanées (moins de 5 secondes)
> - Paiements Mobile Money intégrés (Orange Money, MTN, Wave)
> - Import Google Forms en 1 clic
> - Formulaires multi-étapes (+40% de complétion)
> - Self-hosting disponible
>
> Contrairement à Typeform, Jotform ou Google Forms, Kamforms est pensé pour le marché africain : connexion 3G/4G, prix en FCFA, Mobile Money, et interface en français.

### Community building
- **Reddit** : Publier sur r/Africa, r/Entrepreneur, r/SaaS, r/AfricanTech — pas de lien direct, du contenu utile
- **Indie Hackers** : Raconter le parcours de construction de Kamforms
- **Hacker News** : Show HN quand la version anglaise sera prête
- **Product Hunt** : Launch officiel

### Content syndication
- Publier des articles invités sur WeAreTechAfrica, TechCabal, Agence Ecofin
- Publier des comparatifs sur Medium (format "Kamforms vs X")

---

## Calendrier recommandé

| Semaine | Action |
|---|---|
| 1 | Créer les 5 pages comparatifs en code + déployer |
| 2 | Soumettre à G2, Capterra, AlternativeTo, SaaSHub |
| 3 | Publier 2 articles Medium + post Reddit |
| 4 | Product Hunt launch + BetaList + Crunchbase |
| 5 | Articles invités médias africains + monitoring ChatGPT |
