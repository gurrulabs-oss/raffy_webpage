import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const config = readJson(path.join(ROOT, "seo.config.json"));
const manifest = readJson(path.join(ROOT, "seo", "articles.manifest.json"));

const siteOrigin = normalizeOrigin(config.siteOrigin);
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

urls.sort((a, b) => a.loc.localeCompare(b.loc));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((entry) => `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n  </url>`),
  '</urlset>',
  ''
].join("\n");

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml, "utf8");

const robotsLines = ["User-agent: *"];
if (config.indexable) {
  robotsLines.push("Allow: /");
} else {
  robotsLines.push("Disallow: /");
}
robotsLines.push("", `Sitemap: ${siteOrigin}/sitemap.xml`, "");

fs.writeFileSync(path.join(ROOT, "robots.txt"), robotsLines.join("\n"), "utf8");

console.log(`Generated sitemap.xml with ${urls.length} URLs.`);
console.log(`Generated robots.txt (indexable=${config.indexable}).`);

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
