import fs from 'fs';
const f='fr/outils/index.html';
let h=fs.readFileSync(f,'utf8');
const ic={
 growth:'<path d="M3 20h18M5 16l4-5 4 3 6-8"/><path d="M15 6h4v4"/>',
 meal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 wake:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 nap:'<path d="M4 18h16M6 18v-5a6 6 0 0 1 12 0v5M9 8l-2-3M15 8l2-3"/>',
 solids:'<path d="M4 11h16a8 8 0 0 1-16 0ZM12 3v4M8 5l1 2M16 5l-1 2"/>',
 diaper:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
 feed:'<path d="M9 2h6M10 2v3l-2 3v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8l-2-3V2M8 12h8"/>',
 play:'<path d="M6 3.5v17l14-8.5Z"/>'};
const svg=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
const tiles=[];
const re=/<article class="article-card reveal">\s*<p class="article-tag">(.*?)<\/p>\s*<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>\s*<a href="(.*?)" class="article-link">(.*?)<\/a>\s*<\/article>/gs;
const map=[['t-mint','growth'],['t-peach','meal'],['t-sky','wake'],['t-sky','nap'],['t-peach','solids'],['t-sun','diaper'],['t-peach','feed']];
let m,i=0;
while((m=re.exec(h))){
 const [_,tag,t,d,href,go]=m;
 if(i<7){const [c,k]=map[i];tiles.push(`        <a class="card tool-tile ${c}" href="${href}"><span class="ico">${svg(ic[k])}</span><div><h3>${t}</h3><p>${d}</p><span class="go">${go} <span aria-hidden="true">→</span></span><span class="app-hint"><span>${svg(ic.play)}</span>Aussi dans l'app Raffy</span></div></a>`);}
 else tiles.push(`        <a class="card tool-tile is-blue" href="${href}"><span class="ico">${svg(ic.play)}</span><div><span class="tag">${tag}</span><h3>${t}</h3><p>${d}</p><span class="go">${go} <span aria-hidden="true">→</span></span></div></a>`);
 i++;
}
const main=`<main>
    <header class="tool-hero">
      <div class="container">
        <div class="inner">
          <ol class="crumbs"><li><a href="../index.html">Accueil</a></li><li>Outils</li></ol>
          <p class="eyebrow">Outils web gratuits</p>
          <h1>Outils parentaux</h1>
          <p class="sub">Résolvez les blocages du quotidien avec des outils concrets pour le sommeil, l'alimentation, la croissance et le suivi.</p>
          <p class="sub">Utilisez les outils pour des réponses rapides, puis passez à l'application Android Raffy pour les rappels et l'historique continu. <a href="../articles/application-android-suivi-bebe-guide.html">Lire le guide Android</a>.</p>
        </div>
      </div>
    </header>
    <div class="container">
      <h2 class="sr-only">Outils web gratuits</h2>
      <div class="tool-grid">
${tiles.join('\n')}
      </div>

      <section class="cta-section">
        <div class="cta-band">
          <div>
            <h2>Besoin d'une <em>application de suivi bébé</em> complète ?</h2>
            <p>Raffy réunit courbes de croissance, repas, sommeil et notes médicales au même endroit.</p>
          </div>
          <a class="play-store-badge-link" href="https://play.google.com/store/apps/details?id=com.gurrulabs.raffy" data-track-download="true" data-page-type="tool" data-cta-location="footer-band" aria-label="Télécharger sur Google Play"><img decoding="async" loading="lazy" class="play-store-badge" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Disponible sur Google Play"></a>
        </div>
      </section>
    </div>
  </main>`;
h=h.replace(/<main[\s\S]*?<\/main>/,main);
fs.writeFileSync(f,h);
