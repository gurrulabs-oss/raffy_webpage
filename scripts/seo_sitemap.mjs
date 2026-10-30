import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const config = readJson(path.join(ROOT, "seo.config.json"));
const manifest = readJson(path.join(ROOT, "seo", "articles.manifest.json"));

const siteOrigin = normalizeOrigin(config.siteOrigin);
const extraIndexablePaths = normalizePaths(config.extraIndexablePaths || []);
const aiDiscoveryPaths = normalizePaths(config.aiDiscoveryPaths || extraIndexablePaths);
const existingLastmod = readExistingLastmods(path.join(ROOT, "sitemap.xml"));
const today = new Date().toISOString().slice(0, 10);
const urls = [];

for (const page of manifest.pages) {
  for (const route of Object.values(page.routes)) {
    const filePath = routeToFile(route);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing file for route ${route}: ${filePath}`);
    }

    const loc = `${siteOrigin}${route}`;
    urls.push({ loc, lastmod: resolveLastmod(filePath, loc) });
  }
}

for (const route of extraIndexablePaths) {
  const filePath = routeToFile(route);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file for extra indexable path ${route}: ${filePath}`);
  }
  const loc = `${siteOrigin}${route}`;
  urls.push({ loc, lastmod: resolveLastmod(filePath, loc) });
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
  // Explicit groups for AI search/user/training crawlers and Bing (docs/ai-visibility.md).
  // A bot that matches its own group ignores `*`, so each group repeats `Allow: /`.
  const namedBots = [
    "OAI-SearchBot", "ChatGPT-User", "GPTBot",
    "Claude-SearchBot", "Claude-User", "ClaudeBot",
    "PerplexityBot", "Perplexity-User", "Google-Extended", "Bingbot"
  ];
  for (const bot of namedBots) {
    robotsLines.push("", `User-agent: ${bot}`, "Allow: /");
  }
} else {
  robotsLines.push("Disallow: /");
}
robotsLines.push("", `Sitemap: ${siteOrigin}/sitemap.xml`, "");

fs.writeFileSync(path.join(ROOT, "robots.txt"), robotsLines.join("\n"), "utf8");

writeIfChanged(path.join(ROOT, "llms.txt"), buildLlmsTxt());

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

function readExistingLastmods(filePath) {
  const map = new Map();
  if (!fs.existsSync(filePath)) return map;
  const xml = fs.readFileSync(filePath, "utf8");
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)) {
    map.set(m[1].trim(), m[2]);
  }
  return map;
}

function resolveLastmod(filePath, loc) {
  if (filePath.endsWith(".html")) {
    const m = fs.readFileSync(filePath, "utf8").match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
    if (m) return m[1];
  }
  return existingLastmod.get(loc) || today;
}

function writeIfChanged(filePath, content) {
  if (!fs.existsSync(filePath) || fs.readFileSync(filePath, "utf8") !== content) {
    fs.writeFileSync(filePath, content, "utf8");
  }
}

function decodeEntities(text) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return named[e.toLowerCase()] ?? all;
  });
}

// llms.txt (llmstxt.org): intro text is fixed; page lines come from the manifest + each page's <title>/<meta description>.
function buildLlmsTxt() {
  const meta = (route) => {
    const html = fs.readFileSync(routeToFile(route), "utf8");
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? route;
    const desc = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "";
    return { title: decodeEntities(title.trim()).replace(/\s*\|.*$/, ""), desc: decodeEntities(desc.trim()) };
  };
  const line = (label, route, desc) => `- [${label}](${siteOrigin}${route})${desc ? `: ${desc}` : ""}`;
  const pageLine = (route) => { const m = meta(route); return line(m.title, route, m.desc); };
  const section = (heading, lines) => [`## ${heading}`, "", ...lines, ""];
  const listed = new Set();
  const routes = (locale, types) => {
    const found = manifest.pages.filter((p) => types.includes(p.type)).map((p) => p.routes[locale]);
    found.forEach((r) => listed.add(r));
    return found;
  };
  const toolsFirst = (locale) => {
    const hub = manifest.pages.find((p) => p.id === "tool_library").routes[locale];
    return [hub, ...routes(locale, ["tool"]).filter((r) => r !== hub)];
  };

  const locales = Object.keys(config.locales);
  const homes = locales.map((l) => {
    const r = manifest.pages.find((p) => p.type === "home").routes[l];
    listed.add(r);
    return line(`Raffy home (${config.locales[l].name})`, r, l === "en" ? "overview of app modules and FAQ" : `${config.locales[l].name} version`);
  });
  const out = [
    "# Raffy",
    "",
    "> Raffy is a free Android app for baby care (sleep, feeding, growth, medicines and vaccines) made by Gurru Labs. raffyparenting.com is its website, with free parenting articles and calculators in English, Spanish, French, Brazilian Portuguese, Italian and German. Content is educational and non-diagnostic.",
    "",
    "The app is available only on Google Play. The website has no accounts; tools run in the browser. Each page exists in six language versions with translated URLs.",
    "",
    ...section("App", ["- [Raffy on Google Play](https://play.google.com/store/apps/details?id=com.gurrulabs.raffy): Android baby tracker for sleep, feeding, growth, medicines and vaccines", ...homes])
  ];
  const content = (l) => routes(l, ["library", "article"]);
  out.push(...section("Free tools", toolsFirst("en").map(pageLine)));
  for (const l of locales) {
    const tools = l === "en" ? [] : toolsFirst(l);
    out.push(...section(l === "en" ? "Articles (English)" : config.locales[l].name, [...tools, ...content(l)].map(pageLine)));
  }
  const optional = [
    "- [LLMS.md](" + siteOrigin + "/LLMS.md): reference summary of Raffy and the site",
    "- [AGENTS.md](" + siteOrigin + "/AGENTS.md): short factual overview and URL index",
    "- [Sitemap](" + siteOrigin + "/sitemap.xml): all indexable URLs"
  ];
  for (const { loc } of dedupedUrls) {
    const route = loc.slice(siteOrigin.length);
    if (listed.has(route) || !route.endsWith(".html")) continue;
    const l = route.split("/")[1];
    const m = meta(route);
    optional.push(line(`${m.title} (${l.toUpperCase()})`, route, m.desc));
  }
  out.push(...section("Optional", optional));
  return out.join("\n");
}
