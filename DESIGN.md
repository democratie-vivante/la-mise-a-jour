---
name: La Mise à Jour
description: Le poste de maintenance public du système France — une console d'opérations deadpan, statique et sourcée.
colors:
  primary: "#1d4ed8"
  primary-dark: "#1e40af"
  danger: "#b91c1c"
  success: "#15803d"
  text: "#0f172a"
  text-muted: "#475569"
  bg: "#f8fafc"
  surface: "#ffffff"
  border: "#e2e8f0"
  on-primary: "#ffffff"
  dependency-ash: "#94a3b8"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)"
    fontWeight: 700
    lineHeight: 1.6
    letterSpacing: "0em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 700
    lineHeight: 1.6
    letterSpacing: "0em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.6
    letterSpacing: "0.08em"
  metric:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0em"
rounded:
  card: "12px"
  tooltip: "8px"
  pill: "999px"
  circle: "50%"
spacing:
  gutter: "1rem"
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "1.5rem"
  xl: "2rem"
  section: "4rem"
  hero: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-primary-sm:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-share:
    backgroundColor: "rgba(255, 255, 255, 0.15)"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  status-badge:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  plan-card:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.card}"
    padding: "24px"
  plan-card-recommended:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "24px"
  feature-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "24px"
  release-tag:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "2.4px 9.6px"
  collection-chip:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "5.6px 14.4px"
---

# Design System: La Mise à Jour

## Overview

**Creative North Star : « Le Poste de Maintenance »**

Le site est la présence publique d'une équipe de maintenance, pas d'une marque. Visuellement, c'est une surface d'exploitation : elle emprunte l'ossature d'une page produit — en-tête collant avec statut, héros centré, grilles de trois colonnes, matrice, changelog, tickets — et la vide de tout vocabulaire marketing. Aucune photographie, aucune illustration, aucun mur de logos partenaires, aucun témoignage. Reste le mobilier de la maintenance : pastilles de statut, chaînes de version, verdicts ✔/✗, badges MAJOR/HOTFIX/BREAKING, pointillés pour ce qui n'est pas livré.

La palette est délibérément celle d'un outil de développement : ardoise froide sur blanc cassé, un seul bleu saturé, et deux couleurs de statut tenues en réserve. Rien n'est assez personnalisé pour devenir une marque — c'est précisément l'effet recherché : l'équipe s'efface derrière son travail. Le seul moment d'engagement visuel est la bande bleue pleine largeur du partage, en bas de page, là où la page cesse de rapporter et commence à demander.

La densité est moyennement aérée : colonne de 1080 px, rythme de section à 64 px, cartes à 24 px de padding. Trois colonnes pour comparer, une colonne étroite de 760 px pour lire. Tout est statique ; le seul mouvement du système est le défilement fluide natif du navigateur. La hiérarchie vient du poids (700/800) et du corps, jamais d'un décor.

**Key Characteristics:**
- Une console d'exploitation, pas une page éditoriale : statuts, versions, matrices, tickets.
- Un seul accent bleu ; le rouge et le vert ne servent qu'à porter un état.
- Aucune image, aucun logo, aucune bibliothèque d'icônes : emoji système et glyphes ✔/✗.
- Pilules pour tout ce qui s'actionne, rectangles arrondis 12 px pour tout ce qui se lit.
- Aucune animation, aucune transition, aucun webfont, aucune dépendance.
- Le deadpan est visuel : aucun élément ne signale l'ironie.

## Colors

Une palette d'outil de développement : ardoise froide, un bleu d'action, deux couleurs de statut strictement réservées.

### Primary

- **Bleu Maintenance** (#1d4ed8) : l'unique accent. Boutons principaux, liens, bordure du plan recommandé, chiffres du partage, badge « recommandée », anneau de focus. Le survol du bouton principal descend d'un cran vers **Bleu Maintenance Profond** (#1e40af).

### Semantic Status

- **Rouge Incident** (#b91c1c) : la pastille de statut de l'en-tête (« 1 / 4 chantiers livrés », « 49.3 opérationnel »), les marques de risque de la matrice, le tag HOTFIX.
- **Vert Déployé** (#15803d) : les marques favorables, le tag PATCH, la bordure de la carte de chantier livré, le badge NIGHTLY, les confirmations de copie.

### Neutral

- **Ardoise Encre** (#0f172a) : texte courant, titres, fond des infobulles, tag BREAKING.
- **Ardoise Atténuée** (#475569) : texte secondaire, notes de ligne, navigation, tags ROADMAP, mentions légales.
- **Voile de Page** (#f8fafc) : fond général, fond des cartes secondaires, pastille de statut.
- **Blanc Surface** (#ffffff) : fond des cartes, de l'en-tête, du pied de page, du bouton fantôme.
- **Filet** (#e2e8f0) : bordures de 1 px, séparateurs pointillés des mentions et notes de bas de carte.
- **Cendre Dépendance** (#94a3b8) : noms des dépendances héritées, désaturés pour ne jamais ressembler à des partenaires.

### Named Rules

**La Règle de l'Accent Unique.** Le bleu est le seul accent décoratif. Rouge et vert ne décorent rien : ils portent un état. Une section sans état ne montre ni rouge ni vert.

**La Règle du Verdict Écrit.** Un verdict ne repose jamais sur la seule couleur. Chaque ligne de matrice porte son glyphe ✔ ou ✗ ; la couleur renforce le glyphe, elle ne le remplace pas.

**La Règle de la Bande Bleue.** Le bleu plein format n'apparaît qu'une fois par page, dans la bande de partage. C'est le seul endroit où la page passe du constat à la demande.

## Typography

**Display Font :** pile système (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif)
**Body Font :** la même pile système
**Label / Mono Font :** aucune — pas de monospace dans le système

**Character :** une seule famille, celle de la machine qui travaille. L'interface emprunte la typographie de l'OS qui fait la maintenance ; rien n'est téléchargé, rien n'est signé. L'écart entre 800 et 400 fait toute la hiérarchie, et le crénage par défaut suffit.

### Hierarchy

- **Display** (700, `clamp(2rem, 5vw, 3.25rem)`, interligne 1.15) : le h1 du héros, un seul par page, centré. C'est une affirmation, pas un slogan.
- **Headline** (700, `clamp(1.6rem, 3.5vw, 2.4rem)`, interligne 1.6 hérité) : les titres de section, centrés, avec beaucoup d'air sous la ligne.
- **Title** (700, 1.4rem / 1.15rem, interligne 1.6) : noms de plans à 1.4rem, noms de cartes fonctionnalité et chantier à 1.15rem, version du changelog à 1rem en ligne.
- **Body** (400, 1rem, interligne 1.6) : paragraphes ; sous-titre du héros à 1.1rem ; notes à 0.95rem ; mentions légales et fine print à 0.8rem. La colonne de lecture plafonne à 760 px, soit environ 70 caractères.
- **Label** (700–800, 0.7–0.8rem, interlettrage 0.06–0.08em, capitales) : badges, tags de release, titres de pied de page, lignes de statut, étapes d'action. Jamais au-delà de 0.8rem.
- **Metric** (800, 2.5rem, interligne 1.1) : `prod`, `RC`, `nightly` dans la matrice. Le vocabulaire de version est le plus grand corps de la page.

### Named Rules

**La Règle du Zéro Téléchargement.** Aucun webfont, aucun fichier de police, aucune icône importée. La pile système est la police de marque. Le site reste lisible en `file://`, hors ligne, derrière un réseau filtré.

**La Règle du Chiffre en Display.** La donnée de la fiction — version, build, statut — prend le plus grand corps de la page. On ne l'écrit pas en monospace pour « faire développeur » : elle est en sans, en 800.

## Layout

Le shell est une colonne de 1080 px centrée, avec `width: min(100% - 2rem, 1080px)` : une gouttière de 1rem de chaque côté, plafond à 1080 px. À l'intérieur, les sections qui se lisent passent en colonne étroite de 760 px.

L'en-tête est collant (66 px, fond blanc à 92 %, flou d'arrière-plan de 8 px, filet bas, z-index 50) ; les ancres de section reçoivent `scroll-margin-top: 72px`. Le héros respire 5rem en haut et 3.5rem en bas, centré, sur un lavis radial bleu à 8 % qui tient dans les 60 % supérieurs. Chaque section régulière prend 4rem de padding vertical.

Les grilles : 3 colonnes de largeur égale et 1.5rem de gouttière pour la matrice et les fonctionnalités ; 4 colonnes et 1.25rem pour le plan de mise à jour du hub ; 3 colonnes et 1.25rem pour les actions. Le rythme vertical est un multiple de 4 px.

Points de rupture : au-dessus de 1024 px, trois colonnes ; à 1024 px et moins, deux colonnes, et la nightly (`plan--beta`) s'étend sur toute la largeur ; à 768 px et moins, une seule colonne, la navigation disparaît, le plan recommandé passe en premier, l'en-tête s'enroule et le pied de page tombe en une colonne.

### Named Rules

**La Règle de la Colonne Étroite.** Toute section qui se lit — support, changelog, sources, partage — tient dans 760 px, jamais dans les 1080 px du shell. La largeur est une décision de lecture, pas une contrainte de grille.

## Elevation & Depth

Le système est plat par défaut. La profondeur vient d'abord du ton — voile de page contre blanc surface — puis d'un filet de 1 px. Une seule ombre existe dans tout le projet : un halo diffus de 30 px à 8 % d'ardoise, porté par les cartes de contenu qui doivent se détacher du fond et réutilisé tel quel par les infobulles. Le plan recommandé cumule cette ombre et une bordure bleue de 2 px ; la nightly porte un pointillé bleu de 2 px. Élévation et statut sont deux signaux distincts : l'ombre dit « cette carte est au premier plan », la bordure dit « cette branche est recommandée » ou « cette branche n'est pas livrée ».

### Shadow Vocabulary

- **Soft Lift** (`box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08)`) : cartes de contenu au premier plan et plan recommandé ; c'est aussi l'ombre des infobulles.

### Named Rules

**La Règle de l'Ombre Unique.** Une seule valeur d'ombre dans tout le système. Une profondeur nouvelle se fabrique avec un filet, un fond ou une bordure — jamais avec une deuxième ombre.

## Shapes

Deux formes seulement, et une exception de statut.

Les rectangles de contenu sont arrondis à 12 px : cartes de plan, de fonctionnalité, de chantier, d'action, entrées de changelog, items de support. Tout ce qui s'actionne ou s'étiquette est une pilule à 999 px : boutons, badges de statut, badges de plan, tags de release, puces de collection. Les infobulles sont les seules surfaces à 8 px ; le bouton d'information est un cercle parfait de 28 px.

La bordure porte le statut, pas le décor : 1 px solide pour l'existant, 2 px solide bleu pour la branche recommandée, 2 px pointillé bleu pour la nightly. Les pointillés servent aussi de séparateur interne, toujours fins et discrets.

Aucun découpage, aucun masque, aucune grande forme géométrique, aucune épingle ou ruban en coin.

### Named Rules

**La Règle du Pointillé Non Livré.** Le pointillé signifie « pas encore en production » : la nightly, l'option bêta, la mention ajoutée sous une carte. Une surface livrée et stable est toujours en trait plein.

**La Règle des Pilules pour les Verbes.** Tout ce qui se clique, s'active ou s'étiquette est une pilule. Tout ce qui se lit est un rectangle de 12 px. Aucun bouton carré, aucune carte en pilule.

## Components

### Buttons

- **Forme :** pilule (999 px), poids 700, bordure transparente de 1 px qui réserve la place du contour.
- **Primary :** fond Bleu Maintenance, texte blanc, padding 12 px / 24 px, 1rem. En-tête : la variante `sm` passe à 8 px / 16 px et 0.9rem.
- **Hover / Focus :** le primaire s'assombrit vers Bleu Maintenance Profond ; le partage augmente son opacité blanche ; le fantôme ne change pas de fond. Le focus clavier est un anneau bleu de 3 px décalé de 2 px, sur tous les éléments interactifs.
- **Ghost :** fond Blanc Surface, texte encre, filet gris, même gabarit que le primaire. Son contour est l'affordance au repos : il n'a pas de survol propre.
- **Share :** sur la bande bleue uniquement, fond blanc à 15 %, texte blanc, filet blanc à 50 % ; le survol monte à 28 %.
- **Aucune transition :** les états changent instantanément. C'est une contrainte du système, pas un oubli.

### Badges & Tags

- **Status badge :** pilule, fond voile de page, filet gris, 0.8rem / 600, texte atténué, avec une pastille ronde de 8 px en Rouge Incident. Le point est toujours rouge : le système est toujours dégradé.
- **Plan badge :** pilule bleue, capitales, 0.7rem / 800, interlettrage 0.08em, texte blanc. La variante nightly passe en Vert Déployé.
- **Release tag :** pilule de 0.7rem / 800, `MAJOR` en bleu, `HOTFIX` en rouge, `PATCH` en vert, `BREAKING` en encre, `ROADMAP` sans variante dédiée donc en ardoise atténuée. L'absence de couleur est elle-même une information.
- **Collection chips :** pilules de 0.95rem / 600 sur fond voile, avec la mention de statut en 0.8rem / 700 atténué, alignées en rangée qui s'enroule.

### Cards / Containers

- **Corner Style :** 12 px, invariable.
- **Background :** blanc surface pour les cartes sur fond voile ; voile de page pour les cartes posées sur du blanc (plans, chantiers, actions) ; le plan hérité est en voile avec un texte atténué.
- **Shadow Strategy :** voir Elevation & Depth — Soft Lift sur les cartes de contenu, rien sur les listes.
- **Border :** filet de 1 px ; 2 px bleu pour le recommandé ; 2 px pointillé bleu pour la nightly.
- **Internal Padding :** 24 px pour les cartes ; 16 px / 20 px pour les entrées de changelog ; 4 px / 20 px pour les items de support, dont le résumé porte 16 px de padding vertical.

### Navigation

- **Style :** en-tête collant translucide, filet bas, trois zones — marque à gauche, liens au centre-droit, statut et CTA à droite. La marque est en 1.1rem / 800, avec un suffixe bleu qui nomme le contexte de la page (« système France », « Citoyen 2.0 »).
- **États :** liens en 0.95rem / 600, ardoise atténuée, bleu au survol. Aucun lien actif n'est marqué.
- **Mobile :** sous 768 px, la navigation est retirée sans menu de remplacement ; les actions du héros portent la navigation. L'en-tête s'enroule et conserve statut et partage.

### Support (FAQ)

- **Style :** `<details>` natifs, un seul ouvert à la fois (le JS ferme les autres). Résumé en 1rem / 700 avec 16 px de padding vertical, curseur main.
- **Contenu :** réponse en corps atténué, puis une mention en 0.8rem atténuée séparée par un pointillé fin, qui porte la chute. Le pointillé est la signature de la ligne ajoutée après coup.

### Migration Matrix (signature)

Le composant qui définit le système. Trois colonnes de largeur égale, alignées en haut, de hauteurs volontairement inégales : la nightly est plus longue parce qu'elle porte plus de promesses. Chaque ligne est un flex à alignement de base : glyphe ✔/✗ coloré, nom de la règle, puis éventuellement une note en 0.85rem atténué qui se glisse à côté du nom et retombe à la ligne suivante, puis éventuellement un bouton ⓘ. La ligne n'a ni fond ni filet : c'est l'espacement qui la tient.

### Tooltips

Infobulle en encre, texte blanc 0.85rem, largeur maximale 260 px, rayon 8 px, posée 8 px au-dessus de l'ancre. Elle bascule sous l'ancre quand le haut est coupé, et se décale horizontalement pour rester à 8 px du bord de la fenêtre. Le bouton ⓘ est un cercle de 28 px, 1 px de filet, qui prend le bleu au survol ; il expose `aria-expanded` et `aria-controls`, et Échap ferme l'infobulle.

## Do's and Don'ts

### Do:

- **Do** garder le shell à 1080 px et la colonne de lecture à 760 px.
- **Do** garder un seul accent bleu ; réserver rouge et vert à l'état, jamais au décor.
- **Do** accompagner chaque verdict de matrice de son glyphe ✔ ou ✗.
- **Do** utiliser 12 px pour les surfaces de contenu, 999 px pour tout ce qui se clique ou s'étiquette, 8 px pour les infobulles.
- **Do** réserver le pointillé au non-livré et aux mentions ajoutées.
- **Do** garder la bande de partage comme seul aplat saturé pleine largeur.
- **Do** présenter chaque source comme un lien normal en 0.85rem sous l'affirmation, jamais comme un badge ou un logo.
- **Do** écrire les chaînes de version en sans, en 800, au corps display.
- **Do** garder le build sans dépendance : aucun webfont, aucune bibliothèque d'icônes, aucun CDN.
- **Do** laisser les états changer instantanément ; le défilement fluide natif est le seul mouvement.

### Don't:

- **Don't** ajouter une seconde famille typographique, en particulier un monospace, pour « faire ingénierie ».
- **Don't** ajouter de dégradé au-delà du lavis radial du héros.
- **Don't** ajouter une seconde valeur d'ombre ou un second rayon de carte.
- **Don't** ajouter d'animation, de transition, de parallaxe ou d'apparition au défilement.
- **Don't** utiliser le vert ou le rouge de façon décorative : pas de CTA vert, pas de titre rouge.
- **Don't** ajouter d'illustration, de photographie, d'icône tierce ou de logo institutionnel réel ; la seule imagerie est l'emoji système.
- **Don't** passer en capitales au-delà des micro-libellés (0.7–0.8rem).
- **Don't** transformer une affirmation factuelle en argument marketing pour remplir une carte.
- **Don't** introduire un composant d'entrée ou de formulaire : le système n'en a aucun, et le site ne collecte rien.
