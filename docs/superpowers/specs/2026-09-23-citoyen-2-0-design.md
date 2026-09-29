# Spec — Citoyen 2.0 · Le hub web « plan-democratie.fr »

**Date :** 2026-09-23
**Statut :** approuvé par l'utilisateur (design en chat, sections 1-4)
**Périmètre de cette spec :** le site web uniquement.

## 1. Contexte & intention

Satire de la Ve République présentée comme une offre SaaS. Le site web est le
**hub officiel** : seule surface offrant l'expérience complète (interactivité,
esthétique « vrai SaaS », URL mémorable). Les contenus d'amorce virale
(capture HD de la pricing table, carrousel, vidéo démo) en seront dérivés dans
des passages ultérieurs.

**Objectif de succès :** une URL unique, rapide, partageable, dont la pricing
table peut être capturée en HD sans retouche.

**Décisions utilisateur (exprimées) :**

- Construire **de zéro** dans ce dossier (vide au départ).
- Je rédige **toute la copie satirique** ; l'utilisateur relit et corrige.
- Stack : **HTML/CSS/JS statique**, zéro build, zéro dépendance.
- Livraison : **site web seulement** (image, carrousel, vidéo = passages ultérieurs).
- Identité : produit **« Citoyen 2.0 »**, URL affichée **plan-democratie.fr**.
- **Pas de calculateur** de rentabilité dans cette version (abandonné).
- Esthétique : **SaaS clair façon Stripe**, touche bleu/blanc/rouge.
- Structure : **page unique longue** (pas de mini-pages /statut ni /changelog).
- **Pas de carte « Calculateur — bientôt »** : la grille s'arrête à 6 cartes.
- **Pas de preview visuelle continue** : conception en texte uniquement.

## 2. Architecture

```
democracy-plan/
├── index.html      # toute la page, une seule URL
├── styles.css      # design system SaaS clair
├── main.js         # infobulles, accordéon FAQ, copie de lien, scroll doux
└── README.md       # prévisualisation & hébergement
```

Aucun `package.json`, aucune dépendance. Le site s'ouvre en local directement
(`index.html`) et se déploie tel quel (GitHub Pages, Netlify, Vercel).

## 3. Plan de la page (8 blocs, dans l'ordre)

1. **Header sticky** — logo *Citoyen 2.0*, nav (Fonctionnalités · Tarifs · FAQ),
   badge `● Statut : 49.3 opérationnel`, bouton *Partager*.
2. **Hero** — titre « *Quel est votre plan de citoyenneté ?* », sous-titre
   startup, 2 CTA (*Voir les plans*, *Comparer*). Bandeau « Ils nous font
   confiance » avec logos satiriques (Assemblée, Sénat, partenaires indéterminés).
3. **Preuve sociale fake** — « +68 M de citoyens n'ont rien demandé »,
   note `4,3 / 5 — avis vérifiés sur les lois que vous n'avez pas lues`.
4. **Pricing table** ⭐ — voir §4.
5. **Features détaillées** — voir §5.
6. **FAQ** — voir §6.
7. **CTA final de partage** — voir §7.
8. **Footer** — voir §8.

## 4. Pricing table (visuel virale)

### Mise en page

Deux cartes côte à côte (empilées en mobile), largeur max 1080 px, fond blanc,
cadre net. **Zone de capture HD :** fond blanc uni, sans dégradé ni animation
dans la table — la future capture d'écran doit être propre sans retouche.

| | Plan 5ᵉ République | Plan 6ᵉ République |
|---|---|---|
| Tag | Hérité · depuis 1958 | **Nouveau** · badge `POPULAIRE` |
| Prix | **0 €** « déjà payé par vos aînés » | **0 €** « inclus dans votre citoyenneté » |
| Sous-titre | Sans engagement — résiliable par révolution | Engagé — révocable à tout moment |
| Style | Gris, désaturé, « ancienne génération » | Bordure accent bleu, `scale(1.03)`, ombre |

### Les 8 lignes de features

| Feature | 5ᵉ | 6ᵉ |
|---|---|---|
| Gouvernement nommé sans vote de l'Assemblée | ✓ | ✗ |
| Décret-loi 49.3 | ✓ **sans bouton d'annulation** | ✓ **avec bouton d'annulation** |
| Référendum d'initiative citoyenne | bêta fermée | ✓ inclus |
| Révocation de votre élu | ✗ | ✓ à tout moment |
| Dissolution de l'Assemblée | 1×/an, discrétion exclusive | à la demande de 10 % des citoyens |
| Mandats renouvelables | ✓ illimités | ✗ non renouvelables |
| Amendement citoyen en ligne | ✗ | ✓ |
| Support | formulaire sans réponse | débat public sous 30 jours |

Les lignes ambiguës portent une infobulle (voir §5.2).

### Comportement

- Mobile : les cartes s'empilent, **la 6ᵉ en premier** (mise en avant).
- Aucune animation d'apparition dans la table (capturable à tout instant).

## 5. Features détaillées

### 5.1 Grille

**3 × 2** sur desktop, 1 colonne sur mobile. Cartes blanches, coins arrondis,
icône en haut, titre, accroche d'une ligne, bouton **ⓘ**.

Les 6 cartes :

1. **📜 Article 49 al. 3** — « *Adopté sans vote. Enfin avec bouton d'annulation.* »
   ⓘ *L'ancienne version imposait la loi sans consultation de l'Assemblée. La 6ᵉ ajoute un vrai bouton « annuler », testé en conditions réelles.*
2. **🗳️ Référendum d'initiative citoyenne** — « *De la bêta fermée à la disponibilité générale.* »
   ⓘ *10 % des inscrits suffisent pour proposer une loi. Depuis 1958, le champ « soumettre » reste grisé.*
3. **🔁 Révocation à tout moment** — « *Résiliation sans pénalité.* »
   ⓘ *Votre élu engage pour 5 ans, résiliable par vous à tout moment. Contrairement à votre offre télécom.*
4. **🎯 Mandats non renouvelables** — « *Une seule part, c'est tout.* »
   ⓘ *Comme au gâteau : une part par personne, sinon il n'en reste plus pour tout le monde.*
5. **📊 Amendement citoyen en ligne** — « *Vous proposez, ils répondent.* »
   ⓘ *Déposé, publié, voté à l'Assemblée — avec un accusé de réception, ce qui est déjà un progrès.*
6. **📦 Suivi de vos lois en direct** — « *Comme un colis, mais en mieux.* »
   ⓘ *Statut, retard, livreur assigné. « Votre loi est partie de l'Assemblée… livraison estimée : jamais. »*

**Aucune 7ᵉ carte.** Le calculateur n'est mentionné nulle part.

### 5.2 Infobulles — spécification

- Bouton `ⓘ` sémantique : `<button>` + `aria-expanded`, ouverture au
  **clic/tap** (pas seulement au survol → doigt et clavier).
- Fermeture : clic extérieur, `Échap`, ou re-clic.
- Positionnée au-dessus de la carte, flip automatique si coupée par un bord.

## 6. FAQ

Titre : **« Questions fréquemment posées par nos utilisateurs »** — accordéon
`<details>/<summary>` (zéro JS de base, clavier), fermeture automatique des
autres questions lors de l'ouverture d'une nouvelle (**JS requis**, ~10 lignes
dans `main.js`), « petite ligne absurde » en fin de réponse.

1. *Puis-je résilier mon Plan 5ᵉ République ?* → « L'offre est reconduite tacitement depuis 1958, sans préavis. »
2. *Le Plan 6ᵉ est-il vraiment gratuit ?* → « 0 €/mois, engagement de 5 ans non renouvelable… pour vous. »
3. *Que se passe-t-il si je ne vote pas ?* → « Aucun changement : votre Plan est mis à jour automatiquement. »
4. *Quelles méthodes de paiement acceptez-vous ?* → « Impôts, CSG, TVA. Apple Pay n'est pas encore disponible. »
5. *Le 49.3 peut-il être annulé ?* → « Oui, désormais. L'ancien modèle n'avait pas de bouton. »
6. *Proposez-vous un essai gratuit ?* → « Vous êtes né dedans. C'est l'essai. »

## 7. CTA final de partage

Bloc centré, fond bleu. Titre « *Ce plan se partage mieux que vos opinions* ».

- Boutons **WhatsApp · Signal · X · Facebook** → URL de partage native.
- Bouton **« Copier le lien »** → micro-feedback `✓ Lien copié`.
- Sous-titre : `plan-democratie.fr`.

## 8. Footer

3 colonnes façon SaaS :

- **Produit :** Fonctionnalités · Tarifs · FAQ
- **Légal :** Mentions légales absurdes · CGU · « Aucune donnée collectée, contrairement à vous »
- **Suivi :** `● Tous les systèmes sont dégradés` · `49.3 : opérationnel`
- Bas de page : `© 2026 Citoyen 2.0 — plan-democratie.fr`

## 9. Contraintes transverses

- **Responsive** mobile d'abord (le partage s'y fait).
- **Meta OG / Twitter** pour un aperçu propre quand on colle l'URL sur
  WhatsApp, Signal ou X.
- **Accessibilité :** contrastes AA, navigation clavier complète, infobulles
  et accordéon accessibles.
- **Pas d'animation dans la pricing table** (contrainte de capture HD).
- Langue : **français**.

## 10. Non-objectifs (cette version)

- Calculateur de rentabilité (et toute mention de celui-ci).
- Pages secondaires `/statut`, `/changelog`, `/docs`.
- Capture d'image HD, carrousel, vidéo démo → passages ultérieurs.
- Backend, analytics, collecte de données.
- Build tool, framework, dépendance externe.

## 11. Critères de succès

- `index.html` s'ouvre sans serveur ni build et affiche les 8 blocs.
- La pricing table est capturable en HD en une capture d'écran, sans retouche.
- Toute l'interactivité (infobulles, FAQ, copie de lien, partage) fonctionne
  au clavier et au doigt.
- Le lien collé sur WhatsApp/X affiche un aperçu lisible (meta OG).
- L'utilisateur a relu et approuvé toute la copie satirique.
