# Ajouter une mise à jour système

Recette complète pour une nouvelle déclinaison (exemple : `agronomie`).
La suite échoue tant qu'une seule de ces étapes est oubliée.

## 1. Créer la page

Copier la page modèle, puis adapter :

    mkdir -p agronomie
    cp democratie/index.html agronomie/index.html

Dans `agronomie/index.html` :

1. `<title>`, `meta description` de la nouvelle thématique.
2. `<link rel="canonical" href="https://la-mise-a-jour.fr/agronomie/">` et
   `og:url` à la même valeur (slash final compris).
3. `og:image` → `https://la-mise-a-jour.fr/agronomie/og.png`.
4. `<span class="brand-badge">` → le nom du produit (ex. `Agro 4.0`).
5. `<body data-share-text="…">` → une phrase de partage.
6. Les trois liens de partage codés en dur (WhatsApp, X, Facebook) encodent la
   nouvelle URL et le nouveau texte.
7. Remplacer le contenu : hero, comparaison des deux plans, fonctionnalités,
   FAQ. Garder la structure (un `h1`, des `id` uniques, `.plan`, `.feature-card`,
   `.faq-item`).

## 2. Basculer la carte du hub

Dans `index.html`, section `#collection` :

- la carte passe de `update-card--soon` à `update-card--live` ;
- le statut passe à `Disponible`, le teaser et le changelog sont écrits ;
- le CTA devient `<a class="btn btn-primary btn-sm" href="agronomie/">Ouvrir la mise à jour →</a>`
  (c'est le seul `<a>` de la grille).

## 3. Enregistrer la page

- `sitemap.xml` : ajouter `<url><loc>https://la-mise-a-jour.fr/agronomie/</loc>…</url>`
  (priorité 0.9, `lastmod` du jour).
- `tests/structure.spec.ts` : ajouter
  `{ name: 'agronomie', file: 'agronomie/index.html', url: 'https://la-mise-a-jour.fr/agronomie/', sub: true }`
  au registre `PAGES`.
- `tests/structure.spec.ts` : mettre à jour les littéraux du hub —
  `card teasers match the spec copy`.
  Les décomptes (`HubCollection › update cards match the registry`,
  `only delivered cards link out`, `grid responsive`,
  `ChromeHeader › hub header copy`) dérivent de `PAGES`/`PLANNED` :
  aucun littéral à y toucher.
  Si le nombre de cartes change, ajuster `grid-template-columns` de
  `.updates-grid` dans `styles.css` (colonnes fixes).
- Retirer la déclinaison de `PLANNED` et de ses cartes/badges « bientôt ».

## 4. Mettre à jour le bandeau collection

Sur **toutes** les sous-pages (y compris la nouvelle) : la page livrée est
ajoutée en `<a href="../agronomie/">`, les autres restent en badges. Le test
`CollectionStrip` compare chaque page au registre : une seule page oubliée
suffit à le faire échouer.

## 5. Générer l'image de partage

Ajouter la capture de la nouvelle page dans le tableau `SHOTS` de
`scripts/capture-og.mjs` :

    { url: 'http://localhost:8765/agronomie/', selector: '#tarifs', out: 'agronomie/og.png' }

Puis :

    mise exec -- pnpm exec vite --port 8765 --strictPort &
    sleep 3
    mise exec -- pnpm node scripts/capture-og.mjs

Puis `mise exec -- pnpm test` au vert, commit, push.
