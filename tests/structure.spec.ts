import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
const CSS = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf-8');
const JS = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf-8');

function getText(): string {
  const body = INDEX.split('<body')[1].split('>').slice(1).join('>');
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

// ─── Site Structure Tests ────────────────────────────────────────────────────

test.describe('SiteStructure', () => {
  test('lang is french', () => {
    expect(INDEX).toContain('<html lang="fr">');
  });

  test('share meta are absolute https', () => {
    for (const prop of ['og:url', 'og:image']) {
      const m = INDEX.match(new RegExp(`<meta property="${prop}" content="([^"]+)"`));
      expect(m, `meta ${prop} manquante`).not.toBeNull();
      expect(m![1].startsWith('https://la-mise-a-jour.fr/')).toBe(true);
    }
  });

  test('twitter card present', () => {
    expect(INDEX).toContain('<meta name="twitter:card" content="summary_large_image">');
  });

  test('no external assets', () => {
    expect(INDEX).not.toMatch(/<script[^>]+src="https?:\/\//);
    expect(INDEX).not.toMatch(/<link[^>]+rel="stylesheet"[^>]+href="https?:\/\//);
  });

  test('links local assets', () => {
    expect(INDEX).toContain('href="styles.css"');
    expect(INDEX).toContain('src="main.js"');
  });

  test('design tokens defined', () => {
    for (const t of [
      '--color-bg',
      '--color-surface',
      '--color-text',
      '--color-text-muted',
      '--color-primary',
      '--color-danger',
      '--color-success',
    ]) {
      expect(CSS).toMatch(new RegExp(`${t}:\\s*#[0-9a-fA-F]{6}`));
    }
  });

  test('skip link present', () => {
    expect(INDEX).toContain('<a class="skip-link" href="#main">');
  });

  test('no calculator mention', () => {
    for (const [name, content] of [
      ['index.html', INDEX],
      ['styles.css', CSS],
      ['main.js', JS],
    ] as const) {
      expect(content.toLowerCase(), name).not.toContain('calculateur');
    }
  });
});

// ─── Header & Hero Tests ─────────────────────────────────────────────────────

test.describe('HeaderHero', () => {
  test('status badge text', () => {
    expect(getText()).toContain('Statut : 49.3 opérationnel');
  });

  test('nav is internal only', () => {
    const hrefs = INDEX.match(/<a href="(#[^"]+)"/g) || [];
    for (const href of hrefs) {
      expect(href).toMatch(/^<a href="#/);
    }
    expect(INDEX).toContain('href="#fonctionnalites"');
    expect(INDEX).toContain('href="#tarifs"');
    expect(INDEX).toContain('href="#faq"');
    expect(INDEX).toContain('href="#partage"');
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

// ─── Social Proof Tests ──────────────────────────────────────────────────────

test.describe('SocialProof', () => {
  test('proof numbers', () => {
    const t = getText();
    expect(t).toContain("+68 M de citoyens n'ont rien demandé");
    expect(t).toContain('4,3 / 5');
    expect(t).toContain('avis vérifiés sur les lois que vous n\'avez pas lues');
  });
});

// ─── Pricing Tests ───────────────────────────────────────────────────────────

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

// ─── Feature Grid Tests ──────────────────────────────────────────────────────

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

// ─── Tooltip Static Tests ────────────────────────────────────────────────────

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

// ─── FAQ Tests ───────────────────────────────────────────────────────────────

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

// ─── Share Tests ─────────────────────────────────────────────────────────────

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

  test('js has native share endpoints', () => {
    expect(JS).toContain('https://wa.me/?text=');
    expect(JS).toContain('https://twitter.com/intent/tweet');
    expect(JS).toContain('https://www.facebook.com/sharer/sharer.php?u=');
    expect(JS).toContain('https://la-mise-a-jour.fr/');
    expect(JS).not.toContain('localhost');
  });

  test('share links work without js', () => {
    expect(INDEX).not.toContain('href="#"');
    expect(INDEX).toContain('href="https://wa.me/?text=');
    expect(INDEX).toContain('href="https://twitter.com/intent/tweet?');
    expect(INDEX).toContain(
      'href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fla-mise-a-jour.fr%2F"'
    );
  });
});

// ─── Footer & A11y Tests ─────────────────────────────────────────────────────

test.describe('FooterA11y', () => {
  test('footer structure', () => {
    expect(INDEX).toContain('<footer class="site-footer">');
    const t = getText();
    expect(t).toContain('© 2026 Citoyen 2.0');
    expect(t).toContain('Tous les systèmes sont dégradés');
    expect(t).toContain('49.3 : opérationnel');
    expect(t).toContain('Aucune donnée collectée, contrairement à vous');
  });

  test('footer links resolve', () => {
    for (const href of ['#fonctionnalites', '#tarifs', '#faq']) {
      expect(INDEX).toContain(`href="${href}"`);
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
});

// ─── Integration Tests ───────────────────────────────────────────────────────

test.describe('Integration', () => {
  test('all internal links resolve', () => {
    const hrefs = INDEX.match(/href="#([^"]+)"/g) || [];
    for (const href of hrefs) {
      const id = href.replace(/href="#([^"]+)"/, '$1');
      expect(INDEX, `ancre morte : #${id}`).toContain(`id="${id}"`);
    }
  });

  test('single h1', () => {
    expect(INDEX.match(/<h1>/g)).toHaveLength(1);
  });

  test('deferred script', () => {
    expect(INDEX).toContain('<script src="main.js" defer></script>');
  });

  test('readme exists', () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf-8');
    for (const expected of ['python3 -m http.server', 'og.png']) {
      expect(readme).toContain(expected);
    }
  });
});
