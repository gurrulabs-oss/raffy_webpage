import fs from 'fs';
const f='fr/index.html';
let h=fs.readFileSync(f,'utf8');
const P={
 moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
 growth:'<path d="M3 20h18M5 16l4-5 4 3 6-8"/><path d="M15 6h4v4"/>',
 feed:'<path d="M9 2h6M10 2v3l-2 3v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8l-2-3V2M8 12h8"/>',
 doc:'<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
 meal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 wake:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 play:'<path d="M6 3.5v17l14-8.5Z"/>',
 gift:'<path d="M20 12v8H4v-8M2 7h20v5H2zM12 22V7M12 7S10 3 7.5 3a2 2 0 0 0 0 4M12 7s2-4 4.5-4a2 2 0 0 1 0 4"/>',
 wifi:'<path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0M12 19h.01"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'};
const svg=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
const PS='https://play.google.com/store/apps/details?id=com.gurrulabs.raffy';
const inapp=`<a class="in-app" href="${PS}" data-track-download="true" data-page-type="home" data-cta-location="feature-card"><span>${svg(P.play)}</span>Dans l'app</a>`;
const feat=(t,ic,title,p,img,alt,w,hh)=>`          <article class="card feature ${t}">
            <span class="ico">${svg(ic)}</span>
            <h3>${title}</h3>
            <p>${p}</p>
            ${inapp}
            <div class="shot"><img decoding="async" loading="lazy" src="../assets/${img}" alt="${alt}" width="${w}" height="${hh}"></div>
          </article>`;
const tile=(c,ic,href,t,d)=>`          <a class="card tool-tile ${c}" href="${href}"><span class="ico">${svg(ic)}</span><div><h3>${t}</h3><p>${d}</p><span class="go">Ouvrir l'outil <span aria-hidden="true">→</span></span></div></a>`;
const mini=(tag,cls,href,t,d)=>`            <a class="card a-mini" href="${href}"><span class="tag${cls}">${tag}</span><h3>${t}</h3><p>${d}</p><span class="a-read">Lire l'article</span></a>`;
const main=`<main id="top">
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <p class="eyebrow">Application suivi bébé pour les familles d'aujourd'hui</p>
          <h1>Suivez sommeil, repas, croissance et étapes bébé dans <span class="hl">une seule application</span></h1>
          <p class="intro-line">Des journées plus sereines grâce à des routines lisibles.</p>
          <p class="lead">Raffy permet d'enregistrer siestes, repas, diversification, poids, taille, couches, médicaments et notes quotidiennes sur une chronologie claire.</p>
          <div class="hero-cta">
            <a class="play-store-badge-link" href="${PS}" data-track-download="true" data-page-type="home" data-cta-location="hero" aria-label="Télécharger sur Google Play"><img decoding="async" loading="lazy" class="play-store-badge" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Disponible sur Google Play"></a>
            <a class="btn btn-secondary" href="outils/index.html">Essayer les outils gratuits</a>
          </div>
          <ul class="trust">
            <li><span>${svg(P.gift)}</span>Gratuit sur Google Play</li>
            <li><span>${svg(P.wifi)}</span>Fonctionne hors ligne</li>
            <li><span>${svg(P.globe)}</span>English, Español, Français, Português</li>
          </ul>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="phone p1"><img decoding="async" loading="eager" src="../assets/feeding.webp" alt="" width="921" height="2048"></div>
          <div class="phone p2"><img decoding="async" loading="eager" src="../assets/sleep.webp" alt="" width="921" height="2048"></div>
          <div class="float-chip c1"><span class="ico">${svg(P.moon)}</span><div>Sieste enregistrée<small>1 h 20 min · 13 h 05</small></div></div>
          <div class="float-chip c2"><span class="ico">${svg(P.growth)}</span><div>Poids 7,9 kg<small>P50 · courbe OMS</small></div></div>
        </div>
      </div>
    </section>

    <section id="what" class="section">
      <div class="container">
        <div class="section-head">
          <h2>Qu'est-ce que Raffy ?</h2>
          <p>Raffy est une application Android conçue pour simplifier l'organisation quotidienne autour du bébé et faciliter les décisions parentales. Utilisez les outils web pour les décisions rapides, puis l'app pour le suivi continu.</p>
        </div>
      </div>
    </section>

    <section id="features" class="section home-features">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Tout ce qu'il faut, dans une seule app</p>
          <h2>Des modules utiles pour chaque moment de la journée</h2>
          <p>Du premier biberon au suivi des étapes, Raffy relie routines, santé et croissance.</p>
        </div>
        <div class="feature-grid">
${feat('t-sky',P.moon,'Sommeil',"Suivez siestes, fenêtres d'éveil et coucher avec un suivi du sommeil bébé qui facilite les routines par âge.",'sleep.webp','Écran sommeil de Raffy',921,2048)}
${feat('t-peach',P.feed,'Alimentation',"Enregistrez tétées ou biberons, quantités et durée pour un suivi d'alimentation bébé clair au quotidien.",'feeding.webp',"Écran alimentation de Raffy",921,2048)}
${feat('t-mint',P.growth,'Croissance','Suivez poids, taille et percentiles avec des courbes de croissance bébé pour échanger avec le pédiatre. <a href="outils/calculateur-percentiles-bebe-oms.html">Ouvrir le calculateur OMS</a>.','growth.webp','Écran croissance de Raffy',1080,1920)}
${feat('t-sun',P.doc,'Médicaments et médecin','Centralisez médicaments, rappels, notes pédiatriques et suivi vaccinal dans une seule chronologie de santé bébé.','doctor.webp','Écran médicaments et médecin de Raffy',1080,1920)}
        </div>
      </div>
    </section>

    <section id="tools" class="section band">
      <div class="container">
        <div class="section-head-row">
          <div class="section-head">
            <p class="eyebrow">Outils web gratuits</p>
            <h2>Des réponses rapides avant d'ouvrir l'app</h2>
          </div>
          <a class="btn btn-secondary" href="outils/index.html">Voir les 7 outils</a>
        </div>
        <div class="tool-grid">
${tile('t-mint',P.growth,'outils/calculateur-percentiles-bebe-oms.html','Calculateur de percentiles bébé (OMS)','Poids, taille et périmètre crânien selon les courbes OMS.')}
${tile('t-sky',P.wake,'outils/planificateur-fenetres-eveil.html',"Planificateur de fenêtres d'éveil par âge","Fenêtres d'éveil et structure des siestes selon l'âge.")}
${tile('t-peach',P.meal,'outils/planificateur-repas-hebdomadaire-12-23-mois.html','Planificateur de repas hebdomadaire (12-23 mois)','Un menu de 7 jours pour tout-petit, avec les portions.')}
        </div>
      </div>
    </section>

    <section id="articles" class="section">
      <div class="container">
        <div class="section-head-row">
          <div class="section-head">
            <p class="eyebrow">Guides parentaux</p>
            <h2>Guides parentaux mis en avant</h2>
            <p>Contenus pratiques sur sommeil bébé, diversification alimentaire, percentiles de croissance et développement.</p>
          </div>
          <a class="btn btn-secondary" href="articles/index.html">Accéder à la bibliothèque d'articles</a>
        </div>
        <div class="article-grid">
          <a class="card a-card" href="articles/etapes-developpement-premiere-annee-bebe.html">
            <div class="a-thumb"><img decoding="async" loading="lazy" src="../articles/images/hitos-desarrollo-4-6.png" alt="Image de couverture de l'article sur la première année de bébé"></div>
            <div class="a-body"><span class="tag">Développement</span><h3>La première année de votre bébé : l'année qui vous change pour toujours</h3><p>Un guide rassurant, trimestre par trimestre, pour accompagner le développement sans pression.</p><div class="a-meta"><span>Lire l'article</span></div></div>
          </a>
          <a class="card a-card" href="articles/menu-hebdomadaire-bebe-9-mois.html">
            <div class="a-thumb"><img decoding="async" loading="lazy" src="../articles/menu_9_months/cover_article_menu_9_months.png" alt="Image de couverture du menu hebdomadaire bébé 9 mois"></div>
            <div class="a-body"><span class="tag peach">Menu 9 mois</span><h3>Menu hebdomadaire bébé 9 mois : plan complet sur 7 jours</h3><p>Un menu pratique sur 7 jours pour bébé de 9 mois avec repas types, calories indicatives et repères de sécurité.</p><div class="a-meta"><span>Lire l'article</span></div></div>
          </a>
          <a class="card a-card" href="articles/premier-vaccin-bebe-ce-que-jai-appris.html">
            <div class="a-thumb"><img decoding="async" loading="lazy" src="../articles/images/vaccine.png" alt="Image de couverture de l'article sur le premier vaccin de bébé"></div>
            <div class="a-body"><span class="tag sun">Vaccins</span><h3>Le premier vaccin de mon bébé : ce que j'ai ressenti et appris</h3><p>Un témoignage réel du premier rendez-vous vaccinal : doutes, repères fiables et apaisement après.</p><div class="a-meta"><span>Lire l'article</span></div></div>
          </a>
        </div>
        <h3 class="more-guides-title">Plus de guides</h3>
        <div class="a-more">
${mini('Sommeil bébé',' sky','articles/routine-sommeil-bebe-par-age.html','Routine sommeil bébé par âge : guide pratique hebdomadaire','Mettez en place une routine sommeil bébé par âge avec siestes, fenêtres d\'éveil et coucher plus régulier.')}
${mini('Alimentation',' peach','articles/guide-diversification-bebe-blw.html','Guide diversification bébé : DME, purées et sécurité','Guide pratique de diversification alimentaire avec DME, purées, formats sûrs et plan de démarrage.')}
${mini('Croissance','','articles/percentiles-poids-taille-bebe.html','Percentiles poids taille bébé : comprendre les courbes de croissance','Comprenez les percentiles de croissance bébé et identifiez les situations à discuter avec le pédiatre.')}
${mini('Workflow Android',' sun','articles/application-android-suivi-bebe-guide.html','Meilleure application Android de suivi bébé','Sachez quand un outil web suffit et quand passer au suivi quotidien dans Raffy.')}
        </div>
      </div>
    </section>
`;
const faqM=h.match(/<section id="faq"[\s\S]*?<\/section>/)[0];
const faqItems=[...faqM.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/g)];
const faq=`    <section id="faq" class="section">
      <div class="container">
        <div class="section-head">
          <h2>Questions fréquentes sur Raffy</h2>
          <p>Réponses aux questions les plus courantes sur le sommeil, l'alimentation, la croissance et l'usage quotidien de Raffy.</p>
        </div>
        <div class="faq">
${faqItems.map((m,i)=>`          <details${i==0?' open':''}><summary>${m[1]}</summary><p>${m[2]}</p></details>`).join('\n')}
        </div>
      </div>
    </section>

    <section id="download" class="container">
      <div class="cta-band">
        <div>
          <h2>Suivez sommeil et <em>croissance bébé</em> avec Raffy</h2>
          <p>Téléchargez Raffy sur Google Play et structurez vos routines rapidement.</p>
        </div>
        <a class="play-store-badge-link" href="${PS}" data-track-download="true" data-page-type="home" data-cta-location="footer-cta" aria-label="Télécharger sur Google Play"><img decoding="async" loading="lazy" class="play-store-badge" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Disponible sur Google Play"></a>
      </div>
    </section>
  </main>`;
h=h.replace(/<main[\s\S]*?<\/main>/,main+faq);
h=h.replace('href="../assets/portada.webp" fetchpriority','href="../assets/feeding.webp" fetchpriority');
fs.writeFileSync(f,h);
