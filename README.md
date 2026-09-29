# Citoyen 2.0 — la-mise-a-jour.fr

Page unique satirique : la « source officielle » de la diffusion. Zéro dépendance,
zéro build.

## Prévisualiser

```bash
python3 -m http.server 8765
# puis ouvrir http://localhost:8765/
```

`index.html` s'ouvre aussi directement en double-cliquant, mais le serveur HTTP
est nécessaire pour vérifier le partage et le presse-papiers dans de bonnes conditions.

## Tests

```bash
python3 -m unittest discover -s tests -v
```

Tests statiques (structure, copy, contraintes CSS, contrastes AA) + vérifications
navigateur décrites dans `docs/superpowers/plans/2026-09-24-citoyen-2-0.md`.

## Déploiement

Aucun build : pousser le dossier tel quel sur GitHub Pages, Netlify ou Vercel.

## À faire avant la mise en ligne

- Créer `og.png` (la capture HD de la pricing table, phase visuelle) et le
  déposer à la racine : les meta `og:image` / `twitter:image` pointent déjà vers
  `https://la-mise-a-jour.fr/og.png`.
- Remplacer l'URL canonique si le domaine final diffère de plan-democratie.fr
  (recherche : `plan-democratie.fr` dans `index.html` et `main.js`).
# democracy-plan
