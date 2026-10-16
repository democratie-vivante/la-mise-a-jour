# Spec — Démocratie suite : plan bêta, objections, cas réels et historique des versions

**Date :** 2026-10-16
**Statut :** en attente de revue
**Repo :** la-mise-a-jour.fr (site statique, zéro build)

---

## 1. Contexte et objectif

La page `/democratie/` (Citoyen 2.0) compare aujourd'hui deux offres : le Plan
5ᵉ République (legacy) et le Plan 6ᵉ République (POPULAIRE), sur 8 lignes
alignées. La page convainc les modérés mais s'arrête au bord du-radical-qu'on-
n'ose-pas-proposer, et ne répond pas aux objections du lecteur sceptique.

**Objectif :** pousser la page plus loin avec quatre ajouts —

1. un **3ᵉ plan** assumément plus innovant (« pour bousculer ») : assemblée
   citoyenne tirée au sort dotée du pouvoir législatif, exécutif collectif à la
   place du président unique, conseil des générations futures ;
2. une section **« Pas convaincu·e ? »** qui répond avec humour aux objections
   récurrentes contre ces modèles ;
3. une section **« Déjà en production »** : les cas réels européens qui font
   tourner ces fonctionnalités ;
4. un **« Historique des versions »** de la République française qui recadre :
   la 6ᵉ/7ᵉ est de la maintenance, pas une utopie.

**Succès :**
- Trois plans alignés sur 11 lignes ; le 3ᵉ est à la fois drôle, crédible et
  sourcé ; le 6ᵉ reste le plan recommandé (badge POPULAIRE inchangé).
- Les 6 objections principales reçoivent une réponse satirique mais factuelle,
  chaque fait étant lié à une source institutionnelle.
- Cinq cas réels vérifiables (Suisse, Irlande, Ostbelgien, Pays de Galles,
  Paris).
- Quatre branches séparées (une par feature), fusionnables dans l'ordre, tests
  verts à chaque extrémité.

**Non-objectifs :**
- Quiz interactif, témoignages satiriques (écartés en brainstorm).
- Nouvelle page ou nouvelle déclinaison, changement de `sitemap.xml`.
- Régénération des `og.png` (les captures actuelles restent acceptables).
- Ni modification de la navigation header, ni de la section « agir ».

## 2. Décisions validées

| Sujet | Décision |
|---|---|
| Positionnement du 3ᵉ plan | Bêta / early access — le 6ᵉ reste le choix raisonnable |
| Nom du 3ᵉ plan | « Plan Démocratie Continue » (clin d'œil intégration continue) |
| Badge | « BÊTA » (le « POPULAIRE » du 6ᵉ est inchangé) |
| Grille de comparaison | 3 nouvelles lignes présentes dans les **3 plans** → 11 lignes alignées |
| 6ᵉ sur les nouvelles lignes | ✗ rouge avec row-note « voir plan Démocratie Continue » (progression voulue : l'échelier) |
| Format objections | Accordéon tickets de support (`details`/`summary`, classe `.obj-item`) |
| Format cas réels | 5 cartes sur le modèle `feature-card` |
| Format historique | Release notes versionnées avec tags `MAJOR`/`HOTFIX`/`PATCH`/`BREAKING` |
| Ordre des sections | tarifs → fonctionnalites → **objections** → **production** → **changelog** → sources → faq → agir → partage |
| Branches | 4 branches **empilées** (chacune basée sur la précédente), fusion dans l'ordre (§7) |
| `og.png` | Non régénéré cette itération |

## 3. Feature 1 — Plan Démocratie Continue (branche `democratie-plan-continue`)

### 3.1 Carte

- Classe : `plan plan--beta` ; badge `BÊTA` (même gabarit que `.plan-badge`,
  couleur distincte) ; tag : « Early access · contient des traces de
  souveraineté ».
- Prix : `0 €` — span : « indemnisé comme un jour de jury ».
- plan-sub : « Pour bêta-testeurs·ses de la République — engagement réel,
  retours d'expérience attendus ».
- Fine print (nouvel élément `.plan-disclaimer`, style mention légale) :
  « Effets secondaires fréquents : engagement, responsabilité, intérêt soudain
  pour les budgets locaux. En cas de démocratie excessive, consultez votre
  assemblée. »

### 3.2 Les 11 lignes (alignées sur les 3 plans)

Les 8 lignes existantes sont reprises telles quelles dans le bêta (mêmes
marques/notes que le 6ᵉ), **sauf** Support dont la row-note devient :
« pas besoin — vous êtes le support ».

Trois nouvelles lignes (mêmes labels dans les 3 cartes) :

| Ligne | 5ᵉ (rouge) | 6ᵉ (rouge) | Bêta (vert) |
|---|---|---|---|
| Assemblée citoyenne tirée au sort | ✗ *jury d'assises seulement* | ✗ *pas dans cette version* | ✓ *pouvoir législatif réel* |
| Président unique | ✓ *cumul possible, dissolution en option* | ✓ *un seul, mais sous surveillance* | ✗ *conseil de 7, présidence tournante* |
| Contrôle des générations futures | ✗ *le rapport 2050 n'existe pas* | ✗ *non prévu* | ✓ *avis opposable avant chaque loi* |

Guidage vers le 3ᵉ étage : une seule ligne d'aide sous la grille (élément
`.plans-note`, sous `.pricing-grid`) — « Trois lignes rouges sur le 6ᵉ ? Elles
sont en bêta : voir le plan Démocratie Continue. » Les row-notes du 6ᵉ
restent celles du tableau ci-dessus.

Les trois nouvelles lignes du bêta reçoivent un tooltip ⓘ sourcé (schéma
`info-btn`/`tooltip` existant) :
- `tip-tirage-b` : tirage au sort déjà en production — jurys d'assises depuis
  1791 ; Convention citoyenne pour le climat (2020) restée consultative.
- `tip-collegial-b` : la Suisse gouverne à sept depuis 1848, présidence
  tournante chaque année (lien admin.ch).
- `tip-futures-b` : le Pays de Galles évalue ses lois à l'aune des générations
  futures depuis 2015 (lien gov.wales).

### 3.3 Styles

- `.pricing-grid` : 3 colonnes au-delà de 1024 px ; 2 colonnes entre 769 et
  1024 px (le bêta occupe une pleine largeur) ; 1 colonne ≤ 768 px.
- Le breakpoint 768 px existant (`.plan--popular` en `order: -1`) est préservé —
  ordre mobile : 6ᵉ, 5ᵉ, bêta.
- `.plan--beta` : bordure `2px dashed` (couleur : token existant, pas de
  nouvelle teinte), fond légèrement distinct si un token existe.
- Aucune animation ni transition dans `.pricing`/`.plan` (contrainte test
  existante). Card padding et police des lignes légèrement resserrés en mode
  3 colonnes pour tenir dans 1080 px (max-width du conteneur inchangé).

### 3.4 Copy transverse (portée par cette branche)

- Meta description + og/twitter description : « Comparez le Plan 5ᵉ, le Plan
  6ᵉ République et le plan Démocratie Continue (bêta). »
- Section-sub de #tarifs : « Trois versions. Une seule facture. »
- README ligne `/democratie/` : « Citoyen 2.0 : Plan 5ᵉ, 6ᵉ et bêta citoyenne ».
- Hub (index.html) : toute mention « deux plans »/comparatif bicolore mise en
  cohérence (recherche « Plan 5ᵉ », « 6ᵉ », « deux » à l'implémentation).

## 4. Feature 2 — Section « Pas convaincu·e ? » (branche `democratie-objections`)

- id : `objections` ; titre : « Pas convaincu·e ? — le centre d'aide » ;
  sub : « Objections reçues, réponses honnêtes. Presque. »
- 6 tickets `.obj-item` (`details`/`summary`, summary = l'objection entre
  guillemets) : réponse 2-3 phrases (satire + fait sourcé, lien inline vers
  source institutionnelle) + `.fine-print` punchline.
- `main.js` : le sélecteur single-open devient `.faq-item, .obj-item` (le test
  existant exige que `.faq-item` reste présent dans le JS).
- Les 6 tickets, copie de référence (faits vérifiés selon §10) :

1. « Le tirage au sort ? N'importe qui va légiférer. » → Comme au tribunal :
   vous acceptez depuis 1791 que des citoyens tirés au sort décident de la
   culpabilité — juste pas des lois. L'Irlande est allée plus loin : 99 tirés
   au sort ont préparé deux référendums, adoptés par le peuple.
   *Fine print : la compétence, ça se vérifie. L'élection, ça se promet.*
2. « Personne ne les a élus. C'est antidémocratique. » → Aristote rangeait
   l'élection du côté aristocratique et réservait le tirage au sort à la
   démocratie. Les Athéniens trouvaient l'élection élitiste.
   *Fine print : « démos kratos » — pouvoir du peuple, pas pouvoir des élus.*
3. « Les lobbies vont les plier en deux. » → Un lobbyiste investit sur un
   interlocuteur qui reste vingt ans. Tiré au sort pour un mandat court, sans
   réélection à espérer ni carrière à financer : rien à vendre, rien à acheter.
   *Fine print : le risque n'est pas qu'ils soient corruptibles. C'est qu'ils
   ne le soient pas.*
4. « Les gens n'ont ni le temps ni l'envie. » → Le système repose déjà sur des
   citoyens tirés au sort : jurés d'assises, assesseurs, bureaux de vote. À
   chaque convocation, ils viennent.
   *Fine print : on peut ignorer une élection, pas un huissier.*
5. « Un conseil de sept à la place du président ? Et en cas de crise ? » → La
   Suisse gouverne à sept depuis 1848, présidence tournante chaque année.
   Crises traversées : deux guerres mondiales, plusieurs récessions, zéro
   présidentialisation.
   *Fine print : en cas de crise, ils se réunissent. C'est littéralement le
   produit.*
6. « Le conseil des générations futures va tout bloquer. » → Le Pays de Galles
   vit avec le sien depuis 2015. Bilan : un avenir pris en compte, une
   autoroute en moins. C'était le but.
   *Fine print : bloquer une bêtise à long terme, c'est le cahier des charges.*

## 5. Feature 3 — Section « Déjà en production » (branche `democratie-cas-reels`)

- id : `production` ; titre : « Déjà en production en Europe » ; sub :
  « Fonctionnalités bêta déployées en conditions réelles. Aucun rollback
  signalé. »
- 5 cartes `.feature-card` : drapeau ou emoji, pays, fonctionnalité, année de
  mise en production, phrase d'une ligne, lien externe officiel (`target
  _blank` + `rel="noopener"`, convention existante) :
  1. 🇨🇭 **Suisse** — Exécutif collégial : « 7 conseillers fédéraux, présidence
     tournante chaque année. En production depuis 1848. » (admin.ch)
  2. 🇮🇪 **Irlande** — Assemblées citoyennes : « 99 citoyens tirés au sort, deux
     référendums préparés puis adoptés. » (citizensassembly.ie)
  3. 🇧🇪 **Ostbelgien (Belgique)** — Assemblée citoyenne permanente : « tirage
     au sort renouvelé chaque année, depuis 2019. » (domaine officiel à
     vérifier, cf. §10)
  4. 🏴󠁧󠁢󠁷󠁬󠁳󠁿 **Pays de Galles** — Génération futures : « le bien-être des générations
     futures est inscrit dans la loi depuis 2015, commissaire dédié inclus. »
     (gov.wales)
  5. 🇫🇷 **Paris** — Assemblée citoyenne permanente : « 130 Parisiennes et
     Parisiens tirés au sort, avis sur les projets de la Ville. » (paris.fr)
- La section `#sources` gagne les entrées correspondantes (5 nouveaux liens
  institutionnels).

## 6. Feature 4 — Historique des versions (branche `democratie-changelog`)

- id : `changelog` ; titre : « Historique des versions » ; sub : « La
  République est un logiciel entretenu : cinq versions majeures, une sixième
  en développement. Ce n'est pas une utopie, c'est de la maintenance. »
- Liste type release notes ; chaque entrée : version, année, tag
  (`MAJOR`/`HOTFIX`/`PATCH`/`BREAKING`), note satirique mais factuelle, lien
  vers le texte (Légifrance « Constitutions de la France » ou Conseil
  constitutionnel — à vérifier, cf. §10) :

| Entrée | Tag | Note (résumé) |
|---|---|---|
| v1.0 — 1791 | MAJOR | Première version : monarchie constitutionnelle, jury d'assises (premier module livré tiré au sort). Obsolète. |
| v2.0 — 1848 | MAJOR | Suffrage universel masculin, abolition de l'esclavage. Module retiré au hotfix 1852. |
| v3.0 — 1875 | MAJOR | Lois constitutionnelles. Uptime record : 70 ans (à l'exception du crash de 1940). |
| v4.0 — 1946 | MAJOR | Exécutifs concurrents : chute du gouvernement tous les ~6 mois. Dépréciée. |
| v5.0 — 1958 | MAJOR | Version courante. Parlementarisme rationalisé. Très rationalisé. |
| v5.0.1 — 1962 | HOTFIX | Élection directe du président. Effet secondaire documenté : présidentialisation. Jamais corrigé. |
| v5.0.2 — 2000 | PATCH | Quinquennat : durée de garantie réduite, contre-pouvoirs non étendus. |
| v6.0 — en développement | BREAKING | 49.3 réversible, RIC, mandats non renouvelables. Cf. Plan 6ᵉ République. |
| v7.0 — roadmap | — | Démocratie continue : tirage au sort législatif, collégialité, générations futures. Cf. plan Démocratie Continue. |

- Styles : liste sémantique simple + badges de tag réutilisant les tokens
  existants ; aucune animation.

## 7. Organisation en branches (instruction utilisateur : « sépare les features
sur des branches séparées »)

Quatre branches **empilées** — chacune basée sur la précédente :

| # | Branche | Base | Contenu | Type de commit |
|---|---|---|---|---|
| 1 | `democratie-plan-continue` | `main` | 3ᵉ plan + 3 lignes ×3 plans + styles + tooltips + copy transverse (README, hub, meta) | feat |
| 2 | `democratie-objections` | branche 1 | section objections + `.obj-item` + sélecteur `main.js` | feat |
| 3 | `democratie-cas-reels` | branche 2 | section production + sources enrichies | feat |
| 4 | `democratie-changelog` | branche 3 | section changelog | feat |

**Pourquoi empilées et non parallèles depuis `main` :** les sections 2 à 4
s'insèrent au même point d'ancrage (entre `#fonctionnalites` et `#sources`) et
dépendent des sections précédentes pour leur position finale ; des branches
parallèles entreraient en conflit d'insertion sur `democratie/index.html` et
`tests/structure.spec.ts`. L'empilement garantit zéro conflit et des diffs
propres.

**Fusion :** strictement dans l'ordre 1 → 2 → 3 → 4. Une fois la branche *n*
fusionnée, la branche *n+1* n'apporte que son delta. Si une branche est
rejetée, les suivantes sont rebasées.

**Règles de chantier :**
- Worktree par branche selon la convention du repo (`.worktrees/<branche>`,
  vérifier l'entrée `.gitignore` avant création) ; outil natif de création de
  worktree si disponible.
- TDD : tests structure d'abord (rouge), puis implémentation (vert) ; tests
  verts à **chaque** extrémité de branche, y compris `navigation.spec.ts`.
- Commits en français, préfixes conventionnels (`feat:`, `test:`, `docs:`).
- Pas de push sans validation explicite de l'utilisateur.

## 8. Contraintes techniques et qualité

- Zéro build, zéro nouvelle dépendance, HTML/CSS/JS à la main.
- Patterns réutilisés uniquement : tooltips `info-btn`/`aria-expanded`/
  `role="tooltip" hidden`, accordéon `details`/`summary`, `feature-card`,
  `fine-print`, row-notes, `plans-legend`.
- Aucune animation ni transition dans `.pricing`/`.plan` (test existant
  « pricing has no animation »).
- Breakpoint 768 px : `.plan--popular { order: -1 }` préservé (test existant
  « mobile orders popular first »).
- `.faq-item` reste au comptage exact de 6 (les tickets objections utilisent
  `.obj-item`, pas `.faq-item`).
- Chaque fait exposé porte un lien vers une source institutionnelle ou
  pérenne (convention « democratie exposes institutional sources »).

## 9. Critères d'acceptation (récapitulatif de tests)

**Branche 1** : 33 `plan-row` au total (11 par plan) ; `plan--beta` ×1 ;
badge « BÊTA » ; les 3 nouveaux labels présents dans les 3 cartes ; les 3
nouveaux tooltips existent avec liens externes ; grille à 3 colonnes dans le
CSS ; mentions « deux plans » absentes de README/hub/meta ; `og:image`
inchangé et fichier existant.

**Branche 2** : section `#objections` ; 6 `.obj-item` ; chaque réponse contient
≥1 lien vers un domaine institutionnel ou pérenne (université, Perseus,
Wikisource) ; `main.js` contient `.faq-item` et
`.obj-item` ; `.faq-item` toujours exactement 6 ; test navigation : l'accordéon
objections n'ouvre qu'un ticket à la fois.

**Branche 3** : section `#production` ; 5 cartes, chacune avec année et lien
externe officiel (admin.ch, citizensassembly.ie, gov.wales, paris.fr + domaine
Ostbelgien vérifié) ; `#sources` enrichi d'au moins 5 nouveaux liens.

**Branche 4** : section `#changelog` ; ≥7 entrées versionnées ; ≥5 liens vers
Légifrance/Conseil constitutionnel ; tags MAJOR/HOTFIX/PATCH/BREAKING
utilisés ; v6.0 marquée « en développement » ; v7.0 référence le plan
Démocratie Continue.

## 10. Faits à vérifier à l'implémentation (le site ne bluffe pas)

| Fait | Usage | Source candidate |
|---|---|---|
| Jury d'assises tiré au sort, codifié 1791 | ticket 1, tooltip tirage | Légifrance / vie-publique.fr (fiche jury d'assises) |
| Aristote, *Politiques* : élection aristocratique, sort démocratique | ticket 2 | édition en ligne pérenne (université, Perseus, Wikisource) |
| Irlande : Constitutional Convention puis Citizens' Assembly (99 membres) → référendums 2015 (62 %) et 2018 (66,4 %) | ticket 1, carte Irlande | citizensassembly.ie, referendum.ie |
| Ostbelgien : assemblée citoyenne permanente depuis 2019, domaine officiel exact | carte | parlement de la Communauté germanophone / ostbelgien.eu |
| Pays de Galles : Well-being of Future Generations Act 2015, commissaire, décision M4 (2019) | ticket 6, tooltip futures, carte | gov.wales, legislation.gov.uk |
| Paris : assemblée citoyenne permanente (≈130 membres, 2021) | carte | paris.fr |
| Suisse : Conseil fédéral de 7, présidence annuelle, depuis 1848 | ticket 5, tooltip collégial, carte | admin.ch |
| Convention citoyenne pour le climat : 150 membres, suites | tooltip tirage | vie-publique.fr, rapport CCC |
| IVe République : durée moyenne des gouvernements | changelog v4.0 | vie-publique.fr |
| Textes des constitutions françaises (1791 → 1958) accessibles en ligne | liens du changelog | Légifrance « Constitutions de la France » / conseil-constitutionnel.fr |
| Chiffres inventés par commodité : **interdits** — tout chiffre non sourcé est reformulé sans chiffre | tous | — |
