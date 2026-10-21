import fs from 'fs';
const f='fr/outils/planificateur-repas-hebdomadaire-12-23-mois.html';
let h=fs.readFileSync(f,'utf8');
const a=`<main class="tool-wrap" id="top">
    <section class="tool-planner-grid">
      <article class="tool-planner-card tool-planner-controls">
        <p class="kicker"><span class="dot"></span> 12-23 mois</p>
        <h1>Planificateur de repas pour bebes et jeunes enfants</h1>
        <p>Outil educatif base sur des recommandations de sante publique. Ne remplace pas un avis medical.</p>

`;
if(!h.includes(a)) throw 'a';
h=h.replace(a,`<main id="top">
    <header class="tool-hero">
      <div class="container">
        <div class="inner">
          <ol class="crumbs"><li><a href="../index.html">Accueil</a></li><li><a href="index.html">Outils</a></li><li>Planificateur de repas hebdomadaire</li></ol>
          <p class="eyebrow">12-23 mois</p>
          <h1><em>Planificateur de repas</em> pour bebes et jeunes enfants</h1>
          <p class="sub">Outil educatif base sur des recommandations de sante publique. Ne remplace pas un avis medical.</p>
        </div>
      </div>
    </header>

    <div class="tool-wrap">
    <section class="tool-planner-grid">
      <article class="tool-planner-card tool-planner-controls">
`);
const cta=`    </div>

    <section class="cta-section container">
      <div class="cta-band">
        <div>
          <h2>Besoin d'une <em>application de suivi bébé</em> complète ?</h2>
          <p>Raffy réunit courbes de croissance, repas, sommeil et notes médicales au même endroit.</p>
        </div>
        <a class="play-store-badge-link" href="https://play.google.com/store/apps/details?id=com.gurrulabs.raffy" data-track-download="true" data-page-type="tool" data-cta-location="footer-band" aria-label="Télécharger sur Google Play"><img decoding="async" loading="lazy" class="play-store-badge" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Disponible sur Google Play"></a>
      </div>
    </section>
  </main>`;
h=h.replace(/\n  <\/main>/,'\n'+cta);
fs.writeFileSync(f,h);
