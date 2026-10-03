import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://la-mise-a-jour.fr';

type SitePage = { name: string; file: string; url: string; sub: boolean };

const PAGES: SitePage[] = [
  { name: 'hub', file: 'index.html', url: `${SITE}/`, sub: false },
  { name: 'democratie', file: 'democratie/index.html', url: `${SITE}/democratie/`, sub: true },
];

const PLANNED = [
  { name: 'Agronomie', status: 'en bêta fermée' },
  { name: 'Économie', status: 'planifié' },
  { name: 'Énergie', status: 'planifié' },
];

const read = (rel: string): string => fs.readFileSync(path.join(ROOT, rel), 'utf-8');
const INDEX = read('democratie/index.html');
const HUB = read('index.html');
const CSS = read('styles.css');
const JS = read('main.js');
const SITEMAP = read('sitemap.xml');

function section(html: string, id: string): string {
  const start = html.indexOf(`id="${id}"`);
  if (start < 0) throw new Error(`section #${id} introuvable`);
  const end = html.indexOf('</section>', start);
  if (end < 0) throw new Error(`section #${id} non terminée (</section> manquant)`);
  return html.slice(start, end);
}

function bodyText(html: string): string {
  // `html.split('<body')[1]` saute la section <head> ; sur un fragment (section
  // extraite par section()) il n'y a pas de <body> → on prend le fragment tel quel.
  const body = (html.split('<body')[1] ?? html).split('>').slice(1).join('>');
  return body
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const getText = () => bodyText(INDEX);

function cssRules(selectorPrefix: string): string {
  const pattern = new RegExp(
    `([^{}]*${selectorPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^{}]*)\\{([^{}]*)\\}`,
    'g'
  );
  let match;
  const bodies: string[] = [];
  while ((match = pattern.exec(CSS)) !== null) {
    bodies.push(match[2]);
  }
  return bodies.join(' ');
}

function mediaBlocks(): Array<{ condition: string; body: string }> {
  const blocks: Array<{ condition: string; body: string }> = [];
  const pattern = /@media([^{]+)\{/g;
  let match;
  while ((match = pattern.exec(CSS)) !== null) {
    let depth = 1;
    let i = match.index + match[0].length;
    const start = i;
    while (depth > 0 && i < CSS.length) {
      if (CSS[i] === '{') depth++;
      else if (CSS[i] === '}') depth--;
      i++;
    }
    blocks.push({
      condition: match[1].trim(),
      body: CSS.slice(start, i - 1),
    });
  }
  return blocks;
}

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace('#', '');
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

function channel(c: number): number {
  c = c / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function token(name: string): string {
  const m = CSS.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`jeton ${name} introuvable`);
  return m[1];
}

// ─── Shared Per-Page Invariants ──────────────────────────────────────────────

test.describe('Shared', () => {
  for (const p of PAGES) {
    const html = read(p.file);
    const prefix = p.sub ? '../' : '';

    test(`[${p.name}] lang is french`, () => {
      expect(html).toContain('<html lang="fr">');
    });

    test(`[${p.name}] canonical matches page url`, () => {
      expect(html).toContain(`<link rel="canonical" href="${p.url}">`);
    });

    test(`[${p.name}] og:url matches page url`, () => {
      expect(html).toContain(`<meta property="og:url" content="${p.url}">`);
    });

    test(`[${p.name}] twitter card present`, () => {
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    });

    test(`[${p.name}] og:image points to an existing file`, () => {
      const m = html.match(/<meta property="og:image" content="https:\/\/la-mise-a-jour\.fr\/([^"]+)"/);
      expect(m, 'og:image absente').not.toBeNull();
      expect(fs.existsSync(path.join(ROOT, m![1])), `fichier manquant : ${m![1]}`).toBe(true);
    });

    test(`[${p.name}] no external assets`, () => {
      expect(html).not.toMatch(/<script[^>]+src="https?:\/\//);
      expect(html).not.toMatch(/<link[^>]+rel="stylesheet"[^>]+href="https?:\/\//);
    });

    test(`[${p.name}] links local assets relatively`, () => {
      expect(html).toContain(`href="${prefix}styles.css"`);
      expect(html).toContain(`src="${prefix}main.js"`);
    });

    test(`[${p.name}] skip link present`, () => {
      expect(html).toContain('<a class="skip-link" href="#main">');
    });

    test(`[${p.name}] single h1`, () => {
      expect(html.match(/<h1>/g)).toHaveLength(1);
    });

    test(`[${p.name}] no dead anchors`, () => {
      const anchors = html.match(/href="#([^"]+)"/g) || [];
      for (const a of anchors) {
        const id = a.replace(/href="#([^"]+)"/, '$1');
        expect(html, `ancre morte : #${id}`).toContain(`id="${id}"`);
      }
    });

    test(`[${p.name}] deferred script`, () => {
      expect(html).toContain(`<script src="${prefix}main.js" defer></script>`);
    });

    test(`[${p.name}] share text declared on body`, () => {
      expect(html).toMatch(/<body data-share-text="[^"]+">/);
    });

    test(`[${p.name}] no calculator mention`, () => {
      expect(html.toLowerCase()).not.toContain('calculateur');
    });
  }
});

// ─── Global Assets Tests ─────────────────────────────────────────────────────

test.describe('SiteAssets', () => {
  test('design tokens defined', () => {
    for (const t of [
      '--color-bg', '--color-surface', '--color-text', '--color-text-muted',
      '--color-primary', '--color-danger', '--color-success',
    ]) {
      expect(CSS).toMatch(new RegExp(`${t}:\\s*#[0-9a-fA-F]{6}`));
    }
  });

  test('focus visible style', () => {
    expect(CSS).toContain(':focus-visible');
  });

  test('media queries present', () => {
    const conds = mediaBlocks().map((b) => b.condition);
    expect(conds.some((c) => c.includes('768px'))).toBe(true);
    expect(conds.some((c) => c.includes('1024px'))).toBe(true);
  });

  test('contrast AA', () => {
    const pairs: Array<[string, string]> = [
      [token('--color-text'), token('--color-bg')],
      [token('--color-text-muted'), token('--color-surface')],
      ['#ffffff', token('--color-primary')],
      [token('--color-danger'), token('--color-surface')],
      [token('--color-success'), token('--color-surface')],
    ];
    for (const [fg, bg] of pairs) {
      const ratio = contrastRatio(fg, bg);
      expect(ratio, `${fg} sur ${bg} est sous 4,5:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('tooltip js behaviour', () => {
    expect(JS).toContain('key === "Escape"');
    expect(JS).toContain('closest(".tip-wrap")');
    expect(JS).toContain('getBoundingClientRect');
    expect(JS).toContain('tooltip--below');
    expect(JS).toContain('flipTooltipX');
    expect(CSS).toContain('tooltip--below');
  });

  test('faq js single open', () => {
    expect(JS).toContain('preventDefault');
    expect(JS).toContain('.faq-item');
  });

  test('no calculator in css and js', () => {
    expect(CSS.toLowerCase()).not.toContain('calculateur');
    expect(JS.toLowerCase()).not.toContain('calculateur');
  });

  test('readme exists', () => {
    const readme = read('README.md');
    for (const expected of ['python3 -m http.server', 'og.png']) {
      expect(readme).toContain(expected);
    }
  });
});

// ─── Per-Page Share Tests ─────────────────────────────────────────────────────

test.describe('ShareByPage', () => {
  test('js derives the url from the canonical tag', () => {
    expect(JS).not.toContain('la-mise-a-jour.fr');
    expect(JS).toContain('link[rel="canonical"]');
    expect(JS).toContain('data-share-text');
  });

  for (const p of PAGES) {
    const html = read(p.file);

    test(`[${p.name}] hardcoded share hrefs encode this page`, () => {
      const shareText = html.match(/<body data-share-text="([^"]+)">/)![1];
      const anchors = html.match(/<a class="btn btn-share"[^>]*>/g) || [];
      expect(anchors).toHaveLength(3);
      for (const tag of anchors) {
        const href = tag.match(/href="([^"]+)"/)![1];
        const decoded = decodeURIComponent(href);
        expect(decoded, `URL manquante dans ${href}`).toContain(p.url);
        // Facebook ne transporte que l'URL (`?u=`) ; WhatsApp et X portent aussi le texte.
        if (/text=/.test(href)) {
          expect(decoded, `texte manquant dans ${href}`).toContain(shareText);
        }
      }
    });

    test(`[${p.name}] share section is complete`, () => {
      expect(html).toContain('id="copy-link"');
      expect(html).toContain('id="copy-feedback"');
    });
  }
});

// ─── Démocratie Page Tests ────────────────────────────────────────────────────

test.describe('Democratie', () => {
  // ─── Header & Hero Tests ─────────────────────────────────────────────────

  test.describe('HeaderHero', () => {
    test('status badge text', () => {
      expect(getText()).toContain('Statut : 49.3 opérationnel');
    });

    test('hero headline', () => {
      expect(getText()).toContain('Découvrez Citoyen 2.0 : La démocratie sans les bugs de 1958');
    });

    test('hero has two ctas', () => {
      const ctas = INDEX.match(/class="btn btn-[a-z]+"[^>]*>([^<]+)</g) || [];
      const texts = ctas.map((c) => c.replace(/.*>([^<]+)</, '$1'));
      expect(texts).toContain('Voir les plans');
      expect(texts).toContain('Comparer les plans');
    });

    test('logo band has four partners', () => {
      expect(INDEX.match(/class="logo-item"/g)).toHaveLength(4);
      const t = getText();
      for (const name of [
        'Assemblée nationale',
        'Sénat',
        'Conseil constitutionnel',
        'Partenaires indéterminés',
      ]) {
        expect(t).toContain(name);
      }
    });
  });

  // ─── Social Proof Tests ──────────────────────────────────────────────────

  test.describe('SocialProof', () => {
    test('proof numbers', () => {
      const t = getText();
      expect(t).toContain("+68 M de citoyens n'ont rien demandé");
      expect(t).toContain('4,3 / 5');
      expect(t).toContain('avis vérifiés sur les lois que vous n\'avez pas lues');
    });
  });

  // ─── Pricing Tests ───────────────────────────────────────────────────────

  test.describe('Pricing', () => {
    test('section and cards', () => {
      expect(INDEX).toMatch(/<section id="tarifs" class="section pricing"[^>]*>/);
      expect(INDEX.match(/class="plan plan--legacy"/g)).toHaveLength(1);
      expect(INDEX.match(/class="plan plan--popular"/g)).toHaveLength(1);
      expect(getText()).toContain('POPULAIRE');
    });

    test('eight rows per card sixteen total', () => {
      expect(INDEX.match(/class="plan-row"/g)).toHaveLength(16);
      const legacy = INDEX.split('plan plan--legacy')[1].split('plan plan--popular')[0];
      const popular = INDEX.split('plan plan--popular')[1];
      expect(legacy.match(/class="plan-row"/g)).toHaveLength(8);
      expect(popular.match(/class="plan-row"/g)).toHaveLength(8);
    });

    test('plan copy', () => {
      const t = getText();
      for (const expected of [
        'Hérité · depuis 1958',
        'déjà payé par vos aînés',
        'Sans engagement — résiliable par révolution',
        'Nouveau',
        'inclus dans votre citoyenneté',
        'Engagé — révocable à tout moment',
      ]) {
        expect(t).toContain(expected);
      }
    });

    test('row labels present', () => {
      const t = getText();
      for (const label of [
        'Gouvernement nommé sans vote de l\'Assemblée',
        'Décret-loi 49.3',
        'Référendum d\'initiative citoyenne',
        'Révocation de votre élu',
        'Dissolution de l\'Assemblée',
        'Mandats renouvelables',
        'Amendement citoyen en ligne',
        'Support',
        'sans bouton d\'annulation',
        'avec bouton d\'annulation',
      ]) {
        expect(t).toContain(label);
      }
    });

    test('pricing has no animation', () => {
      const rules = cssRules('.pricing') + cssRules('.plan');
      expect(rules).not.toContain('animation');
      expect(rules).not.toContain('transition');
    });

    test('pricing capture ready', () => {
      const rules = cssRules('.pricing');
      expect(rules).toContain('background');
      expect(rules).toContain('#ffffff');
      expect(rules).toMatch(/max-width:\s*1080px/);
    });

    test('mobile orders popular first', () => {
      const matches = mediaBlocks()
        .filter((b) => b.condition.includes('768px') && b.body.includes('.plan--popular') && b.body.includes('order'));
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].body).toContain('order: -1');
    });
  });

  // ─── Feature Grid Tests ──────────────────────────────────────────────────

  test.describe('FeatureGrid', () => {
    test('section and six cards', () => {
      expect(INDEX).toContain('<section id="fonctionnalites"');
      expect(INDEX.match(/class="feature-card"/g)).toHaveLength(6);
    });

    test('every card has accessible info button', () => {
      const buttons = INDEX.match(/<button type="button" class="info-btn"[^>]*>/g) || [];
      expect(buttons.length).toBeGreaterThanOrEqual(6);
      for (const tag of buttons) {
        expect(tag).toContain('aria-expanded="false"');
        const m = tag.match(/aria-controls="([^"]+)"/);
        expect(m, 'aria-controls manquant').not.toBeNull();
        expect(INDEX).toContain(`id="${m![1]}"`);
      }
    });

    test('card titles', () => {
      const t = getText();
      for (const title of [
        'Article 49 al. 3',
        'Référendum d\'initiative citoyenne',
        'Révocation à tout moment',
        'Mandats non renouvelables',
        'Amendement citoyen en ligne',
        'Suivi de vos lois en direct',
      ]) {
        expect(t).toContain(title);
      }
    });

    test('grid three columns on desktop', () => {
      const rules = cssRules('.features-grid');
      expect(rules).toMatch(/grid-template-columns:\s*repeat\(3/);
    });
  });

  // ─── Tooltip Static Tests ────────────────────────────────────────────────

  test.describe('TooltipStatic', () => {
    test('js handles escape and outside click', () => {
      expect(JS).toContain('key === "Escape"');
      expect(JS).toContain('closest(".tip-wrap")');
    });

    test('js flips tooltip near viewport top', () => {
      expect(JS).toContain('getBoundingClientRect');
      expect(JS).toContain('tooltip--below');
      expect(CSS).toContain('tooltip--below');
    });

    test('js flips tooltip horizontally', () => {
      expect(JS).toContain('flipTooltipX');
    });
  });

  // ─── FAQ Tests ───────────────────────────────────────────────────────────

  test.describe('FAQ', () => {
    test('section and six items', () => {
      expect(INDEX).toContain('<section id="faq"');
      expect(INDEX.match(/class="faq-item"/g)).toHaveLength(6);
      expect(INDEX.match(/<details/g)).toHaveLength(6);
      expect(INDEX.match(/<summary>/g)).toHaveLength(6);
    });

    test('each answer has fine print', () => {
      expect(INDEX.match(/class="fine-print"/g)).toHaveLength(6);
    });

    test('faq questions', () => {
      const t = getText();
      for (const q of [
        'Puis-je résilier mon Plan 5ᵉ République ?',
        'Le Plan 6ᵉ est-il vraiment gratuit ?',
        'Que se passe-t-il si je ne vote pas ?',
        'Quelles méthodes de paiement acceptez-vous ?',
        'Le 49.3 peut-il être annulé ?',
        'Proposez-vous un essai gratuit ?',
      ]) {
        expect(t).toContain(q);
      }
    });

    test('fine print copy', () => {
      const t = getText();
      for (const line of [
        'L\'offre est reconduite tacitement depuis 1958, sans préavis.',
        '0 €/mois, engagement de 5 ans non renouvelable… pour vous.',
        'Aucun changement : votre Plan est mis à jour automatiquement.',
        'Impôts, CSG, TVA. Apple Pay n\'est pas encore disponible.',
        'Oui, désormais. L\'ancien modèle n\'avait pas de bouton.',
        'Vous êtes né dedans. C\'est l\'essai.',
      ]) {
        expect(t).toContain(line);
      }
    });

    test('js single open enforced', () => {
      expect(JS).toContain('preventDefault');
      expect(JS).toContain('.faq-item');
    });
  });

  // ─── Share Tests ─────────────────────────────────────────────────────────

  test.describe('Share', () => {
    test('section and buttons', () => {
      expect(INDEX).toContain('<section id="partage"');
      const platforms = INDEX.match(/data-platform="([^"]+)"/g) || [];
      const names = platforms.map((p) => p.replace(/data-platform="([^"]+)"/, '$1')).sort();
      expect(names).toEqual(['facebook', 'signal', 'whatsapp', 'x']);
    });

    test('copy button and feedback', () => {
      expect(INDEX).toContain('id="copy-link"');
      expect(INDEX).toContain('id="copy-feedback"');
      expect(INDEX).toContain('aria-live="polite"');
    });

    test('share copy', () => {
      const t = getText();
      expect(t).toContain('Ce plan se partage mieux que vos opinions');
      expect(t).toContain('Copier le lien');
    });

    test('share links work without js', () => {
      expect(INDEX).not.toContain('href="#"');
      expect(INDEX).toContain('href="https://wa.me/?text=');
      expect(INDEX).toContain('href="https://twitter.com/intent/tweet?');
      expect(INDEX).toContain(
        'href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fla-mise-a-jour.fr%2Fdemocratie%2F"'
      );
    });
  });

  // ─── Footer & A11y Tests ─────────────────────────────────────────────────

  test.describe('FooterA11y', () => {
    test('footer structure', () => {
      expect(INDEX).toContain('<footer class="site-footer">');
      const t = getText();
      expect(t).toContain('© 2026 La Mise à Jour');
      expect(t).toContain('Tous les systèmes sont dégradés');
      expect(t).toContain('49.3 : opérationnel');
      expect(t).toContain('Aucune donnée collectée, contrairement à vous');
    });

    test('footer links resolve', () => {
      for (const href of ['#fonctionnalites', '#tarifs', '#faq']) {
        expect(INDEX).toContain(`href="${href}"`);
      }
    });
  });
});

// ─── Hub Tests ───────────────────────────────────────────────────────────────

test.describe('HubSmoke', () => {
  test('hub has canonical root', () => {
    expect(HUB).toContain('<link rel="canonical" href="https://la-mise-a-jour.fr/">');
  });

  test('hub links to democratie', () => {
    expect(HUB).toContain('href="democratie/"');
  });

  test('hub has single h1', () => {
    expect(HUB.match(/<h1>/g)).toHaveLength(1);
  });

  test('hub loads local assets relatively', () => {
    expect(HUB).toContain('href="styles.css"');
    expect(HUB).toContain('src="main.js"');
  });
});

test.describe('HubCollection', () => {
  const grid = () => section(HUB, 'collection');

  test('hero copy and two ctas', () => {
    const t = bodyText(HUB);
    expect(t).toContain("Votre société n'a pas été mise à jour depuis 1958.");
    expect(t).toContain('Patch 2026.1 · Installation automatique');
    expect(t).toContain('Ouvrir la mise à jour Démocratie →');
    expect(t).toContain('Voir toutes les mises à jour');
    expect(HUB).toContain('href="democratie/"');
    expect(HUB).toContain('href="#collection"');
  });

  test('four update cards, one live', () => {
    expect(grid().match(/class="update-card/g)).toHaveLength(4);
    expect(grid().match(/class="update-card update-card--live"/g)).toHaveLength(1);
    expect(grid().match(/class="update-card update-card--soon"/g)).toHaveLength(3);
  });

  test('only the démocratie card links out', () => {
    const links = grid().match(/<a [^>]*href="[^"]*"/g) || [];
    expect(links).toHaveLength(1);
    expect(links[0]).toContain('href="democratie/"');
  });

  test('card statuses', () => {
    const t = bodyText(grid());
    expect(t).toContain('Disponible');
    expect(t).toContain('En bêta fermée');
    expect(t).toContain('Planifié');
    expect(t).toContain('Rédaction en cours');
  });

  test('card teasers match the spec copy', () => {
    const t = bodyText(grid());
    for (const teaser of [
      'Plan 5ᵉ vs Plan 6ᵉ : le 49.3 avec bouton d\'annulation, le RIC sorti de bêta fermée.',
      'Du pesticide au sol vivant : migration de l\'agriculture française, sans redémarrage à froid.',
      'Croissance, PIB et richesse réelle : le refactoring que tout le monde repousse depuis 1973.',
      'Production, réseau et sobriété : la seule migration qui ne peut pas être reportée à lundi.',
    ]) {
      expect(t, teaser).toContain(teaser);
    }
  });

  test('grid responsive', () => {
    const rules = cssRules('.updates-grid');
    expect(rules).toMatch(/grid-template-columns:\s*repeat\(4/);
    const mobile = mediaBlocks().filter(
      (b) => b.condition.includes('768px') && b.body.includes('.updates-grid')
    );
    expect(mobile.length).toBeGreaterThan(0);
    expect(mobile[0].body).toContain('1fr');
  });

  test('no raw colour in the new components', () => {
    const rules = cssRules('.update-card') + cssRules('.update-status') + cssRules('.updates-grid');
    expect(rules).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(rules).not.toContain('rgba');
  });

  test('primary on surface contrast', () => {
    expect(contrastRatio(token('--color-primary'), token('--color-surface'))).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('HubSections', () => {
  test('principe has three feature cards with info buttons', () => {
    const s = section(HUB, 'principe');
    expect(s.match(/class="feature-card"/g)).toHaveLength(3);
    const buttons = s.match(/<button type="button" class="info-btn"[^>]*>/g) || [];
    expect(buttons).toHaveLength(3);
    for (const tag of buttons) {
      expect(tag).toContain('aria-expanded="false"');
      const m = tag.match(/aria-controls="([^"]+)"/);
      expect(m).not.toBeNull();
      expect(s).toContain(`id="${m![1]}"`);
    }
    const t = bodyText(s);
    for (const title of ['Diagnostic', 'Comparaison', 'Changelog']) {
      expect(t).toContain(title);
    }
  });

  test('faq has three items with fine print', () => {
    const s = section(HUB, 'faq');
    expect(s.match(/class="faq-item"/g)).toHaveLength(3);
    expect(s.match(/<details/g)).toHaveLength(3);
    expect(s.match(/class="fine-print"/g)).toHaveLength(3);
    const t = bodyText(s);
    for (const q of [
      "C'est quoi, la-mise-a-jour.fr ?",
      'Pourquoi comparer la société à un logiciel ?',
      'Est-ce que je peux contribuer ?',
    ]) {
      expect(t).toContain(q);
    }
    expect(t).toContain('Les faits sont exacts. Seule l\'emballage est satirique.');
    expect(t).toContain('Pull requests bienvenues. 49.3 non requis.');
  });

  test('share section present with four platforms', () => {
    const s = section(HUB, 'partage');
    const platforms = s.match(/data-platform="([^"]+)"/g) || [];
    expect(platforms.map((p) => p.replace(/data-platform="([^"]+)"/, '$1')).sort())
      .toEqual(['facebook', 'signal', 'whatsapp', 'x']);
    expect(s).toContain('id="copy-link"');
    expect(s).toContain('id="copy-feedback"');
  });
});

// ─── Chrome (header) Tests ───────────────────────────────────────────────────

function structuralSignature(html: string, tag: 'header' | 'footer'): string {
  const m = html.match(new RegExp(`<${tag}[\\s\\S]*?</${tag}>`));
  if (!m) throw new Error(`${tag} absent`);
  return m[0]
    .replace(/>[^<]*</g, '><')
    .replace(/\s(?:href|src)="[^"]*"/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

test.describe('ChromeHeader', () => {
  for (const p of PAGES) {
    const html = read(p.file);

    test(`[${p.name}] header exposes the four slots`, () => {
      const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/);
      expect(header, 'header manquant').not.toBeNull();
      expect(header![0]).toContain('class="brand"');
      expect(header![0]).toContain('<nav class="site-nav" aria-label="Navigation principale">');
      expect(header![0]).toContain('class="status-badge"');
      expect(header![0]).toContain('href="#partage"');
      const navLinks = header![0].match(/<nav[\s\S]*?<\/nav>/)![0].match(/<a /g) || [];
      expect(navLinks).toHaveLength(3);
    });

    test(`[${p.name}] exactly one non-empty brand badge`, () => {
      const badges = html.match(/<span class="brand-badge">[^<]+<\/span>/g) || [];
      expect(badges).toHaveLength(1);
    });

    test(`[${p.name}] nav anchors resolve`, () => {
      const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/)![0];
      const nav = header.match(/<nav[\s\S]*?<\/nav>/)![0];
      for (const a of nav.match(/href="#([^"]+)"/g) || []) {
        const id = a.replace(/href="#([^"]+)"/, '$1');
        expect(html, `ancre de nav morte : #${id}`).toContain(`id="${id}"`);
      }
    });
  }

  test('header structure is identical across pages', () => {
    const sigs = PAGES.map((p) => structuralSignature(read(p.file), 'header'));
    expect(new Set(sigs).size, 'header divergent entre les pages').toBe(1);
  });

  test('hub header copy', () => {
    const header = HUB.match(/<header class="site-header">[\s\S]*?<\/header>/)![0];
    expect(header).toContain('la-mise-a-jour <span class="brand-badge">v2026.1</span>');
    expect(header).toContain('href="#main"');
    expect(header).toContain('Statut : 1 / 4 disponible');
    const nav = header.match(/<nav[\s\S]*?<\/nav>/)![0];
    expect(nav).toContain('href="#collection"');
    expect(nav).toContain('href="#principe"');
    expect(nav).toContain('href="#faq"');
  });

  test('democratie header copy', () => {
    const header = INDEX.match(/<header class="site-header">[\s\S]*?<\/header>/)![0];
    expect(header).toContain('la-mise-a-jour <span class="brand-badge">Citoyen 2.0</span>');
    expect(header).toContain('href="../"');
    expect(header).toContain('Statut : 49.3 opérationnel');
    const nav = header.match(/<nav[\s\S]*?<\/nav>/)![0];
    expect(nav).toContain('href="#fonctionnalites"');
    expect(nav).toContain('href="#tarifs"');
    expect(nav).toContain('href="#faq"');
  });
});

// ─── Chrome (footer) Tests ───────────────────────────────────────────────────

function footerHrefs(html: string, pageUrl: string): string[] {
  const footer = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/);
  if (!footer) throw new Error('footer absent');
  const hrefs = footer[0].match(/href="([^"]+)"/g) || [];
  return hrefs.map((h) => {
    const raw = h.replace(/href="([^"]+)"/, '$1');
    return new URL(raw, pageUrl).toString();
  }).sort();
}

test.describe('ChromeFooter', () => {
  for (const p of PAGES) {
    const html = read(p.file);

    test(`[${p.name}] footer copy is platform level`, () => {
      const t = bodyText(html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)![0]);
      expect(t).toContain('Toutes les mises à jour');
      expect(t).toContain('Comment ça marche');
      expect(t).toContain('Aucune donnée collectée, contrairement à vous');
      expect(t).toContain('Tous les systèmes sont dégradés');
      expect(t).toContain('49.3 : opérationnel');
      expect(t).toContain('© 2026 La Mise à Jour');
    });

    test(`[${p.name}] footer links reach an existing target`, () => {
      const footer = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)![0];
      for (const raw of (footer.match(/href="([^"]+)"/g) || []).map((h) => h.replace(/href="([^"]+)"/, '$1'))) {
        const resolved = new URL(raw, p.url);
        const target = PAGES.find((x) => x.url === resolved.origin + resolved.pathname);
        expect(target, `cible inconnue : ${raw}`).toBeTruthy();
        if (resolved.hash) {
          expect(read(target!.file), `ancre morte ${raw}`).toContain(`id="${resolved.hash.slice(1)}"`);
        }
      }
    });
  }

  test('footer structure is identical across pages', () => {
    const sigs = PAGES.map((p) => structuralSignature(read(p.file), 'footer'));
    expect(new Set(sigs).size, 'footer divergent entre les pages').toBe(1);
  });

  test('footer resolves to the same urls everywhere', () => {
    const sets = PAGES.map((p) => footerHrefs(read(p.file), p.url));
    for (let i = 1; i < sets.length; i++) {
      expect(sets[i], `footer de ${PAGES[i].name} divergent`).toEqual(sets[0]);
    }
  });
});

// ─── Sitemap Tests ───────────────────────────────────────────────────────────

test.describe('Sitemap', () => {
  test('sitemap lists exactly the registry pages', () => {
    const locs = [...SITEMAP.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    expect(locs).toEqual(PAGES.map((p) => p.url).sort());
  });

  test('robots points to sitemap', () => {
    expect(read('robots.txt')).toContain('Sitemap: https://la-mise-a-jour.fr/sitemap.xml');
  });
});

// ─── Collection Strip Tests ──────────────────────────────────────────────────

test.describe('CollectionStrip', () => {
  test('hub has no strip (it is the collection)', () => {
    expect(HUB).not.toContain('class="collection"');
  });

  for (const p of PAGES.filter((x) => x.sub)) {
    const html = read(p.file);

    test(`[${p.name}] strip lists delivered pages and planned badges`, () => {
      const strip = html.match(/<nav class="collection"[\s\S]*?<\/nav>/);
      expect(strip, 'bandeau collection manquant').not.toBeNull();
      const s = strip![0];

      const others = PAGES.filter((x) => x.sub && x.name !== p.name);
      const links = (s.match(/href="([^"]+)"/g) || []).map((h) => h.replace(/href="([^"]+)"/, '$1'));
      expect(links).toHaveLength(others.length);
      for (const other of others) {
        expect(links).toContain(`../${other.name}/`);
      }

      const t = bodyText(s);
      for (const planned of PLANNED) {
        expect(t, `badge manquant : ${planned.name}`).toContain(`${planned.name} ${planned.status}`);
      }
      expect(t).toContain('Autres mises à jour disponibles');
      expect(s).not.toContain(`href="../${p.name}/"`);
    });

    test(`[${p.name}] strip sits right before the footer`, () => {
      const i = html.indexOf('<nav class="collection"');
      const navEnd = html.indexOf('</nav>', i);
      const f = html.indexOf('<footer class="site-footer">');
      expect(i, 'bandeau absent').toBeGreaterThan(-1);
      expect(navEnd, '</nav> manquant').toBeGreaterThan(i);
      expect(f, 'footer absent').toBeGreaterThan(navEnd);
      expect(
        html.slice(navEnd + '</nav>'.length, f).trim(),
        'seul du blanc doit séparer le bandeau du footer'
      ).toBe('');
    });
  }

  test('strip statuses match the hub cards', () => {
    const grid = section(HUB, 'collection');
    for (const planned of PLANNED) {
      expect(grid, `carte ${planned.name}`).toContain(planned.name);
      const card = grid.split(planned.name)[0].split('<article').pop()!;
      expect(card, `statut de ${planned.name}`).toContain(planned.status.charAt(0).toUpperCase() + planned.status.slice(1));
    }
  });
});