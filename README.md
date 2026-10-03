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
