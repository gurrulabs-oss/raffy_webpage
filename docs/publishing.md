# Publishing an article or tool page

1. Write the EN page by copying the closest existing page in `en/articles/` (or `en/tools/`) to keep head,
   JSON-LD, header, CTA and footer markup consistent.
2. Create ES/FR/PT versions with translated slugs and native copy (pt = Brazilian Portuguese).
3. Add a page group to `seo/articles.manifest.json` with the 4 routes and correct `type`.
4. Link it from the locale hub (`articles/index.html` per locale, or tools hub) and from ≥3 related pages.
5. If it is a priority page/tool, update `AGENTS.md`, `LLMS.md`, `llms.txt`.
6. Run `npm run seo:all`. Then revert collateral diffs from known sync bugs (duplicate `"publisher"` lines
   in untouched articles, sitemap `lastmod` changes for untouched URLs) unless that bug is fixed.
7. `npm run seo:validate` must pass. Check the page locally (`python3 -m http.server 8000`).
8. Commit on the ticket branch. Owner merges to `main` → deploys.

Checklist per article: primary + 3 secondary keywords, single h1, ≥3 same-locale internal links,
`datePublished`/`dateModified`, pediatric safety section if health-related, Play Store CTA, no `example.com`.

## Notify search engines (IndexNow)

After a deploy is live on production, ping IndexNow (Bing and partners) with the changed URLs:

    npm run seo:indexnow -- --changed <previous-main-sha>   # only pages whose files changed since that commit
    npm run seo:indexnow                                    # all sitemap URLs
    npm run seo:indexnow -- --dry-run                       # print the payload, send nothing

The key file `<key>.txt` at the repo root must stay published (not in `_config.yml` exclude). The first full run
(no args) is due after the T-018 ticket merges and deploys. 200/202 = accepted; anything else exits 1.
