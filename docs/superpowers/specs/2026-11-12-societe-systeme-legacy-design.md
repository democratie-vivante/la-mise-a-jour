# Spec — Le système France : le site devient la présence publique de l'équipe de maintenance

**Date :** 2026-11-12
**Statut :** en attente de revue
**Repo :** la-mise-a-jour.fr (site statique, zéro build)

---

## 1. Contexte et objectif

Le site raconte aujourd'hui une satire SaaS : une « plateforme de mises à jour
système de la société » qui vend des plans, affiche des logos partenaires et se
dénonce elle-même à plusieurs endroits (« Pastiche — aucune de ces institutions
n'approuve ce site », « une plateforme d'éducation populaire emballée en produit
logiciel », « Mentions légales absurdes »).

**Nouvelle fiction :** la société française est un **système informatique legacy**
— un monolithe déployé en 1958, sans documentation, qui a accumulé de la dette
technique et ne répond plus aux besoins. **Une nouvelle équipe de dev a repris le
code** pour le corriger et le moderniser, au service d'une bien meilleure
expérience citoyenne. Le site devient la **présence publique de cette équipe** :
audit, plan de mise à jour, méthode, support, contribution.

**Objectif :** rendre la satire **incarnée** (toute l'architecture du site joue la
fiction, pas seulement la copy) et **assumée** (aucun clin d'œil, aucune
autodénonciation), jusqu'à devenir « presque réelle » — sans jamais franchir la
ligne : le site ne se fait pas passer pour un service officiel, et chaque fait
reste vérifiable.

**Succès :**

- Un visiteur peut croire une seconde qu'il est sur le site public d'une équipe
  de maintenance — puis vérifier chaque affirmation via les sources liées.
- Le site garde son identité sobre, statique, zéro build, zéro dépendance.
- Les blagues existantes survivent : elles étaient constitutionnelles déguisées
  en SaaS, le déguisement passe à l'ingénierie.
- La page Démocratie reste le cœur de l'expérience, traduite en matrice de
  migration v5.0 / v6.0 / v7.0.

**Non-objectifs :**

- Nouvelles pages (statut, roadmap, changelog, équipe, mentions légales séparées) :
  la licence « option C » est écartée pour cette itération.
- Personnifier l'équipe (noms, visages, rôles) : elle reste mystérieuse.
- Gadgets interactifs : pas de faux scanner de détection, pas de théâtre.
- Refonte graphique : on réutilise les composants et les tokens existants.
- Nouvelle déclinaison (Agronomie/Économie/Énergie reste non livré).
- Ajout de dépendance, de build, ou de framework.

**Anti-objectifs :**

- Deux registres sur un même site (îlot SaaS à côté de la fiction dev) : le
  visiteur verrait le stratagème.
- Tout texte qui se dénonce : « satirique », « pastiche », « absurde »,
  « c'est une blague ».
- Tout chiffre inventé, toute affirmation non sourcée.
- Se faire passer pour une institution publique ou un service de l'État.

---

## 2. La fiction (bible)

### 2.1 Le système France

| Élément | Valeur |
|---|---|
| Nom | système France |
| Version en production | v5.0 — build du 4 octobre 1958 |
| Dernier hotfix | v5.0.1 — 1962 (élection directe du président — jamais réverté) |
| Dernier patch | v5.0.2 — 2000 (quinquennat — garantie réduite, contre-pouvoirs non étendus) |
| Documentation | la Constitution — partielle, jamais relue en entier depuis |
| Tests | aucun — pas de contrôle citoyen en amont des lois |
| Rollback | aucun — le 49.3 déploie sans revue |
| Monitoring | aucun — pas de suivi public des lois |
| Support | tickets ouverts, réponses non garanties |
| Bus factor | 1 |
| Utilisateurs | 68 M |
| Dépôt | Légifrance (code source public) |

### 2.2 L'équipe

- **Mystérieuse et jamais personnifiée** : pas de nom, pas de visage, pas de
  page « équipe ». Elle parle en « nous » et ne se manifeste que par son travail
  — audit, tickets, versions.
- En bon open source : ce qui compte, c'est le commit, pas le commiteur.
  Corollaire satirique : le système est présidentialisé jusqu'au bus factor 1 ;
  l'équipe, elle, recrute en permanence et n'importe qui peut être mainteneur.
- Elle ne répond jamais à « qui êtes-vous ? » par autre chose qu'un ticket.

### 2.3 Les quatre chantiers

Le plan de mise à jour suit quatre chantiers de modernisation, versionnés :

| Chantier | Version cible | État |
|---|---|---|
| Démocratie | v6.0 (RC) + v7.0 (nightly) | release candidate |
| Agronomie | v0.9 | bêta fermée |
| Économie | v1.0 | backlog |
| Énergie | v1.0 | backlog |

### 2.4 Les institutions

Ce sont des **dépendances héritées** du système, pas des partenaires :
Assemblée nationale (v5.0), Sénat (déprécié, non retirable sans révision),
Conseil constitutionnel (fork non documenté), « partenaires indéterminés »
(dépendance inconnue). Aucune n'approuve le site — et le site ne le prétend
jamais.

---

## 3. Règles d'écriture

1. **Registre ingénierie.** Vocabulaire : version, build, legacy, dette
   technique, module, dépendance, migration, release candidate, nightly, hotfix,
   patch, breaking, rollback, ticket, audit, SLA, uptime, déprécié, support,
   backlog, release notes. Pas de vocabulaire marketing : plan, tarif, prix,
   abonnement, bêta-testeurs (sauf quand le mot est lui-même la blague), essai
   gratuit.
2. **Deadpan.** Le rire vient de l'écart entre le vocabulaire et la réalité
   constitutionnelle, pas d'une annotation. Aucune phrase ne signale qu'elle est
   drôle.
3. **Faits intouchables.** Chaque affirmation exposée porte un lien vers une
   source institutionnelle ou pérenne. Aucun chiffre inventé : un fait non
   sourcé est reformulé sans chiffre ou retiré. (Règle reprise de la spec
   2026-10-16 §10.)
4. **Mentions légales droites.** Éditeur (l'équipe), hébergeur (GitHub Pages),
   aucune donnée collectée, aucun cookie, aucun traceur. Pas de mention
   « absurdement » fausse.
5. **La seule ligne d'honnêteté** acceptée, in-world : « chaque affirmation est
   sourcée ; l'emballage n'engage que l'équipe. » Elle vit dans le support
   (FAQ), pas en bandeau.

---

## 4. Décisions validées

| Sujet | Décision |
|---|---|
| Fiction | société = système legacy ; équipe anonyme de maintenance |
| Périmètre | 2 pages existantes (hub + démocratie) — option B |
| Équipe | mystérieuse, jamais personnifiée |
| Page SaaS | conservée, traduite en matrice de migration |
| Accueil | page descriptive du système + plan de mise à jour |
| Interactivité | aucune nouvelle ; pas de détection |
| Clins d'œil | supprimés partout (garde-fou testé) |
| Versionnage | v5.0 prod · v6.0 RC · v7.0 nightly ; carte hub Démocratie = v6.0 |
| Mentions légales | réelles, jouées droit |
| OG | régénérées en fin de chantier (script existant) |
| Anims | aucune ajoutée ; contraintes existantes conservées |

---

## 5. Page d'accueil (`index.html`)

**Head :** `<title>La Mise à Jour — maintenance du système France</title>`,
description : « Le suivi public de la modernisation du système France : état du
legacy, plan de mise à jour, méthode, support. » Canonical et OG inchangés
(racine).

### 5.1 Header

- Marque `la-mise-a-jour` + badge `système France`.
- Nav (3 ancres) : `Plan de mise à jour` → `#collection`, `État du système` →
  `#systeme`, `Support` → `#faq`.
- Statut : `Statut : dégradé · 1 / 4 chantiers livrés`.
- Bouton `Partager`.

### 5.2 Hero

- Eyebrow : `Système France · v5.0.2 · en production depuis 1958`
- H1 **inchangé** : `Votre société n'a pas été mise à jour depuis 1958.`
- Sous-titre : « Le système France est un legacy de soixante-huit ans : sans
  documentation, sans tests, sans rollback. Une nouvelle équipe de maintenance a
  repris le code — elle publie ici l'audit, le plan et les tickets. »
- CTAs : `Ouvrir la migration Démocratie →` (primaire → `democratie/`),
  `Lire l'audit du système` (ghost → `#systeme`), `Contribuer` (ghost → `#agir`).

### 5.3 `#systeme` — État du système (nouvelle section)

Titre : `État du système` · Sous-titre : « L'audit d'arrivée de l'équipe. Chaque
dette est documentée, liée et vérifiable. »

Six cartes `.feature-card` dans une `.features-grid` (aucun nouveau composant),
chacune : icône, titre, une phrase de réalité, lien source (`.feature-source`).

| Carte | Phrase | Source |
|---|---|---|
| Pas de rollback | « Le 49.3 déploie sans revue et sans bouton d'annulation. » | Constitution art. 49 al. 3 (Légifrance) |
| Bus factor : 1 | « Un exécutif à point de défaillance unique, renouvelable sans limite. » | Constitution art. 6 et 8 |
| Dépendance obsolète | « Le Sénat est déprécié, mais non retirable sans révision. » | Constitution art. 24 et 89 |
| Pas de tests | « Aucun contrôle citoyen en amont : le RIC est en bêta fermée depuis 1958. » | Constitution art. 11 |
| Pas de monitoring | « Les lois ne sont pas suivies en direct ; les tickets citoyens restent sans réponse. » | Assemblée nationale |
| Pas d'horizon long | « Aucun avis opposable avant adoption ; le rapport 2050 n'existe pas. » | Well-being of Future Generations (Pays de Galles) |

Bandeau de statut sous la grille (composant `.proof` réutilisé) :
`Dernier correctif : 1962 · Dernier patch : 2000 · Version courante : v5.0.2`.

### 5.4 `#collection` — Plan de mise à jour

Titre : `Plan de mise à jour` · Sous-titre : « Quatre chantiers. Un seul est en
release candidate. »

| Carte | Statut | Tag | Teaser | Bas de carte |
|---|---|---|---|---|
| Démocratie | `Release candidate` | `v6.0` | « v5.0 → v6.0 : le 49.3 réversible, le RIC sorti de bêta, la v7.0 en nightly. » + 3 puces (mandats non renouvelables, révocation à tout moment, support sous 30 jours) | CTA `Ouvrir la migration →` (seul `<a>` de la grille) |
| Agronomie | `Bêta fermée` | `v0.9` | teaser inchangé (« Du pesticide au sol vivant… ») | `Spécifications en cours` (remplace « Rédaction en cours ») |
| Économie | `Backlog` | `v1.0` | inchangé (« le refactoring que tout le monde repousse depuis 1973 ») | — |
| Énergie | `Backlog` | `v1.0` | inchangé (« la seule migration qui ne peut pas être reportée à lundi ») | — |

### 5.5 `#principe` — Méthode

Titre : `Méthode` · Sous-titre : « Comment on reprend un système qu'on n'a pas
écrit. » Trois cartes `.feature-card` avec `info-btn`/tooltip (pattern existant) :

- **Diagnostic** — « L'audit : chaque dette documentée, chaque affirmation
  sourcée. » · tooltip : « On commence par ce qui ne marche pas : articles,
  dates, chiffres. Pas d'avis, des références. »
- **Migration** — « Tout changement est listé, réversible, et publié. » ·
  tooltip : « La colonne de gauche est le code en production ; la v6.0 est la
  candidate. Vous choisissez le rythme de migration. »
- **Changelog** — « Ce qui change, en clair. Et ce qui ne change pas parce que
  personne ne l'a demandé. » · tooltip inchangé : « Corrections de bugs connus
  depuis 1958. Fonctionnalité « révocation » enfin documentée. »

### 5.6 `#faq` — Support

Titre : `Support` · Sous-titre : `Les tickets les plus ouverts.` Trois
`.faq-item` avec `.fine-print` :

1. `C'est quoi, la-mise-a-jour.fr ?` → « Le suivi public de la maintenance du
   système France. Une équipe a repris le code ; voici son travail. » · fine
   print : « Chaque affirmation est sourcée ; l'emballage n'engage que l'équipe. »
2. `Pourquoi comparer la société à un logiciel ?` → « Parce qu'un logiciel non
   maintenu depuis 1958 serait déprécié depuis longtemps. » · fine print :
   « Aucune version prise en charge. Dernier correctif de sécurité : 1962. »
3. `Est-ce que je peux contribuer ?` → « Oui. Le code source est public : il
   s'appelle la Constitution. » · fine print : « Pull requests bienvenues. 49.3
   non requis. »

### 5.7 `#agir`, `#partage`, footer

- `#agir` : conservé (se renseigner / interpeller vos élus / candidats 2027),
  copy inchangée — c'est l'action réelle du site.
- `#partage` : conservé ; titre inchangé (`Cette plateforme se partage mieux que
  vos diagnostics`).
- Footer : voir §7.

---

## 6. Page Démocratie (`democratie/index.html`)

### 6.1 Head

- Title : `Citoyen 2.0 — migration Démocratie v6.0`.
- Description : « Le module Démocratie est en v5.0 depuis 1958. La migration
  v6.0 est en release candidate, la v7.0 en nightly. Comparez les branches. »
- `data-share-text` : `Citoyen 2.0 — la migration v6.0 de la Démocratie est en
  release candidate.`

### 6.2 Header et hero

- Badge `Citoyen 2.0` inchangé ; statut inchangé : `Statut : 49.3 opérationnel`.
- Nav : `Fonctionnalités` → `#fonctionnalites`, `Matrice` → `#tarifs`,
  `Support` → `#faq`.
- Eyebrow : `Migration v6.0 · release candidate · v7.0 en nightly`.
- H1 inchangé : `Découvrez Citoyen 2.0 : La démocratie sans les bugs de 1958`.
- Sous-titre : « Le module Démocratie tourne en v5.0 depuis 1958. La migration
  v6.0 est en release candidate ; la v7.0 est en nightly. Comparez les branches
  et reprenez la main sur le code source. »
- CTAs : `Voir la matrice` (`#tarifs`), `Comparer les versions`
  (`#fonctionnalites`), `Contribuer` (`#agir`).

### 6.3 `#logos` → Dépendances héritées

Titre : `Dépendances héritées`. Quatre `.logo-item` avec nom + statut :
Assemblée nationale · Sénat (déprécié) · Conseil constitutionnel (fork non
documenté) · Partenaires indéterminés (dépendance inconnue).
Note (remplace « Pastiche — aucune de ces institutions n'approuve ce site ») :
`Toutes héritées de la v5.0. Aucune n'est maintenue par l'équipe.`

### 6.4 Bandeau proof

- `+68 M de citoyens n'ont rien demandé` — conservé (source INSEE à vérifier,
  cf. §10).
- Remplace `4,3 / 5 — avis vérifiés sur les lois que vous n'avez pas lues` par
  un constat sans chiffre inventé : `Aucun SLO publié, aucune astreinte, aucun
  rollback.` (constat rhétorique, pas de mesure inventée).

### 6.5 `#tarifs` → Matrice de migration

- Titre : `Matrice de migration` · Sous-titre : `Trois branches. Un seul dépôt.`
- Légende conservée dans l'esprit actuel : ✔ la règle est livrée dans cette
  version · ✗ elle n'y est pas ; vert = à votre avantage, rouge = à votre
  détriment.

| Carte | Classe | Tag | Titre | Grande ligne | Sous-titre |
|---|---|---|---|---|---|
| v5.0 | `plan plan--legacy` | `Héritée · build 1958` | `v5.0 — 5ᵉ République` | `prod` | `buildée le 04/10/1958, jamais auditée` |
| v6.0 | `plan plan--popular` | `Release candidate` | `v6.0 — 6ᵉ République` | `RC` | `prête pour la revue` |
| v7.0 | `plan plan--beta` | `Nightly · contient des traces de souveraineté` | `v7.0 — Démocratie Continue` | `nightly` | `compilée chaque nuit pour personne` |

- Badge v6.0 : `RECOMMANDÉE` (remplace `POPULAIRE`). Badge v7.0 : `NIGHTLY`
  (remplace `BÊTA`).
- `plan-sub` : v5.0 `Aucun rollback prévu — sortie par révolution uniquement` ;
  v6.0 `Réversible à tout moment` ; v7.0 inchangé.
- Les **onze lignes** de chaque carte sont conservées à l'identique (c'est le
  contenu constitutionnel) ; seules les `row-note` au vocabulaire SaaS sont
  traduites (`formulaire sans réponse` → `ticket sans réponse`, etc.).
- `plan-disclaimer` conservé tel quel.
- Note sous la grille : `Trois lignes rouges sur la v6.0 ? Elles sont dans la
  v7.0, en nightly.`

### 6.6 `#fonctionnalites`, `#objections`, `#production`, `#changelog`

- `#fonctionnalites` : six cartes conservées. Seule retouche de registre :
  « Résiliation sans pénalité » → « Rollback sans pénalité ».
- `#objections` : contenu conservé ; sous-titre sans le « Presque. » :
  `Objections reçues, réponses sourcées.`
- `#production` : conservé tel quel (déjà en registre dev).
- `#changelog` : conservé tel quel (changelog canonique du dépôt).

### 6.7 `#sources`, `#faq`, `#agir`, `#partage`, bandeau collection

- `#sources` : conservé ; sous-titre conservé (`Les faits, pas l'emballage.`).
- `#faq` : six items conservés, questions traduites en support :
  - `Puis-je désinstaller la v5.0 ?` (réponse : révision constitutionnelle non
    incluse — fine print : `Le système est reconduit tacitement depuis 1958,
    sans préavis.`)
  - `La migration v6.0 est-elle vraiment gratuite ?` (fine print : `0 €,
    engagement de 5 ans non renouvelable… pour vous.`)
  - `Que se passe-t-il si je ne vote pas ?` (fine print : `Aucun changement :
    le système est mis à jour automatiquement.`)
  - `Comment la maintenance est-elle financée ?` (fine print conservé :
    `Impôts, CSG, TVA. Apple Pay n'est pas encore disponible.`)
  - `Le 49.3 peut-il être annulé ?` (fine print conservé : `Oui, désormais.
    L'ancien modèle n'avait pas de bouton.`)
  - `Proposez-vous un essai gratuit ?` (fine print conservé : `Vous êtes né
    dedans. C'est l'essai.`)
- `#agir` : conservé tel quel.
- `#partage` : titre → `Cette migration se partage mieux que vos opinions`.
- Bandeau collection : statuts alignés sur le hub (`Agronomie bêta fermée`,
  `Économie backlog`, `Énergie backlog`).

---

## 7. Chrome partagé

### 7.1 Footer (identique sur les deux pages)

- **Produit** : `Toutes les mises à jour` (→ hub), `Méthode` (→ `../#principe`
  ou `#principe`), `Support` (→ `#faq`).
- **Légal** (texte seul, liens internes uniquement — contrainte test) :
  `Mentions légales` (ancre vers `#faq`), `Édité par l'équipe de maintenance`,
  `Hébergé sur GitHub Pages`, `Aucune donnée collectée — contrairement au
  système`.
- **Suivi** : `Tous les systèmes sont dégradés`, `49.3 : opérationnel`.
- Bas : `© 2026 La Mise à Jour — la-mise-a-jour.fr` (inchangé).

### 7.2 Règles conservées

Structure header/footer identique d'une page à l'autre (signature testée),
exactement un `brand-badge`, liens du footer tous internes et résolvables.

---

## 8. Versionnage harmonisé

- La carte Démocratie du hub passe de `v2.0` à `v6.0`.
- Toute mention « Plan 5ᵉ / 6ᵉ / bêta » dans le hub devient « v5.0 / v6.0 /
  v7.0 ».
- Les cartes de la matrice s'intitulent `v5.0 — 5ᵉ République`,
  `v6.0 — 6ᵉ République`, `v7.0 — Démocratie Continue`.
- Le changelog reste la source de vérité historique : v1.0 → v7.0.

---

## 9. SEO, partage, OG

- `title`, `meta description`, OG/Twitter réécrits au registre de la fiction ;
  canonical et `og:url` inchangés.
- `data-share-text` mis à jour (§5, §6).
- `og.png` (hub) et `democratie/og.png` régénérés en fin de chantier via
  `scripts/capture-og.mjs` (captures `#collection` et `#tarifs`).
- `sitemap.xml`, `robots.txt`, `CNAME` inchangés.

---

## 10. Tests

TDD : la suite est mise à jour **avant** l'implémentation (rouge), puis le site
est réécrit jusqu'au vert. Les tests de copy littérale sont réécrits à partir des
textes autoritatifs de cette spec.

### 10.1 Tests modifiés

- `Democratie › HeaderHero` : eyebrow, sous-titre, CTAs, statut.
- `Democratie › SocialProof` : ligne proof remplacée.
- `Democratie › Pricing` : titre/sous-titre/cartes (v5.0/v6.0/v7.0), tags,
  badges `RECOMMANDÉE`/`NIGHTLY`, grandes lignes, sous-titres, `plan-note`.
  Les 33 lignes, 11 par carte, l'absence d'animation et l'ordre mobile
  `.plan--popular` restent testés à l'identique.
- `Democratie › FeatureGrid` : six titres conservés ; pitch « Rollback sans
  pénalité ».
- `Democratie › FAQ` : questions et fine prints de la §6.7.
- `Democratie › Objections` : sous-titre sans « Presque. ».
- `Democratie › Share` : titre « Cette migration se partage mieux que vos
  opinions ».
- `Corrections › logo band flags the pastiche` → `dependencies band names the
  inherited deps` (noms + statuts), et vérifie l'absence de « Pastiche ».
- `HubSections › faq` : nouvelles questions et fine prints ; vérifie l'absence
  de « Les faits sont exacts. Seule l'emballage est satirique. »
- `HubSections › principe` : titres `Diagnostic / Migration / Changelog`.
- `HubCollection` : statuts `Release candidate` / `Bêta fermée` / `Backlog`,
  tag `v6.0`, teasers et note `Spécifications en cours`.
- `ChromeHeader` : badge `système France`, nav `#collection / #systeme / #faq`,
  statut `dégradé · 1 / 4 chantiers livrés`.
- `ChromeFooter` : nouvelles lignes légales et statut.
- `CollectionStrip` : statuts `bêta fermée` / `backlog`.
- `navigation.spec.ts` : CTA du hub et h1 inchangés (`Ouvrir la migration
  Démocratie →` → `/democratie/`) ; FAQ unique ; tooltips.

### 10.2 Nouveaux garde-fous

- **Aucune autodénonciation** : sur le HTML des deux pages, blocage des chaînes
  `pastiche`, `satirique`, `absurde`, `emballée en produit logiciel`,
  `Rédaction en cours` (casse-insensible).
- **Section `#systeme`** : présente sur le hub, six `.feature-card`, chaque carte
  contient un `href="https://` (source).
- **Bandeau de statut** : `Dernier correctif : 1962`, `Dernier patch : 2000`,
  `Version courante : v5.0.2`.
- **Cohérence des versions** : le hub ne contient plus `v2.0` ; la carte
  Démocratie porte `v6.0`.
- **Mentions légales** : `GitHub Pages` présent, `absurde` absent, footer sans
  lien externe.
- Les invariants existants (tokens, contraste AA, file://, liens relatifs,
  sitemap, zéro ancre morte, un seul h1, assets locaux) restent inchangés.

---

## 11. Documentation et livraison

- `README.md` : description de la nouvelle fiction (page publique de l'équipe de
  maintenance), pages inchangées, workflow de test inchangé.
- `docs/ajouter-une-declinaison.md` : vocabulaire aligné (version/branche,
  statuts release candidate / bêta fermée / backlog).
- Spec commitée sur `main` ; implémentation sur branche dédiée
  (`refactor/systeme-legacy`), commits en français (`docs:`, `test:`, `feat:`,
  `refactor:`).
- `pnpm test` (ou `mise exec -- pnpm test`) vert à la fin ; `tsc --noEmit` vert.
- OG régénérées, puis commit final.

---

## 12. Critères d'acceptation

- Les deux pages racontent une seule fiction, sans aucune phrase qui se dénonce.
- L'accueil décrit le système (audit + dette) **et** publie le plan de mise à
  jour ; les quatre chantiers ont leurs statuts dev.
- La page Démocratie est une matrice de migration v5.0/v6.0/v7.0 ; les 33 lignes
  constitutionnelles sont intactes.
- Chaque affirmation exposée porte un lien source ; aucun chiffre inventé.
- Zéro gadget, zéro nouvelle dépendance, zéro build ; `file://` fonctionne.
- `pnpm test` et `tsc --noEmit` verts ; garde-fous « aucune autodénonciation »
  et « section système » présents.
- Le site reste sobre, statique, et respire l'ingénierie — pas le marketing.

---

## 13. Faits à vérifier à l'implémentation

| Fait | Usage | Source candidate |
|---|---|---|
| Art. 49 al. 3 : adoption sans vote | carte dette, tooltips, matrice | Légifrance, Constitution 1958 |
| Art. 6 et 8 : président, nomination | carte « bus factor » | Légifrance |
| Art. 24 et 89 : Parlement, révision | carte « dépendance obsolète » | Légifrance |
| Art. 11 : référendum (pas d'initiative citoyenne) | carte « pas de tests » | Légifrance / vie-publique.fr |
| 68 M d'habitants | bandeau proof | INSEE (lien à ajouter ou chiffre à retirer) |
| Pays de Galles, loi 2015, générations futures | carte « horizon long » | gov.wales |
| Quinquennat 2000, élection directe 1962 | bandeau de statut, changelog | Légifrance (déjà sourcé) |

Règle inchangée : tout chiffre non sourcé est reformulé sans chiffre.

---

## 14. Risques et points d'attention

- **Trop sec.** En supprimant les clins d'œil, on perd les phrases qui font rire
  le plus vite. Mitigation : déplacer la drôlerie dans les faits eux-mêmes et
  dans les notes de ligne (`sans bouton d'annulation`, `compilée chaque nuit
  pour personne`) — pas dans des commentaires méta.
- **Registre uniforme.** Tout traduire peut produire un jargon monotone.
  Mitigation : garder les punchlines humaines (« une seule part, c'est tout »,
  « vous êtes né dedans. C'est l'essai. »).
- **Confusion légale.** La fiction « équipe de maintenance » ne doit jamais
  suggérer une affiliation officielle. Mitigation : mentions légales droites,
  aucune revendication d'institution, bandeau de dépendances assumé.
- **Tests très prescriptifs.** Toute retouche de copy casse un littéral.
  Mitigation : la §5–§6 fait foi ; implémentation et tests avancent ensemble.
