# S1 foundation notes (for page workers)

- styles.css = B v2 (`.lead/designs/T-010/raffy.css`) + legacy class restyles at the bottom. Put page-type-specific CSS in tools/*.css or articles/article.css; shared components already exist in styles.css (check before adding).
- Header: `.site-header > .container.nav > .brand + nav.navlinks#site-nav + .nav-end` — already on every page; don't change it. Mint hero header is automatic when `main` starts with `.hero`, `.tool-hero` or `.article-hero`, or force with `<body class="has-hero">`.
- script.js: download tracking is delegated on document (any `[data-track-download="true"]` inserted at any time is tracked). `window.RaffyStickyCta.show()/hide()` for tools after a result; article/library pages put `data-sticky="scroll"` on the bar (shows after 40% scroll, <=720px). `.reveal` no longer animates.
- Known collisions: styles.css `.chip` (44px bordered) vs article.css `.chip` tag; `.tool-grid` is now a 3-col grid in styles.css but cluster tool forms also use `.tool-grid`; home's `section.hero.container` gets the mint hero band.

Sticky bar snippet (image path relative to page; data-page-type = page's existing value):
```html
<div class="sticky-cta" data-sticky="scroll">
  <img src="../../assets/raffy-logo.png" alt="" width="40" height="40">
  <div class="t">Raffy baby tracker<small>Free · Android</small></div>
  <a class="btn btn-sm" href="https://play.google.com/store/apps/details?id=com.gurrulabs.raffy" data-track-download="true" data-page-type="article" data-cta-location="sticky">Get the app</a>
  <button class="x" type="button" aria-label="Dismiss"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
</div>
```
(tools: omit data-sticky, call RaffyStickyCta.show() after a result.) Strings EN/ES/FR/PT: "Raffy baby tracker"/"Raffy para tu bebé"/"Raffy pour bébé"/"Raffy para o bebê"; "Free · Android"/"Gratis · Android"/"Gratuit · Android"/"Grátis · Android"; "Get the app"/"Descargar la app"/"Télécharger l'app"/"Baixar o app"; aria "Dismiss"/"Cerrar"/"Fermer"/"Fechar".

Bottom CTA band (reuse the page's existing download section copy; tool version: add `has-shot` + `.copy`/`.cta-shot` as in mockup tool.html):
```html
<section id="download" class="container">
  <div class="cta-band">
    <div><h2>…existing heading…</h2><p>…existing text…</p></div>
    <a class="play-store-badge-link" href="https://play.google.com/store/apps/details?id=com.gurrulabs.raffy" data-track-download="true" data-page-type="home" data-cta-location="footer-band" aria-label="Get it on Google Play"><img decoding="async" loading="lazy" class="play-store-badge" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play"></a>
  </div>
</section>
```
If the page already has a download section with an existing data-cta-location (e.g. `footer-cta`), KEEP that value on its link (restyle it as the band) rather than renaming it.
