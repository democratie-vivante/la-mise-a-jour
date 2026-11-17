# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Grand public citoyen d'abord**, pas nécessairement à l'aise avec le jargon logiciel : visiteurs curieux ou agacés par le fonctionnement institutionnel, qui arrivent souvent depuis un partage social et lisent sur téléphone.
- Publics secondaires : personnes techniques ou design qui reconnaissent la métaphore d'ingénierie, journalistes et militants qui viennent vérifier les sources.
- Situation d'usage : lecture mobile, en mobilité, avec une décision rapide à prendre — rester, comprendre, partager ou agir.

## Product Purpose

Le suivi public d'une équipe de maintenance anonyme qui reprend le « système France » : la société française traitée comme un logiciel legacy déployé en 1958. Le site expose l'audit, le plan de mise à jour, la méthode et le support.

Une visite réussie produit deux choses, dans cet ordre : le visiteur **comprend** l'état du système et peut vérifier chaque affirmation via les sources liées ; puis il peut **agir** — partager, interpeller ses élus ou les candidats de 2027.

## Positioning

Le site n'est ni un média, ni un service officiel, ni un manifeste. Il emprunte la forme du poste de maintenance d'une équipe de dev — audit, versions, matrice de migration, tickets — pour rendre lisibles des faits institutionnels sourcés.

Ce qu'un site voisin ne pourrait pas copier honnêtement : le deadpan intégral, la traçabilité de chaque fait, et l'anonymat de l'équipe.

## Operating Context

- Site statique, zéro build, deux pages : `/` (hub) et `/democratie/`.
- La page Démocratie est le cœur de l'expérience : matrice de migration v5.0 / v6.0 / v7.0.
- Les visiteurs arrivent par partage social (WhatsApp, X, Facebook, Signal) et lisent souvent sur mobile.
- Aucun compte, aucune donnée collectée, aucun cookie, aucun traceur.
- Les actions proposées : lire les textes officiels, trouver son député, interpeller les candidats de 2027, copier un message.

## Capabilities and Constraints

- Deux pages seulement ; pas de nouvelle page (statut, équipe, mentions légales séparées).
- Aucun framework, aucune dépendance runtime, aucun build : HTML/CSS/JS servis tels quels.
- Versionnage de la fiction : v5.0 en production (build 1958), v5.0.1 hotfix 1962, v5.0.2 patch 2000 ; v6.0 en release candidate ; v7.0 en nightly.
- Statuts des chantiers : release candidate (Démocratie), bêta fermée (Agronomie), backlog (Économie, Énergie).
- Chaque affirmation factuelle porte un lien vers une source institutionnelle ou pérenne.
- Aucun chiffre inventé : un fait non sourcé est reformulé sans chiffre ou retiré.
- L'équipe reste anonyme : pas de nom, pas de visage, pas de rôle, pas de page équipe.
- Mentions légales réelles et sobres : éditeur (l'équipe), hébergeur GitHub Pages, aucune donnée collectée.
- Interactivité limitée aux comportements existants : FAQ, tooltips, copie, partage.

## Brand Commitments

- Nom : **La Mise à Jour** (`la-mise-a-jour.fr`).
- Voix : registre ingénierie, deadpan. Le comique naît de l'écart entre le vocabulaire logiciel et la réalité constitutionnelle, jamais d'une annotation.
- **Fiction assumée, jamais dénoncée dans l'interface** : le site est la présence publique d'une équipe de maintenance ; aucun texte ne dit « satire », « pastiche » ou « c'est une blague ». La seule ligne d'honnêteté acceptée vit en FAQ : « Chaque affirmation est sourcée ; l'emballage n'engage que l'équipe. »
- Le site ne se fait jamais passer pour une institution publique ou un service de l'État ; aucune institution n'approuve le site.
- Identité visuelle sobre, statique, sans animation ajoutée.

## Evidence on Hand

- Sources institutionnelles liées depuis les pages : Légifrance (Constitution de 1958), vie-publique.fr, Assemblée nationale, INSEE, Conseil fédéral suisse, Citizens' Assembly (Irlande), Bürgerdialog Ostbelgien, gouvernement gallois, Ville de Paris.
- Aucun témoignage, client, benchmark, prix ou métrique d'audience réel : ne jamais en fabriquer.
- Référence éditoriale complète : `docs/superpowers/specs/2026-11-12-societe-systeme-legacy-design.md`.
- Images de partage (`og.png`, `democratie/og.png`) générées depuis les pages réelles par `scripts/capture-og.mjs`.

## Product Principles

1. **La fiction porte l'architecture**, pas seulement la copie : chaque section doit pouvoir être lue comme le travail réel d'une équipe de maintenance.
2. **Un fait = une source.** Dans le doute, retirer le chiffre plutôt que l'inventer.
3. **Deadpan intégral** : aucune phrase ne signale qu'elle est drôle, aucune autodénonciation.
4. **Le grand public d'abord** : la métaphore reste lisible sans connaître le jargon ; le jargon est un décor, pas un péage.
5. **Comprendre puis agir** : d'abord l'audit et les preuves, ensuite le partage et l'interpellation.
6. **L'équipe s'efface derrière son travail** : pas de personnalité, pas de visage, pas de culte du mainteneur.

## Accessibility & Inclusion

- Lecture mobile prioritaire ; navigation clavier et lien d'évitement présents.
- Aucune information ne dépend uniquement de la couleur : les marques ✔/✗ portent le verdict.
- Les tooltips sont utilisables au clavier (`aria-expanded`, `aria-controls`) et se ferment avec Échap.
- Le contenu essentiel reste lisible sans JavaScript ; la copie et le partage sont des améliorations.
