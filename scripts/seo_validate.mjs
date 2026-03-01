import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const config = readJson(path.join(ROOT, "seo.config.json"));
const manifest = readJson(path.join(ROOT, "seo", "articles.manifest.json"));
const siteOrigin = normalizeOrigin(config.siteOrigin);
const localeCodes = Object.keys(config.locales);

const errors = [];

const manifestPages = [];
for (const page of manifest.pages) {
  for (const [locale, route] of Object.entries(page.routes)) {
    const filePath = routeToFile(route);
    manifestPages.push({ pageId: page.id, locale, route, filePath, routes: page.routes });
  }
}

for (const page of manifestPages) {
  assertExists(page.filePath, `Missing file for route ${page.route}`);
}

const allHtml = [
  ...walkHtml(path.join(ROOT, "en")),
  ...walkHtml(path.join(ROOT, "es")),
  ...walkHtml(path.join(ROOT, "fr")),
  ...walkHtml(path.join(ROOT, "pt")),
  path.join(ROOT, "404.html")
].filter((filePath) => fs.existsSync(filePath));

for (const filePath of [...allHtml, path.join(ROOT, "sitemap.xml"), path.join(ROOT, "robots.txt")]) {
  const content = fs.readFileSync(filePath, "utf8");
  if (content.includes("example.com")) {
    errors.push(`Found example.com in ${rel(filePath)}`);
  }
}

for (const page of manifestPages) {
  const html = fs.readFileSync(page.filePath, "utf8");
  const expectedCanonical = `${siteOrigin}${page.route}`;
  const canonical = matchOne(html, /<link\s+rel="canonical"\s+href="([^"]+)"\s*>/i);
  if (!canonical) {
    errors.push(`Missing canonical in ${rel(page.filePath)}`);
  } else if (canonical !== expectedCanonical) {
    errors.push(`Canonical mismatch in ${rel(page.filePath)}: expected ${expectedCanonical}, got ${canonical}`);
  }

  const ogUrl = matchOne(html, /<meta\s+property="og:url"\s+content="([^"]+)"\s*>/i);
  if (ogUrl && ogUrl !== expectedCanonical) {
    errors.push(`og:url mismatch in ${rel(page.filePath)}: expected ${expectedCanonical}, got ${ogUrl}`);
  }

  const alternates = new Map();
  for (const match of html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"\s*>/gi)) {
    alternates.set(match[1], match[2]);
  }

  for (const locale of localeCodes) {
    const hreflang = config.locales[locale].hreflang;
    const expectedHref = `${siteOrigin}${page.routes[locale]}`;
    const actualHref = alternates.get(hreflang);
    if (!actualHref) {
      errors.push(`Missing hreflang ${hreflang} in ${rel(page.filePath)}`);
    } else if (actualHref !== expectedHref) {
      errors.push(`hreflang ${hreflang} mismatch in ${rel(page.filePath)}: expected ${expectedHref}, got ${actualHref}`);
    }
  }

  const xDefault = alternates.get("x-default");
  const expectedXDefault = `${siteOrigin}${config.xDefault}`;
  if (xDefault !== expectedXDefault) {
    errors.push(`x-default mismatch in ${rel(page.filePath)}: expected ${expectedXDefault}, got ${xDefault || "(missing)"}`);
  }
}

for (const page of manifestPages) {
  const html = fs.readFileSync(page.filePath, "utf8");
  const alternates = new Map();
  for (const match of html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"\s*>/gi)) {
    alternates.set(match[1], match[2]);
  }

  for (const locale of localeCodes) {
    const targetRoute = page.routes[locale];
    const targetFile = routeToFile(targetRoute);
    if (!fs.existsSync(targetFile)) continue;

    const targetHtml = fs.readFileSync(targetFile, "utf8");
    const targetAlternates = new Map();
    for (const match of targetHtml.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"\s*>/gi)) {
      targetAlternates.set(match[1], match[2]);
    }

    const sourceLang = config.locales[page.locale].hreflang;
    const expectedBack = `${siteOrigin}${page.route}`;
    const actualBack = targetAlternates.get(sourceLang);
    if (actualBack !== expectedBack) {
      errors.push(`Hreflang reciprocity mismatch: ${targetRoute} should point back to ${expectedBack} for ${sourceLang}`);
    }
  }
}

for (const filePath of allHtml) {
  const html = fs.readFileSync(filePath, "utf8");
  const links = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((m) => m[1]);
  for (const href of links) {
    if (isExternal(href) || href.startsWith("#") || href.startsWith("javascript:")) {
      continue;
    }

    const cleanHref = href.split("#")[0].split("?")[0];
    if (!cleanHref) continue;

    let targetFile;
    if (cleanHref.startsWith("/")) {
      const trimmed = cleanHref.slice(1);
      targetFile = cleanHref.endsWith("/") ? path.join(ROOT, trimmed, "index.html") : path.join(ROOT, trimmed);
    } else {
      const dir = path.dirname(filePath);
      targetFile = cleanHref.endsWith("/") ? path.join(dir, cleanHref, "index.html") : path.join(dir, cleanHref);
    }

    if (!fs.existsSync(targetFile)) {
      errors.push(`Broken internal link in ${rel(filePath)} -> ${href}`);
    }
  }
}

if (config.indexable) {
  const sitemapPath = path.join(ROOT, "sitemap.xml");
  assertExists(sitemapPath, "Missing sitemap.xml");
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  for (const page of manifestPages) {
    const expected = `${siteOrigin}${page.route}`;
    if (!sitemap.includes(`<loc>${expected}</loc>`)) {
      errors.push(`Missing indexable URL in sitemap: ${expected}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`SEO validation failed with ${errors.length} issue(s):`);
  for (const issue of errors) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(`SEO validation passed for ${manifestPages.length} localized pages.`);

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

function matchOne(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : "";
}

function assertExists(filePath, message) {
  if (!fs.existsSync(filePath)) {
    errors.push(message);
  }
}

function rel(filePath) {
  return path.relative(ROOT, filePath) || filePath;
}

function isExternal(href) {
  return /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}
