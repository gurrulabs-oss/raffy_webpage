#!/usr/bin/env node
// T-010 S4: rebuild article pages + the article library to the B v2 design. Locale-agnostic.
//
// Usage: node .lead/scratch/T-010/articles-transform.mjs <articles-dir> [--dry] [--locale en|es|fr|pt]
//   e.g. node .lead/scratch/T-010/articles-transform.mjs en/articles
// The locale defaults to the first path segment (en/es/fr/pt).
// Idempotent: pages that already have <header class="article-hero"> are left alone (the library is detected the same way).
// Run it on the whole directory: related-article cards and library cards read the reading time ("data-minutes")
// and cover of the target pages, whether those were already converted or not.
//
// What it does for an article page (legacy markup: main.article-wrap > article.article-card):
//   - mint .article-hero: breadcrumb (labels from the page's BreadcrumbList JSON-LD, hrefs from the header nav),
//     eyebrow (old .chip text), h1, excerpt, byline "<editorial team> · N min read"
//   - cover figure (kept) moved below the hero; portrait/square images get the .is-poster treatment
//   - table of contents from the H2s (adds ids, text untouched): sticky sidebar + mobile <details>
//   - prose: tip paragraphs (<p><strong>"What helps most:"</strong> ...</p>) -> .callout; H2 matching the
//     "pediatrician/safety" patterns -> first following block in .callout.safety; .note-box -> + .callout
//   - .inline-cta app card before the 2nd H2 (data-cta-location="inline-article")
//   - old .download-box / .section-card.cta -> closing .cta-band (existing copy and data-cta-location kept)
//   - related-articles list -> cards; sticky mobile app bar
// Reading time: N = max(1, round(words / 220)) over the article body (intro + sections, before the download box
// and related list), words counted from the source markup with tags stripped.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const PLAY = 'https://play.google.com/store/apps/details?id=com.gurrulabs.raffy';

// ---------------------------------------------------------------- locale strings
export const STRINGS = {
  en: {
    editorialTeam: 'Raffy editorial team',
    minRead: (n) => `${n} min read`,
    tocTitle: 'On this page',
    tocCount: (n) => `${n} sections`,
    safetyTitle: 'Pediatric safety',
    inlineTitle: 'Track it all in Raffy',
    inlineText: 'Sleep, feeding, growth and routines in one free Android app.',
    tool: 'Free tool',
    stickyName: 'Raffy baby tracker', stickySub: 'Free · Android', stickyBtn: 'Get the app', stickyDismiss: 'Dismiss',
    tipLabels: ['What helps most'],
    safetyRe: /pediatric|safety/i,
    libAll: (n) => `All · ${n}`,
    libFilter: 'Filter by topic',
    topics: { sleep: 'Sleep', feeding: 'Feeding', growth: 'Growth & development', health: 'Health', family: 'Family & app' },
    bannerSub: 'Growth, feeding & sleep in one app',
    bandTitle: 'Turn the guides into a daily <em>routine</em>',
    bandText: 'Download Raffy on Google Play and start organizing routines in minutes.',
    badgeAlt: 'Get it on Google Play', badgeAria: 'Get it on Google Play',
    home: 'Home', articles: 'Articles',
  },
  es: {
    editorialTeam: 'Equipo editorial de Raffy',
    minRead: (n) => `${n} min de lectura`,
    tocTitle: 'En esta página',
    tocCount: (n) => `${n} secciones`,
    safetyTitle: 'Seguridad pediátrica',
    inlineTitle: 'Sigue todo en Raffy',
    inlineText: 'Sueño, tomas, crecimiento y rutinas en una sola app gratuita para Android.',
    tool: 'Herramienta gratis',
    stickyName: 'Raffy para tu bebé', stickySub: 'Gratis · Android', stickyBtn: 'Descargar la app', stickyDismiss: 'Cerrar',
    tipLabels: ['Lo que más ayuda'],
    safetyRe: /pediatr|seguridad/i,
    libAll: (n) => `Todos · ${n}`,
    libFilter: 'Filtrar por tema',
    topics: { sleep: 'Sueño', feeding: 'Alimentación', growth: 'Crecimiento y desarrollo', health: 'Salud', family: 'Familia y app' },
    bannerSub: 'Crecimiento, alimentación y sueño en una app',
    bandTitle: 'Convierte las guías en una <em>rutina</em> diaria',
    bandText: 'Descarga Raffy en Google Play y empieza a organizar rutinas en minutos.',
    badgeAlt: 'Disponible en Google Play', badgeAria: 'Descargar en Google Play',
    home: 'Inicio', articles: 'Artículos',
  },
  fr: {
    editorialTeam: "L'équipe éditoriale de Raffy",
    minRead: (n) => `${n} min de lecture`,
    tocTitle: 'Sur cette page',
    tocCount: (n) => `${n} sections`,
    safetyTitle: 'Sécurité pédiatrique',
    inlineTitle: 'Suivez tout dans Raffy',
    inlineText: 'Sommeil, repas, croissance et routines dans une seule app Android gratuite.',
    tool: 'Outil gratuit',
    stickyName: 'Raffy pour bébé', stickySub: 'Gratuit · Android', stickyBtn: "Télécharger l'app", stickyDismiss: 'Fermer',
    tipLabels: ['Ce qui aide le plus'],
    safetyRe: /p[ée]diatre|s[ée]curit[ée]/i,
    libAll: (n) => `Tous · ${n}`,
    libFilter: 'Filtrer par thème',
    topics: { sleep: 'Sommeil', feeding: 'Alimentation', growth: 'Croissance et développement', health: 'Santé', family: 'Famille et app' },
    bannerSub: 'Croissance, repas et sommeil dans une seule app',
    bandTitle: 'Transformez les guides en une <em>routine</em> quotidienne',
    bandText: 'Téléchargez Raffy sur Google Play et organisez vos routines en quelques minutes.',
    badgeAlt: 'Disponible sur Google Play', badgeAria: 'Télécharger sur Google Play',
    home: 'Accueil', articles: 'Articles',
  },
  pt: {
    editorialTeam: 'Equipe editorial do Raffy',
    minRead: (n) => `${n} min de leitura`,
    tocTitle: 'Nesta página',
    tocCount: (n) => `${n} seções`,
    safetyTitle: 'Segurança pediátrica',
    inlineTitle: 'Acompanhe tudo no Raffy',
    inlineText: 'Sono, mamadas, crescimento e rotinas em um único app gratuito para Android.',
    tool: 'Ferramenta grátis',
    stickyName: 'Raffy para o bebê', stickySub: 'Grátis · Android', stickyBtn: 'Baixar o app', stickyDismiss: 'Fechar',
    tipLabels: ['O que mais ajuda'],
    safetyRe: /pediatra|seguran[çc]a/i,
    libAll: (n) => `Todos · ${n}`,
    libFilter: 'Filtrar por tema',
    topics: { sleep: 'Sono', feeding: 'Alimentação', growth: 'Crescimento e desenvolvimento', health: 'Saúde', family: 'Família e app' },
    bannerSub: 'Crescimento, alimentação e sono em um só app',
    bandTitle: 'Transforme os guias em uma <em>rotina</em> diária',
    bandText: 'Baixe o Raffy no Google Play e comece a organizar rotinas em minutos.',
    badgeAlt: 'Disponível no Google Play', badgeAria: 'Baixar no Google Play',
    home: 'Início', articles: 'Artigos',
  },
};

// Topic per page key (locale independent: data-page-key on <body>). tag = .tag colour, tint = no-cover tile, icon, shot = app screenshot.
const TOPICS = {
  article_sleep_routine: { topic: 'sleep', tag: 'sky', tint: 't-sky', icon: 'sleep', shot: 'sleep' },
  article_naps_transitions_sleep_0_2: { topic: 'sleep', tag: 'sky', tint: 't-sky', icon: 'nap', shot: 'sleep' },
  article_newborn_routine: { topic: 'sleep', tag: '', tint: 't-mint', icon: 'heart', shot: 'sleep' },
  article_solids_guide: { topic: 'feeding', tag: 'peach', tint: 't-peach', icon: 'solids', shot: 'feeding' },
  article_weekly_menu_9_months: { topic: 'feeding', tag: 'peach', tint: 't-peach', icon: 'solids', shot: 'feeding' },
  article_growth_percentiles: { topic: 'growth', tag: '', tint: 't-mint', icon: 'growth', shot: 'growth' },
  article_milestones_year_one: { topic: 'growth', tag: '', tint: 't-mint', icon: 'growth', shot: 'growth' },
  article_first_vaccine: { topic: 'health', tag: 'sun', tint: 't-sun', icon: 'doctor', shot: 'doctor' },
  article_parenting_confidence: { topic: 'family', tag: 'sun', tint: 't-sun', icon: 'star', shot: 'portada' },
  article_android_tracker: { topic: 'family', tag: '', tint: 't-mint', icon: 'play', shot: 'portada' },
  tool_growth_percentiles: { topic: 'growth', tag: '', tint: 't-mint', icon: 'tool', shot: 'growth' },
  tool_weekly_meal_planner: { topic: 'feeding', tag: 'peach', tint: 't-peach', icon: 'tool', shot: 'feeding' },
  tool_solids: { topic: 'feeding', tag: 'peach', tint: 't-peach', icon: 'tool', shot: 'feeding' },
  tool_feeding: { topic: 'feeding', tag: 'peach', tint: 't-peach', icon: 'tool', shot: 'feeding' },
  tool_nap: { topic: 'sleep', tag: 'sky', tint: 't-sky', icon: 'tool', shot: 'sleep' },
  tool_wake: { topic: 'sleep', tag: 'sky', tint: 't-sky', icon: 'tool', shot: 'sleep' },
  tool_diaper: { topic: 'growth', tag: '', tint: 't-mint', icon: 'tool', shot: 'portada' },
  tool_library: { topic: 'family', tag: '', tint: 't-mint', icon: 'tool', shot: 'portada' },
};
const DEFAULT_TOPIC = { topic: 'family', tag: '', tint: 't-mint', icon: 'star', shot: 'portada' };
const topicFor = (key) => TOPICS[key] || DEFAULT_TOPIC;

const ICONS = {
  sleep: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
  growth: '<path d="M3 20h18M5 16l4-5 4 3 6-8"/><path d="M15 6h4v4"/>',
  doctor: '<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
  solids: '<path d="M4 11h16a8 8 0 0 1-16 0ZM12 3v4M8 5l1 2M16 5l-1 2"/>',
  nap: '<path d="M4 18h16M6 18v-5a6 6 0 0 1 12 0v5M9 8l-2-3M15 8l2-3"/>',
  star: '<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7Z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
  play: '<path d="M6 3.5v17l14-8.5Z"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  tool: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
};
const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[k] || ''}</svg>`;

// ---------------------------------------------------------------- helpers
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return String.fromCodePoint(n); }
  return ENT[e.toLowerCase()] ?? m;
});
const textOf = (html) => decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const slugify = (s) => decode(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const shortSlug = (s) => { const w = slugify(s).split('-'); let out = ''; for (const x of w) { if ((out + '-' + x).length > 40 && out) break; out = out ? out + '-' + x : x; } return out || 'section'; };
const countWords = (html) => (textOf(html).match(/\S+/g) || []).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
export const minutes = (words) => Math.max(1, Math.round(words / 220));
const attr = (tag, name) => { const m = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i').exec(tag); return m ? m[1] : null; };

function imageSize(file) {
  try {
    const b = readFileSync(file);
    if (b.slice(1, 4).toString() === 'PNG') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') {
      const k = b.slice(12, 16).toString();
      if (k === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
      if (k === 'VP8L') { const v = b.readUInt32LE(21); return { w: (v & 0x3fff) + 1, h: ((v >> 14) & 0x3fff) + 1 }; }
      if (k === 'VP8X') return { w: (b.readUIntLE(24, 3)) + 1, h: (b.readUIntLE(27, 3)) + 1 };
    }
  } catch { /* ignore */ }
  return null;
}

function pageKey(html) { const m = /<body[^>]*data-page-key="([^"]*)"/.exec(html); return m ? m[1] : ''; }

// Legacy article body slice: after the excerpt (or the cover) up to the download box / related list.
function legacyParts(html) {
  const m = /<main class="article-wrap">\s*<article class="article-card">([\s\S]*?)<\/article>\s*<\/main>/.exec(html);
  if (!m) return null;
  const inner = m[1];
  const chip = /<span class="chip">([\s\S]*?)<\/span>/.exec(inner);
  const h1 = /<h1>([\s\S]*?)<\/h1>/.exec(inner);
  const exc = /<p class="excerpt">([\s\S]*?)<\/p>/.exec(inner);
  const cover = /<figure class="article-cover">[\s\S]*?<\/figure>/.exec(inner);
  if (!chip || !h1 || !exc) return null;
  const start = Math.max(exc.index + exc[0].length, cover ? cover.index + cover[0].length : 0);
  const rest = inner.slice(start);
  const idxs = [rest.indexOf('<div class="download-box">'), rest.indexOf('<section class="section-card cta"'), rest.indexOf('<section class="related-articles">')].filter((i) => i >= 0);
  const end = idxs.length ? Math.min(...idxs) : rest.length;
  const body = rest.slice(0, end).trim();
  let tail = rest.slice(end);
  let download = null, related = null;
  const dl = /<div class="download-box">([\s\S]*?)<\/div>/.exec(tail);
  const sc = /<section class="section-card cta"([^>]*)>([\s\S]*?)<\/section>/.exec(tail);
  if (dl) download = { kind: 'box', attrs: '', html: dl[1] };
  else if (sc) download = { kind: 'section', attrs: sc[1], html: sc[2] };
  const rel = /<section class="related-articles">([\s\S]*?)<\/section>/.exec(tail);
  if (rel) related = rel[1];
  return { chip: chip[1].trim(), h1: h1[1].trim(), excerpt: exc[1].trim(), cover: cover ? cover[0] : null, body, download, related };
}

// Reading time of any article file (legacy -> computed; converted -> data-minutes).
function articleInfo(file, cache) {
  if (cache.has(file)) return cache.get(file);
  let info = null;
  if (existsSync(file)) {
    const html = readFileSync(file, 'utf8');
    const key = pageKey(html);
    const conv = /data-minutes="(\d+)"/.exec(html);
    let mins = null, label = '', cover = null;
    if (conv) {
      mins = +conv[1];
      const e = /<p class="eyebrow">([\s\S]*?)<\/p>/.exec(html); label = e ? e[1].trim() : '';
    } else {
      const lp = legacyParts(html);
      if (lp) { mins = minutes(countWords(lp.body)); label = lp.chip; }
    }
    const fig = /<figure class="article-cover[^"]*">\s*(<img[^>]*>)/.exec(html);
    if (fig) cover = fig[1];
    info = { key, mins, label, cover, file };
  }
  cache.set(file, info);
  return info;
}

// ---------------------------------------------------------------- shared fragments
function playLink({ loc, cls = 'play-store-badge-link', size = '', st, pageType, slug }) {
  const sm = size === 'sm' ? ' play-store-badge-link-sm' : '';
  const slugAttr = slug ? ` data-article-slug="${slug}"` : '';
  return `<a class="${cls}${sm}" href="${PLAY}" data-track-download="true" data-page-type="${pageType}" data-cta-location="${loc}"${slugAttr} aria-label="${st.badgeAria}"><img decoding="async" loading="lazy" class="play-store-badge" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="${st.badgeAlt}"></a>`;
}
function stickyBar({ st, pageType }) {
  return `  <div class="sticky-cta" data-sticky="scroll">
    <img src="../../assets/raffy-logo.png" alt="" width="40" height="40">
    <div class="t">${st.stickyName}<small>${st.stickySub}</small></div>
    <a class="btn btn-sm" href="${PLAY}" data-track-download="true" data-page-type="${pageType}" data-cta-location="sticky">${st.stickyBtn}</a>
    <button class="x" type="button" aria-label="${st.stickyDismiss}">${svg('x')}</button>
  </div>
`;
}
function headerInfo(html) {
  const nav = /<nav class="navlinks"[^>]*>([\s\S]*?)<\/nav>/.exec(html);
  const links = nav ? [...nav[1].matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({ href: m[1], text: m[2].trim() })) : [];
  const pt = /class="btn btn-sm"[^>]*data-page-type="([^"]*)"/.exec(html);
  let crumbs = null;
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const j = JSON.parse(m[1]); if (j['@type'] === 'BreadcrumbList') crumbs = j.itemListElement.map((e) => e.name); } catch { /* ignore */ }
  }
  return { links, pageType: pt ? pt[1] : 'article', crumbs };
}
function addScript(html) {
  if (html.includes('articles/article.js')) return html;
  return html.replace(/(<script src="\.\.\/\.\.\/script\.js"[^>]*><\/script>)/, '$1\n  <script src="../../articles/article.js" defer></script>');
}
function addStylesheet(html) {
  if (html.includes('articles/article.css')) return html;
  return html.replace(/(<link rel="stylesheet" href="\.\.\/\.\.\/styles\.css">)/, '$1\n  <link rel="stylesheet" href="../../articles/article.css">');
}

// ---------------------------------------------------------------- article page
function transformArticle(html, file, locale, cache) {
  const st = STRINGS[locale];
  const parts = legacyParts(html);
  if (!parts) return null;
  const hdr = headerInfo(html);
  const key = pageKey(html);
  const tp = topicFor(key);
  const dir = path.dirname(file);
  const words = countWords(parts.body);
  const mins = minutes(words);
  const slug = path.basename(file, '.html');

  // ---- body
  let body = parts.body;
  // H2 ids
  const toc = [];
  const used = new Set();
  body = body.replace(/<h2>([\s\S]*?)<\/h2>/g, (m, inner) => {
    let id = shortSlug(textOf(inner)); let n = 2; const base = id;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id); toc.push({ id, html: inner.trim() });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  // tips
  body = body.replace(/<p><strong>([^<]*)<\/strong>\s*([\s\S]*?)<\/p>/g, (m, label, rest) => {
    const clean = label.replace(/[:：\s]+$/, '').trim().toLowerCase();
    if (!st.tipLabels.some((t) => t.toLowerCase() === clean)) return m;
    return `<div class="callout"><p class="callout-title"><span>${svg('star')}</span><strong>${label}</strong></p><p>${rest.trim()}</p></div>`;
  });
  // safety: first block after a matching H2
  body = body.replace(/(<h2 id="[^"]*">([\s\S]*?)<\/h2>\s*)(<ul>[\s\S]*?<\/ul>|<p>[\s\S]*?<\/p>)/g, (m, h, inner, block) => {
    if (!st.safetyRe.test(textOf(inner))) return m;
    return `${h}<div class="callout safety"><p class="callout-title"><span>${svg('shield')}</span>${st.safetyTitle}</p>${block}</div>`;
  });
  // note box
  body = body.replace(/<div class="note-box">/g, '<div class="note-box callout">');
  // author line ("By Gurru Labs<br>December 2025")
  body = body.replace(/<p>(<strong>[^<]*<\/strong><br>[^<]*)<\/p>/, '<p class="author-note">$1</p>');

  // ---- inline CTA before 2nd H2
  const dlAnchor = parts.download ? /<a\b[^>]*class="play-store-badge-link"[\s\S]*?<\/a>/.exec(parts.download.html) : null;
  const slugAttr = dlAnchor ? attr(dlAnchor[0], 'data-article-slug') : slug;
  const shotName = tp.shot === 'portada' && locale === 'es' ? 'portada_es' : tp.shot;
  const inline = `<div class="inline-cta">
            <div class="copy">
              <h3>${st.inlineTitle}</h3>
              <p>${st.inlineText}</p>
              ${playLink({ loc: 'inline-article', size: 'sm', st, pageType: hdr.pageType, slug: slugAttr })}
            </div>
            <img src="../../assets/${shotName}.webp" alt="" width="120" height="170" loading="lazy" decoding="async">
          </div>`;
  const h2Positions = [...body.matchAll(/<h2 id=/g)].map((m) => m.index);
  if (h2Positions.length >= 2) body = body.slice(0, h2Positions[1]) + inline + '\n\n          ' + body.slice(h2Positions[1]);
  else body += '\n\n          ' + inline;

  // ---- hero
  const crumbName = (i, fallback) => (hdr.crumbs && hdr.crumbs[i]) || fallback;
  const homeHref = hdr.links[0]?.href || '../index.html';
  const artHref = hdr.links[1]?.href || 'index.html';
  const hero = `    <header class="article-hero">
      <div class="container">
        <div class="inner">
          <ol class="crumbs"><li><a href="${homeHref}">${crumbName(0, st.home)}</a></li><li><a href="${artHref}">${crumbName(1, st.articles)}</a></li><li>${crumbName(2, textOf(parts.h1))}</li></ol>
          <p class="eyebrow">${parts.chip}</p>
          <h1>${parts.h1}</h1>
          <p class="excerpt">${parts.excerpt}</p>
          <div class="byline">
            <span class="avatar"><img src="../../assets/raffy-logo.png" alt="" width="26" height="26"></span>
            <span>${st.editorialTeam}</span><span class="sep"></span>
            <span data-minutes="${mins}">${st.minRead(mins)}</span>
          </div>
        </div>
      </div>
    </header>
`;

  // ---- cover
  let cover = '';
  if (parts.cover) {
    const src = /src="([^"]*)"/.exec(parts.cover)?.[1];
    const dim = src ? imageSize(path.resolve(dir, src)) : null;
    const ratio = dim ? dim.w / dim.h : 0;
    const cls = ratio >= 1.5 ? '' : (ratio && ratio < 0.55 ? ' is-poster is-shot' : ' is-poster');
    cover = '      ' + parts.cover.replace('class="article-cover"', `class="article-cover${cls}"`) + '\n';
  }

  // ---- toc
  const tocLinks = toc.map((t) => `<li><a href="#${t.id}">${t.html}</a></li>`).join('\n            ');
  const tocDesktop = `<nav class="toc" aria-label="${st.tocTitle}">
          <p class="toc-title">${st.tocTitle}</p>
          <ol>
            ${tocLinks}
          </ol>
        </nav>`;
  const tocMobile = `<details class="toc-mobile card">
            <summary>${st.tocTitle} · ${st.tocCount(toc.length)}</summary>
            <ol>
              ${tocLinks.replace(/\n {12}/g, '\n              ')}
            </ol>
          </details>`;

  // ---- closing band
  let band = '';
  if (parts.download) {
    const dh = parts.download.html;
    const anchor = dlAnchor ? dlAnchor[0] : '';
    const copy = dh.replace(anchor, '').trim();
    const idAttr = /id="([^"]*)"/.exec(parts.download.attrs)?.[1];
    const copyIndented = copy.split('\n').map((l) => l.trim()).filter(Boolean).join('\n              ');
    band = `      <section class="cta-section article-cta"${idAttr ? ` id="${idAttr}"` : ''}>
        <div class="cta-band">
          <div>
              ${copyIndented}
          </div>
          ${anchor}
        </div>
      </section>
`;
  }

  // ---- related cards
  let relatedHtml = '';
  if (parts.related) {
    const h2 = /<h2>([\s\S]*?)<\/h2>/.exec(parts.related)?.[1] ?? '';
    const cards = [...parts.related.matchAll(/<li><a href="([^"]*)">([\s\S]*?)<\/a><\/li>/g)].map((m) => {
      const [, href, text] = m;
      const target = articleInfo(path.resolve(dir, href.split('#')[0]), cache);
      const t = topicFor(target?.key || '');
      const isArticle = target && target.key.startsWith('article_');
      const isTool = target && target.key.startsWith('tool_');
      const label = isArticle ? target.label : (isTool ? st.tool : '');
      const thumb = isArticle && target.cover
        ? `<div class="a-thumb">${target.cover.replace(/alt="[^"]*"/, 'alt=""').replace(/ ?fetchpriority="[^"]*"/, '').replace('loading="eager"', 'loading="lazy"')}</div>`
        : `<div class="a-thumb fallback ${t.tint}">${svg(t.icon)}</div>`;
      const meta = isArticle && target.mins ? `<div class="a-meta"><span>${st.minRead(target.mins)}</span></div>` : '';
      const tag = label ? `<span class="tag${t.tag ? ' ' + t.tag : ''}">${label}</span>` : '';
      return `          <a class="card a-card" href="${href}">
            ${thumb}
            <div class="a-body">${tag}<h3>${text}</h3>${meta}</div>
          </a>`;
    }).join('\n');
    relatedHtml = `      <section class="related related-articles">
        <div class="section-head-row"><div class="section-head"><h2>${h2}</h2></div></div>
        <div class="article-grid">
${cards}
        </div>
      </section>
`;
  }

  const main = `  <main>
${hero}
    <div class="container">
${cover}
      <div class="article-layout">
        ${tocDesktop}

        <article class="prose">
          ${tocMobile}

          ${body.replace(/\n\s*\n\s*/g, '\n\n          ')}
        </article>
      </div>

${band}
${relatedHtml}    </div>
  </main>

${stickyBar({ st, pageType: hdr.pageType })}`;

  let out = html.replace(/<main class="article-wrap">[\s\S]*?<\/article>\s*<\/main>\s*/, main + '\n');
  out = addScript(addStylesheet(out));
  return { html: out, mins };
}

// ---------------------------------------------------------------- library
function transformLibrary(html, file, locale, cache) {
  const st = STRINGS[locale];
  const m = /<main>\s*<section class="container section">\s*<article class="intro-copy">([\s\S]*?)<\/article>\s*<\/section>\s*<section class="container section">\s*<article class="section-card">([\s\S]*?)<\/article>\s*<\/section>\s*<\/main>/.exec(html);
  if (!m) return null;
  const hdr = headerInfo(html);
  const dir = path.dirname(file);
  const [, intro, listing] = m;
  const kicker = /<p class="kicker">(?:<span class="dot"><\/span>)?([\s\S]*?)<\/p>/.exec(intro)[1].trim();
  const h1 = /<h1>([\s\S]*?)<\/h1>/.exec(intro)[1];
  const lead = /<p class="lead">([\s\S]*?)<\/p>/.exec(intro)[1];
  const h2 = /<h2>([\s\S]*?)<\/h2>/.exec(listing)?.[1];
  const aintro = /<p class="article-intro">([\s\S]*?)<\/p>/.exec(listing)?.[1];

  const cards = [...listing.matchAll(/<article class="article-card reveal">([\s\S]*?)<\/article>/g)].map((c) => {
    const s = c[1];
    const img = /<img[^>]*>/.exec(s)?.[0] || null;
    const tag = /<p class="article-tag">([\s\S]*?)<\/p>/.exec(s)[1];
    const title = /<h3>([\s\S]*?)<\/h3>/.exec(s)[1];
    const desc = /<\/h3>\s*<p>([\s\S]*?)<\/p>/.exec(s)[1];
    const link = /<a href="([^"]*)" class="article-link">([\s\S]*?)<\/a>/.exec(s);
    const target = articleInfo(path.resolve(dir, link[1]), cache);
    return { img, tag, title, desc, href: link[1], linkText: link[2], target };
  });
  const featIdx = Math.max(0, cards.findIndex((c) => c.target?.key === 'article_milestones_year_one'));

  const topics = ['sleep', 'feeding', 'growth', 'health', 'family'].filter((t) => cards.some((c) => topicFor(c.target?.key).topic === t));
  const chips = [`<button class="chip" type="button" aria-pressed="true" data-filter-value="all">${st.libAll(cards.length)}</button>`,
    ...topics.map((t) => `<button class="chip" type="button" aria-pressed="false" data-filter-value="${t}">${st.topics[t]}</button>`)].join('\n        ');

  const cardHtml = cards.map((c, i) => {
    const t = topicFor(c.target?.key);
    let thumb;
    if (c.img) {
      const src = /src="([^"]*)"/.exec(c.img)[1];
      const dim = imageSize(path.resolve(dir, src));
      const shot = dim && dim.w / dim.h < 0.55;
      thumb = `<div class="a-thumb${shot ? ' is-shot' : ''}">${c.img.replace(/ class="article-card-thumb"/, '')}</div>`;
    } else thumb = `<div class="a-thumb fallback ${t.tint}">${svg(t.icon)}</div>`;
    const meta = c.target?.mins ? `<span>${st.minRead(c.target.mins)}</span>` : '';
    return `          <article class="card a-card${i === featIdx ? ' featured' : ''}" data-topic="${t.topic}">
            ${thumb}
            <div class="a-body"><span class="tag${t.tag ? ' ' + t.tag : ''}">${c.tag}</span><h3>${c.title}</h3><p>${c.desc}</p><div class="a-meta">${meta}<a href="${c.href}" class="article-link">${c.linkText}</a></div></div>
          </article>`;
  });
  const ordered = [cardHtml[featIdx], ...cardHtml.filter((_, i) => i !== featIdx)];

  const homeHref = hdr.links[0]?.href || '../index.html';
  const main = `  <main>
    <header class="article-hero">
      <div class="container">
        <div class="inner">
          <ol class="crumbs"><li><a href="${homeHref}">${hdr.crumbs?.[0] || st.home}</a></li><li>${hdr.crumbs?.[1] || st.articles}</li></ol>
          <p class="eyebrow">${kicker}</p>
          <h1>${h1}</h1>
          <p class="excerpt">${lead}</p>
        </div>
      </div>
    </header>

    <div class="container library">
      <div class="section-head">
        <h2>${h2}</h2>
        <p>${aintro}</p>
      </div>

      <div class="chips" role="group" aria-label="${st.libFilter}" data-filter>
        ${chips}
      </div>

      <div class="app-banner">
        <img src="../../assets/raffy-logo.png" alt="" width="44" height="44">
        <p class="t">${st.stickyName}<small>${st.bannerSub}</small></p>
        ${playLink({ loc: 'library-banner', size: 'sm', st, pageType: hdr.pageType })}
      </div>

      <div class="article-grid">
${ordered.join('\n')}
      </div>

      <section class="cta-section">
        <div class="cta-band">
          <div><h2>${st.bandTitle}</h2><p>${st.bandText}</p></div>
          ${playLink({ loc: 'footer-band', st, pageType: hdr.pageType })}
        </div>
      </section>
    </div>
  </main>

${stickyBar({ st, pageType: hdr.pageType })}`;
  let out = html.replace(/<main>[\s\S]*?<\/main>\s*/, main + '\n');
  out = addScript(addStylesheet(out));
  return { html: out };
}

// ---------------------------------------------------------------- main
function run() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const li = args.indexOf('--locale');
  const dirArg = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--locale');
  if (!dirArg) { console.error('usage: articles-transform.mjs <articles-dir> [--dry] [--locale xx]'); process.exit(2); }
  const dir = path.resolve(dirArg);
  const rel = path.relative(process.cwd(), dir).split(path.sep);
  const locale = li >= 0 ? args[li + 1] : rel[0];
  if (!STRINGS[locale]) { console.error(`unknown locale ${locale}`); process.exit(2); }
  const cache = new Map();
  const files = readdirSync(dir).filter((f) => f.endsWith('.html')).sort();
  // articles first, library last (the library reads the converted articles' data-minutes; either order works)
  files.sort((a, b) => (a === 'index.html') - (b === 'index.html') || a.localeCompare(b));
  const report = [];
  for (const f of files) {
    const file = path.join(dir, f);
    const html = readFileSync(file, 'utf8');
    if (html.includes('<header class="article-hero">')) { report.push(`skip (already converted) ${f}`); continue; }
    const res = f === 'index.html' ? transformLibrary(html, file, locale, cache) : transformArticle(html, file, locale, cache);
    if (!res) { report.push(`SKIP (unrecognised markup) ${f}`); continue; }
    cache.delete(file);
    if (!dry) writeFileSync(file, res.html);
    report.push(`${dry ? 'would convert' : 'converted'} ${f}${res.mins ? `  ${res.mins} min` : ''}`);
  }
  console.log(report.join('\n'));
}
if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) run();
