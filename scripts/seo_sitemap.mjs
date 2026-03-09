import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const config = readJson(path.join(ROOT, "seo.config.json"));
const manifest = readJson(path.join(ROOT, "seo", "articles.manifest.json"));

const siteOrigin = normalizeOrigin(config.siteOrigin);
const extraIndexablePaths = normalizePaths(config.extraIndexablePaths || []);
const aiDiscoveryPaths = normalizePaths(config.aiDiscoveryPaths || extraIndexablePaths);
const urls = [];

for (const page of manifest.pages) {
  for (const route of Object.values(page.routes)) {
    const filePath = routeToFile(route);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing file for route ${route}: ${filePath}`);
    }

    const stat = fs.statSync(filePath);
    urls.push({
      loc: `${siteOrigin}${route}`,
      lastmod: stat.mtime.toISOString().slice(0, 10)
    });
  }
}

for (const route of extraIndexablePaths) {
  const filePath = routeToFile(route);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file for extra indexable path ${route}: ${filePath}`);
  }
  const stat = fs.statSync(filePath);
  urls.push({
    loc: `${siteOrigin}${route}`,
    lastmod: stat.mtime.toISOString().slice(0, 10)
  });
}

const dedupedUrls = Array.from(new Map(urls.map((entry) => [entry.loc, entry])).values());
dedupedUrls.sort((a, b) => a.loc.localeCompare(b.loc));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...dedupedUrls.map((entry) => `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n  </url>`),
  '</urlset>',
  ''
].join("\n");

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml, "utf8");

const robotsLines = ["User-agent: *"];
if (config.indexable) {
  robotsLines.push("Allow: /");
  for (const route of aiDiscoveryPaths) {
    robotsLines.push(`Allow: ${route}`);
  }
} else {
  robotsLines.push("Disallow: /");
}
robotsLines.push("", `Sitemap: ${siteOrigin}/sitemap.xml`, "");

fs.writeFileSync(path.join(ROOT, "robots.txt"), robotsLines.join("\n"), "utf8");

console.log(`Generated sitemap.xml with ${dedupedUrls.length} URLs.`);
console.log(`Generated robots.txt (indexable=${config.indexable}).`);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeOrigin(origin) {
  return String(origin || "").replace(/\/$/, "");
}

function normalizePaths(values) {
  return (Array.isArray(values) ? values : [])
    .map((value) => String(value || "").trim())
    .filter((value) => value.startsWith("/"));
}

function routeToFile(route) {
  const trimmed = route.startsWith("/") ? route.slice(1) : route;
  const relative = trimmed.endsWith("/") ? `${trimmed}index.html` : trimmed;
  return path.join(ROOT, relative);
}
