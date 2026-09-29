import html as html_mod
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "styles.css").read_text(encoding="utf-8")
JS = (ROOT / "main.js").read_text(encoding="utf-8")


def text():
    """Texte visible de la page, entités et espaces insécables normalisés."""
    body = INDEX.split("<body", 1)[1].split(">", 1)[1]
    body = html_mod.unescape(body).replace("\xa0", " ")
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", body))


def css_rules(selector_prefix):
    """Concatène les corps de règles dont le sélecteur commence par le préfixe."""
    pattern = re.compile(
        r"([^{}]*" + re.escape(selector_prefix) + r"[^{}]*)\{([^{}]*)\}"
    )
    return " ".join(m.group(2) for m in pattern.finditer(CSS))


class SiteStructureTests(unittest.TestCase):
    def test_lang_is_french(self):
        self.assertIn('<html lang="fr">', INDEX)

    def test_share_meta_are_absolute_https(self):
        for prop in ("og:url", "og:image"):
            m = re.search(rf'<meta property="{prop}" content="([^"]+)"', INDEX)
            self.assertIsNotNone(m, f"meta {prop} manquante")
            self.assertTrue(
                m.group(1).startswith("https://plan-democratie.fr/"),
                f"{prop} doit être absolue et sur le domaine canonique",
            )

    def test_twitter_card_present(self):
        self.assertIn('<meta name="twitter:card" content="summary_large_image">', INDEX)

    def test_no_external_assets(self):
        self.assertNotRegex(INDEX, r'<script[^>]+src="https?://')
        self.assertNotRegex(INDEX, r'<link[^>]+rel="stylesheet"[^>]+href="https?://')

    def test_links_local_assets(self):
        self.assertIn('href="styles.css"', INDEX)
        self.assertIn('src="main.js"', INDEX)

    def test_design_tokens_defined(self):
        for token in (
            "--color-bg",
            "--color-surface",
            "--color-text",
            "--color-text-muted",
            "--color-primary",
            "--color-danger",
            "--color-success",
        ):
            self.assertRegex(CSS, rf"{token}:\s*#[0-9a-fA-F]{{6}}")

    def test_skip_link_present(self):
        self.assertIn('<a class="skip-link" href="#main">', INDEX)

    def test_no_calculator_mention(self):
        for name, content in (("index.html", INDEX), ("styles.css", CSS), ("main.js", JS)):
            self.assertNotIn("calculateur", content.lower(), name)


class HeaderHeroTests(unittest.TestCase):
    def test_status_badge_text(self):
        self.assertIn("Statut : 49.3 opérationnel", text())

    def test_nav_is_internal_only(self):
        for href in re.findall(r'<a href="(#[^"]+)"', INDEX):
            self.assertTrue(href.startswith("#"))
        self.assertIn('href="#fonctionnalites"', INDEX)
        self.assertIn('href="#tarifs"', INDEX)
        self.assertIn('href="#faq"', INDEX)
        self.assertIn('href="#partage"', INDEX)

    def test_hero_headline(self):
        self.assertIn("Quel est votre plan de citoyenneté ?", text())

    def test_hero_has_two_ctas(self):
        cta = re.findall(r'class="btn btn-[a-z]+"[^>]*>([^<]+)<', INDEX)
        self.assertIn("Voir les plans", cta)
        self.assertIn("Comparer les plans", cta)

    def test_logo_band_has_four_partners(self):
        self.assertEqual(INDEX.count('class="logo-item"'), 4)
        for name in ("Assemblée nationale", "Sénat", "Conseil constitutionnel", "Partenaires indéterminés"):
            self.assertIn(name, text())


class SocialProofTests(unittest.TestCase):
    def test_proof_numbers(self):
        t = text()
        self.assertIn("+68 M de citoyens n'ont rien demandé", t)
        self.assertIn("4,3 / 5", t)
        self.assertIn("avis vérifiés sur les lois que vous n'avez pas lues", t)


def media_blocks():
    """Liste (condition, corps) de chaque bloc @media, accolades équilibrées."""
    blocks = []
    for m in re.finditer(r"@media([^{]+)\{", CSS):
        depth, i, start = 1, m.end(), m.end()
        while depth:
            if CSS[i] == "{":
                depth += 1
            elif CSS[i] == "}":
                depth -= 1
            i += 1
        blocks.append((m.group(1).strip(), CSS[start:i - 1]))
    return blocks


class PricingTests(unittest.TestCase):
    def test_section_and_cards(self):
        self.assertRegex(INDEX, r'<section id="tarifs" class="section pricing"[^>]*>')
        self.assertEqual(INDEX.count('class="plan plan--legacy"'), 1)
        self.assertEqual(INDEX.count('class="plan plan--popular"'), 1)
        self.assertIn("POPULAIRE", text())

    def test_eight_rows_per_card_sixteen_total(self):
        self.assertEqual(INDEX.count('class="plan-row"'), 16)
        legacy = INDEX.split('plan plan--legacy', 1)[1].split("plan plan--popular", 1)[0]
        popular = INDEX.split("plan plan--popular", 1)[1]
        self.assertEqual(legacy.count('class="plan-row"'), 8)
        self.assertEqual(popular.count('class="plan-row"'), 8)

    def test_plan_copy(self):
        t = text()
        for expected in (
            "Hérité · depuis 1958",
            "déjà payé par vos aînés",
            "Sans engagement — résiliable par révolution",
            "Nouveau",
            "inclus dans votre citoyenneté",
            "Engagé — révocable à tout moment",
        ):
            self.assertIn(expected, t)

    def test_row_labels_present(self):
        t = text()
        for label in (
            "Gouvernement nommé sans vote de l'Assemblée",
            "Décret-loi 49.3",
            "Référendum d'initiative citoyenne",
            "Révocation de votre élu",
            "Dissolution de l'Assemblée",
            "Mandats renouvelables",
            "Amendement citoyen en ligne",
            "Support",
            "sans bouton d'annulation",
            "avec bouton d'annulation",
        ):
            self.assertIn(label, t)

    def test_pricing_has_no_animation(self):
        rules = css_rules(".pricing") + css_rules(".plan")
        self.assertNotIn("animation", rules)
        self.assertNotIn("transition", rules)

    def test_pricing_capture_ready(self):
        rules = css_rules(".pricing")
        self.assertIn("background", rules)
        self.assertIn("#ffffff", rules)
        self.assertRegex(rules, r"max-width:\s*1080px")

    def test_mobile_orders_popular_first(self):
        matches = [
            body for cond, body in media_blocks()
            if "768px" in cond and ".plan--popular" in body and "order" in body
        ]
        self.assertTrue(matches, "le Plan 6ᵉ doit passer en premier sur mobile")
        self.assertIn("order: -1", matches[0])


class FeatureGridTests(unittest.TestCase):
    def test_section_and_six_cards(self):
        self.assertIn('<section id="fonctionnalites"', INDEX)
        self.assertEqual(INDEX.count('class="feature-card"'), 6)

    def test_every_card_has_accessible_info_button(self):
        buttons = re.findall(r'<button type="button" class="info-btn"[^>]*>', INDEX)
        self.assertGreaterEqual(len(buttons), 6)
        for tag in re.findall(r'<button[^>]*class="info-btn"[^>]*>', INDEX):
            self.assertIn('aria-expanded="false"', tag)
            m = re.search(r'aria-controls="([^"]+)"', tag)
            self.assertIsNotNone(m, "aria-controls manquant")
            self.assertIn(f'id="{m.group(1)}"', INDEX)

    def test_card_titles(self):
        t = text()
        for title in (
            "Article 49 al. 3",
            "Référendum d'initiative citoyenne",
            "Révocation à tout moment",
            "Mandats non renouvelables",
            "Amendement citoyen en ligne",
            "Suivi de vos lois en direct",
        ):
            self.assertIn(title, t)

    def test_grid_three_columns_on_desktop(self):
        rules = css_rules(".features-grid")
        self.assertRegex(rules, r"grid-template-columns:\s*repeat\(3")


class TooltipStaticTests(unittest.TestCase):
    def test_js_handles_escape_and_outside_click(self):
        self.assertIn('key === "Escape"', JS)
        self.assertIn("closest(\".tip-wrap\")", JS)

    def test_js_flips_tooltip_near_viewport_top(self):
        self.assertIn("getBoundingClientRect", JS)
        self.assertIn("tooltip--below", JS)
        self.assertIn("tooltip--below", CSS)

    def test_js_flips_tooltip_horizontally(self):
        self.assertIn("flipTooltipX", JS)


class FaqTests(unittest.TestCase):
    def test_section_and_six_items(self):
        self.assertIn('<section id="faq"', INDEX)
        self.assertEqual(INDEX.count('class="faq-item"'), 6)
        self.assertEqual(INDEX.count("<details"), 6)
        self.assertEqual(INDEX.count("<summary>"), 6)

    def test_each_answer_has_fine_print(self):
        self.assertEqual(INDEX.count('class="fine-print"'), 6)

    def test_faq_questions(self):
        t = text()
        for q in (
            "Puis-je résilier mon Plan 5ᵉ République ?",
            "Le Plan 6ᵉ est-il vraiment gratuit ?",
            "Que se passe-t-il si je ne vote pas ?",
            "Quelles méthodes de paiement acceptez-vous ?",
            "Le 49.3 peut-il être annulé ?",
            "Proposez-vous un essai gratuit ?",
        ):
            self.assertIn(q, t)

    def test_fine_print_copy(self):
        t = text()
        for line in (
            "L'offre est reconduite tacitement depuis 1958, sans préavis.",
            "0 €/mois, engagement de 5 ans non renouvelable… pour vous.",
            "Aucun changement : votre Plan est mis à jour automatiquement.",
            "Impôts, CSG, TVA. Apple Pay n'est pas encore disponible.",
            "Oui, désormais. L'ancien modèle n'avait pas de bouton.",
            "Vous êtes né dedans. C'est l'essai.",
        ):
            self.assertIn(line, t)

    def test_js_single_open_enforced(self):
        self.assertIn("preventDefault", JS)
        self.assertIn(".faq-item", JS)


class ShareTests(unittest.TestCase):
    def test_section_and_buttons(self):
        self.assertIn('<section id="partage"', INDEX)
        platforms = re.findall(r'data-platform="([^"]+)"', INDEX)
        self.assertEqual(sorted(platforms), ["facebook", "signal", "whatsapp", "x"])

    def test_copy_button_and_feedback(self):
        self.assertIn('id="copy-link"', INDEX)
        self.assertIn('id="copy-feedback"', INDEX)
        self.assertIn("aria-live=\"polite\"", INDEX)

    def test_share_copy(self):
        t = text()
        self.assertIn("Ce plan se partage mieux que vos opinions", t)
        self.assertIn("Copier le lien", t)

    def test_js_has_native_share_endpoints(self):
        self.assertIn("https://wa.me/?text=", JS)
        self.assertIn("https://twitter.com/intent/tweet", JS)
        self.assertIn("https://www.facebook.com/sharer/sharer.php?u=", JS)
        self.assertIn('https://plan-democratie.fr/', JS)
        self.assertNotIn("localhost", JS)

    def test_share_links_work_without_js(self):
        self.assertNotIn('href="#"', INDEX)
        self.assertIn('href="https://wa.me/?text=', INDEX)
        self.assertIn('href="https://twitter.com/intent/tweet?', INDEX)
        self.assertIn(
            'href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fplan-democratie.fr%2F"',
            INDEX,
        )


def hex_to_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def _channel(c):
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(hex_color):
    r, g, b = (_channel(c) for c in hex_to_rgb(hex_color))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(fg, bg):
    l1, l2 = relative_luminance(fg), relative_luminance(bg)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def token(name):
    m = re.search(rf"{name}:\s*(#[0-9a-fA-F]{{6}})", CSS)
    assert m, f"jeton {name} introuvable"
    return m.group(1)


class FooterA11yTests(unittest.TestCase):
    def test_footer_structure(self):
        self.assertIn('<footer class="site-footer">', INDEX)
        self.assertIn("© 2026 Citoyen 2.0", text())
        self.assertIn("Tous les systèmes sont dégradés", text())
        self.assertIn("49.3 : opérationnel", text())
        self.assertIn("Aucune donnée collectée, contrairement à vous", text())

    def test_footer_links_resolve(self):
        for href in ("#fonctionnalites", "#tarifs", "#faq"):
            self.assertIn(f'href="{href}"', INDEX)

    def test_focus_visible_style(self):
        self.assertIn(":focus-visible", CSS)

    def test_media_queries_present(self):
        conds = [cond for cond, _ in media_blocks()]
        self.assertTrue(any("768px" in c for c in conds))
        self.assertTrue(any("1024px" in c for c in conds))

    def test_contrast_aa(self):
        pairs = [
            (token("--color-text"), token("--color-bg")),
            (token("--color-text-muted"), token("--color-surface")),
            ("#ffffff", token("--color-primary")),
            (token("--color-danger"), token("--color-surface")),
            (token("--color-success"), token("--color-surface")),
        ]
        for fg, bg in pairs:
            self.assertGreaterEqual(
                contrast_ratio(fg, bg), 4.5,
                f"{fg} sur {bg} est sous 4,5:1",
            )


class IntegrationTests(unittest.TestCase):
    def test_all_internal_links_resolve(self):
        for href in re.findall(r'href="#([^"]+)"', INDEX):
            self.assertIn(f'id="{href}"', INDEX, f"ancre morte : #{href}")

    def test_single_h1(self):
        self.assertEqual(INDEX.count("<h1>"), 1)

    def test_deferred_script(self):
        self.assertIn('<script src="main.js" defer></script>', INDEX)

    def test_readme_exists(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        for expected in ("python3 -m http.server", "python3 -m unittest", "og.png"):
            self.assertIn(expected, readme)


if __name__ == "__main__":
    unittest.main()
