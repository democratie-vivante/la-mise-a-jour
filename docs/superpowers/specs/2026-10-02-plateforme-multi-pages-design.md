# Spec — Passage à une plateforme multi-pages

**Date :** 2026-10-02
**Statut :** en attente de revue
**Repo :** la-mise-a-jour.fr (site statique, zéro build)

---

## 1. Contexte et objectif

Le site est aujourd'hui une page unique satirique, « Citoyen 2.0 » (comparatif
Plan 5ᵉ / Plan 6ᵉ République), servie depuis `index.html` à la racine. Le domaine
`la-mise-a-jour.fr` invite à traiter la société comme un logiciel à mettre à jour :
chaque grand sujet de société devient une « mise à jour système » avec sa page.

**Objectif :** transformer le site en plateforme multi-pages — un hub à la racine
et une page par sujet — sans perdre l'identité « zéro build, zéro dépendance »,
en rendant l'ajout d'une déclinaison aussi cheap que possible.

**Succès :**
- `https://la-mise-a-jour.fr/` = hub « console de versions » ; `https://la-mise-a-jour.fr/democratie/` = la page existante déplacée, contenu inchangé.
- Ajouter une déclinaison = ajouter un fichier HTML + quelques entrées listées, le test de cohérence forçant le reste.
- Une suite de tests unique (TypeScript/Playwright), verte, multi-pages.
- Déploiement toujours « push tel quel » sur GitHub Pages.

**Non-objectifs :**
- Écrire le contenu d'une deuxième déclinaison (Agronomie, Économie, Énergie).
- Introduire un générateur de site, un bundler ou une étape de build.
- Refonte du CSS existant (seuls de nouveaux composants s'ajoutent).
- Données structurées JSON-LD.

## 2. Décisions validées

| Sujet | Décision |
|---|---|
| Racine `/` | Hub des mises à jour (pas de redirection) |
| Chrome partagé | Zéro build : HTML autonome par page + tests de cohérence |
| Marque header | Marque plateforme `la-mise-a-jour` + badge du produit courant |
| Périmètre au lancement | Hub + `/democratie/` ; 3 cartes « bientôt » non cliquables |
| Concept du hub | Approche 1 : « console de versions » (réutilise la grammaire SaaS existante) |
| Suite de tests | TypeScript (Playwright) unique ; le doublon Python est supprimé |

## 3. Architecture des fichiers et URLs

```
/
├── index.html                 ← hub « console de versions » (nouveau)
├── democratie/
│   └── index.html             ← page Citoyen 2.0 (git mv depuis la racine)
├── styles.css                 ← partagé (+ composants hub et collection)
├── main.js                    ← partagé (partage paramétré par page)
├── favicon.svg
├── og.png                     ← capture du hub (grille #collection)
├── democratie/og.png           ← capture de #tarifs (actuelle)
├── sitemap.xml                ← 2 URLs
├── robots.txt, CNAME
├── docs/ajouter-une-declinaison.md
└── tests/
    ├── structure.spec.ts      ← refactoré multi-pages
    └── navigation.spec.ts     ← nouveau, vrai navigateur
```

**Règles :**

1. Le déplacement se fait par `git mv index.html democratie/index.html`, puis le
   hub est créé à la racine : l'historique Git suit le fichier.
2. **Tous les liens et assets sont relatifs** (`styles.css` à la racine,
   `../styles.css` depuis `democratie/`, `../` vers le hub). Aucun
   `href="/..."` ni `src="/..."`. Le double-clic `file://` du README reste
   fonctionnel et le site reste portable sur un sous-chemin. Un test refuse les
   chemins absolus.
3. **URL canonique de chaque page** :
   - `https://la-mise-a-jour.fr/` (hub)
   - `https://la-mise-a-jour.fr/democratie/` (avec slash final : GitHub Pages et
     Vite redirigent `/democratie` → `/democratie/` ; canonical, sitemap et
     liens de partage utilisent la forme avec slash).
4. **Les anciens liens vers `https://la-mise-a-jour.fr/` restent valides** : la
   racine devient le hub, dont la première carte est la mise à jour Démocratie.
   Aucune redirection, aucun lien cassé, aucune perte d'autorité SEO racine.
5. Profondeur unique : toutes les sous-pages sont à `/<slug>/index.html` (une
   seule imbrication). Toute règle de lien relative en découle.

## 4. Chrome partagé

### 4.1 Header (toutes les pages)

Structure identique sur toutes les pages : `brand` + `brand-badge`, `nav`
(ancres de la page), `status-badge`, bouton `Partager`. Seuls les textes et les
`href` changent.

```html
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="…">la-mise-a-jour <span class="brand-badge">…</span></a>
    <nav class="site-nav" aria-label="Navigation principale">…ancres de la page…</nav>
    <span class="status-badge"><span class="status-dot" aria-hidden="true"></span>Statut : …</span>
    <a class="btn btn-primary btn-sm" href="#partage">Partager</a>
  </div>
</header>
```

- **Hub** : `brand href="#main"`, badge `v2026.1`, nav `#collection` /
  `#principe` / `#faq`, statut `Statut : 1 / 4 disponible`.
- **Démocratie** : `brand href="../"`, badge `Citoyen 2.0`, nav `#fonctionnalites`
  / `#tarifs` / `#faq`, statut `Statut : 49.3 opérationnel` (inchangé).

La collection ne pollue pas l'en-tête : elle vit dans le bandeau dédié (§ 4.3).

### 4.2 Footer (toutes les pages)

Le footer devient **plateforme-level** : mêmes cibles sur toutes les pages, ce
qui le rend littéralement identique à l'affichage et testable.

```html
<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <h2 class="footer-title">Produit</h2>
      <ul class="footer-links">
        <li><a href="…">Toutes les mises à jour</a></li>   <!-- hub -->
        <li><a href="…">Comment ça marche</a></li>          <!-- hub #principe -->
        <li><a href="…">FAQ</a></li>                        <!-- hub #faq -->
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Légal</h2>
      <ul class="footer-links">
        <li><a href="…">Mentions légales absurdes</a></li>
        <li><a href="…">CGU</a></li>
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
  <p class="footer-bottom">© 2026 La Mise à Jour — <a href="…">la-mise-a-jour.fr</a></p>
</footer>
```

Les `href` du footer résolvent vers les **mêmes URL cibles** depuis n'importe
quelle page (racine : `./`, `#principe`, `#faq` ; sous-page : `../`,
`../#principe`, `../#faq`). Les colonnes Légal et Suivi sont du texte seul.

### 4.3 Bandeau collection (sous-pages uniquement)

Inséré juste avant le footer. Absent du hub, qui *est* la collection. Exemple
ci-dessous **vu depuis une autre sous-page** (la page Démocratie y figurerait
en lien ; vue depuis `/democratie/`, elle n'y figure pas) :

```html
<nav class="collection" aria-label="Autres mises à jour">
  <p class="collection-title">Autres mises à jour disponibles :</p>
  <a href="../democratie/" class="collection-item">Démocratie <em>v2.0</em></a>
  <span class="collection-item collection-item--soon">Agronomie <em>en bêta fermée</em></span>
  <span class="collection-item collection-item--soon">Économie <em>planifié</em></span>
  <span class="collection-item collection-item--soon">Énergie <em>planifié</em></span>
</nav>
```

**Contenu déterminé par le registre, pas à la main :** le bandeau liste chaque
mise à jour **livrée** *autre que la page courante* (en `<a>`, relatif), puis
chaque déclinaison **non livrée** (en `<span class="collection-item--soon">`
avec son statut). La page courante n'y figure donc pas : pas d'auto-lien, pas
de « Autres mises à jour » qui renvoie à soi. Sur `/democratie/` au lancement,
le bandeau affiche donc les 3 badges et aucun lien.

**Règle zéro lien mort :** une déclinaison non livrée est du texte avec un
badge de statut, jamais une balise `<a>`.

### 4.4 Règles de lien et de structure testées

- Signature structurelle (tags + classes, texte et `href` exclus) du
  `<header>` et du `<footer>` identique sur toutes les pages.
- Chaque `href` du footer, résolu depuis sa page, donne la même URL cible d'une
  page à l'autre, et cette cible existe (fichier présent ; `#ancre` présente
  sur la page cible). Depuis la racine, un lien vers la racine s'écrit `./` ;
  depuis une sous-page, `../`.
- Bandeau collection : présent sur toutes les sous-pages, absent du hub, et son
  contenu est exactement celui décrit en § 4.3 (dérivé du registre).
- Chaque page déclare exactement un `<span class="brand-badge">` non vide.

## 5. Contenu du hub (`index.html`)

**Head :** `<title>La Mise à Jour — des correctifs pour une société obsolète</title>`,
meta description dédiée, canonical `https://la-mise-a-jour.fr/`, OG/Twitter
alignés (§ 7).

### 5.1 Hero

- Eyebrow : `Patch 2026.1 · Installation automatique`
- `h1` : `Votre société n'a pas été mise à jour depuis 1958.`
- Sous-titre : `la-mise-a-jour.fr est la plateforme de mises à jour système de la société. Chaque page compare la version héritée à la version corrigée : bugs connus, correctifs listés, et le bouton d'annulation qui manquait.`
- CTAs : `Ouvrir la mise à jour Démocratie →` (primaire, → `democratie/`) et
  `Voir toutes les mises à jour` (ghost, → `#collection`).

### 5.2 `#collection` — grille de cartes produit

Composants existants réutilisés (`.plan`, `.status-badge`, `.plan-tag`,
`.plan-features`) : une carte = une mise à jour, avec statut, version, teaser
« changelog » et CTA.

| Carte | Statut | Contenu |
|---|---|---|
| **Mise à jour Démocratie** | `Disponible`, badge `v2.0`, **carte cliquable** | Teaser : « Plan 5ᵉ vs Plan 6ᵉ : le 49.3 avec bouton d'annulation, le RIC sorti de bêta fermée. » + 3 puces changelog (mandats non renouvelables, révocation à tout moment, support sous 30 jours) + CTA `Ouvrir la mise à jour →` |
| **Mise à jour Agronomie** | `En bêta fermée`, **non cliquable** | « Du pesticide au sol vivant : migration de l'agriculture française, sans redémarrage à froid. » + mention `Rédaction en cours` |
| **Mise à jour Économie** | `Planifié`, **non cliquable** | « Croissance, PIB et richesse réelle : le refactoring que tout le monde repousse depuis 1973. » |
| **Mise à jour Énergie** | `Planifié`, **non cliquable** | « Production, réseau et sobriété : la seule migration qui ne peut pas être reportée à lundi. » |

Seule la carte Démocratie contient un `<a>` ; les trois autres affichent leur
statut en badge.

### 5.3 `#principe` — Comment ça marche (3 `.feature-card`)

- **Diagnostic** — « La liste des bugs de la version actuelle. Références à l'appui, sans détour. »
- **Comparaison** — « Deux plans côte à côte : ce que vous avez déjà, et ce que la mise à jour ajoute. »
- **Changelog** — « Ce qui change, en clair. Et ce qui ne change pas parce que personne ne l'a demandé. »
  (chacune avec `.info-btn` + tooltip, comme sur le reste du site)

### 5.4 `#faq` — 3 `.faq-item` avec `.fine-print`

1. `C'est quoi, la-mise-a-jour.fr ?` → « Une plateforme d'éducation populaire emballée en produit logiciel. » / *fine print :* « Les faits sont exacts. Seule l'emballage est satirique. »
2. `Pourquoi comparer la société à un logiciel ?` → « Parce qu'un logiciel non patché depuis 1958 aurait été déprécié depuis longtemps. » / *fine print :* « Aucune version prise en charge. Pas de correctif de sécurité depuis 1962. »
3. `Est-ce que je peux contribuer ?` → « Oui. Le code source est public, contrairement à celui de vos lois. » / *fine print :* « Pull requests bienvenues. 49.3 non requis. »

### 5.5 `#partage`

Bandeau de partage existant, réutilisé tel quel, URL = racine.

## 6. Page `/democratie/` — delta uniquement

Le contenu (hero, bandeau logos, proof, tarifs, fonctionnalités, FAQ, partage)
est **strictement inchangé**. Modifications :

1. **Head** : `canonical`, `og:url`, `og:title`, `og:description` →
   `https://la-mise-a-jour.fr/democratie/` ; `og:image` →
   `https://la-mise-a-jour.fr/democratie/og.png`.
2. **Header** : `brand` → `la-mise-a-jour` + `brand-badge` `Citoyen 2.0`,
   `href="../"`. Nav et statut inchangés.
3. **Bandeau collection** inséré juste avant le footer (§ 4.3).
4. **Footer** : remplacé par la version plateforme-level (§ 4.2).
5. **Partage** : les `href` codés en dur passent à l'URL `/democratie/`.

## 7. Partage et SEO

### 7.1 `main.js` — partage paramétré par page

- La constante globale `CANONICAL_URL` disparaît : l'URL partagée est lue dans
  `<link rel="canonical">` de la page courante (une seule source de vérité,
  zéro configuration par page).
- Le texte de partage est lu dans `<body data-share-text="…">`.
- `navigator.share` utilise `document.title`.
- Les `href` codés en dur (chemin sans JS) restent dans le HTML ; un test
  vérifie qu'ils correspondent au canonical + `data-share-text` de leur page.
- Les autres behaviours (tooltips, FAQ ouverture unique, copie presse-papiers)
  sont inchangés et déjà agnostiques de la page.

### 7.2 Head par page

Par page : `title`, `meta description`, `canonical`, `og:type`,
`og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`,
`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
Le `og:url` et le `canonical` doivent correspondre au fichier (test).

### 7.3 Sitemap et images

- `sitemap.xml` : 2 `<url>` — `/` (priority 1.0) et `/democratie/`
  (priority 0.9), `lastmod` à jour.
- `robots.txt` inchangé (il référence déjà le sitemap).
- **Images OG distinctes** : `og.png` = capture de la grille `#collection` du
  hub ; `democratie/og.png` = capture de `#tarifs` (l'actuelle `og.png`).
- `scripts/capture-og.mjs` est adapté pour produire les deux captures en une
  passe (il cible aujourd'hui `http://localhost:8765` + `#tarifs`).

## 8. Tests

Suite unique : TypeScript/Playwright. **Suppression de `tests/test_structure.py`
et `tests/__init__.py`** (doublon exact des 47 tests TS, aujourd'hui en échec
sur l'ancien domaine `plan-democratie.fr`). Le README passe de
`python3 -m unittest` à `pnpm test`.

### 8.1 Registre des pages

```ts
const PAGES = [
  { file: 'index.html',           url: 'https://la-mise-a-jour.fr/',             name: 'hub' },
  { file: 'democratie/index.html', url: 'https://la-mise-a-jour.fr/democratie/', name: 'democratie' },
];
```

Ce registre est la source de vérité testée contre le sitemap et contre le
système de fichiers.

### 8.2 Tests partagés (bouclés sur chaque page)

`lang="fr"`, assets locaux uniquement, canonical et `og:url` cohérents avec le
fichier, un seul `h1`, aucune ancre morte, script en `defer`, contraste AA,
`:focus-visible`, media queries 768/1024px, design tokens, absence du mot
« calculateur », présence du skip-link, signature structurelle header/footer.

### 8.3 Suite `MultiPage` (nouvelle)

1. Tous les `href`/`src` des pages HTML sont relatifs (aucun chemin racine).
2. Header/footer : signature structurelle identique sur toutes les pages.
3. Liens du footer : résolution identique d'une page à l'autre et cibles existantes.
4. Bandeau collection : présent sur toutes les sous-pages, absent du hub ; il
   contient exactement les pages livrées (autres que la courante) en `<a>` et
   les déclinaisons non livrées en badges, avec les statuts attendus.
5. Chaque page possède exactement un `brand-badge` non vide.
6. Chaque répertoire du registre contient un `index.html` ; chaque page du
   sitemap existe et inversement (pas d'URL fantôme, pas de page orpheline).
7. Les `href` de partage codés en dur correspondent au canonical et au
   `data-share-text` de leur page.
8. Aucun lien vers une déclinaison non livrée (règle zéro lien mort) : les
   seules balises `<a>` inter-pages pointent vers des pages du registre.

### 8.4 Contenu spécifique

- **`democratie`** : les 47 tests actuels y sont relogés. Ajustements
  explicites attendus :
  - `© 2026 Citoyen 2.0 — la-mise-a-jour.fr` devient
    `© 2026 La Mise à Jour — la-mise-a-jour.fr` (footer plateforme-level) ;
  - les liens du footer pointent désormais vers le hub (§ 4.2) ; les ancres
    `#fonctionnalites`, `#tarifs`, `#faq` restent dans la nav et sont couvertes
    par le test générique « aucune ancre morte » ;
  - `brand` = `la-mise-a-jour` + badge `Citoyen 2.0` ;
  - liens de partage et `og:url` sur `/democratie/` ;
  - bandeau collection présent, avec 3 badges et aucun lien.
- **`hub`** : titre/description/canonical racine, h1, les 4 cartes avec leurs
  statuts exacts, une seule carte contenant un `<a>`, les 3
  `feature-card`, les 3 FAQ avec fine print, la bande de partage.

### 8.5 `tests/navigation.spec.ts` (nouveau, vrai navigateur)

Serveur Vite déjà déclaré dans `playwright.config.ts` :
1. Depuis le hub, clic sur `Ouvrir la mise à jour Démocratie →` → URL `/democratie/`.
2. Depuis `/democratie/`, clic sur le `brand` (`../`) → retour au hub, URL `/`.
3. FAQ : ouverture unique (un clic sur une question referme la précédente).
4. Tooltip : clic sur `.info-btn` ouvre, `Échap` referme.

Le presse-papiers n'est **pas** testé en navigateur (permissions instables) :
il reste couvert statiquement.

## 9. Scripts, README, déploiement

- `scripts/capture-og.mjs` : capture les deux OG en une passe (hub `#collection`
  → `og.png`, démocratie `#tarifs` → `democratie/og.png`), en gardant la
  suppression du header sticky.
- `README.md` : description multi-pages (« hub + une page par mise à jour »),
  commande de test `pnpm test` (au lieu de `python3 -m unittest`), section
  « Ajouter une déclinaison » pointant vers `docs/ajouter-une-declinaison.md`.
- **Déploiement inchangé** : push tel quel sur GitHub Pages. Vite ne sert qu'aux
  tests ; il sert déjà les `index.html` de répertoire (`/democratie/`).
- `docs/superpowers/plans/2026-09-24-citoyen-2-0.md` reste inchangé :
  c'est de l'historique.

## 10. Recette « ajouter une déclinaison »

Documentée dans `docs/ajouter-une-declinaison.md` :

1. Copier `democratie/index.html` vers `<slug>/index.html` : changer
   `brand-badge`, `canonical`, `og:url`, `og:image`, titre, description, contenu.
2. Au hub : basculer la carte de `Planifié` à `Disponible`, la rendre cliquable,
   ajouter le changelog.
3. Ajouter l'URL au `sitemap.xml` et la page au registre `PAGES` du test.
4. Mettre à jour le bandeau collection sur **toutes** les sous-pages (le test de
   cohérence échoue tant qu'une seule page n'est pas à jour).
5. Capture OG dédiée, `pnpm test` au vert, push.

## 11. Critères d'acceptation

- `pnpm test` : suite verte (47 tests actuels migrés + nouvelles suites).
- `python3 -m unittest` n'est plus documenté ni présent dans le repo.
- Le hub s'affiche sur `/`, la page Citoyen 2.0 sur `/democratie/`, contenu de
  cette dernière strictement inchangé à l'affichage.
- Aucun lien mort, aucune URL absolue de chemin, aucun asset externe.
- `sitemap.xml` contient exactement les pages du registre.
- README à jour ; `docs/ajouter-une-declinaison.md` présent.
- Double-clic `index.html` en `file://` toujours fonctionnel.

## 12. Risques et points d'attention

- **Vite et les URLs de répertoire** : vérifier en implémentation que
  `/democratie/` et `/democratie` sont bien servis (redirection incluse). Si
  Vite ne sert pas le slash final, les tests navigateur utilisent la forme
  servie et le canonical reste avec slash.
- **Copy du hub** : les textes de la § 5 font foi pour les tests ; tout ajustement
  de wording se fait ici avant l'implémentation, ou dans la tâche concernée avec
  ses tests dans la foulée.
- **Bandeau collection à N copies** : plus il y a de sous-pages, plus la mise à
  jour est répétitive — c'est assumé (le test l'exige), et c'est le signal qu'un
  build devient pertinent au-delà d'une cinquantaine de pages.
- **`og.png` racine changé** : les partages déjà en circulation sur la racine
  verront l'image passer de la pricing table à la grille du hub. Accepté : la
  racine n'est plus la page produit.
