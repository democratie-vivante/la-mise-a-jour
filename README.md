# La Mise à Jour — la-mise-a-jour.fr

Fiction assumée, « zéro build » : le système France est traité comme un legacy
non maintenu, et une équipe de maintenance anonyme publie son audit, son plan de
mise à jour et ses tickets. Un hub à la racine, une page par chantier.

- `/` — hub d'équipe : état du système, plan de mise à jour, méthode, support
- `/democratie/` — migration Démocratie : matrice v5.0 / v6.0 / v7.0

## Vocabulaire

Le site parle en versions et en branches, pas en offres commerciales :

| Statut affiché   | Sens sur le site                                  |
| ---------------- | ------------------------------------------------- |
| Release candidate | livrable prêt pour la revue (v6.0 — Démocratie)   |
| Bêta fermée       | chantier ouvert, accès restreint (Agronomie)      |
| Backlog           | chantier identifié, pas encore spécifié           |
| Nightly           | build quotidien, non supporté (v7.0)              |

La v5.0 est la production héritée (5ᵉ République, build 1958). La v6.0 est la
release candidate. La v7.0 est la nightly « Démocratie Continue ».

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
