#!/usr/bin/env node
// IndexNow submitter. Usage:
//   node scripts/indexnow.mjs [--dry-run] [--changed <git-ref>]
// Default: submit every <loc> in sitemap.xml. With --changed, only URLs whose source file changed since <git-ref>.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS = 10000;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const ci = args.indexOf("--changed");
const changedRef = ci >= 0 ? args[ci + 1] : null;
if (ci >= 0 && (!changedRef || changedRef.startsWith("--"))) fail("--changed needs a git ref");

const config = JSON.parse(fs.readFileSync(path.join(ROOT, "seo.config.json"), "utf8"));
const origin = config.siteOrigin.replace(/\/$/, "");
const host = new URL(origin).host;

const keyFiles = fs.readdirSync(ROOT).filter((f) => {
  return /^[0-9a-f]{32}\.txt$/.test(f) && fs.readFileSync(path.join(ROOT, f), "utf8").trim() === f.slice(0, -4);
});
if (keyFiles.length !== 1) fail(`Expected exactly one IndexNow key file in repo root, found ${keyFiles.length}`);
const key = keyFiles[0].slice(0, -4);

const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

let urlList = sitemapUrls;
if (changedRef) {
  let out;
  try {
    out = execFileSync("git", ["diff", "--name-only", changedRef, "HEAD"], { cwd: ROOT, encoding: "utf8" });
  } catch (e) {
    fail(`git diff against ${changedRef} failed`);
  }
  const wanted = new Set();
  for (const file of out.split("\n").map((s) => s.trim()).filter(Boolean)) {
    if (file.endsWith("/index.html")) wanted.add(`${origin}/${file.slice(0, -"index.html".length)}`);
    else if (file === "index.html") wanted.add(`${origin}/`);
    wanted.add(`${origin}/${file}`);
  }
  urlList = sitemapUrls.filter((u) => wanted.has(u));
  if (urlList.length === 0) {
    console.log(`No sitemap URLs changed since ${changedRef}; nothing to submit.`);
    process.exit(0);
  }
}
if (urlList.length > MAX_URLS) urlList = urlList.slice(0, MAX_URLS);

const payload = { host, key, keyLocation: `${origin}/${key}.txt`, urlList };
if (dryRun) {
  console.log(JSON.stringify(payload, null, 2));
  console.error(`[dry-run] ${urlList.length} URL(s); no request sent.`);
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});
console.log(`IndexNow response: ${res.status} ${res.statusText} (${urlList.length} URLs)`);
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text().catch(() => ""));
  process.exit(1);
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}
