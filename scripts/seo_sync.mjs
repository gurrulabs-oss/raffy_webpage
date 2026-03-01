import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const config = readJson(path.join(ROOT, "seo.config.json"));
const manifest = readJson(path.join(ROOT, "seo", "articles.manifest.json"));

const siteOrigin = normalizeOrigin(config.siteOrigin);
const localeCodes = Object.keys(config.locales);
const trustRoutes = buildTrustRouteMap(manifest.pages);

const webpSrcMap = new Map([
  ["../assets/portada.png", "../assets/portada.webp"],
  ["../assets/portada_es.png", "../assets/portada_es.webp"],
  ["/assets/doctor.png", "/assets/doctor.webp"],
  ["/assets/doctor_es.png", "/assets/doctor_es.webp"],
  ["/assets/feeding.png", "/assets/feeding.webp"],
  ["/assets/growth.png", "/assets/growth.webp"],
  ["/assets/sleep.jpg", "/assets/sleep.webp"],
  ["/assets/sleep_es.jpg", "/assets/sleep_es.webp"],
  ["../assets/sleep.jpg", "../assets/sleep.webp"],
  ["../assets/sleep_es.jpg", "../assets/sleep_es.webp"]
]);

const dimensionMap = new Map([
  ["assets/raffy-logo.png", { w: 500, h: 500 }],
  ["assets/portada.webp", { w: 1748, h: 1240 }],
  ["assets/portada_es.webp", { w: 1748, h: 1240 }],
  ["assets/doctor.webp", { w: 1080, h: 1920 }],
  ["assets/doctor_es.webp", { w: 1080, h: 1920 }],
  ["assets/feeding.webp", { w: 921, h: 2048 }],
  ["assets/growth.webp", { w: 1080, h: 1920 }],
  ["assets/sleep.webp", { w: 921, h: 2048 }],
  ["assets/sleep_es.webp", { w: 921, h: 2048 }],
  ["assets/portada.png", { w: 1748, h: 1240 }],
  ["assets/portada_es.png", { w: 1748, h: 1240 }],
  ["assets/doctor.png", { w: 1080, h: 1920 }],
  ["assets/doctor_es.png", { w: 1080, h: 1920 }],
  ["assets/feeding.png", { w: 921, h: 2048 }],
  ["assets/growth.png", { w: 1080, h: 1920 }],
  ["assets/sleep.jpg", { w: 921, h: 2048 }],
  ["assets/sleep_es.jpg", { w: 921, h: 2048 }]
]);

const footerLabels = {
  en: {
    aria: "Trust and legal pages",
    about: "About",
    editorial_policy: "Editorial Policy",
    privacy: "Privacy",
    data_deletion: "Data Deletion",
    terms: "Terms",
    contact: "Contact"
  },
  es: {
    aria: "Páginas de confianza y legales",
    about: "Quiénes somos",
    editorial_policy: "Política editorial",
    privacy: "Privacidad",
    data_deletion: "Eliminación de datos",
    terms: "Términos",
    contact: "Contacto"
  },
  fr: {
    aria: "Pages de confiance et mentions légales",
    about: "À propos",
    editorial_policy: "Politique éditoriale",
    privacy: "Confidentialité",
    data_deletion: "Suppression des données",
    terms: "Conditions",
    contact: "Contact"
  },
  pt: {
    aria: "Páginas de confiança e legais",
    about: "Sobre",
    editorial_policy: "Política editorial",
    privacy: "Privacidade",
    data_deletion: "Exclusão de dados",
    terms: "Termos",
    contact: "Contato"
  }
};

const preloadMap = {
  en: "../assets/portada.webp",
  es: "../assets/portada_es.webp",
  fr: "../assets/portada.webp",
  pt: "../assets/portada.webp"
};

let touched = 0;

for (const page of manifest.pages) {
  for (const locale of localeCodes) {
    const route = page.routes[locale];
    const filePath = routeToFile(route);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing file ${filePath} for route ${route}`);
    }

    let html = fs.readFileSync(filePath, "utf8");

    html = html.replace(/https:\/\/example\.com/g, siteOrigin);
    html = updateCanonical(html, `${siteOrigin}${route}`);
    html = updateAlternates(html, buildAlternates(page.routes, config, siteOrigin));
    html = updateMetaContent(html, "property", "og:url", `${siteOrigin}${route}`);
    html = updateRobots(html, config.indexable ? "index,follow" : "noindex,follow");
    html = html.replace(/href="#screens"/g, 'href="#features"');
    html = rewriteJsonLdPublisher(html, page.type);

    if (page.id === "home") {
      html = ensurePreloadImage(html, preloadMap[locale] || preloadMap.en);
    }

    html = rewriteImages(html, webpSrcMap, dimensionMap);
    html = replaceFooter(html, buildFooter(locale, route, trustRoutes, footerLabels));

    fs.writeFileSync(filePath, html, "utf8");
    touched += 1;
  }
}

const legacyPaths = walkHtml(path.join(ROOT, "articles"));
for (const filePath of legacyPaths) {
  let html = fs.readFileSync(filePath, "utf8");
  html = html.replace(/https:\/\/example\.com/g, siteOrigin);
  html = updateRobots(html, "noindex,follow");
  fs.writeFileSync(filePath, html, "utf8");
}

console.log(`SEO sync updated ${touched} localized pages and ${legacyPaths.length} legacy redirects.`);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeOrigin(origin) {
  return String(origin || "").replace(/\/$/, "");
}

function routeToFile(route) {
  const trimmed = route.startsWith("/") ? route.slice(1) : route;
  const relative = trimmed.endsWith("/") ? `${trimmed}index.html` : trimmed;
  return path.join(ROOT, relative);
}

function buildAlternates(routes, cfg, origin) {
  const lines = [];
  for (const [locale, route] of Object.entries(routes)) {
    lines.push(`<link rel="alternate" hreflang="${cfg.locales[locale].hreflang}" href="${origin}${route}">`);
  }
  lines.push(`<link rel="alternate" hreflang="x-default" href="${origin}${cfg.xDefault}">`);
  return lines.join("\n  ");
}

function updateCanonical(html, canonicalUrl) {
  if (/<link\s+rel="canonical"\s+href="[^"]+"\s*>/i.test(html)) {
    return html.replace(/<link\s+rel="canonical"\s+href="[^"]+"\s*>/i, `<link rel="canonical" href="${canonicalUrl}">`);
  }
  return html.replace(/<meta\s+name="description"[^>]*>\s*/i, (m) => `${m}<link rel="canonical" href="${canonicalUrl}">\n  `);
}

function updateAlternates(html, alternateBlock) {
  const pattern = /<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]+"\s*>\s*(?:\n\s*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]+"\s*>\s*)+/i;
  if (pattern.test(html)) {
    return html.replace(pattern, `${alternateBlock}\n  `);
  }
  return html.replace(/<link\s+rel="canonical"[^>]*>\s*/i, (m) => `${m}${alternateBlock}\n  `);
}

function updateMetaContent(html, attrName, attrValue, contentValue) {
  const escapedAttrValue = escapeRegExp(attrValue);
  const tagRegex = new RegExp(`<meta\\s+${attrName}="${escapedAttrValue}"\\s+content="[^"]*"\\s*>`, "i");
  const replacement = `<meta ${attrName}="${attrValue}" content="${contentValue}">`;
  if (tagRegex.test(html)) {
    return html.replace(tagRegex, replacement);
  }
  return html;
}

function updateRobots(html, contentValue) {
  const robotsRegex = /<meta\s+name="robots"\s+content="[^"]*"\s*>/i;
  const robotsTag = `<meta name="robots" content="${contentValue}">`;
  if (robotsRegex.test(html)) {
    return html.replace(robotsRegex, robotsTag);
  }
  if (/<meta\s+name="description"[^>]*>/i.test(html)) {
    return html.replace(/<meta\s+name="description"[^>]*>\s*/i, (m) => `${m}${robotsTag}\n  `);
  }
  return html.replace(/<meta\s+name="viewport"[^>]*>\s*/i, (m) => `${m}${robotsTag}\n  `);
}

function rewriteJsonLdPublisher(html, pageType) {
  if (pageType !== "article") return html;
  return html.replace(/"author"\s*:\s*\{[^}]+\},\s*/g, (authorBlock) => {
    if (authorBlock.includes("publisher")) return authorBlock;
    return `${authorBlock}"publisher": {"@type": "Organization", "name": "Raffy"},\n    `;
  });
}

function ensurePreloadImage(html, href) {
  if (html.includes(`rel="preload" as="image" href="${href}"`)) {
    return html;
  }
  return html.replace(/<link\s+rel="stylesheet"[^>]*>\s*/i, (m) => `${m}<link rel="preload" as="image" href="${href}" fetchpriority="high">\n  `);
}

function rewriteImages(html, srcMap, dims) {
  return html.replace(/<img\b[^>]*>/g, (imgTag) => {
    let tag = imgTag;

    for (const [from, to] of srcMap.entries()) {
      tag = tag.replace(`src="${from}"`, `src="${to}"`);
    }

    const src = matchOne(tag, /\ssrc="([^"]+)"/i);
    const normSrc = normalizeSrc(src);
    const hasCoverClass = /class="[^"]*\bcover-image\b[^"]*"/.test(tag);
    const hasBrandClass = /class="[^"]*\bbrand-logo\b[^"]*"/.test(tag);

    if (!/\bdecoding="[^"]+"/.test(tag)) {
      tag = injectBeforeEnd(tag, ' decoding="async"');
    }

    if (!/\bloading="[^"]+"/.test(tag)) {
      if (hasCoverClass || hasBrandClass) tag = injectBeforeEnd(tag, ' loading="eager"');
      else tag = injectBeforeEnd(tag, ' loading="lazy"');
    }

    if (hasCoverClass && !/\bfetchpriority="[^"]+"/.test(tag)) {
      tag = injectBeforeEnd(tag, ' fetchpriority="high"');
    }

    if (normSrc && dims.has(normSrc)) {
      const size = dims.get(normSrc);
      if (!/\bwidth="\d+"/.test(tag)) {
        tag = injectBeforeEnd(tag, ` width="${size.w}"`);
      }
      if (!/\bheight="\d+"/.test(tag)) {
        tag = injectBeforeEnd(tag, ` height="${size.h}"`);
      }
    }

    return tag;
  });
}

function replaceFooter(html, footerBlock) {
  return html.replace(/<footer class="container footer">[\s\S]*?<\/footer>/i, footerBlock);
}

function buildFooter(locale, route, trustMap, labelsMap) {
  const labels = labelsMap[locale] || labelsMap.en;
  const linkOrder = ["about", "editorial_policy", "privacy", "data_deletion", "terms", "contact"];
  const links = linkOrder.map((key) => {
    const href = relativeHref(route, trustMap[locale][key]);
    return `<a href="${href}">${labels[key]}</a>`;
  });

  return [
    '<footer class="container footer">',
    '    <p>© <span id="year"></span> Raffy App</p>',
    `    <nav class="footer-links" aria-label="${labels.aria}">`,
    `      ${links.join("\n      ")}`,
    '    </nav>',
    '  </footer>'
  ].join("\n");
}

function buildTrustRouteMap(pages) {
  const keys = ["about", "editorial_policy", "privacy", "data_deletion", "terms", "contact"];
  const map = {
    en: {},
    es: {},
    fr: {},
    pt: {}
  };

  for (const page of pages) {
    if (!keys.includes(page.id)) continue;
    for (const [locale, route] of Object.entries(page.routes)) {
      map[locale][page.id] = route;
    }
  }

  return map;
}

function relativeHref(fromRoute, toRoute) {
  const fromFile = stripLeading(fromRoute.endsWith("/") ? `${fromRoute}index.html` : fromRoute);
  const toFile = stripLeading(toRoute.endsWith("/") ? `${toRoute}index.html` : toRoute);
  const fromDir = path.posix.dirname(fromFile);
  const relPath = path.posix.relative(fromDir, toFile);
  return relPath || "./";
}

function walkHtml(rootDir) {
  const result = [];
  if (!fs.existsSync(rootDir)) return result;
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (entry.isFile() && entry.name.endsWith(".html")) result.push(fullPath);
    }
  }
  return result;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchOne(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : "";
}

function injectBeforeEnd(tag, insertText) {
  return tag.replace(/\s*\/>$/, `${insertText} />`).replace(/>$/, `${insertText}>`);
}

function normalizeSrc(src) {
  if (!src) return "";
  const clean = src.split("?")[0].split("#")[0].replace(/^\.?\//, "").replace(/^\//, "");
  return clean;
}

function stripLeading(route) {
  return route.startsWith("/") ? route.slice(1) : route;
}
