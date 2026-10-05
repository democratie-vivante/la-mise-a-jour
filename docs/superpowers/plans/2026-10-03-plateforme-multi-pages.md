# Plateforme multi-pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Exécution (2026-10-04) :** 12/12 tâches terminées sur la branche `plateforme-multi-pages`, revues indépendantes par tâche, revue finale + lot de corrections des défauts restants. Dérogation actée par l'utilisateur : `@types/node` ajouté en devDependency (3 → 4) pour rendre `tsc --noEmit` vert — la contrainte « 3 devDependencies » (ligne 26) est levée à cette fin. Le site livré reste sans dépendance (zéro build, servi tel quel).

**Goal:** Transformer le site monopage en plateforme : un hub « console de versions » à la racine et la page Citoyen 2.0 déplacée sur `/democratie/`, avec un chrome partagé, un bandeau collection et une suite de tests multi-pages unique.

**Architecture:** HTML/CSS/JS statiques sans build : chaque page est un fichier autonome qui référence `styles.css` / `main.js` en relatif, le chrome (header, footer) est dupliqué mais verrouillé par des tests de cohérence structurelle. Les URLs de partage sont dérivées du `<link rel="canonical">` de chaque page, pas d'une constante globale. Les tests statiques TypeScript lisent les fichiers ; une seconde suite navigateur vérifie la navigation réelle.

**Tech Stack:** HTML5 sémantique, CSS custom properties, JS vanilla (IIFE, `defer`), Playwright/TypeScript via `pnpm`, Vite uniquement comme serveur de tests, GitHub Pages en déploiement.

**Spec:** `docs/superpowers/specs/2026-10-02-plateforme-multi-pages-design.md` (le plan argumente à partir du spec — lire les deux).

## Global Constraints

- **Zéro build** : aucun bundler, générateur ni étape de build. Le déploiement reste « push tel quel » sur GitHub Pages.
- **Liens et assets strictement relatifs** : interdiction de `href="/..."` et `src="/..."` dans les pages HTML (spec §3.2).
- **URLs canoniques exactes** : `https://la-mise-a-jour.fr/` (hub) et `https://la-mise-a-jour.fr/democratie/` (slash final obligatoire).
- **Copy du hub** : les textes de la § 5 du spec font foi et sont vérifiés par les tests (h1, teasers des 4 cartes, 3 questions FAQ).
- **Couleurs** : uniquement les tokens existants (`--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-primary`, `--color-primary-dark`, `--color-danger`, `--color-success`), contraste ≥ 4,5:1 sur les paires déjà couvertes.
- **Règle zéro lien mort** : une déclinaison non livrée (Agronomie, Économie, Énergie) n'est jamais une balise `<a>`, toujours un badge de statut (spec §4.3).
- **Suite de tests unique** : TypeScript/Playwright. `tests/test_structure.py` et `tests/__init__.py` sont supprimés en T11.
- **Commandes** : `pnpm` n'est pas sur le PATH hors `mise`. Lancer les tests par :
  `mise exec -- pnpm exec playwright test` (ou `mise exec -- pnpm test`). Vérifier un fichier : `mise exec -- pnpm exec playwright test tests/structure.spec.ts -g "nom du test"`.
- **Aucune dépendance npm ajoutée** : `devDependencies` reste `{ @playwright/test, typescript, vite }`.
- Ne jamais pusher avant la fin : l'état intermédiaire du site est visible sur le dossier local uniquement.

## Review Focus

Ces cinq cas sont implicites dans le spec mais ne sont couverts par aucune tâche « naturellement » ; chacun reçoit son test dans la tâche indiquée.

1. **Ouverture en `file://` (double-clic sur `index.html`)** : le hub doit charger sa feuille de style et son JS en chemins relatifs. Attendu : le `h1` du hub s'affiche avec `background` calculé à `rgb(248, 250, 252)`. → test ajouté en **T10**.
2. **URL partagée sans slash final (`/democratie`)** : elle doit servir la page, pas un 404 (GitHub Pages redirige, Vite peut différer). Attendu : statut < 400 et le `h1` Citoyen 2.0 présent pour les deux formes d'URL. → test ajouté en **T10**.
3. **Partage sans JavaScript** : les `href` codés en dur (WhatsApp, X, Facebook) doivent encoder l'URL canonique de la page et son `data-share-text`, sinon les partages sans JS pointent vers la racine. → test ajouté en **T8**.
4. **Contraste des nouveaux composants** (cartes du hub, statuts, bandeau collection) : les nouvelles règles CSS ne doivent contenir aucune couleur brute non testée. Attendu : aucune valeur `#hex` dans les règles `.update-card` / `.collection`, et la paire `--color-primary` sur `--color-surface` ≥ 4,5:1. → tests ajoutés en **T3**.
5. **`og:image` manquant** : une URL OG pointant vers un fichier inexistant casse l'aperçu de partage. Attendu : le fichier désigné par `og:image` existe sur disque pour chaque page. → test ajouté en **T2**.

---

### Task 1: Découpage en deux pages (git mv + chemins relatifs + hub minimal)

**Files:**
- Move: `index.html` → `democratie/index.html`
- Create: `index.html` (hub minimal, tête et hero uniquement)
- Modify: `democratie/index.html` (assets relatifs, canonical, og:url)
- Test: `tests/structure.spec.ts`

**Interfaces:**
- Consumes: rien (première tâche).
- Produces: `democratie/index.html` (page produit à `../styles.css`, canonical `https://la-mise-a-jour.fr/democratie/`), `index.html` (hub à `styles.css`, canonical racine, lien `democratie/`). Les tâches suivantes lisent ces deux chemins via les constantes `INDEX` et `HUB`.

- [x] **Step 1: Déplacer la page en conservant l'historique Git, puis créer le hub minimal**

```bash
git mv index.html democratie/index.html
```

Créer aussitôt `index.html` (le dossier racine ne doit jamais rester sans page) :

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>La Mise à Jour — des correctifs pour une société obsolète</title>
  <meta name="description" content="La plateforme de mises à jour système de la société : démocratie, agronomie, économie, énergie. Comparez la version héritée à la version corrigée.">
  <link rel="canonical" href="https://la-mise-a-jour.fr/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="La Mise à Jour">
  <meta property="og:title" content="La Mise à Jour — des correctifs pour une société obsolète">
  <meta property="og:description" content="La plateforme de mises à jour système de la société. Chaque page compare la version héritée à la version corrigée.">
  <meta property="og:url" content="https://la-mise-a-jour.fr/">
  <meta property="og:image" content="https://la-mise-a-jour.fr/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="La Mise à Jour — des correctifs pour une société obsolète">
  <meta name="twitter:description" content="La plateforme de mises à jour système de la société.">
  <meta name="twitter:image" content="https://la-mise-a-jour.fr/og.png">
  <meta name="theme-color" content="#1d4ed8">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="stylesheet" href="styles.css">
  <script src="main.js" defer></script>
</head>
<body data-share-text="Votre société n'a pas été mise à jour depuis 1958.">
  <a class="skip-link" href="#main">Aller au contenu</a>
  <main id="main">
    <section class="hero">
      <div class="container">
        <p class="hero-eyebrow">Patch 2026.1 · Installation automatique</p>
        <h1>Votre société n'a pas été mise à jour depuis 1958.</h1>
        <p class="hero-sub">la-mise-a-jour.fr est la plateforme de mises à jour système de la société.
          Chaque page compare la version héritée à la version corrigée : bugs connus, correctifs
          listés, et le bouton d'annulation qui manquait.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="democratie/">Ouvrir la mise à jour Démocratie →</a>
        </div>
      </div>
    </section>
  </main>
</body>
</html>
```

Aucun lien fantôme : le hub n'a pas encore de header, de footer, ni de section `#collection`.

- [x] **Step 2: Pointer la suite de tests vers les deux fichiers (rouge attendu)**

Dans `tests/structure.spec.ts`, remplacer la lecture unique par :

```ts
const ROOT = path.resolve(__dirname, '..');
const INDEX = fs.readFileSync(path.join(ROOT, 'democratie', 'index.html'), 'utf-8');
const HUB = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
const CSS = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf-8');
const JS = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf-8');
```

Adapter le test `links local assets` (le hub sera testé en boucle multi-pages dès T2, on ne teste ici que le préfixe de la page déplacée) :

```ts
test('links local assets', () => {
  expect(INDEX).toContain('href="../styles.css"');
  expect(INDEX).toContain('src="../main.js"');
});
```

Ajouter une describe de fumée pour le hub, juste avant la fermeture du fichier :

```ts
test.describe('HubSmoke', () => {
  test('hub has canonical root', () => {
    expect(HUB).toContain('<link rel="canonical" href="https://la-mise-a-jour.fr/">');
  });

  test('hub links to democratie', () => {
    expect(HUB).toContain('href="democratie/"');
  });

  test('hub has single h1', () => {
    expect(HUB.match(/<h1>/g)).toHaveLength(1);
  });

  test('hub loads local assets relatively', () => {
    expect(HUB).toContain('href="styles.css"');
    expect(HUB).toContain('src="main.js"');
  });
});
```

- [x] **Step 3: Vérifier l'échec**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts`
Expected: FAIL sur `links local assets` (la page déplacée référence encore `styles.css` sans `../`).

- [x] **Step 4: Corriger la page déplacée**

Dans `democratie/index.html`, cinq remplacements :

```html
<link rel="canonical" href="https://la-mise-a-jour.fr/democratie/">
...
<meta property="og:url" content="https://la-mise-a-jour.fr/democratie/">
...
<link rel="icon" type="image/svg+xml" href="../favicon.svg">
<link rel="stylesheet" href="../styles.css">
<script src="../main.js" defer></script>
```

`og:image` reste `https://la-mise-a-jour.fr/og.png` pour l'instant : `democratie/og.png` n'est créé qu'en T12.

- [x] **Step 5: Vérifier le passage au vert**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts`
Expected: PASS (47 tests historiques + 4 tests `HubSmoke`).

- [x] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: déplace Citoyen 2.0 vers /democratie/ et crée le hub à la racine"
```

---

### Task 2: Registre des pages, tests partagés, `data-share-text`, sitemap

**Files:**
- Modify: `tests/structure.spec.ts` (registre `PAGES`, suites partagées, migration des describes)
- Modify: `democratie/index.html:24` (attribut `data-share-text`)
- Modify: `sitemap.xml`

**Interfaces:**
- Consumes: `INDEX` (page démocratie) et `HUB` (hub) créés en T1.
- Produces: `const PAGES: SitePage[]` — registre `{ name, file, url, sub }` utilisé par **toutes** les tâches suivantes (T5, T6, T7, T8, T9) ; helper `section(html, id)` ; constante `PLANNED` utilisée en T7 ; attribut `data-share-text` consommé par `main.js` en T8.

- [x] **Step 1: Écrire la tête du fichier de tests (registre + helpers + suites partagées)**

Remplacer le bloc d'import et de constantes par :

```ts
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://la-mise-a-jour.fr';

type SitePage = { name: string; file: string; url: string; sub: boolean };

const PAGES: SitePage[] = [
  { name: 'hub', file: 'index.html', url: `${SITE}/`, sub: false },
  { name: 'democratie', file: 'democratie/index.html', url: `${SITE}/democratie/`, sub: true },
];

const PLANNED = [
  { name: 'Agronomie', status: 'en bêta fermée' },
  { name: 'Économie', status: 'planifié' },
  { name: 'Énergie', status: 'planifié' },
];

const read = (rel: string): string => fs.readFileSync(path.join(ROOT, rel), 'utf-8');
const INDEX = read('democratie/index.html');
const HUB = read('index.html');
const CSS = read('styles.css');
const JS = read('main.js');
const SITEMAP = read('sitemap.xml');

function section(html: string, id: string): string {
  const start = html.indexOf(`id="${id}"`);
  if (start < 0) throw new Error(`section #${id} introuvable`);
  return html.slice(start, html.indexOf('</section>', start));
}

function bodyText(html: string): string {
  const body = html.split('<body')[1].split('>').slice(1).join('>');
  return body
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
```

Garder tels quels les helpers existants : `cssRules`, `mediaBlocks`, `hexToRgb`, `channel`, `relativeLuminance`, `contrastRatio`, `token`. Remplacer l'ancien `getText()` (qui ne lit que `INDEX`) par `bodyText(INDEX)` dans les tests qui l'utilisaient, ou conserver un alias `const getText = () => bodyText(INDEX);` — l'alias est retenu ici pour limiter le diff.

Ajouter les suites partagées, bouclées sur le registre (à placer avant les describes de contenu) :

```ts
test.describe('Shared', () => {
  for (const p of PAGES) {
    const html = read(p.file);
    const prefix = p.sub ? '../' : '';

    test(`[${p.name}] lang is french`, () => {
      expect(html).toContain('<html lang="fr">');
    });

    test(`[${p.name}] canonical matches page url`, () => {
      expect(html).toContain(`<link rel="canonical" href="${p.url}">`);
    });

    test(`[${p.name}] og:url matches page url`, () => {
      expect(html).toContain(`<meta property="og:url" content="${p.url}">`);
    });

    test(`[${p.name}] twitter card present`, () => {
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    });

    test(`[${p.name}] og:image points to an existing file`, () => {
      const m = html.match(/<meta property="og:image" content="https:\/\/la-mise-a-jour\.fr\/([^"]+)"/);
      expect(m, 'og:image absente').not.toBeNull();
      expect(fs.existsSync(path.join(ROOT, m![1])), `fichier manquant : ${m![1]}`).toBe(true);
    });

    test(`[${p.name}] no external assets`, () => {
      expect(html).not.toMatch(/<script[^>]+src="https?:\/\//);
      expect(html).not.toMatch(/<link[^>]+rel="stylesheet"[^>]+href="https?:\/\//);
    });

    test(`[${p.name}] links local assets relatively`, () => {
      expect(html).toContain(`href="${prefix}styles.css"`);
      expect(html).toContain(`src="${prefix}main.js"`);
    });

    test(`[${p.name}] skip link present`, () => {
      expect(html).toContain('<a class="skip-link" href="#main">');
    });

    test(`[${p.name}] single h1`, () => {
      expect(html.match(/<h1>/g)).toHaveLength(1);
    });

    test(`[${p.name}] no dead anchors`, () => {
      const anchors = html.match(/href="#([^"]+)"/g) || [];
      for (const a of anchors) {
        const id = a.replace(/href="#([^"]+)"/, '$1');
        expect(html, `ancre morte : #${id}`).toContain(`id="${id}"`);
      }
    });

    test(`[${p.name}] deferred script`, () => {
      expect(html).toContain(`<script src="${prefix}main.js" defer></script>`);
    });

    test(`[${p.name}] share text declared on body`, () => {
      expect(html).toMatch(/<body data-share-text="[^"]+">/);
    });

    test(`[${p.name}] no calculator mention`, () => {
      expect(html.toLowerCase()).not.toContain('calculateur');
    });
  }
});

test.describe('SiteAssets', () => {
  test('design tokens defined', () => {
    for (const t of [
      '--color-bg', '--color-surface', '--color-text', '--color-text-muted',
      '--color-primary', '--color-danger', '--color-success',
    ]) {
      expect(CSS).toMatch(new RegExp(`${t}:\\s*#[0-9a-fA-F]{6}`));
    }
  });

  test('focus visible style', () => {
    expect(CSS).toContain(':focus-visible');
  });

  test('media queries present', () => {
    const conds = mediaBlocks().map((b) => b.condition);
    expect(conds.some((c) => c.includes('768px'))).toBe(true);
    expect(conds.some((c) => c.includes('1024px'))).toBe(true);
  });

  test('contrast AA', () => {
    const pairs: Array<[string, string]> = [
      [token('--color-text'), token('--color-bg')],
      [token('--color-text-muted'), token('--color-surface')],
      ['#ffffff', token('--color-primary')],
      [token('--color-danger'), token('--color-surface')],
      [token('--color-success'), token('--color-surface')],
    ];
    for (const [fg, bg] of pairs) {
      const ratio = contrastRatio(fg, bg);
      expect(ratio, `${fg} sur ${bg} est sous 4,5:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('tooltip js behaviour', () => {
    expect(JS).toContain('key === "Escape"');
    expect(JS).toContain('closest(".tip-wrap")');
    expect(JS).toContain('getBoundingClientRect');
    expect(JS).toContain('tooltip--below');
    expect(JS).toContain('flipTooltipX');
    expect(CSS).toContain('tooltip--below');
  });

  test('faq js single open', () => {
    expect(JS).toContain('preventDefault');
    expect(JS).toContain('.faq-item');
  });

  test('no calculator in css and js', () => {
    expect(CSS.toLowerCase()).not.toContain('calculateur');
    expect(JS.toLowerCase()).not.toContain('calculateur');
  });

  test('readme exists', () => {
    const readme = read('README.md');
    for (const expected of ['python3 -m http.server', 'og.png']) {
      expect(readme).toContain(expected);
    }
  });
});
```

- [x] **Step 2: Reloger les describes existants et purger les doublons**

Dans `tests/structure.spec.ts` :
- Supprimer les tests désormais couverts par `Shared` : `lang is french`, `share meta are absolute https`, `twitter card present`, `no external assets`, `links local assets` (adapté), `skip link present`, `no calculator mention` (partie INDEX), `single h1`, `deferred script`, `all internal links resolve`, et `design tokens defined` / `focus visible style` / `media queries present` / `contrast AA` / `tooltip` / `faq js` (partie `SiteAssets`).
- Regrouper le reste des describes existantes (`HeaderHero`, `SocialProof`, `Pricing`, `FeatureGrid`, `TooltipStatic`, `FAQ`, `Share`, `FooterA11y`) dans `test.describe('Democratie', () => { … })`, sans changer leurs assertions.
- La describe `Integration` perd ses quatre tests (`all internal links resolve`, `single h1`, `deferred script`, `readme exists`) : tous sont repris par `Shared` ou `SiteAssets`. Supprimer la describe `Integration` devenue vide.
- Supprimer le test `nav is internal only` : il exige que tous les `<a href="...">` commencent par `#`, ce qui n'est plus vrai une fois le chrome multi-pages posé (T5/T6). Sa couverture est reprise par T9 (liens relatifs) et T6 (résolution du footer).

- [x] **Step 3: Ajouter l'attribut de partage sur la page démocratie**

Dans `democratie/index.html`, la balise `<body>` devient :

```html
<body data-share-text="Quel est votre plan de citoyenneté ? Découvrez le Plan 6ᵉ République.">
```

(Valeur identique à l'ancienne constante `SHARE_TEXT` de `main.js`.)

- [x] **Step 4: Ajouter le test sitemap ↔ registre (rouge attendu)**

```ts
test.describe('Sitemap', () => {
  test('sitemap lists exactly the registry pages', () => {
    const locs = [...SITEMAP.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    expect(locs).toEqual(PAGES.map((p) => p.url).sort());
  });

  test('robots points to sitemap', () => {
    expect(read('robots.txt')).toContain('Sitemap: https://la-mise-a-jour.fr/sitemap.xml');
  });
});
```

- [x] **Step 5: Vérifier l'échec**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts`
Expected: FAIL sur `sitemap lists exactly the registry pages` (le sitemap ne contient que la racine).

- [x] **Step 6: Mettre à jour le sitemap**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://la-mise-a-jour.fr/</loc>
    <lastmod>2026-10-03</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://la-mise-a-jour.fr/democratie/</loc>
    <lastmod>2026-10-03</lastmod>
    <priority>0.9</priority>
  </url>
</urlset>
```

- [x] **Step 7: Vérifier le passage au vert**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts`
Expected: PASS. Noter le nombre de tests affiché (référence pour les tâches suivantes).

- [x] **Step 8: Commit**

```bash
git add tests/structure.spec.ts sitemap.xml democratie/index.html
git commit -m "test: registre multi-pages, suites partagées et sitemap à deux URLs"
```

---

### Task 3: Hub — hero étendu et grille `#collection`

**Files:**
- Modify: `index.html` (hero + nouvelle section `#collection`)
- Modify: `styles.css` (nouvelles règles `.updates-grid`, `.update-card`, `.update-status`)
- Test: `tests/structure.spec.ts` (describe `HubCollection`)

**Interfaces:**
- Consumes: `HUB`, `section()` (T2).
- Produces: sections `id="collection"` (utilisée par le header en T5, le test de statuts en T7 et le bandeau OG en T12) et hero avec deux CTA (`democratie/` et `#collection`).

- [x] **Step 1: Écrire les tests du hub (rouge attendu)**

Ajouter à `tests/structure.spec.ts` :

```ts
test.describe('HubCollection', () => {
  const grid = () => section(HUB, 'collection');

  test('hero copy and two ctas', () => {
    const t = bodyText(HUB);
    expect(t).toContain("Votre société n'a pas été mise à jour depuis 1958.");
    expect(t).toContain('Patch 2026.1 · Installation automatique');
    expect(t).toContain('Ouvrir la mise à jour Démocratie →');
    expect(t).toContain('Voir toutes les mises à jour');
    expect(HUB).toContain('href="democratie/"');
    expect(HUB).toContain('href="#collection"');
  });

  test('four update cards, one live', () => {
    expect(grid().match(/class="update-card/g)).toHaveLength(4);
    expect(grid().match(/class="update-card update-card--live"/g)).toHaveLength(1);
    expect(grid().match(/class="update-card update-card--soon"/g)).toHaveLength(3);
  });

  test('only the démocratie card links out', () => {
    const links = grid().match(/<a [^>]*href="[^"]*"/g) || [];
    expect(links).toHaveLength(1);
    expect(links[0]).toContain('href="democratie/"');
  });

  test('card statuses', () => {
    const t = bodyText(grid());
    expect(t).toContain('Disponible');
    expect(t).toContain('En bêta fermée');
    expect(t).toContain('Planifié');
    expect(t).toContain('Rédaction en cours');
  });

  test('card teasers match the spec copy', () => {
    const t = bodyText(grid());
    for (const teaser of [
      'Plan 5ᵉ vs Plan 6ᵉ : le 49.3 avec bouton d\'annulation, le RIC sorti de bêta fermée.',
      'Du pesticide au sol vivant : migration de l\'agriculture française, sans redémarrage à froid.',
      'Croissance, PIB et richesse réelle : le refactoring que tout le monde repousse depuis 1973.',
      'Production, réseau et sobriété : la seule migration qui ne peut pas être reportée à lundi.',
    ]) {
      expect(t, teaser).toContain(teaser);
    }
  });

  test('grid responsive', () => {
    const rules = cssRules('.updates-grid');
    expect(rules).toMatch(/grid-template-columns:\s*repeat\(4/);
    const mobile = mediaBlocks().filter(
      (b) => b.condition.includes('768px') && b.body.includes('.updates-grid')
    );
    expect(mobile.length).toBeGreaterThan(0);
    expect(mobile[0].body).toContain('1fr');
  });

  test('no raw colour in the new components', () => {
    const rules = cssRules('.update-card') + cssRules('.update-status') + cssRules('.updates-grid');
    expect(rules).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(rules).not.toContain('rgba');
  });

  test('primary on surface contrast', () => {
    expect(contrastRatio(token('--color-primary'), token('--color-surface'))).toBeGreaterThanOrEqual(4.5);
  });
});
```

- [x] **Step 2: Vérifier l'échec**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts -g "HubCollection"`
Expected: FAIL (section `#collection` introuvable, `section()` lève `section #collection introuvable`).

- [x] **Step 3: Étendre le hero du hub**

Dans `index.html`, ajouter le second CTA dans `.hero-actions` :

```html
        <div class="hero-actions">
          <a class="btn btn-primary" href="democratie/">Ouvrir la mise à jour Démocratie →</a>
          <a class="btn btn-ghost" href="#collection">Voir toutes les mises à jour</a>
        </div>
```

- [x] **Step 4: Ajouter la section `#collection`**

Toujours dans `index.html`, après `</section>` du hero :

```html
    <section id="collection" class="section updates" aria-labelledby="collection-title">
      <div class="container">
        <h2 id="collection-title">Mises à jour système</h2>
        <p class="section-sub">Quatre systèmes à patcher. Un seul est sorti de la bêta.</p>

        <div class="updates-grid">
          <article class="update-card update-card--live">
            <p class="update-status">Disponible</p>
            <p class="plan-tag">v2.0</p>
            <h3>Mise à jour Démocratie</h3>
            <p class="update-teaser">Plan 5ᵉ vs Plan 6ᵉ : le 49.3 avec bouton d'annulation, le RIC sorti de bêta fermée.</p>
            <ul class="update-changelog">
              <li>Mandats non renouvelables</li>
              <li>Révocation à tout moment</li>
              <li>Support sous 30 jours</li>
            </ul>
            <p class="update-cta"><a class="btn btn-primary btn-sm" href="democratie/">Ouvrir la mise à jour →</a></p>
          </article>

          <article class="update-card update-card--soon">
            <p class="update-status">En bêta fermée</p>
            <p class="plan-tag">v0.9</p>
            <h3>Mise à jour Agronomie</h3>
            <p class="update-teaser">Du pesticide au sol vivant : migration de l'agriculture française, sans redémarrage à froid.</p>
            <p class="update-note">Rédaction en cours</p>
          </article>

          <article class="update-card update-card--soon">
            <p class="update-status">Planifié</p>
            <p class="plan-tag">v1.0</p>
            <h3>Mise à jour Économie</h3>
            <p class="update-teaser">Croissance, PIB et richesse réelle : le refactoring que tout le monde repousse depuis 1973.</p>
          </article>

          <article class="update-card update-card--soon">
            <p class="update-status">Planifié</p>
            <p class="plan-tag">v1.0</p>
            <h3>Mise à jour Énergie</h3>
            <p class="update-teaser">Production, réseau et sobriété : la seule migration qui ne peut pas être reportée à lundi.</p>
          </article>
        </div>
      </div>
    </section>
```

Attention : le premier lien du hub est le CTA du hero ; dans la section `#collection`, l'unique `<a>` est celui de `democratie/`.

- [x] **Step 5: Ajouter le CSS**

À la fin de `styles.css`, avant les blocs `@media` :

```css
.updates {
  background: var(--color-surface);
}

.updates-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
  margin-top: 2rem;
}

.update-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.update-card--live {
  border-color: var(--color-success);
}

.update-status {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.update-card--live .update-status {
  color: var(--color-success);
}

.update-card h3 {
  margin: 0;
  font-size: 1.15rem;
}

.update-teaser {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.update-changelog {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--color-text);
  font-size: 0.9rem;
}

.update-note {
  margin: auto 0 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.update-cta {
  margin: auto 0 0;
}
```

Puis ajouter dans le bloc existant `@media (max-width: 1024px)` :

```css
  .updates-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
```

et dans `@media (max-width: 768px)` :

```css
  .updates-grid {
    grid-template-columns: 1fr;
  }
```

Seuls des tokens existants sont utilisés : aucun hexadécimal, aucune `rgba`.

- [x] **Step 6: Vérifier le passage au vert**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts`
Expected: PASS (toutes les suites, y compris `HubCollection`).

- [x] **Step 7: Commit**

```bash
git add index.html styles.css tests/structure.spec.ts
git commit -m "feat: hub console de versions — hero et grille des mises à jour"
```

---

### Task 4: Hub — `#principe`, `#faq`, `#partage`

**Files:**
- Modify: `index.html` (trois sections)
- Test: `tests/structure.spec.ts` (describe `HubSections`)

**Interfaces:**
- Consumes: `HUB`, `section()` (T2), composants CSS existants `.feature-card`, `.faq-item`, `.share-*` (aucun CSS nouveau).
- Produces: sections `id="principe"`, `id="faq"`, `id="partage"` référencées par le header du hub en T5 et testées en navigateur en T10.

- [x] **Step 1: Écrire les tests (rouge attendu)**

```ts
test.describe('HubSections', () => {
  test('principe has three feature cards with info buttons', () => {
    const s = section(HUB, 'principe');
    expect(s.match(/class="feature-card"/g)).toHaveLength(3);
    const buttons = s.match(/<button type="button" class="info-btn"[^>]*>/g) || [];
    expect(buttons).toHaveLength(3);
    for (const tag of buttons) {
      expect(tag).toContain('aria-expanded="false"');
      const m = tag.match(/aria-controls="([^"]+)"/);
      expect(m).not.toBeNull();
      expect(s).toContain(`id="${m![1]}"`);
    }
    const t = bodyText(s);
    for (const title of ['Diagnostic', 'Comparaison', 'Changelog']) {
      expect(t).toContain(title);
    }
  });

  test('faq has three items with fine print', () => {
    const s = section(HUB, 'faq');
    expect(s.match(/class="faq-item"/g)).toHaveLength(3);
    expect(s.match(/<details/g)).toHaveLength(3);
    expect(s.match(/class="fine-print"/g)).toHaveLength(3);
    const t = bodyText(s);
    for (const q of [
      "C'est quoi, la-mise-a-jour.fr ?",
      'Pourquoi comparer la société à un logiciel ?',
      'Est-ce que je peux contribuer ?',
    ]) {
      expect(t).toContain(q);
    }
    expect(t).toContain('Les faits sont exacts. Seule l\'emballage est satirique.');
    expect(t).toContain('Pull requests bienvenues. 49.3 non requis.');
  });

  test('share section present with four platforms', () => {
    const s = section(HUB, 'partage');
    const platforms = s.match(/data-platform="([^"]+)"/g) || [];
    expect(platforms.map((p) => p.replace(/data-platform="([^"]+)"/, '$1')).sort())
      .toEqual(['facebook', 'signal', 'whatsapp', 'x']);
    expect(s).toContain('id="copy-link"');
    expect(s).toContain('id="copy-feedback"');
  });
});
```

- [x] **Step 2: Vérifier l'échec**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts -g "HubSections"`
Expected: FAIL (`section #principe introuvable`).

- [x] **Step 3: Ajouter les trois sections au hub**

Après la section `#collection` de `index.html` :

```html
    <section id="principe" class="section features" aria-labelledby="principe-title">
      <div class="container">
        <h2 id="principe-title">Comment ça marche</h2>
        <div class="features-grid">
          <article class="feature-card">
            <p class="feature-icon" aria-hidden="true">🔍</p>
            <h3>Diagnostic</h3>
            <p class="feature-pitch">La liste des bugs de la version actuelle. Références à l'appui, sans détour.</p>
            <span class="tip-wrap">
              <button type="button" class="info-btn" aria-expanded="false" aria-controls="tip-h1" aria-label="En savoir plus sur le diagnostic">ⓘ</button>
              <span class="tooltip" id="tip-h1" role="tooltip" hidden>Chaque mise à jour commence par ce qui ne marche pas : articles, dates, chiffres. Pas d'avis, des références.</span>
            </span>
          </article>

          <article class="feature-card">
            <p class="feature-icon" aria-hidden="true">📋</p>
            <h3>Comparaison</h3>
            <p class="feature-pitch">Deux plans côte à côte : ce que vous avez déjà, et ce que la mise à jour ajoute.</p>
            <span class="tip-wrap">
              <button type="button" class="info-btn" aria-expanded="false" aria-controls="tip-h2" aria-label="En savoir plus sur la comparaison">ⓘ</button>
              <span class="tooltip" id="tip-h2" role="tooltip" hidden>Même grille que votre offre télécom : la colonne de gauche vous est déjà facturée.</span>
            </span>
          </article>

          <article class="feature-card">
            <p class="feature-icon" aria-hidden="true">📦</p>
            <h3>Changelog</h3>
            <p class="feature-pitch">Ce qui change, en clair. Et ce qui ne change pas parce que personne ne l'a demandé.</p>
            <span class="tip-wrap">
              <button type="button" class="info-btn" aria-expanded="false" aria-controls="tip-h3" aria-label="En savoir plus sur le changelog">ⓘ</button>
              <span class="tooltip" id="tip-h3" role="tooltip" hidden>« Corrections de bugs connus depuis 1958. Fonctionnalité « révocation » enfin documentée. »</span>
            </span>
          </article>
        </div>
      </div>
    </section>

    <section id="faq" class="section faq" aria-labelledby="faq-title">
      <div class="container container--narrow">
        <h2 id="faq-title">Questions fréquemment posées</h2>
        <div class="faq-list">
          <details class="faq-item">
            <summary>C'est quoi, la-mise-a-jour.fr&nbsp;?</summary>
            <p class="faq-answer">Une plateforme d'éducation populaire emballée en produit logiciel.</p>
            <p class="fine-print">Les faits sont exacts. Seule l'emballage est satirique.</p>
          </details>

          <details class="faq-item">
            <summary>Pourquoi comparer la société à un logiciel&nbsp;?</summary>
            <p class="faq-answer">Parce qu'un logiciel non patché depuis 1958 aurait été déprécié depuis longtemps.</p>
            <p class="fine-print">Aucune version prise en charge. Pas de correctif de sécurité depuis 1962.</p>
          </details>

          <details class="faq-item">
            <summary>Est-ce que je peux contribuer&nbsp;?</summary>
            <p class="faq-answer">Oui. Le code source est public, contrairement à celui de vos lois.</p>
            <p class="fine-print">Pull requests bienvenues. 49.3 non requis.</p>
          </details>
        </div>
      </div>
    </section>

    <section id="partage" class="section share" aria-labelledby="share-title">
      <div class="container container--narrow share-inner">
        <h2 id="share-title">Cette plateforme se partage mieux que vos diagnoses</h2>
        <div class="share-buttons">
          <a class="btn btn-share" data-platform="whatsapp" href="https://wa.me/?text=Votre%20soci%C3%A9t%C3%A9%20n%27a%20pas%20%C3%A9t%C3%A9%20mise%20%C3%A0%20jour%20depuis%201958.%20https%3A%2F%2Fla-mise-a-jour.fr%2F" target="_blank" rel="noopener">WhatsApp</a>
          <button class="btn btn-share" data-platform="signal" type="button">Signal</button>
          <a class="btn btn-share" data-platform="x" href="https://twitter.com/intent/tweet?text=Votre%20soci%C3%A9t%C3%A9%20n%27a%20pas%20%C3%A9t%C3%A9%20mise%20%C3%A0%20jour%20depuis%201958.&url=https%3A%2F%2Fla-mise-a-jour.fr%2F" target="_blank" rel="noopener">X</a>
          <a class="btn btn-share" data-platform="facebook" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fla-mise-a-jour.fr%2F" target="_blank" rel="noopener">Facebook</a>
          <button class="btn btn-primary" id="copy-link" type="button">Copier le lien</button>
        </div>
        <p class="share-feedback" id="copy-feedback" role="status" aria-live="polite" hidden></p>
        <p class="share-url">la-mise-a-jour.fr</p>
      </div>
    </section>
```

Aucun CSS nouveau : `.features`, `.features-grid`, `.faq`, `.share` existent déjà.

- [x] **Step 4: Vérifier le passage au vert**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add index.html tests/structure.spec.ts
git commit -m "feat: hub — principe, FAQ et bandeau de partage"
```

---

### Task 5: Header plateforme sur les deux pages

**Files:**
- Modify: `index.html` (nouveau header)
- Modify: `democratie/index.html:26-37` (header)
- Modify: `styles.css:81` (`.brand-version` → `.brand-badge`)
- Test: `tests/structure.spec.ts` (describe `ChromeHeader`)

**Interfaces:**
- Consumes: `PAGES`, `read()` (T2), sections du hub `#collection`, `#principe`, `#faq`, `#partage` (T3/T4).
- Produces: bloc `<header class="site-header">` identique en structure sur les deux pages, balise `<span class="brand-badge">…</span>` (testée en T5) ; T6 ajoute le footer.

- [x] **Step 1: Écrire les tests (rouge attendu)**

```ts
function structuralSignature(html: string, tag: 'header' | 'footer'): string {
  const m = html.match(new RegExp(`<${tag}[\\s\\S]*?</${tag}>`));
  if (!m) throw new Error(`${tag} absent`);
  return m[0]
    .replace(/>[^<]*</g, '><')
    .replace(/\s(?:href|src)="[^"]*"/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

test.describe('ChromeHeader', () => {
  for (const p of PAGES) {
    const html = read(p.file);

    test(`[${p.name}] header exposes the four slots`, () => {
      const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/);
      expect(header, 'header manquant').not.toBeNull();
      expect(header![0]).toContain('class="brand"');
      expect(header![0]).toContain('<nav class="site-nav" aria-label="Navigation principale">');
      expect(header![0]).toContain('class="status-badge"');
      expect(header![0]).toContain('href="#partage"');
      const navLinks = header![0].match(/<nav[\s\S]*?<\/nav>/)![0].match(/<a /g) || [];
      expect(navLinks).toHaveLength(3);
    });

    test(`[${p.name}] exactly one non-empty brand badge`, () => {
      const badges = html.match(/<span class="brand-badge">[^<]+<\/span>/g) || [];
      expect(badges).toHaveLength(1);
    });

    test(`[${p.name}] nav anchors resolve`, () => {
      const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/)![0];
      const nav = header.match(/<nav[\s\S]*?<\/nav>/)![0];
      for (const a of nav.match(/href="#([^"]+)"/g) || []) {
        const id = a.replace(/href="#([^"]+)"/, '$1');
        expect(html, `ancre de nav morte : #${id}`).toContain(`id="${id}"`);
      }
    });
  }

  test('header structure is identical across pages', () => {
    const sigs = PAGES.map((p) => structuralSignature(read(p.file), 'header'));
    expect(new Set(sigs).size, 'header divergent entre les pages').toBe(1);
  });

  test('hub header copy', () => {
    const header = HUB.match(/<header class="site-header">[\s\S]*?<\/header>/)![0];
    expect(header).toContain('la-mise-a-jour <span class="brand-badge">v2026.1</span>');
    expect(header).toContain('href="#main"');
    expect(header).toContain('Statut : 1 / 4 disponible');
    const nav = header.match(/<nav[\s\S]*?<\/nav>/)![0];
    expect(nav).toContain('href="#collection"');
    expect(nav).toContain('href="#principe"');
    expect(nav).toContain('href="#faq"');
  });

  test('democratie header copy', () => {
    const header = INDEX.match(/<header class="site-header">[\s\S]*?<\/header>/)![0];
    expect(header).toContain('la-mise-a-jour <span class="brand-badge">Citoyen 2.0</span>');
    expect(header).toContain('href="../"');
    expect(header).toContain('Statut : 49.3 opérationnel');
    const nav = header.match(/<nav[\s\S]*?<\/nav>/)![0];
    expect(nav).toContain('href="#fonctionnalites"');
    expect(nav).toContain('href="#tarifs"');
    expect(nav).toContain('href="#faq"');
  });
});
```

- [x] **Step 2: Vérifier l'échec**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts -g "ChromeHeader"`
Expected: FAIL (le hub n'a pas de header, `header manquant`).

- [x] **Step 3: Ajouter le header au hub**

Insérer juste après `<a class="skip-link" …>` de `index.html` :

```html
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="#main">la-mise-a-jour <span class="brand-badge">v2026.1</span></a>
      <nav class="site-nav" aria-label="Navigation principale">
        <a href="#collection">Mises à jour</a>
        <a href="#principe">Comment ça marche</a>
        <a href="#faq">FAQ</a>
      </nav>
      <span class="status-badge"><span class="status-dot" aria-hidden="true"></span>Statut : 1 / 4 disponible</span>
      <a class="btn btn-primary btn-sm" href="#partage">Partager</a>
    </div>
  </header>
```

- [x] **Step 4: Adapter le header de la page démocratie**

Dans `democratie/index.html`, remplacer la ligne du `brand` :

```html
      <a class="brand" href="../">la-mise-a-jour <span class="brand-badge">Citoyen 2.0</span></a>
```

Nav, `status-badge` et bouton `Partager` restent identiques (la nav contient déjà exactement 3 liens).

- [x] **Step 5: Renommer la classe CSS**

Dans `styles.css:81`, remplacer `.brand-version` par `.brand-badge` (le corps de règle est conservé tel quel). Aucun test ne référençait `.brand-version`.

- [x] **Step 6: Vérifier le passage au vert + la suite entière**

Run: `mise exec -- pnpm exec playwright test`
Expected: PASS. En particulier `Shared[hub] no dead anchors` reste vert : le header du hub ne référence que des sections créées en T3/T4.

- [x] **Step 7: Commit**

```bash
git add index.html democratie/index.html styles.css tests/structure.spec.ts
git commit -m "feat: header plateforme avec badge de version sur toutes les pages"
```

---

### Task 6: Footer plateforme-level sur les deux pages

**Files:**
- Modify: `index.html` (footer)
- Modify: `democratie/index.html` (footer)
- Test: `tests/structure.spec.ts` (describe `ChromeFooter`)

**Interfaces:**
- Consumes: `PAGES`, `structuralSignature()` (T5), `section()` (T2).
- Produces: bloc `<footer class="site-footer">` dont les `href` résolvent vers les mêmes URL depuis chaque page ; T7 ajoute le bandeau collection juste avant.

- [x] **Step 1: Écrire les tests (rouge attendu)**

```ts
function footerHrefs(html: string, pageUrl: string): string[] {
  const footer = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/);
  if (!footer) throw new Error('footer absent');
  const hrefs = footer[0].match(/href="([^"]+)"/g) || [];
  return hrefs.map((h) => {
    const raw = h.replace(/href="([^"]+)"/, '$1');
    return new URL(raw, pageUrl).toString();
  }).sort();
}

test.describe('ChromeFooter', () => {
  for (const p of PAGES) {
    const html = read(p.file);

    test(`[${p.name}] footer copy is platform level`, () => {
      const t = bodyText(html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)![0]);
      expect(t).toContain('Toutes les mises à jour');
      expect(t).toContain('Comment ça marche');
      expect(t).toContain('Aucune donnée collectée, contrairement à vous');
      expect(t).toContain('Tous les systèmes sont dégradés');
      expect(t).toContain('49.3 : opérationnel');
      expect(t).toContain('© 2026 La Mise à Jour');
    });

    test(`[${p.name}] footer links reach an existing target`, () => {
      const footer = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)![0];
      for (const raw of (footer.match(/href="([^"]+)"/g) || []).map((h) => h.replace(/href="([^"]+)"/, '$1'))) {
        const resolved = new URL(raw, p.url);
        const target = PAGES.find((x) => x.url === resolved.origin + resolved.pathname);
        expect(target, `cible inconnue : ${raw}`).toBeTruthy();
        if (resolved.hash) {
          expect(read(target!.file), `ancre morte ${raw}`).toContain(`id="${resolved.hash.slice(1)}"`);
        }
      }
    });
  }

  test('footer structure is identical across pages', () => {
    const sigs = PAGES.map((p) => structuralSignature(read(p.file), 'footer'));
    expect(new Set(sigs).size, 'footer divergent entre les pages').toBe(1);
  });

  test('footer resolves to the same urls everywhere', () => {
    const sets = PAGES.map((p) => footerHrefs(read(p.file), p.url));
    for (let i = 1; i < sets.length; i++) {
      expect(sets[i], `footer de ${PAGES[i].name} divergent`).toEqual(sets[0]);
    }
  });
});
```

- [x] **Step 2: Vérifier l'échec**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts -g "ChromeFooter"`
Expected: FAIL (`footer absent` sur le hub).

- [x] **Step 3: Écrire le footer du hub**

À la fin de `index.html`, avant `</body>` :

```html
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <h2 class="footer-title">Produit</h2>
        <ul class="footer-links">
          <li><a href="./">Toutes les mises à jour</a></li>
          <li><a href="./#principe">Comment ça marche</a></li>
          <li><a href="./#faq">FAQ</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer-title">Légal</h2>
        <ul class="footer-links">
          <li><a href="./#faq">Mentions légales absurdes</a></li>
          <li><a href="./#faq">CGU</a></li>
          <li>Aucune donnée collectée, contrairement à vous</li>
        </ul>
      </div>
      <div>
        <h2 class="footer-title">Suivi</h2>
        <ul class="footer-links">
          <li><span class="status-dot" aria-hidden="true"></span> Tous les systèmes sont dégradés</li>
          <li>49.3 : opérationnel</li>
        </ul>
      </div>
    </div>
    <p class="footer-bottom">© 2026 La Mise à Jour — <a href="./">la-mise-a-jour.fr</a></p>
  </footer>
```

- [x] **Step 4: Remplacer le footer de la page démocratie**

Même bloc dans `democratie/index.html`, avec `./` remplacé par `../` et `./#` par `../#` :

```html
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <h2 class="footer-title">Produit</h2>
        <ul class="footer-links">
          <li><a href="../">Toutes les mises à jour</a></li>
          <li><a href="../#principe">Comment ça marche</a></li>
          <li><a href="../#faq">FAQ</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer-title">Légal</h2>
        <ul class="footer-links">
          <li><a href="../#faq">Mentions légales absurdes</a></li>
          <li><a href="../#faq">CGU</a></li>
          <li>Aucune donnée collectée, contrairement à vous</li>
        </ul>
      </div>
      <div>
        <h2 class="footer-title">Suivi</h2>
        <ul class="footer-links">
          <li><span class="status-dot" aria-hidden="true"></span> Tous les systèmes sont dégradés</li>
          <li>49.3 : opérationnel</li>
        </ul>
      </div>
    </div>
    <p class="footer-bottom">© 2026 La Mise à Jour — <a href="../">la-mise-a-jour.fr</a></p>
  </footer>
```

- [x] **Step 5: Mettre à jour le test historique de footer**

Dans `tests/structure.spec.ts`, la describe `Democratie` → `FooterA11y` → `footer structure` asserte encore l'ancien copyright. Remplacer la ligne :

```ts
    expect(t).toContain('© 2026 Citoyen 2.0');
```

par :

```ts
    expect(t).toContain('© 2026 La Mise à Jour');
```

Les autres assertions de ce test (`Tous les systèmes sont dégradés`, `49.3 : opérationnel`, `Aucune donnée collectée, contrairement à vous`) sont conservées : ces chaînes sont toujours présentes. Le test `footer links resolve` reste valable car `#fonctionnalites`, `#tarifs` et `#faq` sont toujours dans la nav ; sa couverture réelle sur le footer est désormais portée par `ChromeFooter`.

- [x] **Step 6: Vérifier le passage au vert**

Run: `mise exec -- pnpm exec playwright test`
Expected: PASS. `footer structure is identical across pages` prouve que les deux blocs ont bien la même signature.

- [x] **Step 7: Commit**

```bash
git add index.html democratie/index.html tests/structure.spec.ts
git commit -m "feat: footer plateforme identique sur toutes les pages"
```

---

### Task 7: Bandeau collection sur `/democratie/`

**Files:**
- Modify: `democratie/index.html` (bandeau avant le footer)
- Modify: `styles.css` (règles `.collection`)
- Test: `tests/structure.spec.ts` (describe `CollectionStrip`)

**Interfaces:**
- Consumes: `PAGES`, `PLANNED`, `section()` (T2), statuts des cartes du hub (T3).
- Produces: bloc `<nav class="collection">` reproductible pour toute nouvelle sous-page (recette T11) et testé ici.

- [x] **Step 1: Écrire les tests (rouge attendu)**

```ts
test.describe('CollectionStrip', () => {
  test('hub has no strip (it is the collection)', () => {
    expect(HUB).not.toContain('class="collection"');
  });

  for (const p of PAGES.filter((x) => x.sub)) {
    const html = read(p.file);

    test(`[${p.name}] strip lists delivered pages and planned badges`, () => {
      const strip = html.match(/<nav class="collection"[\s\S]*?<\/nav>/);
      expect(strip, 'bandeau collection manquant').not.toBeNull();
      const s = strip![0];

      const others = PAGES.filter((x) => x.sub && x.name !== p.name);
      const links = (s.match(/href="([^"]+)"/g) || []).map((h) => h.replace(/href="([^"]+)"/, '$1'));
      expect(links).toHaveLength(others.length);
      for (const other of others) {
        expect(links).toContain(`../${other.name}/`);
      }

      const t = bodyText(s);
      for (const planned of PLANNED) {
        expect(t, planned.name).toContain(planned.name);
        expect(t, `${planned.name} : ${planned.status}`).toContain(planned.status);
      }
      expect(t).toContain('Autres mises à jour disponibles');
      expect(s).not.toContain(`href="../${p.name}/"`);
    });

    test(`[${p.name}] strip sits right before the footer`, () => {
      const i = html.indexOf('<nav class="collection"');
      const f = html.indexOf('<footer class="site-footer">');
      expect(i).toBeGreaterThan(-1);
      expect(f).toBeGreaterThan(i);
      expect(html.slice(i, f)).not.toContain('<footer');
    });
  }

  test('strip statuses match the hub cards', () => {
    const grid = section(HUB, 'collection');
    for (const planned of PLANNED) {
      expect(grid, `carte ${planned.name}`).toContain(planned.name);
      const card = grid.split(planned.name)[0].split('<article').pop()!;
      expect(card, `statut de ${planned.name}`).toContain(planned.status.charAt(0).toUpperCase() + planned.status.slice(1));
    }
  });
});
```

Note : le statut affiché dans le hub commence une majuscule (`En bêta fermée`, `Planifié`) alors que `PLANNED.status` est en bas de casse — d'où la capitalisation dans la comparaison. Pour `Économie` et `Énergie`, `grid.split(name)[0].split('<article').pop()` isole bien l'article concerné.

- [x] **Step 2: Vérifier l'échec**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts -g "CollectionStrip"`
Expected: FAIL (`bandeau collection manquant`).

- [x] **Step 3: Insérer le bandeau dans la page démocratie**

Dans `democratie/index.html`, juste avant `<footer class="site-footer">` :

```html
  <nav class="collection" aria-label="Autres mises à jour">
    <div class="container">
      <p class="collection-title">Autres mises à jour disponibles :</p>
      <ul class="collection-list">
        <li><span class="collection-item collection-item--soon">Agronomie <em>en bêta fermée</em></span></li>
        <li><span class="collection-item collection-item--soon">Économie <em>planifié</em></span></li>
        <li><span class="collection-item collection-item--soon">Énergie <em>planifié</em></span></li>
      </ul>
    </div>
  </nav>
```

Aucun `<a>` : la seule page livrée est la page courante, elle ne s'autolien pas (spec §4.3).

- [x] **Step 4: Ajouter le CSS**

Avant les blocs `@media` dans `styles.css` :

```css
.collection {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 1.75rem 0;
}

.collection-title {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.collection-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.collection-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text);
  text-decoration: none;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
}

.collection-item em {
  font-style: normal;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

a.collection-item:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
```

- [x] **Step 5: Vérifier le passage au vert**

Run: `mise exec -- pnpm exec playwright test`
Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add democratie/index.html styles.css tests/structure.spec.ts
git commit -m "feat: bandeau collection sur les sous-pages"
```

---

### Task 8: Partage paramétré par page

**Files:**
- Modify: `main.js:74-75` (constantes → lecture du DOM)
- Modify: `democratie/index.html` (href de partage codés en dur)
- Test: `tests/structure.spec.ts` (describe `ShareByPage`)

**Interfaces:**
- Consumes: `PAGES`, attribut `data-share-text` (T2), `<link rel="canonical">` de chaque page (T1).
- Produces: `pageUrl()` et `shareText()` dans `main.js`, testées en T10 (navigation) et consommées par toute future page sans configuration JS.

- [x] **Step 1: Écrire les tests (rouge attendu)**

```ts
test.describe('ShareByPage', () => {
  test('js derives the url from the canonical tag', () => {
    expect(JS).not.toContain('la-mise-a-jour.fr');
    expect(JS).toContain('link[rel="canonical"]');
    expect(JS).toContain('data-share-text');
  });

  for (const p of PAGES) {
    const html = read(p.file);

    test(`[${p.name}] hardcoded share hrefs encode this page`, () => {
      const shareText = html.match(/<body data-share-text="([^"]+)">/)![1];
      const anchors = html.match(/<a class="btn btn-share"[^>]*>/g) || [];
      expect(anchors).toHaveLength(3);
      for (const tag of anchors) {
        const href = tag.match(/href="([^"]+)"/)![1];
        const decoded = decodeURIComponent(href);
        expect(decoded, `URL manquante dans ${href}`).toContain(p.url);
        // Facebook ne transporte que l'URL (`?u=`) ; WhatsApp et X portent aussi le texte.
        if (/text=/.test(href)) {
          expect(decoded, `texte manquant dans ${href}`).toContain(shareText);
        }
      }
    });

    test(`[${p.name}] share section is complete`, () => {
      expect(html).toContain('id="copy-link"');
      expect(html).toContain('id="copy-feedback"');
    });
  }
});
```

- [x] **Step 2: Vérifier l'échec**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts -g "ShareByPage"`
Expected: FAIL sur `js derives the url from the canonical tag` (`main.js` contient encore `la-mise-a-jour.fr`).

- [x] **Step 3: Paramétrer `main.js`**

Remplacer :

```js
  var CANONICAL_URL = "https://la-mise-a-jour.fr/";
  var SHARE_TEXT = "Quel est votre plan de citoyenneté ? Découvrez le Plan 6ᵉ République.";
```

par :

```js
  function pageUrl() {
    var link = document.querySelector('link[rel="canonical"]');
    return (link && link.href) || window.location.href;
  }

  function shareText() {
    var text = document.body.getAttribute("data-share-text");
    return text || document.title;
  }
```

Puis remplacer chaque usage :
- `buildShareUrl(platform, pageUrl || CANONICAL_URL)` → la signature devient `buildShareUrl(platform, url, text)` avec `url` obligatoire passé par l'appelant.
- Dans `initShare` : `var url = pageUrl(); var text = shareText();`
  - Signal : `var payload = { title: document.title, text: text, url: url };` et repli `copyText(text + " " + url)`.
  - Liens : `var href = buildShareUrl(platform, url, text);`
- Dans `initCopy` : `copyText(pageUrl())` et message d'erreur `"Copie impossible : " + pageUrl()`.

`buildShareUrl` devient :

```js
  function buildShareUrl(platform, url, text) {
    if (platform === "whatsapp") {
      return "https://wa.me/?text=" + encodeURIComponent(text + " " + url);
    }
    if (platform === "x") {
      return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) +
        "&url=" + encodeURIComponent(url);
    }
    if (platform === "facebook") {
      return "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
    }
    return null;
  }
```

Le `window.buildShareUrl = buildShareUrl;` est conservé.

- [x] **Step 4: Mettre à jour les href codés en dur de la page démocratie**

Dans `democratie/index.html`, section `#partage`, remplacer `https%3A%2F%2Fla-mise-a-jour.fr%2F` par `https%3A%2F%2Fla-mise-a-jour.fr%2Fdemocratie%2F` dans les trois boutons (WhatsApp, X, Facebook) :

```html
          <a class="btn btn-share" data-platform="whatsapp" href="https://wa.me/?text=Quel%20est%20votre%20plan%20de%20citoyennet%C3%A9%20%3F%20D%C3%A9couvrez%20le%20Plan%206%E1%B5%89%20R%C3%A9publique.%20https%3A%2F%2Fla-mise-a-jour.fr%2Fdemocratie%2F" target="_blank" rel="noopener">WhatsApp</a>
          <a class="btn btn-share" data-platform="x" href="https://twitter.com/intent/tweet?text=Quel%20est%20votre%20plan%20de%20citoyennet%C3%A9%20%3F%20D%C3%A9couvrez%20le%20Plan%206%E1%B5%89%20R%C3%A9publique.&url=https%3A%2F%2Fla-mise-a-jour.fr%2Fdemocratie%2F" target="_blank" rel="noopener">X</a>
          <a class="btn btn-share" data-platform="facebook" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fla-mise-a-jour.fr%2Fdemocratie%2F" target="_blank" rel="noopener">Facebook</a>
```

Le hub (T4) encode déjà `https%3A%2F%2Fla-mise-a-jour.fr%2F`, qui est son canonical : il passe le test sans modification.

- [x] **Step 5: Vérifier le passage au vert + purger l'ancien test**

Dans la describe `Democratie` → `Share`, supprimer `js has native share endpoints` (il exigeait `https://la-mise-a-jour.fr/` dans le JS, ce qui est désormais interdit) et remplacer par le contrôle déjà écrit dans `ShareByPage`. Vérifier que `share links work without js` utilise désormais l'URL `/democratie/` :

```ts
  test('share links work without js', () => {
    expect(INDEX).not.toContain('href="#"');
    expect(INDEX).toContain('href="https://wa.me/?text=');
    expect(INDEX).toContain('https://twitter.com/intent/tweet?');
    expect(INDEX).toContain(
      'href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fla-mise-a-jour.fr%2Fdemocratie%2F"'
    );
  });
```

Run: `mise exec -- pnpm exec playwright test`
Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add main.js democratie/index.html tests/structure.spec.ts
git commit -m "feat: partage derivé du canonical et du data-share-text de chaque page"
```

---

### Task 9: Garde-fous multi-pages (liens relatifs, zéro lien mort)

**Files:**
- Test: `tests/structure.spec.ts` (describe `MultiPage`)

**Interfaces:**
- Consumes: `PAGES`, `section()` (T2), le site complet (T1-T8).
- Produces: le contrat vérifié pour toute page future ajoutée à `PAGES`.

- [x] **Step 1: Écrire les garde-fous**

```ts
test.describe('MultiPage', () => {
  for (const p of PAGES) {
    const html = read(p.file);

    test(`[${p.name}] no root-absolute link or asset`, () => {
      const attrs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
      const absolute = attrs.filter((u) => u.startsWith('/'));
      expect(absolute, 'chemins racine absolus interdits').toEqual([]);
    });

    test(`[${p.name}] every page link targets a registry page`, () => {
      const anchors = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1]);
      for (const raw of anchors) {
        if (raw.startsWith('#') || /^https?:\/\//.test(raw)) continue;
        const resolved = new URL(raw, p.url);
        const target = PAGES.find((x) => x.url === resolved.origin + resolved.pathname);
        expect(target, `lien hors registre : ${raw}`).toBeTruthy();
      }
    });

    test(`[${p.name}] no anchor promotes a planned déclinaison`, () => {
      const labels = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)]
        .map((m) => m[0].replace(/<[^>]+>/g, ''));
      for (const planned of PLANNED) {
        for (const label of labels) {
          expect(label, `${p.name} → ${planned.name}`).not.toContain(planned.name);
        }
      }
    });
  }
});
```

Notes de mise en œuvre :
- Le test des liens porte sur les balises `<a>` uniquement : `<link rel="stylesheet">`,
  `<link rel="icon">` et `<script>` pointent vers des fichiers, pas vers des pages,
  et ne doivent pas être comparés au registre.
- Le test « aucun chemin racine absolu », lui, coure sur **tous** les `href`/`src`,
  assets compris : c'est lui qui interdit `href="/styles.css"`.

- [x] **Step 2: Vérifier que les garde-fous sont verts sur l'existant**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts -g "MultiPage"`
Expected: PASS. Si un test échoue, une page contient un chemin racine absolus ou un lien hors registre : corriger la page, pas le test.

- [x] **Step 3: Prouver que le garde-fou tombe (rouge artificiel)**

Dans `democratie/index.html`, remplacer temporairement :

```html
  <link rel="stylesheet" href="../styles.css">
```

par :

```html
  <link rel="stylesheet" href="/styles.css">
```

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts -g "no root-absolute"`
Expected: FAIL (`chemins racine absolus interdits` avec `["/styles.css"]`).

- [x] **Step 4: Rétablir et revérifier**

Restaurer `href="../styles.css"`, relancer :

Run: `mise exec -- pnpm exec playwright test`
Expected: PASS (suite complète).

- [x] **Step 5: Commit**

```bash
git add tests/structure.spec.ts
git commit -m "test: garde-fous liens relatifs et zéro lien mort"
```

---

### Task 10: Tests navigateur (`navigation.spec.ts`)

**Files:**
- Create: `tests/navigation.spec.ts`

**Interfaces:**
- Consumes: serveur Vite déclaré dans `playwright.config.ts` (`baseURL: http://localhost:8765`, démarrage automatique), hub et `/democratie/` (T1-T8).
- Produces: la preuve des deux risques du Review Focus n° 1 et n° 2 (file:// et slash final), plus la navigation réelle.

- [x] **Step 1: Écrire la suite navigateur**

```ts
import { test, expect } from '@playwright/test';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');

test('hub CTA reaches the démocratie page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ouvrir la mise à jour Démocratie →' }).click();
  await expect(page).toHaveURL('/democratie/');
  await expect(page.locator('h1')).toContainText('Découvrez Citoyen 2.0');
});

test('brand returns from démocratie to the hub', async ({ page }) => {
  await page.goto('/democratie/');
  await page.locator('.brand').click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('h1')).toHaveText("Votre société n'a pas été mise à jour depuis 1958.");
});

test('both url forms serve the démocratie page', async ({ page }) => {
  for (const url of ['/democratie', '/democratie/']) {
    const resp = await page.goto(url);
    expect(resp!.status(), `${url} : statut`).toBeLessThan(400);
    await expect(page.locator('h1')).toContainText('Découvrez Citoyen 2.0');
  }
});

test('hub faq opens one item at a time', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('.faq-item');
  await items.nth(0).locator('summary').click();
  await expect(items.nth(0)).toHaveAttribute('open', '');
  await items.nth(1).locator('summary').click();
  await expect(items.nth(1)).toHaveAttribute('open', '');
  await expect(items.nth(0)).not.toHaveAttribute('open', '');
});

test('tooltip opens on click and closes on Escape', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('#principe .info-btn').first();
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  const tipId = await button.getAttribute('aria-controls');
  await expect(page.locator(`#${tipId}`)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator(`#${tipId}`)).toBeHidden();
});

test('hub works from file:// with relative assets', async ({ page }) => {
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await expect(page.locator('h1')).toHaveText("Votre société n'a pas été mise à jour depuis 1958.");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg, 'feuille de style non chargée en file://').toBe('rgb(248, 250, 252)');
});
```

- [x] **Step 2: Lancer la suite navigateur**

Run: `mise exec -- pnpm exec playwright test tests/navigation.spec.ts`
Expected: PASS.

Écarts possibles et conduite à tenir :
- `both url forms serve the démocratie page` échoue en 404 sur `/democratie` (Vite ne sert pas le slash final) : GitHub Pages redirige, c'est un écart de l'environnement de test. Remplacer le test par la seule forme servie `await page.goto('/democratie/')` et ajouter un commentaire dans le test indiquant que la redirection slash est assurée par GitHub Pages, pas par Vite. Ne pas toucher au canonical.
- Le test `file://` échoue sur `rgb(248, 250, 252)` : un chemin est devenu absolu. Corriger `index.html`, pas le test.

- [x] **Step 3: Vérifier que la suite complète passe ensemble**

Run: `mise exec -- pnpm exec playwright test`
Expected: PASS (statique + navigateur).

- [x] **Step 4: Commit**

```bash
git add tests/navigation.spec.ts
git commit -m "test: navigation réelle, FAQ, tooltips et ouverture file://"
```

---

### Task 11: Suppression du doublon Python, README et recette d'ajout

**Files:**
- Delete: `tests/test_structure.py`, `tests/__init__.py`
- Modify: `README.md`
- Create: `docs/ajouter-une-declinaison.md`
- Test: `tests/structure.spec.ts` (describe `Docs`)

**Interfaces:**
- Consumes: `PAGES`, `PLANNED`, le site complet (T1-T10).
- Produces: la documentation de référence pour toute future déclinaison (lien depuis le README).

- [x] **Step 1: Écrire les tests de documentation (rouge attendu)**

```ts
test.describe('Docs', () => {
  test('readme documents the multi-page workflow', () => {
    const readme = read('README.md');
    expect(readme).toContain('pnpm test');
    expect(readme).not.toContain('python3 -m unittest');
    expect(readme).toContain('/democratie/');
  });

  test('déclinaison recipe exists and lists every step', () => {
    const doc = read('docs/ajouter-une-declinaison.md');
    for (const step of ['democratie/index.html', 'sitemap.xml', 'PAGES', 'collection', 'og.png']) {
      expect(doc, step).toContain(step);
    }
  });

  test('python test suite is gone', () => {
    expect(fs.existsSync(path.join(ROOT, 'tests', 'test_structure.py'))).toBe(false);
    expect(fs.existsSync(path.join(ROOT, 'tests', '__init__.py'))).toBe(false);
  });
});
```

- [x] **Step 2: Vérifier l'échec**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts -g "Docs"`
Expected: FAIL (README sans `pnpm test`, recette absente, Python encore présent).

- [x] **Step 3: Supprimer le doublon Python**

```bash
git rm tests/test_structure.py tests/__init__.py
```

- [x] **Step 4: Réécrire le README**

````markdown
# La Mise à Jour — la-mise-a-jour.fr

Plateforme satirique « zéro build » : un hub à la racine et une page par mise à
jour système. Zéro dépendance, zéro build, servi tel quel.

- `/` — hub « console de versions » (les mises à jour disponibles et à venir)
- `/democratie/` — Citoyen 2.0 : Plan 5ᵉ vs Plan 6ᵉ République

## Prévisualiser

```bash
pnpm exec vite --port 8765
# puis ouvrir http://localhost:8765/
```

`index.html` s'ouvre aussi en double-clic (`file://`) : tous les liens et assets
sont relatifs. Le serveur HTTP reste nécessaire pour vérifier le partage et le
presse-papiers. `python3 -m http.server 8765` convient aussi.

## Tests

```bash
pnpm test
```

Suite Playwright unique : `tests/structure.spec.ts` (statique, multi-pages) et
`tests/navigation.spec.ts` (vrai navigateur). `pnpm` est fourni par `mise` si
vous n'avez pas l'outil d'installé : `mise exec -- pnpm test`.

## Ajouter une mise à jour

Voir `docs/ajouter-une-declinaison.md` : la recette complète, test par test.

## Déploiement

Aucun build : pousser le dossier tel quel sur GitHub Pages.
````

- [x] **Step 5: Écrire la recette**

`docs/ajouter-une-declinaison.md` :

```markdown
# Ajouter une mise à jour système

Recette complète pour une nouvelle déclinaison (exemple : `agronomie`).
Le test `MultiPage` échoue tant qu'une seule de ces étapes est oubliée.

## 1. Créer la page

Copier la page modèle, puis adapter :

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
- Retirer la déclinaison de `PLANNED` et de ses cartes/badges « bientôt ».

## 4. Mettre à jour le bandeau collection

Sur **toutes** les sous-pages (y compris la nouvelle) : la page livrée est
ajoutée en `<a href="../agronomie/">`, les autres restent en badges. Le test
`CollectionStrip` compare chaque page au registre : une seule page oubliée
suffit à le faire échouer.

## 5. Générer l'image de partage

    mise exec -- pnpm exec vite --port 8765 &
    mise exec -- pnpm node scripts/capture-og.mjs

Puis `pnpm test` au vert, commit, push.
```

- [x] **Step 6: Vérifier le passage au vert**

Run: `mise exec -- pnpm exec playwright test`
Expected: PASS.

- [x] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: suppression du doublon Python, README multi-pages et recette d'ajout"
```

---

### Task 12: Images Open Graph par page

**Files:**
- Modify: `scripts/capture-og.mjs`
- Modify: `democratie/index.html` (`og:image`)
- Modify: `og.png`, create: `democratie/og.png` (binaires régénérés)
- Test: `tests/structure.spec.ts` (le test partagé `og:image points to an existing file` couvre les deux fichiers)

**Interfaces:**
- Consumes: hub `#collection` (T3), `/democratie/#tarifs` (page historique), serveur Vite.
- Produces: `og.png` (hub) et `democratie/og.png` (page produit), URLs OG respectives.

- [x] **Step 1: Vérifier l'état actuel (rouge attendu)**

Le test partagé `og:image points to an existing file` est vert : les deux pages pointent encore vers `og.png` à la racine. Le changement d'URL de la page démocratie est le point qui doit passer par un cycle rouge-vert.

Ajouter au describe `Shared`, après `og:image points to an existing file` :

```ts
    test(`[${p.name}] og:image lives next to the page`, () => {
      const m = html.match(/<meta property="og:image" content="https:\/\/la-mise-a-jour\.fr\/([^"]+)"/)!;
      const expected = p.sub ? `${path.dirname(p.file)}/og.png` : 'og.png';
      expect(m[1]).toBe(expected);
    });
```

- [x] **Step 2: Vérifier l'échec**

Run: `mise exec -- pnpm exec playwright test tests/structure.spec.ts -g "og:image lives next to"`
Expected: FAIL pour `democratie` (attendu `democratie/og.png`, obtenu `og.png`).

- [x] **Step 3: Réécrire le script de capture**

`scripts/capture-og.mjs` :

```js
import { chromium } from '@playwright/test';

const SHOTS = [
  { url: 'http://localhost:8765/', selector: '#collection', out: 'og.png' },
  { url: 'http://localhost:8765/democratie/', selector: '#tarifs', out: 'democratie/og.png' },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

for (const shot of SHOTS) {
  await page.goto(shot.url);
  await page.waitForLoadState('networkidle');
  await page.addStyleTag({ content: '.site-header { display: none !important; }' });
  await page.locator(shot.selector).screenshot({ path: shot.out });
  console.log(`Capture ${shot.out} sauvegardée (${shot.selector} sur ${shot.url})`);
}

await browser.close();
```

- [x] **Step 4: Générer les deux captures**

```bash
mise exec -- pnpm exec vite --port 8765 --strictPort &
sleep 3
mise exec -- pnpm node scripts/capture-og.mjs
ls -l og.png democratie/og.png
```

Expected: deux fichiers présents, `democratie/og.png` nouvellement créé (la pricing table), `og.png` remplacé (grille du hub).

- [x] **Step 5: Pointer l'OG de la page démocratie vers son fichier**

Dans `democratie/index.html` :

```html
  <meta property="og:image" content="https://la-mise-a-jour.fr/democratie/og.png">
  ...
  <meta name="twitter:image" content="https://la-mise-a-jour.fr/democratie/og.png">
```

- [x] **Step 6: Vérifier le passage au vert**

Run: `mise exec -- pnpm exec playwright test`
Expected: PASS — `og:image points to an existing file` (deux pages) et `og:image lives next to the page` (deux pages).

- [x] **Step 7: Commit**

```bash
git add scripts/capture-og.mjs og.png democratie/og.png democratie/index.html tests/structure.spec.ts
git commit -m "feat: captures Open Graph dédiées au hub et à /democratie/"
```

---

## Final Verification

- [x] `mise exec -- pnpm exec playwright test` → suite complète verte (statique + navigateur).
- [x] `git status --short` → working tree propre.
- [x] `grep -rn "python3 -m unittest" README.md tests/` → aucun résultat.
- [x] `grep -rn 'href="/\|src="/' index.html democratie/index.html` → aucun résultat.
- [x] `cat sitemap.xml` → exactement les deux URLs du registre `PAGES`.
- [x] Ouverture manuelle : `index.html` en double-clic (CSS chargé, CTA cliquable) puis `pnpm exec vite --port 8765` et parcours hub ↔ démocratie.
