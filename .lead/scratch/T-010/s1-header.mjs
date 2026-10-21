#!/usr/bin/env node
// T-010 S1: rewrite page chrome on every localized page.
//  - Google Fonts link -> Manrope 400-800 + Fraunces 600 (normal + italic), display=swap (keeps the 2 preconnects;
//    adds preconnects + link on pages that had none).
//  - Removes the animated background markup (<div class="bg-dynamic">…</div>).
//  - Header -> B v2 structure: .site-header > .container.nav > .brand, nav.navlinks, .nav-end
//    (language picker, "Get the app" button, menu button). Existing brand link, nav hrefs/texts and the
//    language selector are kept verbatim; the header Play badge becomes a .btn.btn-sm with the same
//    href / data-track-download / data-page-type / data-cta-location="header" (/ data-article-slug).
//  - Pages without a header get the same header (nav copied from the locale's root-level newsletter page).
// Idempotent: pages that already have <header class="site-header"> keep their header.
// Usage: node .lead/scratch/T-010/s1-header.mjs [--dry]
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");
const LOCALES = ["en", "es", "fr", "pt"];
const DRY = process.argv.includes("--dry");
const PLAY_URL = "https://play.google.com/store/apps/details?id=com.gurrulabs.raffy";
const FONT_LINK = '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&display=swap" rel="stylesheet">';
const PRECONNECTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';

const L10N = {
  en: { cta: "Get the app", menu: "Menu", nav: "Main" },
  es: { cta: "Descargar la app", menu: "Menú", nav: "Principal" },
  fr: { cta: "Télécharger l'app", menu: "Menu", nav: "Principale" },
  pt: { cta: "Baixar o app", menu: "Menu", nav: "Principal" }
};
// Template pages (same directory level as the header-less pages: locale root)
const NAV_TEMPLATE = { en: "en/newsletter.html", es: "es/boletin.html", fr: "fr/newsletter.html", pt: "pt/boletim.html" };
const LANG_TEMPLATE = { en: "en/privacy.html", es: "es/privacidad.html", fr: "fr/confidentialite.html", pt: "pt/privacidade.html" };

const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 3.5v17l14-8.5Z"/></svg>';
const ICON_MENU = '<svg class="ico-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
const ICON_CLOSE = '<svg class="ico-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>';

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];

function parseHeader(block, rel) {
  const brand = block.match(/<a class="brand"[\s\S]*?<\/a>/);
  const nav = block.match(/<nav class="navlinks"[^>]*>([\s\S]*?)<\/nav>/);
  const lang = block.match(/<div class="lang-switch">[\s\S]*?<\/select>\s*<\/div>/);
  const badge = block.match(/<a class="play-store-badge-link[^"]*"[^>]*data-cta-location="header"[^>]*>/);
  if (!brand || !nav || !lang || !badge) throw new Error(`${rel}: unexpected header structure`);
  const links = [...nav[1].matchAll(/<a\s[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
  return {
    brand: brand[0],
    links,
    lang: lang[0],
    pageType: attr(badge[0], "data-page-type"),
    articleSlug: attr(badge[0], "data-article-slug")
  };
}

function normalizeLang(langBlock) {
  // Re-indent and add the B v2 .lang class to the select (id, data-language-selector, aria-label kept).
  const label = langBlock.match(/<label[\s\S]*?<\/label>/)[0];
  let select = langBlock.match(/<select[\s\S]*?<\/select>/)[0];
  if (!/<select[^>]*class="/.test(select)) select = select.replace("<select ", '<select class="lang" ');
  const open = select.match(/<select[^>]*>/)[0];
  const options = [...select.matchAll(/<option[^>]*>[^<]*<\/option>/g)].map((m) => m[0]);
  return [
    '<div class="lang-switch">',
    `          ${label}`,
    `          ${open}`,
    ...options.map((o) => `            ${o}`),
    "          </select>",
    "        </div>"
  ].join("\n");
}

function isCurrent(rel, href) {
  if (!href || href.includes("#") || /^[a-z]+:/i.test(href)) return false;
  const fileUrl = new URL(`file:///${rel}`);
  const target = new URL(href, fileUrl).pathname.replace(/^\//, "");
  if (target === rel) return true;
  // Section pages (articles/…, tools/…): the link to the section index is the current section.
  const dir = path.posix.dirname(rel);
  if (dir.split("/").length < 2) return false;
  return target === `${dir}/index.html` || target === `${dir}/`;
}

function markCurrent(rel, links) {
  return links.map((a) => {
    const clean = a.replace(/\saria-current="[^"]*"/, "");
    const href = attr(clean, "href");
    return isCurrent(rel, href) ? clean.replace(/^<a /, '<a aria-current="page" ') : clean;
  });
}

function buildHeader(locale, rel, h) {
  const t = L10N[locale];
  const dataAttrs = [
    `href="${PLAY_URL}"`,
    'data-track-download="true"',
    `data-page-type="${h.pageType}"`,
    'data-cta-location="header"',
    h.articleSlug ? `data-article-slug="${h.articleSlug}"` : null
  ].filter(Boolean).join(" ");
  const links = markCurrent(rel, h.links);
  return [
    '<header class="site-header">',
    '    <div class="container nav">',
    `      ${h.brand.replace(/\n\s*/g, "\n        ").replace(/\n\s*<\/a>$/, "\n      </a>")}`,
    `      <nav class="navlinks" id="site-nav" aria-label="${t.nav}">`,
    ...links.map((a) => `        ${a}`),
    "      </nav>",
    '      <div class="nav-end">',
    `        ${normalizeLang(h.lang)}`,
    `        <a class="btn btn-sm" ${dataAttrs}>${ICON_PLAY}${t.cta}</a>`,
    `        <button class="menu-btn" type="button" aria-label="${t.menu}" aria-expanded="false" aria-controls="site-nav">${ICON_MENU}${ICON_CLOSE}</button>`,
    "      </div>",
    "    </div>",
    "  </header>"
  ].join("\n");
}

function pageTypeFromKey(key) {
  return key || "trust";
}

// Parse the template headers up front (before their pages are rewritten). On a re-run they are
// already B v2 headers and header-less pages no longer exist, so templates are not needed.
const templates = {};
for (const locale of LOCALES) {
  try {
    const headerRe0 = /<header>[\s\S]*?<\/header>/;
    const nav = parseHeader(read(NAV_TEMPLATE[locale]).match(headerRe0)[0], NAV_TEMPLATE[locale]);
    const lang = parseHeader(read(LANG_TEMPLATE[locale]).match(headerRe0)[0], LANG_TEMPLATE[locale]);
    templates[locale] = { nav, lang };
  } catch (error) {
    templates[locale] = null;
  }
}

const report = { fonts: 0, fontsAdded: 0, bg: 0, headers: 0, headersAdded: 0, skipped: [] };
const files = LOCALES.flatMap((l) => walk(path.join(ROOT, l))).map((p) => path.relative(ROOT, p).split(path.sep).join("/"));

for (const rel of files) {
  const locale = rel.split("/")[0];
  let html = read(rel);
  const before = html;

  // 1. Fonts
  const fontRe = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*" rel="stylesheet">/;
  if (fontRe.test(html)) {
    if (!html.includes(FONT_LINK)) { html = html.replace(fontRe, FONT_LINK); report.fonts++; }
  } else if (!html.includes("fonts.googleapis.com/css2")) {
    html = html.replace(/(\n\s*)(<link rel="stylesheet")/, `$1${PRECONNECTS}$1${FONT_LINK}$1$2`);
    report.fontsAdded++;
  }

  // 2. Animated background markup
  const bgRe = /<div class="bg-dynamic"[^>]*>[\s\S]*?<\/div>\s*/;
  if (bgRe.test(html)) { html = html.replace(bgRe, ""); report.bg++; }

  // 3. Header
  const headerRe = /<header>[\s\S]*?<\/header>/;
  if (/<header class="site-header">/.test(html)) {
    report.skipped.push(rel);
  } else if (headerRe.test(html)) {
    const parsed = parseHeader(html.match(headerRe)[0], rel);
    html = html.replace(headerRe, buildHeader(locale, rel, parsed));
    report.headers++;
  } else {
    if (rel.split("/").length !== 2) throw new Error(`${rel}: header-less page outside the locale root`);
    if (!templates[locale]) throw new Error(`${rel}: no template header available for ${locale}`);
    const { nav: navTpl, lang: langTpl } = templates[locale];
    const key = (html.match(/<body[^>]*data-page-key="([^"]*)"/) || [])[1];
    const parsed = { brand: langTpl.brand, links: navTpl.links, lang: langTpl.lang, pageType: pageTypeFromKey(key) };
    html = html.replace(/(<body[^>]*>\n)/, `$1  ${buildHeader(locale, rel, parsed)}\n`);
    report.headersAdded++;
  }

  if (html !== before && !DRY) fs.writeFileSync(path.join(ROOT, rel), html);
}

console.log(JSON.stringify(report, null, 2));
