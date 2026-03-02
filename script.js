const ROUTE_MAP = {
  home: {
    en: "/en/",
    es: "/es/",
    fr: "/fr/",
    pt: "/pt/"
  },
  library: {
    en: "/en/articles/",
    es: "/es/articulos/",
    fr: "/fr/articles/",
    pt: "/pt/artigos/"
  },
  article_sleep_routine: {
    en: "/en/articles/baby-sleep-routine-by-age.html",
    es: "/es/articulos/rutina-sueno-bebe-por-edad.html",
    fr: "/fr/articles/routine-sommeil-bebe-par-age.html",
    pt: "/pt/artigos/rotina-sono-bebe-por-idade.html"
  },
  article_solids_guide: {
    en: "/en/articles/baby-solids-guide-blw-purees.html",
    es: "/es/articulos/guia-alimentacion-complementaria-blw.html",
    fr: "/fr/articles/guide-diversification-bebe-blw.html",
    pt: "/pt/artigos/guia-introducao-alimentar-bebe-blw.html"
  },
  article_weekly_menu_9_months: {
    en: "/en/articles/weekly-menu-9-month-old-baby.html",
    es: "/es/articulos/menu-semanal-bebe-9-meses.html",
    fr: "/fr/articles/menu-hebdomadaire-bebe-9-mois.html",
    pt: "/pt/artigos/cardapio-semanal-bebe-9-meses.html"
  },
  article_growth_percentiles: {
    en: "/en/articles/baby-weight-height-percentiles-guide.html",
    es: "/es/articulos/percentiles-peso-talla-bebe.html",
    fr: "/fr/articles/percentiles-poids-taille-bebe.html",
    pt: "/pt/artigos/percentis-peso-altura-bebe.html"
  },
  tool_growth_percentiles: {
    en: "/en/tools/baby-growth-percentile-calculator-who.html",
    es: "/es/herramientas/calculadora-percentiles-bebe-oms.html",
    fr: "/fr/outils/calculateur-percentiles-bebe-oms.html",
    pt: "/pt/ferramentas/calculadora-percentis-bebe-oms.html"
  },
  article_newborn_routine: {
    en: "/en/articles/newborn-daily-routine-guide.html",
    es: "/es/articulos/rutina-diaria-recien-nacido.html",
    fr: "/fr/articles/routine-quotidienne-nouveau-ne.html",
    pt: "/pt/artigos/rotina-diaria-recem-nascido.html"
  },
  article_milestones_year_one: {
    en: "/en/articles/first-year-baby-milestones-guide.html",
    es: "/es/articulos/hitos-desarrollo-primer-ano-bebe.html",
    fr: "/fr/articles/etapes-developpement-premiere-annee-bebe.html",
    pt: "/pt/artigos/marcos-desenvolvimento-primeiro-ano-bebe.html"
  },
  article_parenting_confidence: {
    en: "/en/articles/parenting-with-confidence-guide.html",
    es: "/es/articulos/criar-con-confianza-y-sin-culpa.html",
    fr: "/fr/articles/eduquer-avec-confiance-sans-culpabilite.html",
    pt: "/pt/artigos/criar-com-confianca-sem-culpa.html"
  },
  article_first_vaccine: {
    en: "/en/articles/first-baby-vaccine-what-i-learned.html",
    es: "/es/articulos/primera-vacuna-bebe-lo-que-aprendi.html",
    fr: "/fr/articles/premier-vaccin-bebe-ce-que-jai-appris.html",
    pt: "/pt/artigos/primeira-vacina-bebe-o-que-aprendi.html"
  },
  about: {
    en: "/en/about.html",
    es: "/es/sobre.html",
    fr: "/fr/a-propos.html",
    pt: "/pt/sobre.html"
  },
  editorial_policy: {
    en: "/en/editorial-policy.html",
    es: "/es/politica-editorial.html",
    fr: "/fr/politique-editoriale.html",
    pt: "/pt/politica-editorial.html"
  },
  privacy: {
    en: "/en/privacy.html",
    es: "/es/privacidad.html",
    fr: "/fr/confidentialite.html",
    pt: "/pt/privacidade.html"
  },
  data_deletion: {
    en: "/en/data-deletion.html",
    es: "/es/eliminacion-datos.html",
    fr: "/fr/suppression-donnees.html",
    pt: "/pt/exclusao-dados.html"
  },
  terms: {
    en: "/en/terms.html",
    es: "/es/terminos.html",
    fr: "/fr/conditions.html",
    pt: "/pt/termos.html"
  },
  contact: {
    en: "/en/contact.html",
    es: "/es/contacto.html",
    fr: "/fr/contact.html",
    pt: "/pt/contato.html"
  }
};

const LOCALE_CODES = ["en", "es", "fr", "pt"];
const STORAGE_KEY = "raffy_locale";
const MIXPANEL_TOKEN = "20a6baa8d266700297f9b0b16efc0a13";
const PAGE_LABELS = {
  home: "Main Page",
  library: "Articles",
  tool_growth_percentiles: "Growth Tool",
  about: "About",
  contact: "Contact",
  privacy: "Privacy",
  terms: "Terms",
  data_deletion: "Data Deletion",
  editorial_policy: "Editorial Policy"
};

const year = document.getElementById("year");
const toTop = document.getElementById("toTop");
const reveals = document.querySelectorAll(".reveal");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const downloadLinks = document.querySelectorAll('[data-track-download="true"]');
const bgLayer = document.querySelector(".bg-dynamic");
const bgShapes = document.querySelectorAll(".bg-shape");
const languageSelector = document.querySelector("[data-language-selector]");
const featureShots = document.querySelectorAll(".feature-showcase .feature-shot");
const clickableCards = document.querySelectorAll(".article-grid .article-card");
const body = document.body;

function initMixpanel() {
  (function mixpanelBootstrap(documentRef, mixpanelRef) {
    if (mixpanelRef.__SV) return;

    let script;
    let firstScript;
    let index;

    window.mixpanel = mixpanelRef;
    mixpanelRef._i = [];
    mixpanelRef.init = function init(token, config, name) {
      function setStub(target, method) {
        const parts = method.split(".");
        if (parts.length === 2) {
          target = target[parts[0]];
          method = parts[1];
        }
        target[method] = function stubbedMethod() {
          target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
        };
      }

      let instance = mixpanelRef;
      if (typeof name !== "undefined") {
        instance = mixpanelRef[name] = [];
      } else {
        name = "mixpanel";
      }

      instance.people = instance.people || [];
      instance.toString = function toString(debug) {
        let value = "mixpanel";
        if (name !== "mixpanel") value += `.${name}`;
        if (!debug) value += " (stub)";
        return value;
      };
      instance.people.toString = function peopleToString() {
        return `${instance.toString(1)}.people (stub)`;
      };

      const methods = "disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
      for (index = 0; index < methods.length; index += 1) {
        setStub(instance, methods[index]);
      }
      mixpanelRef._i.push([token, config, name]);
    };

    mixpanelRef.__SV = 1.2;
    script = documentRef.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
    firstScript = documentRef.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  })(document, window.mixpanel || []);

  window.mixpanel.init(MIXPANEL_TOKEN, {
    persistence: "localStorage",
    ip: true,
    api_host: "https://api-eu.mixpanel.com"
  });
}

function getTrackingContext() {
  const pageKey = body?.dataset.pageKey || "unknown";
  const language = LOCALE_CODES.includes(body?.dataset.locale) ? body.dataset.locale : "en";
  let page = PAGE_LABELS[pageKey] || "Main Page";
  let articleId;

  if (pageKey.startsWith("article_")) {
    page = "Articles";
    const englishRoute = ROUTE_MAP[pageKey]?.en || "";
    articleId = englishRoute.split("/").pop()?.replace(/\.html$/, "");
  }

  return {
    pageKey,
    page,
    language,
    articleId
  };
}

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_term: params.get("utm_term") || "",
    utm_content: params.get("utm_content") || ""
  };
}

function buildTrackingPayload(includeReferrer = false) {
  const context = getTrackingContext();
  const payload = {
    language: context.language,
    page: context.page,
    page_key: context.pageKey,
    path: window.location.pathname,
    url: window.location.href,
    ...getUtmParams()
  };

  if (context.articleId) {
    payload.article_id = context.articleId;
  }

  if (includeReferrer) {
    payload.referrer = document.referrer || "";
  }

  return payload;
}

function trackPageView() {
  const context = getTrackingContext();
  const payload = buildTrackingPayload(true);
  const eventName = `Raffy Webpage - ${context.page}`;

  if (window.mixpanel && typeof window.mixpanel.track === "function") {
    window.mixpanel.track(eventName, payload);
  }
}

if (year) year.textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
    }
  });
}, { threshold: 0.15 });

reveals.forEach((card, i) => {
  card.style.transitionDelay = `${Math.min(i * 70, 280)}ms`;
  observer.observe(card);
});

function initFeatureShotZoom() {
  if (!featureShots.length || !body) return;

  const locale = body.dataset.locale || "en";
  const labels = {
    en: { close: "Close", closeAria: "Close enlarged feature image" },
    es: { close: "Cerrar", closeAria: "Cerrar imagen ampliada de la funcionalidad" },
    fr: { close: "Fermer", closeAria: "Fermer l'image agrandie de la fonctionnalite" },
    pt: { close: "Fechar", closeAria: "Fechar imagem ampliada da funcionalidade" }
  };
  const ui = labels[locale] || labels.en;

  const viewer = document.createElement("aside");
  viewer.className = "feature-zoom-viewer";
  viewer.setAttribute("hidden", "");
  viewer.setAttribute("aria-live", "polite");
  viewer.innerHTML = `<button class="feature-zoom-close" type="button" aria-label="${ui.closeAria}">${ui.close}</button><img class="feature-zoom-image" alt="">`;
  document.body.appendChild(viewer);

  const viewerImage = viewer.querySelector(".feature-zoom-image");
  const closeButton = viewer.querySelector(".feature-zoom-close");
  let activeShot = null;

  const closeViewer = () => {
    if (!activeShot) return;
    viewer.classList.remove("is-open");
    viewer.setAttribute("hidden", "");
    activeShot.classList.remove("is-zoom-source");
    activeShot.setAttribute("aria-expanded", "false");
    activeShot = null;
  };

  const openViewer = (shot) => {
    if (activeShot === shot && viewer.classList.contains("is-open")) {
      closeViewer();
      return;
    }

    if (activeShot) {
      activeShot.classList.remove("is-zoom-source");
      activeShot.setAttribute("aria-expanded", "false");
    }

    viewerImage.src = shot.currentSrc || shot.src;
    viewerImage.alt = shot.alt || "";
    viewerImage.classList.toggle("is-contain", shot.classList.contains("feature-shot-contain"));

    viewer.removeAttribute("hidden");
    viewer.classList.add("is-open");

    shot.classList.add("is-zoom-source");
    shot.setAttribute("aria-expanded", "true");
    activeShot = shot;
  };

  closeButton?.addEventListener("click", closeViewer);

  featureShots.forEach((shot) => {
    shot.classList.add("feature-shot-zoomable");
    shot.setAttribute("role", "button");
    shot.setAttribute("tabindex", "0");
    shot.setAttribute("aria-expanded", "false");

    shot.addEventListener("click", () => openViewer(shot));
    shot.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openViewer(shot);
      }
      if (event.key === "Escape") {
        closeViewer();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeViewer();
    }
  });
}

initFeatureShotZoom();

function initClickableArticleCards() {
  if (!clickableCards.length) return;

  const interactiveSelector = "a, button, input, select, textarea, label";

  clickableCards.forEach((card) => {
    const primaryLink = card.querySelector(":scope > .article-link");
    if (!primaryLink) return;

    card.classList.add("article-card-clickable");
    if (!card.hasAttribute("tabindex")) card.tabIndex = 0;
    if (!card.hasAttribute("role")) card.setAttribute("role", "link");

    const cardTitle = card.querySelector("h3")?.textContent?.trim();
    if (cardTitle) {
      card.setAttribute("aria-label", cardTitle);
    }

    card.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(interactiveSelector)) return;
      primaryLink.click();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      primaryLink.click();
    });
  });
}

initClickableArticleCards();

function initFooterPlayBadge() {
  const footer = document.querySelector("footer.footer");
  if (!footer || footer.querySelector(".footer-play-store")) return;

  const locale = body?.dataset.locale || "en";
  const labels = {
    en: { aria: "Get it on Google Play", alt: "Get it on Google Play" },
    es: { aria: "Descargar en Google Play", alt: "Disponible en Google Play" },
    fr: { aria: "Télécharger sur Google Play", alt: "Disponible sur Google Play" },
    pt: { aria: "Baixar no Google Play", alt: "Disponível no Google Play" }
  };
  const copy = labels[locale] || labels.en;

  const pageKey = body?.dataset.pageKey || "";
  const pageType = pageKey === "home" ? "home" : pageKey === "library" ? "library" : pageKey.startsWith("article_") ? "article" : "trust";
  const articleSlug = pageType === "article" ? window.location.pathname.split("/").pop()?.replace(/\.html$/, "") || "" : "";

  const link = document.createElement("a");
  link.className = "play-store-badge-link footer-play-store";
  link.href = "https://play.google.com/store/apps/details?id=com.gurrulabs.raffy";
  link.setAttribute("aria-label", copy.aria);
  link.dataset.trackDownload = "true";
  link.dataset.pageType = pageType;
  link.dataset.ctaLocation = "footer";
  if (articleSlug) link.dataset.articleSlug = articleSlug;

  const image = document.createElement("img");
  image.decoding = "async";
  image.loading = "lazy";
  image.className = "play-store-badge";
  image.src = "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";
  image.alt = copy.alt;

  link.appendChild(image);
  footer.appendChild(link);
  link.addEventListener("click", () => trackDownloadClick(link));
}

initFooterPlayBadge();

window.addEventListener("scroll", () => {
  if (!toTop) return;
  if (window.scrollY > 320) toTop.classList.add("show");
  else toTop.classList.remove("show");
});

let bgTicking = false;

function updateDynamicBackground() {
  const scrollLimit = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const p = Math.min(Math.max(window.scrollY / scrollLimit, 0), 1);

  if (bgLayer) {
    bgLayer.style.setProperty("--bg-x1", `${16 + p * 24}%`);
    bgLayer.style.setProperty("--bg-y1", `${14 + p * 18}%`);
    bgLayer.style.setProperty("--bg-x2", `${84 - p * 28}%`);
    bgLayer.style.setProperty("--bg-y2", `${20 + p * 28}%`);
    bgLayer.style.setProperty("--bg-x3", `${52 + p * 8}%`);
    bgLayer.style.setProperty("--bg-y3", `${86 - p * 24}%`);
  }

  bgShapes.forEach((shape, index) => {
    const direction = index % 2 === 0 ? 1 : -1;
    const driftX = (index + 1) * 12 * p * direction;
    const driftY = (index + 1) * 18 * p * (direction * -1);
    const rotate = (index + 1) * 4 * p * direction;
    shape.style.transform = `translate3d(${driftX}px, ${driftY}px, 0) rotate(${rotate}deg)`;
  });

  bgTicking = false;
}

window.addEventListener("scroll", () => {
  if (bgTicking) return;
  bgTicking = true;
  window.requestAnimationFrame(updateDynamicBackground);
}, { passive: true });

window.addEventListener("resize", () => {
  window.requestAnimationFrame(updateDynamicBackground);
});

updateDynamicBackground();

toTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function trackDownloadClick(link) {
  const payload = {
    ...buildTrackingPayload(false),
    cta_location: link.dataset.ctaLocation || "unknown",
    target_url: link.href || ""
  };

  if (window.mixpanel && typeof window.mixpanel.track === "function") {
    window.mixpanel.track("Raffy Webpage - Download Button Clicked", payload);
  }
}

downloadLinks.forEach((link) => {
  link.addEventListener("click", () => trackDownloadClick(link));
});

initMixpanel();
trackPageView();

function getBasePrefix() {
  const segments = window.location.pathname.split("/").filter(Boolean);
  const localeIndex = segments.findIndex((segment) => LOCALE_CODES.includes(segment));
  if (localeIndex === -1) return "";

  const rawPrefix = `/${segments.slice(0, localeIndex).join("/")}`;
  return rawPrefix === "/" ? "" : rawPrefix;
}

function getRouteForLocale(pageKey, nextLocale) {
  const pageRoutes = ROUTE_MAP[pageKey] || ROUTE_MAP.home;
  return pageRoutes[nextLocale] || ROUTE_MAP.home[nextLocale] || ROUTE_MAP.home.en;
}

function handleLanguageSelector() {
  if (!languageSelector || !body) return;

  const pageKey = body.dataset.pageKey || "home";
  const currentLocale = body.dataset.locale || "en";

  languageSelector.value = currentLocale;

  try {
    localStorage.setItem(STORAGE_KEY, currentLocale);
  } catch (error) {
    // Ignore storage restrictions.
  }

  languageSelector.addEventListener("change", () => {
    const nextLocale = languageSelector.value;

    try {
      localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch (error) {
      // Ignore storage restrictions.
    }

    const target = getRouteForLocale(pageKey, nextLocale);
    const basePrefix = getBasePrefix();
    window.location.href = `${basePrefix}${target}`;
  });
}

handleLanguageSelector();
