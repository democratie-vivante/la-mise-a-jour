# Ajouter une mise à jour système

Recette complète pour un nouveau chantier (exemple : `agronomie`).
La suite échoue tant qu'une seule de ces étapes est oubliée.

## 0. Choisir le statut

Le hub et le bandeau de collection partagent trois statuts :

- `Release candidate` — livrable prêt pour la revue ; la carte est
  `update-card--live` et c'est la seule à pointer vers une page.
- `Bêta fermée` — chantier ouvert, accès restreint ; reste
  `update-card--soon`.
- `Backlog` — chantier identifié, pas encore spécifié ; reste
  `update-card--soon`.

Les chantiers non livrés sont déclarés dans `PLANNED` avec l'un de ces
libellés, en minuscules (`release candidate`, `bêta fermée`, `backlog`).

## 1. Créer la page

Copier la page modèle, puis adapter :

    mkdir -p agronomie
    cp democratie/index.html agronomie/index.html

Dans `agronomie/index.html` :

1. `<title>`, `meta description` de la nouvelle thématique.
2. `<link rel="canonical" href="https://la-mise-a-jour.fr/agronomie/">` et
   `og:url` à la même valeur (slash final compris).
3. `og:image` → `https://la-mise-a-jour.fr/agronomie/og.png`.
4. `<span class="brand-badge">` → le nom du module (ex. `Agro 4.0`).
5. `<body data-share-text="…">` → une phrase de partage.
6. Les trois liens de partage codés en dur (WhatsApp, X, Facebook) encodent la
   nouvelle URL et le nouveau texte.
7. `hero-sub`, `plan-tag` et les titres de branches : remplacer les
   versions (`v5.0`, `v6.0`, `v7.0`) par celles du chantier.
8. Remplacer le contenu : hero, matrice des branches, fonctionnalités, FAQ.
   Garder la structure (un `h1`, des `id` uniques, `.plan`, `.feature-card`,
   `.faq-item`). La matrice garde 3 branches × 11 lignes (33 `plan-row`).

## 2. Basculer la carte du hub

Dans `index.html`, section `#collection` :

- la carte passe de `update-card--soon` à `update-card--live` ;
- le statut passe à `Release candidate`, le teaser et le changelog sont écrits ;
- le CTA devient `<a class="btn btn-primary btn-sm" href="agronomie/">Ouvrir la migration →</a>`
  (c'est le seul `<a>` de la grille) ;
- retirer la ligne correspondante de `PLANNED` dans `tests/structure.spec.ts`.

## 3. Enregistrer la page

- `sitemap.xml` : ajouter `<url><loc>https://la-mise-a-jour.fr/agronomie/</loc>…</url>`
  (priorité 0.9, `lastmod` du jour).
- `tests/structure.spec.ts` : ajouter
  `{ name: 'agronomie', file: 'agronomie/index.html', url: 'https://la-mise-a-jour.fr/agronomie/', sub: true }`
  au registre `PAGES`.
- `tests/structure.spec.ts` : mettre à jour les littéraux du hub —
  `card teasers match the spec copy` et, si besoin, les questions de
  `faq has three items`.
  Les décomptes (`HubCollection › update cards match the registry`,
  `only delivered cards link out`, `grid responsive`,
  `ChromeHeader › hub header copy`) dérivent de `PAGES`/`PLANNED` :
  aucun littéral à y toucher.
  Si le nombre de cartes change, ajuster `grid-template-columns` de
  `.updates-grid` dans `styles.css` (colonnes fixes).

## 4. Mettre à jour le bandeau collection

Sur **toutes** les sous-pages (y compris la nouvelle) : la page livrée est
ajoutée en `<a href="../agronomie/">`, les autres restent en badges avec leur
statut (`bêta fermée`, `backlog`). Le test `CollectionStrip` compare chaque
page au registre : une seule page oubliée suffit à le faire échouer.

## 5. Générer l'image de partage

Ajouter la capture de la nouvelle page dans le tableau `SHOTS` de
`scripts/capture-og.mjs` :

    { url: 'http://localhost:8765/agronomie/', selector: '#tarifs', out: 'agronomie/og.png' }

Puis :

    mise exec -- pnpm exec vite --port 8765 --strictPort &
    sleep 3
    mise exec -- pnpm node scripts/capture-og.mjs

Puis `mise exec -- pnpm test` au vert, commit, push.
