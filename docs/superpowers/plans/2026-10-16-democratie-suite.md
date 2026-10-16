# Démocratie suite — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter à `/democratie/` un 3ᵉ plan bêta (« Démocratie Continue ») et trois sections (objections, cas réels, historique des versions), répartis sur 4 branches empilées.

**Architecture:** Site statique zéro build (HTML/CSS/JS à la main) testé par une suite Playwright unique (`tests/structure.spec.ts` statique, `tests/navigation.spec.ts` vrai navigateur). Chaque feature vit sur sa propre branche, empilée sur la précédente : les 4 branches modifient `democratie/index.html` aux mêmes points d'ancrage, l'empilement supprime tout conflit.

**Tech Stack:** HTML5, CSS (tokens `:root` existants), JavaScript vanilla (`main.js`), TypeScript/Playwright, pnpm/mise.

**Spec:** `docs/superpowers/specs/2026-10-16-democratie-suite-design.md`

## Global Constraints

- Zéro build, zéro nouvelle dépendance ; HTML/CSS/JS écrits à la main.
- Aucune animation ni transition dans `.pricing`/`.plan` (test « pricing has no animation »).
- `.plan--popular { order: -1 }` dans le bloc `@media (max-width: 768px)` préservé (test « mobile orders popular first »).
- `.faq-item` reste exactement 6 sur la page (les tickets objections utilisent `.obj-item`).
- Chaque fait exposé porte un lien vers une source institutionnelle ou pérenne ; **aucun chiffre non sourcé** — un chiffre introuvable est reformulé sans chiffre.
- Commits en français, préfixés (`feat:`, `test:`, `docs:`).
- 4 branches empilées, fusion strictement dans l'ordre 1→2→3→4 ; tests verts à chaque extrémité de branche.
- `og.png` non régénéré ; `og:image` inchangé.

## Review Focus

Ces conditions ne sont pas couvertes par la suite existante ; chacune reçoit son test dans la tâche propriétaire :

1. **Empilement mobile avec 3 cartes** — un lecteur mobile doit toujours voir le 6ᵉ en premier, puis 5ᵉ, puis bêta → test « pricing stacks on mobile » (Task 1).
2. **Lien de source mort ou inventé** — aucun test ne prouve qu'une URL répond ; mitigation obligatoire : vérification `webfetch` avant écriture, tests d'hôte (Tasks 2, 4).
3. **Tooltip long sortant du viewport** — sur petit écran, `max-width: 260px` peut déborder à l'horizontale → test navigation « beta tooltips stay inside the viewport » (Task 2).
4. **Pastille verte portant `✗`** — un humain peut lire l'inverse du verdict ; le test « marks carry the verdict » vérifie la classe, pas la lisibilité → test reconduit et étendu aux 3 plans (Task 1).
5. **Légende contredisant les nouvelles pastilles** — `plans-legend` doit rester vraie après ajout des lignes → test « plans note points to the beta » (Task 1).

---

## Vue des branches

| # | Branche | Base | Tâches | Contenu |
|---|---|---|---|---|
| 1 | `democratie-plan-continue` | `main` | Task 1, Task 2 | 3ᵉ plan, 3 lignes ×3 plans, styles, tooltips, copy transverse |
| 2 | `democratie-objections` | branche 1 | Task 3 | section `#objections` + JS |
| 3 | `democratie-cas-reels` | branche 2 | Task 4 | section `#production` + sources |
| 4 | `democratie-changelog` | branche 3 | Task 5 | section `#changelog` |

## Task 0: Boucle de test

- [ ] **Step 1 : vérifier que la suite est verte sur le point de départ**

Depuis la racine du repo :

```bash
git status --short            # doit être vide
pnpm install
pnpm test                     # attendu : toutes les tests passent (baseline)
```

Si `pnpm` est absent : `mise exec -- pnpm test`. Noter le nombre de tests verts comme baseline.

---

## Task 1: Branche 1 — le plan « Démocratie Continue » (structure + styles)

**Files:**
- Create: `.worktrees/democratie-plan-continue` (worktree, branche `democratie-plan-continue`)
- Modify: `democratie/index.html` (section `#tarifs`, meta description)
- Modify: `styles.css` (`.pricing-grid`, `.plan--beta`, `.plan-badge--beta`, `.plan-disclaimer`, `.plans-note`, bloc `@media (max-width: 1024px)`)
- Test: `tests/structure.spec.ts` (`test.describe('Pricing')`, `test.describe('Lisibilite')`)

**Interfaces:**
- Consumes: rien (première branche).
- Produces: classes `plan--beta`, `plan-badge--beta`, `plan-disclaimer`, `plans-note` ; ids de tooltips `tip-tirage-b`, `tip-collegial-b`, `tip-futures-b` ; 3 nouveaux libellés de lignes ; 11 `plan-row` par plan (33 au total).

- [ ] **Step 1 : créer le worktree et la branche**

```bash
git worktree add .worktrees/democratie-plan-continue -b democratie-plan-continue
cd .worktrees/democratie-plan-continue
pnpm install
pnpm test            # attendu : vert, même baseline que Task 0
```

Si l'outil natif de création de worktree est disponible, s'en servir ; sa branche doit alors être basée sur `main`.

- [ ] **Step 2 : écrire les tests structure (rouge)**

Dans `tests/structure.spec.ts`, `test.describe('Pricing')`, **remplacer** les deux tests suivants :

```ts
    test('section and cards', () => {
      expect(INDEX).toMatch(/<section id="tarifs" class="section pricing"[^>]*>/);
      expect(INDEX.match(/class="plan plan--legacy"/g)).toHaveLength(1);
      expect(INDEX.match(/class="plan plan--popular"/g)).toHaveLength(1);
      expect(INDEX.match(/class="plan plan--beta"/g)).toHaveLength(1);
      expect(bodyText(INDEX)).toContain('POPULAIRE');
      expect(bodyText(INDEX)).toContain('BÊTA');
    });

    test('eleven rows per card thirty-three total', () => {
      expect(INDEX.match(/class="plan-row"/g)).toHaveLength(33);
      const legacy = INDEX.split('plan plan--legacy')[1].split('plan plan--popular')[0];
      const popular = INDEX.split('plan plan--popular')[1].split('plan plan--beta')[0];
      const beta = INDEX.split('plan plan--beta')[1];
      expect(legacy.match(/class="plan-row"/g)).toHaveLength(11);
      expect(popular.match(/class="plan-row"/g)).toHaveLength(11);
      expect(beta.match(/class="plan-row"/g)).toHaveLength(11);
    });
```

**Ajouter** ces tests à la fin de `test.describe('Pricing')` :

```ts
    test('beta plan copy', () => {
      const t = bodyText(INDEX);
      for (const expected of [
        'Plan Démocratie Continue',
        'Early access',
        'indemnisé comme un jour de jury',
        'pas besoin — vous êtes le support',
      ]) {
        expect(t).toContain(expected);
      }
    });

    test('three new aligned rows on every plan', () => {
      const segs: Array<[string, string]> = [
        ['legacy', INDEX.split('plan plan--legacy')[1].split('plan plan--popular')[0]],
        ['popular', INDEX.split('plan plan--popular')[1].split('plan plan--beta')[0]],
        ['beta', INDEX.split('plan plan--beta')[1]],
      ];
      for (const [name, seg] of segs) {
        const t = bodyText(seg);
        expect(t, name).toContain('Assemblée citoyenne tirée au sort');
        expect(t, name).toContain('Président unique');
        expect(t, name).toContain('Contrôle des générations futures');
      }
    });

    test('plans note points to the beta', () => {
      const s = section(INDEX, 'tarifs');
      expect(s).toContain('class="plans-note"');
      expect(bodyText(s)).toContain('Démocratie Continue');
    });

    test('pricing grid three columns on desktop', () => {
      expect(cssRules('.pricing-grid')).toMatch(/grid-template-columns:\s*repeat\(3/);
    });

    test('pricing stacks on mobile', () => {
      const matches = mediaBlocks()
        .filter((b) => b.condition.includes('768px') && b.body.includes('.pricing-grid'));
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].body).toMatch(/grid-template-columns:\s*1fr/);
    });
```

Dans `test.describe('Lisibilite')`, **remplacer** le test « marks carry the verdict, not only presence » (les comptages changent) :

```ts
  test('marks carry the verdict, not only presence', () => {
    const legacy = INDEX.split('plan plan--legacy')[1].split('plan plan--popular')[0];
    const popular = INDEX.split('plan plan--popular')[1].split('plan plan--beta')[0];
    const beta = INDEX.split('plan plan--beta')[1];
    expect(legacy.match(/mark--risque/g) ?? []).toHaveLength(10);
    expect(popular.match(/mark--bon/g) ?? []).toHaveLength(8);
    expect(popular.match(/mark--risque/g) ?? []).toHaveLength(3);
    expect(beta.match(/mark--bon/g) ?? []).toHaveLength(11);
    expect(beta).not.toContain('mark--risque');
  });
```

Toujours dans `Lisibilite`, **remplacer** le test « popular plan does not claim renewable and non-renewable mandats » (le découpage doit exclure la carte bêta) :

```ts
  test('popular plan does not claim renewable and non-renewable mandats', () => {
    const popular = INDEX.split('plan plan--popular')[1].split('plan plan--beta')[0];
    expect(popular).toContain('Mandats non renouvelables');
    expect(popular).not.toMatch(/Mandats renouvelables[\s\S]{0,80}non renouvelables/);
  });
```

- [ ] **Step 3 : lancer et vérifier l'échec**

```bash
pnpm exec playwright test tests/structure.spec.ts -g "Pricing|Lisibilite"
```

Attendu : ÉCHEC (plan--beta absent, comptages 33/11 faux, grille encore à 2 colonnes).

- [ ] **Step 4 : implémenter le HTML (`democratie/index.html`)**

**4a. Meta (le `<head>`)** — remplacer les trois descriptions actuelles (`name="description"`, `og:description`, `twitter:description`) par :

```html
  <meta name="description" content="Comparez le Plan 5ᵉ, le Plan 6ᵉ République et le plan Démocratie Continue (bêta). Une seule facture : votre citoyenneté.">
```

`og:description` reçoit la même valeur ; `twitter:description` reçoit :

```html
  <meta name="twitter:description" content="Comparez trois plans : 5ᵉ, 6ᵉ République et Démocratie Continue (bêta).">
```

**4b. Section-sub** — remplacer (section `#tarifs`) :

```html
        <p class="section-sub">Deux générations. Une seule facture.</p>
```

par :

```html
        <p class="section-sub">Trois versions. Une seule facture.</p>
```

**4c. Nouvelles lignes du plan legacy** — juste après la ligne Support et avant `</ul>` de `.plan--legacy`, insérer :

```html
              <li class="plan-row"><span class="mark mark--risque" aria-hidden="true">✗</span> Assemblée citoyenne tirée au sort
                <span class="row-note">jury d'assises seulement</span>
              </li>
              <li class="plan-row"><span class="mark mark--risque" aria-hidden="true">✓</span> Président unique
                <span class="row-note">cumul possible, dissolution en option</span>
              </li>
              <li class="plan-row"><span class="mark mark--risque" aria-hidden="true">✗</span> Contrôle des générations futures
                <span class="row-note">le rapport 2050 n'existe pas</span>
              </li>
```

**4d. Nouvelles lignes du plan popular** — juste après la ligne Support et avant `</ul>` de `.plan--popular`, insérer :

```html
              <li class="plan-row"><span class="mark mark--risque" aria-hidden="true">✗</span> Assemblée citoyenne tirée au sort
                <span class="row-note">pas dans cette version</span>
              </li>
              <li class="plan-row"><span class="mark mark--risque" aria-hidden="true">✓</span> Président unique
                <span class="row-note">un seul, mais sous surveillance</span>
              </li>
              <li class="plan-row"><span class="mark mark--risque" aria-hidden="true">✗</span> Contrôle des générations futures
                <span class="row-note">non prévu</span>
              </li>
```

**4e. Carte bêta** — juste après `</article>` du plan popular et avant `</div>` de `.pricing-grid`, insérer l'article complet :

```html
          <article class="plan plan--beta">
            <header class="plan-head">
              <p class="plan-badge plan-badge--beta">BÊTA</p>
              <p class="plan-tag">Early access · contient des traces de souveraineté</p>
              <h3>Plan Démocratie Continue</h3>
              <p class="plan-price">0 €<span>indemnisé comme un jour de jury</span></p>
              <p class="plan-sub">Pour bêta-testeurs·ses de la République — engagement réel, retours d'expérience attendus</p>
            </header>
            <ul class="plan-features">
              <li class="plan-row"><span class="mark mark--bon" aria-hidden="true">✗</span> Gouvernement nommé sans vote de l'Assemblée</li>
              <li class="plan-row"><span class="mark mark--bon" aria-hidden="true">✓</span> Décret-loi 49.3
                <span class="row-note">avec bouton d'annulation</span>
              </li>
              <li class="plan-row"><span class="mark mark--bon" aria-hidden="true">✓</span> Référendum d'initiative citoyenne
                <span class="row-note">inclus</span>
              </li>
              <li class="plan-row"><span class="mark mark--bon" aria-hidden="true">✓</span> Révocation de votre élu
                <span class="row-note">à tout moment</span>
              </li>
              <li class="plan-row"><span class="mark mark--bon" aria-hidden="true">✓</span> Dissolution de l'Assemblée
                <span class="row-note">à la demande de 10 % des citoyens</span>
              </li>
              <li class="plan-row"><span class="mark mark--bon" aria-hidden="true">✓</span> Mandats non renouvelables
                <span class="row-note">une seule fois</span>
              </li>
              <li class="plan-row"><span class="mark mark--bon" aria-hidden="true">✓</span> Amendement citoyen en ligne</li>
              <li class="plan-row"><span class="mark mark--bon" aria-hidden="true">✓</span> Support
                <span class="row-note">pas besoin — vous êtes le support</span>
              </li>
              <li class="plan-row"><span class="mark mark--bon" aria-hidden="true">✓</span> Assemblée citoyenne tirée au sort
                <span class="row-note">pouvoir législatif réel</span>
                <span class="tip-wrap">
                  <button type="button" class="info-btn" aria-expanded="false" aria-controls="tip-tirage-b" aria-label="En savoir plus sur le tirage au sort">ⓘ</button>
                  <span class="tooltip" id="tip-tirage-b" role="tooltip" hidden>Le tirage au sort existe déjà : jurys d'assises depuis 1791. La Convention citoyenne pour le climat (2020) est restée consultative. <a href="https://www.vie-publique.fr/">Détail</a>.</span>
                </span>
              </li>
              <li class="plan-row"><span class="mark mark--bon" aria-hidden="true">✗</span> Président unique
                <span class="row-note">conseil de 7, présidence tournante</span>
                <span class="tip-wrap">
                  <button type="button" class="info-btn" aria-expanded="false" aria-controls="tip-collegial-b" aria-label="En savoir plus sur l'exécutif collégial">ⓘ</button>
                  <span class="tooltip" id="tip-collegial-b" role="tooltip" hidden>La Suisse gouverne à sept depuis 1848, présidence tournante chaque année. <a href="https://www.admin.ch/gov/fr/accueil/conseil-federal.html">Conseil fédéral</a>.</span>
                </span>
              </li>
              <li class="plan-row"><span class="mark mark--bon" aria-hidden="true">✓</span> Contrôle des générations futures
                <span class="row-note">avis opposable avant chaque loi</span>
                <span class="tip-wrap">
                  <button type="button" class="info-btn" aria-expanded="false" aria-controls="tip-futures-b" aria-label="En savoir plus sur les générations futures">ⓘ</button>
                  <span class="tooltip" id="tip-futures-b" role="tooltip" hidden>Le Pays de Galles évalue ses lois à l'aune des générations futures depuis 2015. <a href="https://www.gov.wales/">Bien-être des générations futures</a>.</span>
                </span>
              </li>
            </ul>
            <p class="plan-disclaimer">Effets secondaires fréquents : engagement, responsabilité, intérêt soudain pour les budgets locaux. En cas de démocratie excessive, consultez votre assemblée.</p>
          </article>
```

**4g. CSS grille 3 colonnes resserrée** — après `.plans-note`, ajouter (compense l'étroitesse des cartes à 3 colonnes) :

```css
@media (min-width: 1025px) {
  .plan {
    padding: 1.5rem;
  }

  .plan-row {
    font-size: 0.9rem;
  }
}
```

Ce bloc n'introduit ni `animation` ni `transition` (contrainte test).

**4f. Note sous la grille** — juste après `</div>` qui ferme `.pricing-grid` et avant le `</div>` du `.container` :

```html
        <p class="plans-note">Trois lignes rouges sur le 6ᵉ ? Elles sont en bêta : voir le plan Démocratie Continue.</p>
```

- [ ] **Step 5 : implémenter le CSS (`styles.css`)**

Remplacer `.pricing-grid` (colonnes) :

```css
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  align-items: start;
}
```

Après `.plan--popular { ... }`, ajouter :

```css
.plan--beta {
  border: 2px dashed var(--color-primary);
}

.plan-badge--beta {
  background: var(--color-success);
}

.plan-disclaimer {
  margin: 1.5rem 0 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  border-top: 1px dashed var(--color-border);
  padding-top: 0.75rem;
}

.plans-note {
  margin: 1rem 0 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
```

Dans `@media (max-width: 1024px)`, ajouter (avant la fermeture du bloc) :

```css
  .pricing-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .plan--beta {
    grid-column: 1 / -1;
  }
```

Le bloc `@media (max-width: 768px)` existant (`.pricing-grid { grid-template-columns: 1fr; }` + `.plan--popular { order: -1; }`) est laissé tel quel.

- [ ] **Step 6 : lancer et vérifier le vert**

```bash
pnpm exec playwright test tests/structure.spec.ts -g "Pricing|Lisibilite"
pnpm test
```

Attendu : tout vert (les tests FAQ/Features encore inchangés ne comptent pas les nouvelles cartes).

- [ ] **Step 7 : commit**

```bash
git add democratie/index.html styles.css tests/structure.spec.ts
git commit -m "feat: plan Démocratie Continue (bêta) et trois lignes de comparaison"
```

---

## Task 2: Branche 1 — tooltips sourcés, copy transverse et garde a11y

**Files:**
- Modify: `tests/structure.spec.ts` (nouveau test tooltips bêta)
- Modify: `tests/navigation.spec.ts` (garde viewport tooltips bêta)
- Modify: `democratie/index.html` (URLs exactes des tooltips) — si la vérification change les liens
- Modify: `README.md`, `index.html` (hub), `tests/structure.spec.ts` (copie du teaser hub)
- Test: `tests/structure.spec.ts`, `tests/navigation.spec.ts`

**Interfaces:**
- Consumes: ids `tip-tirage-b`, `tip-collegial-b`, `tip-futures-b` (Task 1).
- Produces: teaser hub mis à jour (base de la branche suivante).

- [ ] **Step 1 : vérifier les URLs exactes des tooltips**

Avec `webfetch`, trouver et confirmer :
- la fiche vie-publique.fr sur le jury d'assises (remplacer l'URL racine du tooltip tirage) ;
- `https://www.admin.ch/gov/fr/accueil/conseil-federal.html` (conseil fédéral) ;
- la page gov.wales sur le Well-being of Future Generations Act 2015.

Remplacer dans `democratie/index.html` les `href` des trois tooltips par les URLs confirmées. Les tests ci-dessous n'asserteront que l'hôte (comme le test existant sur `tip-ric-l`).

- [ ] **Step 2 : écrire le test structure tooltips (rouge)**

Dans `tests/structure.spec.ts`, `test.describe('Sources')`, ajouter :

```ts
  test('beta tooltips link to their sources', () => {
    expect(INDEX).toMatch(/id="tip-tirage-b"[\s\S]*?href="https:\/\/www\.vie-publique\.fr/);
    expect(INDEX).toMatch(/id="tip-collegial-b"[\s\S]*?href="https:\/\/www\.admin\.ch/);
    expect(INDEX).toMatch(/id="tip-futures-b"[\s\S]*?href="https:\/\/www\.gov\.wales/);
  });
```

- [ ] **Step 3 : écrire le test navigation de garde (rouge)**

Dans `tests/navigation.spec.ts`, ajouter :

```ts
test('beta tooltips stay inside the viewport', async ({ page }) => {
  await page.goto('/democratie/');
  for (const id of ['tip-tirage-b', 'tip-collegial-b', 'tip-futures-b']) {
    const button = page.locator(`[aria-controls="${id}"]`);
    await button.click();
    const box = await page.locator(`#${id}`).boundingBox();
    const width = page.viewportSize()!.width;
    expect(box, `${id} invisible`).not.toBeNull();
    expect(box!.x, `${id} déborde à gauche`).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width, `${id} déborde à droite`).toBeLessThanOrEqual(width + 1);
    await page.keyboard.press('Escape');
  }
});
```

- [ ] **Step 4 : lancer et vérifier l'échec**

```bash
pnpm exec playwright test tests/structure.spec.ts -g "beta tooltips"
pnpm exec playwright test tests/navigation.spec.ts -g "beta tooltips"
```

Attendu : ÉCHEC si les URLs/hôtes ne sont pas encore ceux attendus.

- [ ] **Step 5 : mettre à jour le teaser hub et son test**

Dans `index.html` (hub), remplacer le texte du `.update-teaser` de la carte Démocratie :

```html
            <p class="update-teaser">Plan 5ᵉ vs 6ᵉ vs bêta : le 49.3 avec bouton d'annulation, le RIC sorti de bêta fermée, la démocratie continue en early access.</p>
```

Dans `tests/structure.spec.ts`, mettre à jour l'attente correspondante (elle contient la chaîne `'Plan 5ᵉ vs Plan 6ᵉ : …'`) :

```ts
      'Plan 5ᵉ vs 6ᵉ vs bêta : le 49.3 avec bouton d\'annulation, le RIC sorti de bêta fermée, la démocratie continue en early access.',
```

- [ ] **Step 6 : mettre à jour le README**

Dans `README.md`, remplacer la ligne descriptive :

```markdown
- `/democratie/` — Citoyen 2.0 : Plan 5ᵉ, 6ᵉ et bêta citoyenne
```

- [ ] **Step 7 : lancer et vérifier le vert**

```bash
pnpm test
```

Attendu : tout vert.

- [ ] **Step 8 : commit**

```bash
git add democratie/index.html index.html README.md tests/structure.spec.ts tests/navigation.spec.ts
git commit -m "feat: tooltips sourcés du plan bêta et copy transverse trois plans"
```

---

## Task 3: Branche 2 — section « Pas convaincu·e ? »

**Files:**
- Create/switch: `.worktrees/democratie-objections` (branche `democratie-objections`, base `democratie-plan-continue`)
- Modify: `democratie/index.html` (section `#objections` insérée avant `#sources`)
- Modify: `styles.css` (étendre `.faq-item` et `.faq-item summary` à `.obj-item`)
- Modify: `main.js` (sélecteur single-open)
- Test: `tests/structure.spec.ts` (déplacer les comptages FAQ en portée, ajouter `Objections`), `tests/navigation.spec.ts`

**Interfaces:**
- Consumes: branche 1 (ordre de la page, regroupe les insertions avant `#sources`).
- Produces: section `#objections`, classe `.obj-item` (6 occurrences), sélecteur JS `.faq-item, .obj-item`.

- [ ] **Step 1 : créer le worktree de la branche 2**

```bash
git worktree add .worktrees/democratie-objections -b democratie-objections democratie-plan-continue
cd .worktrees/democratie-objections
pnpm install
pnpm test            # attendu : vert (hérite de la branche 1)
```

- [ ] **Step 2 : écrire les tests structure (rouge)**

Dans `tests/structure.spec.ts`, `test.describe('FAQ')`, **remplacer** les deux tests de comptage pour les restreindre à la section `#faq` :

```ts
    test('section and six items', () => {
      expect(INDEX).toContain('<section id="faq"');
      const s = section(INDEX, 'faq');
      expect(s.match(/class="faq-item"/g)).toHaveLength(6);
      expect(s.match(/<details/g)).toHaveLength(6);
      expect(s.match(/<summary>/g)).toHaveLength(6);
    });

    test('each answer has fine print', () => {
      expect(section(INDEX, 'faq').match(/class="fine-print"/g)).toHaveLength(6);
    });
```

**Ajouter** une nouvelle describe après `test.describe('FAQ')` :

```ts
  test.describe('Objections', () => {
    test('section and six tickets', () => {
      expect(INDEX).toContain('<section id="objections"');
      const s = section(INDEX, 'objections');
      expect(s.match(/class="obj-item"/g)).toHaveLength(6);
      expect(s.match(/<details/g)).toHaveLength(6);
    });

    test('each ticket answers with a sourced link', () => {
      const items = section(INDEX, 'objections').split('class="obj-item"').slice(1);
      expect(items).toHaveLength(6);
      for (const item of items) {
        expect(item, 'réponse manquante').toContain('class="faq-answer"');
        expect(item, 'fine print manquante').toContain('class="fine-print"');
        expect(item, 'source manquante').toMatch(/href="https:\/\//);
      }
    });

    test('objections js single open', () => {
      expect(JS).toContain('.obj-item');
      expect(JS).toContain('.faq-item');
    });

    test('faq stays separate from objections', () => {
      expect(section(INDEX, 'faq').match(/class="obj-item"/g)).toBeNull();
    });
  });
```

Dans `tests/navigation.spec.ts`, ajouter :

```ts
test('objections open one at a time on the démocratie page', async ({ page }) => {
  await page.goto('/democratie/');
  const items = page.locator('.obj-item');
  await expect(items).toHaveCount(6);
  await items.nth(0).locator('summary').click();
  await expect(items.nth(0)).toHaveAttribute('open', '');
  await items.nth(1).locator('summary').click();
  await expect(items.nth(1)).toHaveAttribute('open', '');
  await expect(items.nth(0)).not.toHaveAttribute('open', '');
});
```

- [ ] **Step 3 : lancer et vérifier l'échec**

```bash
pnpm exec playwright test tests/structure.spec.ts -g "Objections|FAQ"
pnpm exec playwright test tests/navigation.spec.ts -g "objections"
```

Attendu : ÉCHEC (`#objections` absente).

- [ ] **Step 4 : vérifier les URLs des sources citées**

Avec `webfetch`, confirmer : l'édition en ligne des *Politiques* d'Aristote (`https://fr.wikisource.org/wiki/Politique_(Aristote)` ou équivalent pérenne https), une page `service-public.fr` sur la convocation des jurés, et l'URL `https://www.hatvp.fr/`. Remplacer les `href` du bloc ci-dessous par les URLs confirmées (les tests n'asserteront que l'hôte).

- [ ] **Step 5 : implémenter le HTML (`democratie/index.html`)**

Insérer la section complète juste avant `<section id="sources"` (chaque ticket porte au moins un lien source, exigence du test « each ticket answers with a sourced link ») :

```html
    <section id="objections" class="section faq" aria-labelledby="objections-title">
      <div class="container container--narrow">
        <h2 id="objections-title">Pas convaincu·e ? — le centre d'aide</h2>
        <p class="section-sub">Objections reçues, réponses honnêtes. Presque.</p>
        <div class="faq-list">
          <details class="obj-item">
            <summary>« Le tirage au sort ? N'importe qui va légiférer. »</summary>
            <p class="faq-answer">Comme au tribunal : vous acceptez depuis 1791 que des citoyens tirés au sort décident de la culpabilité — juste pas des lois. L'Irlande est allée plus loin : <a href="https://citizensassembly.ie/">99 tirés au sort</a> ont préparé deux référendums, adoptés par le peuple.</p>
            <p class="fine-print">La compétence, ça se vérifie. L'élection, ça se promet.</p>
          </details>
          <details class="obj-item">
            <summary>« Personne ne les a élus. C'est antidémocratique. »</summary>
            <p class="faq-answer">Aristote rangeait l'élection du côté aristocratique et réservait le tirage au sort à la démocratie (<a href="https://fr.wikisource.org/wiki/Politique_(Aristote)">Politiques</a>). Les Athéniens trouvaient l'élection élitiste.</p>
            <p class="fine-print">« démos kratos » — pouvoir du peuple, pas pouvoir des élus.</p>
          </details>
          <details class="obj-item">
            <summary>« Les lobbies vont les plier en deux. »</summary>
            <p class="faq-answer">Un lobbyiste investit sur un interlocuteur qui reste vingt ans. Tiré au sort pour un mandat court, sans réélection à espérer ni carrière à financer : rien à vendre, rien à acheter (<a href="https://www.hatvp.fr/">transparence de la vie publique</a>).</p>
            <p class="fine-print">Le risque n'est pas qu'ils soient corruptibles. C'est qu'ils ne le soient pas.</p>
          </details>
          <details class="obj-item">
            <summary>« Les gens n'ont ni le temps ni l'envie. »</summary>
            <p class="faq-answer">Le système repose déjà sur des citoyens tirés au sort : jurés d'assises, assesseurs, bureaux de vote. À chaque <a href="https://www.service-public.fr/">convocation</a>, ils viennent.</p>
            <p class="fine-print">On peut ignorer une élection, pas un huissier.</p>
          </details>
          <details class="obj-item">
            <summary>« Un conseil de sept à la place du président ? Et en cas de crise ? »</summary>
            <p class="faq-answer">La Suisse gouverne à sept depuis 1848, présidence tournante chaque année (<a href="https://www.admin.ch/gov/fr/accueil/conseil-federal.html">Conseil fédéral</a>). Crises traversées : deux guerres mondiales, plusieurs récessions, zéro présidentialisation.</p>
            <p class="fine-print">En cas de crise, ils se réunissent. C'est littéralement le produit.</p>
          </details>
          <details class="obj-item">
            <summary>« Le conseil des générations futures va tout bloquer. »</summary>
            <p class="faq-answer">Le Pays de Galles vit avec le sien depuis 2015 (<a href="https://www.gov.wales/">Well-being of Future Generations</a>). Bilan : un avenir pris en compte, une autoroute en moins. C'était le but.</p>
            <p class="fine-print">Bloquer une bêtise à long terme, c'est le cahier des charges.</p>
          </details>
        </div>
      </div>
    </section>
```

- [ ] **Step 6 : étendre le CSS (`styles.css`)**

Remplacer le sélecteur `.faq-item {` par `.faq-item,\n.obj-item {`, et `.faq-item summary {` par `.faq-item summary,\n.obj-item summary {`. Le reste (`.faq-answer`, `.fine-print`) est déjà partagé et réutilisé tel quel.

- [ ] **Step 7 : étendre le JS (`main.js`)**

Dans `initFaq`, remplacer les **deux** occurrences de `document.querySelectorAll(".faq-item")` (lignes ~61 et ~66) par :

```js
document.querySelectorAll(".faq-item, .obj-item")
```

- [ ] **Step 8 : lancer et vérifier le vert**

```bash
pnpm test
```

Attendu : tout vert (structure + navigation).

- [ ] **Step 9 : commit**

```bash
git add democratie/index.html styles.css main.js tests/structure.spec.ts tests/navigation.spec.ts
git commit -m "feat: section objections (pas convaincu·e) et accordéon partagé"
```

---

## Task 4: Branche 3 — section « Déjà en production » et sources

**Files:**
- Create/switch: `.worktrees/democratie-cas-reels` (branche `democratie-cas-reels`, base `democratie-objections`)
- Modify: `democratie/index.html` (section `#production` avant `#sources` ; entrées de `#sources`)
- Modify: `styles.css` (`.feature-source`)
- Test: `tests/structure.spec.ts`

**Interfaces:**
- Consumes: branche 2 (ordre de page).
- Produces: section `#production` (5 `.feature-card`), entrées sources supplémentaires.

- [ ] **Step 1 : créer le worktree de la branche 3**

```bash
git worktree add .worktrees/democratie-cas-reels -b democratie-cas-reels democratie-objections
cd .worktrees/democratie-cas-reels
pnpm install
pnpm test            # attendu : vert
```

- [ ] **Step 2 : écrire les tests structure (rouge)**

Dans `test.describe('FeatureGrid')`, **remplacer** le test de comptage pour le restreindre à `#fonctionnalites` :

```ts
    test('section and six cards', () => {
      expect(INDEX).toContain('<section id="fonctionnalites"');
      expect(section(INDEX, 'fonctionnalites').match(/class="feature-card"/g)).toHaveLength(6);
    });
```

**Ajouter** une describe `ProductionReelle` après `FeatureGrid` :

```ts
  test.describe('ProductionReelle', () => {
    test('section and five cases', () => {
      expect(INDEX).toContain('<section id="production"');
      expect(section(INDEX, 'production').match(/class="feature-card"/g)).toHaveLength(5);
    });

    test('each case names a country and a year', () => {
      const t = bodyText(section(INDEX, 'production'));
      for (const name of ['Suisse', 'Irlande', 'Ostbelgien', 'Pays de Galles', 'Paris']) {
        expect(t, name).toContain(name);
      }
      for (const year of ['1848', '2019', '2015', '2021']) {
        expect(t, year).toContain(year);
      }
    });

    test('each case links an official source', () => {
      const s = section(INDEX, 'production');
      for (const host of [
        'https://www.admin.ch/',
        'https://citizensassembly.ie/',
        'https://www.buergerdialog.be/',
        'https://www.gov.wales/',
        'https://www.paris.fr/',
      ]) {
        expect(s, host).toContain(`href="${host}`);
      }
    });
  });
```

Dans `test.describe('Sources')`, ajouter :

```ts
  test('case study sources are listed', () => {
    const s = section(INDEX, 'sources');
    for (const host of [
      'https://www.admin.ch/',
      'https://citizensassembly.ie/',
      'https://www.buergerdialog.be/',
      'https://www.gov.wales/',
      'https://www.paris.fr/',
    ]) {
      expect(s, host).toContain(`href="${host}`);
    }
  });
```

- [ ] **Step 3 : lancer et vérifier l'échec**

```bash
pnpm exec playwright test tests/structure.spec.ts -g "ProductionReelle|FeatureGrid|Sources"
```

Attendu : ÉCHEC (`#production` absente).

- [ ] **Step 4 : vérifier les URLs des cas réels**

Avec `webfetch`, confirmer l'URL exacte de la page « assemblée citoyenne permanente » de Paris (`paris.fr`) et de la page gov.wales sur le Well-being of Future Generations Act. Noter les URLs retenues ; les tests ci-dessus n'asserteront que l'hôte.

- [ ] **Step 5 : implémenter le HTML (`democratie/index.html`)**

Insérer la section juste avant `<section id="sources"` :

```html
    <section id="production" class="section features" aria-labelledby="production-title">
      <div class="container">
        <h2 id="production-title">Déjà en production en Europe</h2>
        <p class="section-sub">Fonctionnalités bêta déployées en conditions réelles. Aucun rollback signalé.</p>
        <div class="features-grid">
          <article class="feature-card">
            <p class="feature-icon" aria-hidden="true">🇨🇭</p>
            <h3>Suisse — Exécutif collégial</h3>
            <p class="feature-pitch">7 conseillers fédéraux, présidence tournante chaque année. En production depuis 1848.</p>
            <p class="feature-source"><a href="https://www.admin.ch/gov/fr/accueil/conseil-federal.html">admin.ch</a></p>
          </article>
          <article class="feature-card">
            <p class="feature-icon" aria-hidden="true">🇮🇪</p>
            <h3>Irlande — Assemblées citoyennes</h3>
            <p class="feature-pitch">99 citoyens tirés au sort, deux référendums préparés puis adoptés.</p>
            <p class="feature-source"><a href="https://citizensassembly.ie/">citizensassembly.ie</a></p>
          </article>
          <article class="feature-card">
            <p class="feature-icon" aria-hidden="true">🇧🇪</p>
            <h3>Ostbelgien — Assemblée citoyenne permanente</h3>
            <p class="feature-pitch">Tirage au sort renouvelé chaque année, depuis 2019.</p>
            <p class="feature-source"><a href="https://www.buergerdialog.be/">buergerdialog.be</a></p>
          </article>
          <article class="feature-card">
            <p class="feature-icon" aria-hidden="true">🏴󠁧󠁢󠁷󠁬󠁳󠁿</p>
            <h3>Pays de Galles — Générations futures</h3>
            <p class="feature-pitch">Le bien-être des générations futures est inscrit dans la loi depuis 2015, commissaire dédié inclus.</p>
            <p class="feature-source"><a href="https://www.gov.wales/">gov.wales</a></p>
          </article>
          <article class="feature-card">
            <p class="feature-icon" aria-hidden="true">🇫🇷</p>
            <h3>Paris — Assemblée citoyenne permanente</h3>
            <p class="feature-pitch">130 Parisiennes et Parisiens tirés au sort, avis sur les projets de la Ville.</p>
            <p class="feature-source"><a href="https://www.paris.fr/">paris.fr</a></p>
          </article>
        </div>
      </div>
    </section>
```

Puis, dans `<ul class="sources-list">` de `#sources`, insérer avant `</ul>` :

```html
          <li><a href="https://www.admin.ch/gov/fr/accueil/conseil-federal.html">Conseil fédéral suisse</a> — exécutif collégial de sept membres, présidence tournante annuelle.</li>
          <li><a href="https://citizensassembly.ie/">Citizens' Assembly (Irlande)</a> — assemblées citoyennes tirées au sort et référendums associés.</li>
          <li><a href="https://www.buergerdialog.be/">Bürgerdialog in Ostbelgien</a> — assemblée citoyenne permanente depuis 2019.</li>
          <li><a href="https://www.gov.wales/">Well-being of Future Generations (Pays de Galles)</a> — loi de 2015 sur les générations futures.</li>
          <li><a href="https://www.paris.fr/">Assemblée citoyenne de Paris</a> — assemblée permanente tirée au sort.</li>
```

- [ ] **Step 6 : implémenter le CSS (`styles.css`)**

Après `.feature-pitch`, ajouter :

```css
.feature-source {
  margin: 0;
  font-size: 0.85rem;
}
```

- [ ] **Step 7 : lancer et vérifier le vert**

```bash
pnpm test
```

Attendu : tout vert.

- [ ] **Step 8 : commit**

```bash
git add democratie/index.html styles.css tests/structure.spec.ts
git commit -m "feat: section déjà en production et sources des cas réels"
```

---

## Task 5: Branche 4 — « Historique des versions »

**Files:**
- Create/switch: `.worktrees/democratie-changelog` (branche `democratie-changelog`, base `democratie-cas-reels`)
- Modify: `democratie/index.html` (section `#changelog` avant `#sources`)
- Modify: `styles.css` (`.changelog-list`, `.release*`)
- Test: `tests/structure.spec.ts`

**Interfaces:**
- Consumes: branche 3 (ordre de page).
- Produces: section `#changelog` (9 `.release`), tags `MAJOR`/`HOTFIX`/`PATCH`/`BREAKING`.

- [ ] **Step 1 : créer le worktree de la branche 4**

```bash
git worktree add .worktrees/democratie-changelog -b democratie-changelog democratie-cas-reels
cd .worktrees/democratie-changelog
pnpm install
pnpm test            # attendu : vert
```

- [ ] **Step 2 : écrire les tests structure (rouge)**

**Ajouter** une describe `Changelog` dans `test.describe('Democratie')` (après `ProductionReelle`) :

```ts
  test.describe('Changelog', () => {
    test('section and nine releases', () => {
      expect(INDEX).toContain('<section id="changelog"');
      expect(section(INDEX, 'changelog').match(/class="release"/g)).toHaveLength(9);
    });

    test('versions and years', () => {
      const t = bodyText(section(INDEX, 'changelog'));
      for (const v of ['v1.0', 'v2.0', 'v3.0', 'v4.0', 'v5.0', 'v5.0.1', 'v5.0.2', 'v6.0', 'v7.0']) {
        expect(t, v).toContain(v);
      }
      for (const y of ['1791', '1848', '1875', '1946', '1958', '1962', '2000']) {
        expect(t, y).toContain(y);
      }
    });

    test('release tags', () => {
      const s = section(INDEX, 'changelog');
      for (const tag of ['MAJOR', 'HOTFIX', 'PATCH', 'BREAKING']) {
        expect(s, tag).toContain(tag);
      }
    });

    test('each release links a founding text', () => {
      const s = section(INDEX, 'changelog');
      const hrefs = s.match(/href="https:\/\/[^"]+"/g) || [];
      expect(hrefs.length).toBeGreaterThanOrEqual(5);
      expect(s).toMatch(/href="https:\/\/www\.(legifrance\.gouv\.fr|conseil-constitutionnel\.fr)/);
    });

    test('v6.0 is in development and points to the beta', () => {
      const t = bodyText(section(INDEX, 'changelog'));
      expect(t).toContain('en développement');
      expect(t).toContain('Démocratie Continue');
    });
  });
```

- [ ] **Step 3 : lancer et vérifier l'échec**

```bash
pnpm exec playwright test tests/structure.spec.ts -g "Changelog"
```

Attendu : ÉCHEC (`#changelog` absente).

- [ ] **Step 4 : vérifier les URLs des textes fondateurs**

Avec `webfetch`, confirmer une page listant les constitutions françaises sur `legifrance.gouv.fr` ou `www.conseil-constitutionnel.fr`, et l'URL de la Constitution de 1958 déjà utilisée dans `#sources`. Utiliser ces liens dans les entrées (les tests n'asserteront que l'hôte).

- [ ] **Step 5 : implémenter le HTML (`democratie/index.html`)**

Insérer juste avant `<section id="sources"` :

```html
    <section id="changelog" class="section changelog" aria-labelledby="changelog-title">
      <div class="container container--narrow">
        <h2 id="changelog-title">Historique des versions</h2>
        <p class="section-sub">La République est un logiciel entretenu : cinq versions majeures, une sixième en développement. Ce n'est pas une utopie, c'est de la maintenance.</p>
        <ol class="changelog-list">
          <li class="release">
            <p class="release-head"><span class="release-tag release-tag--major">MAJOR</span> <span class="release-version">v1.0</span> <span class="release-year">1791</span></p>
            <p class="release-note">Première version : monarchie constitutionnelle, jury d'assises (premier module livré tiré au sort). Obsolète. <a href="https://www.conseil-constitutionnel.fr/">Texte</a>.</p>
          </li>
          <li class="release">
            <p class="release-head"><span class="release-tag release-tag--major">MAJOR</span> <span class="release-version">v2.0</span> <span class="release-year">1848</span></p>
            <p class="release-note">Suffrage universel masculin, abolition de l'esclavage. Module retiré au hotfix 1852. <a href="https://www.conseil-constitutionnel.fr/">Texte</a>.</p>
          </li>
          <li class="release">
            <p class="release-head"><span class="release-tag release-tag--major">MAJOR</span> <span class="release-version">v3.0</span> <span class="release-year">1875</span></p>
            <p class="release-note">Lois constitutionnelles. Uptime record : 70 ans (à l'exception du crash de 1940). <a href="https://www.conseil-constitutionnel.fr/">Texte</a>.</p>
          </li>
          <li class="release">
            <p class="release-head"><span class="release-tag release-tag--major">MAJOR</span> <span class="release-version">v4.0</span> <span class="release-year">1946</span></p>
            <p class="release-note">Exécutifs concurrents : chute du gouvernement tous les ~6 mois. Dépréciée. <a href="https://www.conseil-constitutionnel.fr/">Texte</a>.</p>
          </li>
          <li class="release">
            <p class="release-head"><span class="release-tag release-tag--major">MAJOR</span> <span class="release-version">v5.0</span> <span class="release-year">1958</span></p>
            <p class="release-note">Version courante. Parlementarisme rationalisé. Très rationalisé. <a href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000571356/">Texte</a>.</p>
          </li>
          <li class="release">
            <p class="release-head"><span class="release-tag release-tag--hotfix">HOTFIX</span> <span class="release-version">v5.0.1</span> <span class="release-year">1962</span></p>
            <p class="release-note">Élection directe du président. Effet secondaire documenté : présidentialisation. Jamais corrigé. <a href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000571356/">Texte</a>.</p>
          </li>
          <li class="release">
            <p class="release-head"><span class="release-tag release-tag--patch">PATCH</span> <span class="release-version">v5.0.2</span> <span class="release-year">2000</span></p>
            <p class="release-note">Quinquennat : durée de garantie réduite, contre-pouvoirs non étendus. <a href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000571356/">Texte</a>.</p>
          </li>
          <li class="release">
            <p class="release-head"><span class="release-tag release-tag--breaking">BREAKING</span> <span class="release-version">v6.0</span> <span class="release-year">en développement</span></p>
            <p class="release-note">49.3 réversible, RIC, mandats non renouvelables. Cf. Plan 6ᵉ République. <a href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000571356/">Texte</a>.</p>
          </li>
          <li class="release">
            <p class="release-head"><span class="release-tag release-tag--roadmap">ROADMAP</span> <span class="release-version">v7.0</span> <span class="release-year">à venir</span></p>
            <p class="release-note">Démocratie continue : tirage au sort législatif, collégialité, générations futures. Cf. plan Démocratie Continue.</p>
          </li>
        </ol>
      </div>
    </section>
```

- [ ] **Step 6 : implémenter le CSS (`styles.css`)**

Après `.fine-print`, ajouter :

```css
.changelog-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.release {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
}

.release-head {
  margin: 0 0 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.release-tag {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #ffffff;
  background: var(--color-text-muted);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
}

.release-tag--major {
  background: var(--color-primary);
}

.release-tag--hotfix {
  background: var(--color-danger);
}

.release-tag--patch {
  background: var(--color-success);
}

.release-tag--breaking {
  background: var(--color-text);
}

.release-version {
  font-weight: 800;
}

.release-year {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.release-note {
  margin: 0;
  color: var(--color-text-muted);
}
```

- [ ] **Step 7 : lancer et vérifier le vert**

```bash
pnpm test
```

Attendu : tout vert.

- [ ] **Step 8 : commit**

```bash
git add democratie/index.html styles.css tests/structure.spec.ts
git commit -m "feat: historique des versions de la République"
```

---

## Task 6: Intégration — ordre de page et fusion

**Files:**
- Lecture seule (vérification) sur les 4 branches.

- [ ] **Step 1 : vérifier l'ordre final des sections sur la branche 4**

Sur la branche `democratie-changelog`, extraire l'ordre des `<section id=` de `democratie/index.html` :

```bash
grep -o '<section id="[^"]*"' democratie/index.html
```

Attendu, dans cet ordre : `logos`, `tarifs`, `fonctionnalites`, `objections`, `production`, `changelog`, `sources`, `faq`, `agir`, `partage`.

- [ ] **Step 2 : vérifier la fusion ordonnée**

Depuis `main`, fusionner dans l'ordre et relancer la suite à chaque étape :

```bash
git checkout main
git merge --ff-only democratie-plan-continue
git merge --ff-only democratie-objections
git merge --ff-only democratie-cas-reels
git merge --ff-only democratie-changelog
pnpm test
```

Attendu : chaque `merge --ff-only` passe (branches empilées) ; la suite complète est verte sur `main`.

Si une fusion n'est pas fast-forward, NE PAS forcer : signaler et vérifier l'empilement (chaque branche doit être basée sur la précédente).

- [ ] **Step 3 : nettoyer les worktrees**

```bash
git worktree remove .worktrees/democratie-plan-continue
git worktree remove .worktrees/democratie-objections
git worktree remove .worktrees/democratie-cas-reels
git worktree remove .worktrees/democratie-changelog
```

Laisser les branches en place pour la revue. Ne pas pousser sans validation explicite de l'utilisateur.
