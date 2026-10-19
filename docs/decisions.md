# Decisions

- **Static hand-written HTML, no build step.** HTML files are the source of truth. A rework (templating/build)
  is acceptable if a ticket justifies it — owner approved the idea, not a specific design.
- **All 4 locales ship together.** No page exists in only some locales; manifest enforces equivalence.
- **SEO metadata is script-owned.** Canonical/hreflang/footer/robots come from `seo_sync.mjs` + manifest.
- **Deploy = push to `main`** (GitHub Pages). Agents never push; owner merges.
- **Public AI discovery files** (`/AGENTS.md`, `/LLMS.md`, `/llms.txt`) are indexable site content listed in
  `seo.config.json` and `robots.txt`. Agent instructions live in `CLAUDE.md`, not in `AGENTS.md`.
- **Legal pages are owner-only.**
- **Analytics = Mixpanel**, a project shared across Gurru Labs websites (EU host). Event names are prefixed
  `Raffy Webpage - ` to separate them from the other sites. The privacy policy already lists Mixpanel.
- **Newsletter via `mailto:`** — no backend/email provider yet.
