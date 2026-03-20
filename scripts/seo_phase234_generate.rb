#!/usr/bin/env ruby
# frozen_string_literal: true

require "fileutils"
require "pathname"

ROOT = Dir.pwd
SITE_ORIGIN = "https://www.raffyparenting.com"

LOCALES = {
  "en" => {
    lang: "en",
    locale_tag: "en-US",
    root: "/en/",
    article_dir: "/en/articles/",
    tools_dir: "/en/tools/",
    article_folder: "articles",
    tools_folder: "tools",
    labels: {
      home: "Home",
      articles: "Articles",
      tools: "Tools",
      open_tool: "Open tool",
      read_guide: "Read guide",
      related: "Related resources",
      app_cta: "Get it on Google Play",
      printable: "Print this sheet",
      newsletter_btn: "Subscribe",
      newsletter_placeholder: "you@example.com",
      trust_aria: "Trust and legal pages",
      about: "About",
      editorial: "Editorial Policy",
      privacy: "Privacy",
      deletion: "Data Deletion",
      terms: "Terms",
      contact: "Contact"
    }
  },
  "es" => {
    lang: "es",
    locale_tag: "es-ES",
    root: "/es/",
    article_dir: "/es/articulos/",
    tools_dir: "/es/herramientas/",
    article_folder: "articulos",
    tools_folder: "herramientas",
    labels: {
      home: "Inicio",
      articles: "Artículos",
      tools: "Herramientas",
      open_tool: "Abrir herramienta",
      read_guide: "Leer guía",
      related: "Recursos relacionados",
      app_cta: "Descargar en Google Play",
      printable: "Imprimir plantilla",
      newsletter_btn: "Suscribirme",
      newsletter_placeholder: "tu@email.com",
      trust_aria: "Páginas de confianza y legales",
      about: "Quiénes somos",
      editorial: "Política editorial",
      privacy: "Privacidad",
      deletion: "Eliminación de datos",
      terms: "Términos",
      contact: "Contacto"
    }
  },
  "fr" => {
    lang: "fr",
    locale_tag: "fr-FR",
    root: "/fr/",
    article_dir: "/fr/articles/",
    tools_dir: "/fr/outils/",
    article_folder: "articles",
    tools_folder: "outils",
    labels: {
      home: "Accueil",
      articles: "Articles",
      tools: "Outils",
      open_tool: "Ouvrir l'outil",
      read_guide: "Lire le guide",
      related: "Ressources liées",
      app_cta: "Télécharger sur Google Play",
      printable: "Imprimer cette fiche",
      newsletter_btn: "S'abonner",
      newsletter_placeholder: "vous@email.com",
      trust_aria: "Pages de confiance et mentions légales",
      about: "À propos",
      editorial: "Politique éditoriale",
      privacy: "Confidentialité",
      deletion: "Suppression des données",
      terms: "Conditions",
      contact: "Contact"
    }
  },
  "pt" => {
    lang: "pt",
    locale_tag: "pt-BR",
    root: "/pt/",
    article_dir: "/pt/artigos/",
    tools_dir: "/pt/ferramentas/",
    article_folder: "artigos",
    tools_folder: "ferramentas",
    labels: {
      home: "Início",
      articles: "Artigos",
      tools: "Ferramentas",
      open_tool: "Abrir ferramenta",
      read_guide: "Ler guia",
      related: "Recursos relacionados",
      app_cta: "Baixar no Google Play",
      printable: "Imprimir folha",
      newsletter_btn: "Assinar",
      newsletter_placeholder: "voce@email.com",
      trust_aria: "Páginas de confiança e legais",
      about: "Sobre",
      editorial: "Política editorial",
      privacy: "Privacidade",
      deletion: "Exclusão de dados",
      terms: "Termos",
      contact: "Contato"
    }
  }
}.freeze

TRUST_ROUTES = {
  "about" => { "en" => "/en/about.html", "es" => "/es/sobre.html", "fr" => "/fr/a-propos.html", "pt" => "/pt/sobre.html" },
  "editorial" => { "en" => "/en/editorial-policy.html", "es" => "/es/politica-editorial.html", "fr" => "/fr/politique-editoriale.html", "pt" => "/pt/politica-editorial.html" },
  "privacy" => { "en" => "/en/privacy.html", "es" => "/es/privacidad.html", "fr" => "/fr/confidentialite.html", "pt" => "/pt/privacidade.html" },
  "deletion" => { "en" => "/en/data-deletion.html", "es" => "/es/eliminacion-datos.html", "fr" => "/fr/suppression-donnees.html", "pt" => "/pt/exclusao-dados.html" },
  "terms" => { "en" => "/en/terms.html", "es" => "/es/terminos.html", "fr" => "/fr/conditions.html", "pt" => "/pt/termos.html" },
  "contact" => { "en" => "/en/contact.html", "es" => "/es/contacto.html", "fr" => "/fr/contact.html", "pt" => "/pt/contato.html" }
}.freeze

EXISTING_CORE = {
  "sleep_article" => { "en" => "/en/articles/baby-sleep-routine-by-age.html", "es" => "/es/articulos/rutina-sueno-bebe-por-edad.html", "fr" => "/fr/articles/routine-sommeil-bebe-par-age.html", "pt" => "/pt/artigos/rotina-sono-bebe-por-idade.html" },
  "solids_article" => { "en" => "/en/articles/baby-solids-guide-blw-purees.html", "es" => "/es/articulos/guia-alimentacion-complementaria-blw.html", "fr" => "/fr/articles/guide-diversification-bebe-blw.html", "pt" => "/pt/artigos/guia-introducao-alimentar-bebe-blw.html" },
  "growth_article" => { "en" => "/en/articles/baby-weight-height-percentiles-guide.html", "es" => "/es/articulos/percentiles-peso-talla-bebe.html", "fr" => "/fr/articles/percentiles-poids-taille-bebe.html", "pt" => "/pt/artigos/percentis-peso-altura-bebe.html" },
  "milestone_article" => { "en" => "/en/articles/first-year-baby-milestones-guide.html", "es" => "/es/articulos/hitos-desarrollo-primer-ano-bebe.html", "fr" => "/fr/articles/etapes-developpement-premiere-annee-bebe.html", "pt" => "/pt/artigos/marcos-desenvolvimento-primeiro-ano-bebe.html" },
  "who_tool" => { "en" => "/en/tools/baby-growth-percentile-calculator-who.html", "es" => "/es/herramientas/calculadora-percentiles-bebe-oms.html", "fr" => "/fr/outils/calculateur-percentiles-bebe-oms.html", "pt" => "/pt/ferramentas/calculadora-percentis-bebe-oms.html" },
  "meal_tool" => { "en" => "/en/tools/weekly-meal-planner-12-23-months.html", "es" => "/es/herramientas/planificador-comidas-semanal-12-23-meses.html", "fr" => "/fr/outils/planificateur-repas-hebdomadaire-12-23-mois.html", "pt" => "/pt/ferramentas/planejador-cardapio-semanal-12-23-meses.html" }
}.freeze

PILLARS = {
  "sleep_hub" => {
    routes: {
      "en" => "/en/articles/sleep-by-age-hub.html",
      "es" => "/es/articulos/sueno-por-edad-hub.html",
      "fr" => "/fr/articles/sommeil-par-age-hub.html",
      "pt" => "/pt/artigos/sono-por-idade-hub.html"
    },
    titles: {
      "en" => "Sleep by Age Hub for Babies and Toddlers | Raffy",
      "es" => "Hub de sueño por edad para bebés y toddlers | Raffy",
      "fr" => "Hub sommeil par âge pour bébés et tout-petits | Raffy",
      "pt" => "Hub de sono por idade para bebês e toddlers | Raffy"
    },
    desc: {
      "en" => "Plan baby and toddler sleep by age with routines, wake windows, transition guides, and printable sheets.",
      "es" => "Planifica el sueño por edad con rutinas, ventanas de vigilia, transiciones y plantillas imprimibles.",
      "fr" => "Planifiez le sommeil par âge avec routines, fenêtres d'éveil, transitions et fiches imprimables.",
      "pt" => "Planeje o sono por idade com rotinas, janelas de vigília, transições e folhas imprimíveis."
    }
  },
  "feeding_hub" => {
    routes: {
      "en" => "/en/articles/feeding-by-age-hub.html",
      "es" => "/es/articulos/alimentacion-por-edad-hub.html",
      "fr" => "/fr/articles/alimentation-par-age-hub.html",
      "pt" => "/pt/artigos/alimentacao-por-idade-hub.html"
    },
    titles: {
      "en" => "Feeding by Age Hub for Babies and Toddlers | Raffy",
      "es" => "Hub de alimentación por edad para bebés y toddlers | Raffy",
      "fr" => "Hub alimentation par âge pour bébés et tout-petits | Raffy",
      "pt" => "Hub de alimentação por idade para bebês e toddlers | Raffy"
    },
    desc: {
      "en" => "Use age-based feeding plans, solids progression tools, and weekly planners for practical routines.",
      "es" => "Usa planes de alimentación por edad, progresión de sólidos y planificadores semanales.",
      "fr" => "Utilisez des plans d'alimentation par âge, progression de diversification et planification hebdomadaire.",
      "pt" => "Use planos de alimentação por idade, progressão alimentar e planejadores semanais."
    }
  },
  "growth_hub" => {
    routes: {
      "en" => "/en/articles/growth-tracking-hub.html",
      "es" => "/es/articulos/seguimiento-crecimiento-hub.html",
      "fr" => "/fr/articles/suivi-croissance-hub.html",
      "pt" => "/pt/artigos/monitoramento-crescimento-hub.html"
    },
    titles: {
      "en" => "Growth Tracking Hub for the First Years | Raffy",
      "es" => "Hub de seguimiento de crecimiento en los primeros años | Raffy",
      "fr" => "Hub suivi de croissance des premières années | Raffy",
      "pt" => "Hub de monitoramento de crescimento nos primeiros anos | Raffy"
    },
    desc: {
      "en" => "Track weight and height trends with WHO tools, checklists, and pediatric escalation guidance.",
      "es" => "Sigue tendencias de peso y talla con herramientas OMS, checklists y señales de consulta.",
      "fr" => "Suivez poids et taille avec outils OMS, check-lists et critères d'orientation pédiatrique.",
      "pt" => "Monitore peso e altura com ferramentas OMS, checklists e sinais para procurar pediatra."
    }
  },
  "milestones_hub" => {
    routes: {
      "en" => "/en/articles/development-milestones-hub.html",
      "es" => "/es/articulos/hitos-desarrollo-hub.html",
      "fr" => "/fr/articles/etapes-developpement-hub.html",
      "pt" => "/pt/artigos/marcos-desenvolvimento-hub.html"
    },
    titles: {
      "en" => "Development Milestones Hub 0-24 Months | Raffy",
      "es" => "Hub de hitos del desarrollo 0-24 meses | Raffy",
      "fr" => "Hub étapes du développement 0-24 mois | Raffy",
      "pt" => "Hub de marcos do desenvolvimento 0-24 meses | Raffy"
    },
    desc: {
      "en" => "Follow month-by-month milestones with practical observations, checklists, and next-step actions.",
      "es" => "Sigue hitos mes a mes con observación práctica, checklist y próximos pasos.",
      "fr" => "Suivez les étapes mois par mois avec observation pratique, check-list et prochaines actions.",
      "pt" => "Acompanhe marcos mês a mês com observação prática, checklist e próximos passos."
    }
  }
}.freeze

AGE_INTENT = {
  "sleep_age_page" => {
    routes: {
      "en" => "/en/articles/sleep-schedule-6-month-old.html",
      "es" => "/es/articulos/horario-sueno-bebe-6-meses.html",
      "fr" => "/fr/articles/rythme-sommeil-bebe-6-mois.html",
      "pt" => "/pt/artigos/rotina-sono-bebe-6-meses.html"
    },
    titles: {
      "en" => "6-Month-Old Sleep Schedule: Realistic Daily Plan | Raffy",
      "es" => "Horario de sueño para bebé de 6 meses: plan realista diario | Raffy",
      "fr" => "Rythme de sommeil bébé 6 mois: plan quotidien réaliste | Raffy",
      "pt" => "Rotina de sono para bebê de 6 meses: plano diário realista | Raffy"
    },
    desc: {
      "en" => "Build a practical sleep schedule for a 6-month-old baby with wake windows, naps, and bedtime anchors.",
      "es" => "Crea un horario de sueño realista para 6 meses con ventanas de vigilia, siestas y anclaje nocturno.",
      "fr" => "Créez un rythme réaliste à 6 mois avec fenêtres d'éveil, siestes et ancrage du coucher.",
      "pt" => "Monte uma rotina realista aos 6 meses com janelas de vigília, sonecas e ancoragem do sono noturno."
    }
  },
  "feeding_age_page" => {
    routes: {
      "en" => "/en/articles/feeding-schedule-12-month-old.html",
      "es" => "/es/articulos/horario-comidas-bebe-12-meses.html",
      "fr" => "/fr/articles/rythme-repas-bebe-12-mois.html",
      "pt" => "/pt/artigos/rotina-alimentacao-bebe-12-meses.html"
    },
    titles: {
      "en" => "12-Month Feeding Schedule: Sample Day and Portions | Raffy",
      "es" => "Horario de comidas a los 12 meses: día ejemplo y porciones | Raffy",
      "fr" => "Rythme repas à 12 mois: journée type et portions | Raffy",
      "pt" => "Rotina alimentar aos 12 meses: dia exemplo e porções | Raffy"
    },
    desc: {
      "en" => "Plan meals, snacks, milk targets, and solids variety for a 12-month-old toddler day.",
      "es" => "Planifica comidas, snacks, leche y variedad de sólidos para un bebé de 12 meses.",
      "fr" => "Planifiez repas, collations, lait et variété des solides à 12 mois.",
      "pt" => "Planeje refeições, lanches, leite e variedade alimentar aos 12 meses."
    }
  },
  "growth_age_page" => {
    routes: {
      "en" => "/en/articles/baby-growth-checklist-first-year.html",
      "es" => "/es/articulos/checklist-crecimiento-primer-ano.html",
      "fr" => "/fr/articles/checklist-croissance-premiere-annee.html",
      "pt" => "/pt/artigos/checklist-crescimento-primeiro-ano.html"
    },
    titles: {
      "en" => "Baby Growth Checklist for the First Year | Raffy",
      "es" => "Checklist de crecimiento del bebé para el primer año | Raffy",
      "fr" => "Checklist croissance bébé première année | Raffy",
      "pt" => "Checklist de crescimento do bebê no primeiro ano | Raffy"
    },
    desc: {
      "en" => "Use a month-by-month checklist for weight, height, and follow-up questions before pediatric visits.",
      "es" => "Usa un checklist mes a mes de peso, talla y preguntas para consulta pediátrica.",
      "fr" => "Utilisez une check-list mensuelle poids/taille et questions avant la consultation.",
      "pt" => "Use um checklist mensal de peso/altura e perguntas para a consulta pediátrica."
    }
  },
  "milestone_age_page" => {
    routes: {
      "en" => "/en/articles/milestones-by-month-0-12.html",
      "es" => "/es/articulos/hitos-mes-a-mes-0-12.html",
      "fr" => "/fr/articles/etapes-mois-par-mois-0-12.html",
      "pt" => "/pt/artigos/marcos-mes-a-mes-0-12.html"
    },
    titles: {
      "en" => "Milestones by Month 0-12: What to Watch | Raffy",
      "es" => "Hitos mes a mes 0-12: qué observar | Raffy",
      "fr" => "Étapes mois par mois 0-12: que surveiller | Raffy",
      "pt" => "Marcos mês a mês 0-12: o que observar | Raffy"
    },
    desc: {
      "en" => "Track communication, motor, and social milestones month by month with practical observations.",
      "es" => "Sigue hitos de comunicación, motor y social mes a mes con observación práctica.",
      "fr" => "Suivez communication, motricité et social mois par mois avec observation pratique.",
      "pt" => "Acompanhe marcos de comunicação, motor e social mês a mês com observação prática."
    }
  }
}.freeze

TOOLS = {
  "wake_tool" => {
    kind: "wake",
    routes: {
      "en" => "/en/tools/wake-window-planner.html",
      "es" => "/es/herramientas/planificador-ventanas-sueno.html",
      "fr" => "/fr/outils/planificateur-fenetres-eveil.html",
      "pt" => "/pt/ferramentas/planejador-janelas-vigilia.html"
    },
    titles: {
      "en" => "Wake Window Planner by Age | Raffy",
      "es" => "Planificador de ventanas de sueño por edad | Raffy",
      "fr" => "Planificateur de fenêtres d'éveil par âge | Raffy",
      "pt" => "Planejador de janelas de vigília por idade | Raffy"
    },
    desc: {
      "en" => "Fighting overtired meltdowns? Find age-based wake windows and a nap flow you can use today.",
      "es" => "¿Tu bebé llega pasado de sueño? Calcula ventanas de vigilia por edad y arma una rutina de siestas más estable.",
      "fr" => "Bébé finit souvent en sur-fatigue ? Estimez les fenêtres d'éveil par âge et structurez des siestes plus stables.",
      "pt" => "Seu bebê chega exausto ao fim da janela? Estime janelas de vigília por idade e organize sonecas mais estáveis."
    }
  },
  "nap_tool" => {
    kind: "nap",
    routes: {
      "en" => "/en/tools/nap-transition-helper.html",
      "es" => "/es/herramientas/ayudante-transicion-siestas.html",
      "fr" => "/fr/outils/assistant-transition-siestes.html",
      "pt" => "/pt/ferramentas/ajudante-transicao-sonecas.html"
    },
    titles: {
      "en" => "Nap Transition Helper | Raffy",
      "es" => "Ayudante de transición de siestas | Raffy",
      "fr" => "Assistant de transition des siestes | Raffy",
      "pt" => "Ajudante de transição de sonecas | Raffy"
    },
    desc: {
      "en" => "Not sure if it is time to drop a nap? Spot transition signs and follow a step-by-step adjustment plan.",
      "es" => "¿No sabes si toca quitar una siesta? Detecta señales de transición y aplica ajustes paso a paso.",
      "fr" => "Vous hésitez à supprimer une sieste ? Repérez les signes de transition et suivez un plan d'ajustement étape par étape.",
      "pt" => "Não sabe se já é hora de tirar uma soneca? Identifique sinais de transição e siga ajustes passo a passo."
    }
  },
  "solids_tool" => {
    kind: "solids",
    routes: {
      "en" => "/en/tools/solids-progression-planner.html",
      "es" => "/es/herramientas/planificador-progresion-solidos.html",
      "fr" => "/fr/outils/planificateur-progression-diversification.html",
      "pt" => "/pt/ferramentas/planejador-progresso-alimentacao.html"
    },
    titles: {
      "en" => "Solids Progression Planner by Age | Raffy",
      "es" => "Planificador de progresión de sólidos por edad | Raffy",
      "fr" => "Planificateur de progression de la diversification | Raffy",
      "pt" => "Planejador de progressão alimentar por idade | Raffy"
    },
    desc: {
      "en" => "Stuck on what texture to offer next? Plan weekly texture upgrades and food variety without guesswork.",
      "es" => "¿Bloqueada con la siguiente textura? Planifica avances semanales y variedad de alimentos sin improvisar.",
      "fr" => "Bloqué sur la texture suivante ? Planifiez la progression des textures et la variété alimentaire semaine après semaine.",
      "pt" => "Travou na próxima textura? Planeje a progressão de texturas e a variedade alimentar semana a semana."
    }
  },
  "diaper_tool" => {
    kind: "diaper",
    routes: {
      "en" => "/en/tools/diaper-output-tracker.html",
      "es" => "/es/herramientas/calculadora-panales-eliminacion.html",
      "fr" => "/fr/outils/calculateur-couches-elimination.html",
      "pt" => "/pt/ferramentas/calculadora-fraldas-eliminacao.html"
    },
    titles: {
      "en" => "Diaper Output Tracker by Age | Raffy",
      "es" => "Calculadora de pañales y eliminación por edad | Raffy",
      "fr" => "Calculateur couches et élimination par âge | Raffy",
      "pt" => "Calculadora de fraldas e eliminações por idade | Raffy"
    },
    desc: {
      "en" => "Wondering if diaper output is normal? Track wet diapers and stools to catch hydration red flags early.",
      "es" => "¿Te preocupa si las eliminaciones son normales? Registra pañales mojados y deposiciones para detectar señales de alerta.",
      "fr" => "Vous vous demandez si l'élimination est normale ? Suivez couches mouillées et selles pour repérer tôt les signaux d'alerte.",
      "pt" => "Em dúvida se as eliminações estão normais? Registre fraldas molhadas e evacuações para perceber sinais de alerta cedo."
    }
  },
  "feeding_tool" => {
    kind: "feeding",
    routes: {
      "en" => "/en/tools/feeding-quantity-estimator.html",
      "es" => "/es/herramientas/estimador-cantidad-alimentacion.html",
      "fr" => "/fr/outils/estimateur-quantites-alimentation.html",
      "pt" => "/pt/ferramentas/estimador-quantidade-alimentacao.html"
    },
    titles: {
      "en" => "Feeding Quantity Estimator by Age | Raffy",
      "es" => "Estimador de cantidad de alimentación por edad | Raffy",
      "fr" => "Estimateur de quantités alimentaires par âge | Raffy",
      "pt" => "Estimador de quantidade alimentar por idade | Raffy"
    },
    desc: {
      "en" => "Unsure how much to feed? Estimate daily intake targets by age, weight, and meal count with less guesswork.",
      "es" => "¿No tienes claro cuánto ofrecer? Estima objetivos diarios según edad, peso y número de comidas.",
      "fr" => "Pas sûr des quantités à proposer ? Estimez les apports quotidiens selon l'âge, le poids et le nombre de repas.",
      "pt" => "Sem clareza sobre quanto oferecer? Estime metas diárias de ingestão por idade, peso e número de refeições."
    }
  }
}.freeze

COMPANIONS = {
  "wake_companion" => {
    routes: {
      "en" => "/en/articles/wake-window-planner-guide.html",
      "es" => "/es/articulos/guia-planificador-ventanas-sueno.html",
      "fr" => "/fr/articles/guide-planificateur-fenetres-eveil.html",
      "pt" => "/pt/artigos/guia-planejador-janelas-vigilia.html"
    },
    titles: {
      "en" => "How to Use a Wake Window Planner by Age | Raffy",
      "es" => "Cómo usar un planificador de ventanas de sueño por edad | Raffy",
      "fr" => "Comment utiliser un planificateur de fenêtres d'éveil | Raffy",
      "pt" => "Como usar um planejador de janelas de vigília por idade | Raffy"
    },
    desc: {
      "en" => "Learn to apply wake windows without rigid schedules and adjust by signals.",
      "es" => "Aprende a aplicar ventanas de vigilia sin rigidez y ajustando por señales.",
      "fr" => "Apprenez à appliquer les fenêtres d'éveil avec flexibilité selon les signaux.",
      "pt" => "Aprenda a aplicar janelas de vigília com flexibilidade e sinais do bebê."
    }
  },
  "nap_companion" => {
    routes: {
      "en" => "/en/articles/nap-transition-signs-by-age.html",
      "es" => "/es/articulos/senales-transicion-siestas-por-edad.html",
      "fr" => "/fr/articles/signes-transition-siestes-par-age.html",
      "pt" => "/pt/artigos/sinais-transicao-sonecas-por-idade.html"
    },
    titles: {
      "en" => "Nap Transition Signs by Age and What to Do | Raffy",
      "es" => "Señales de transición de siestas por edad y qué hacer | Raffy",
      "fr" => "Signes de transition des siestes par âge et actions | Raffy",
      "pt" => "Sinais de transição de sonecas por idade e como agir | Raffy"
    },
    desc: {
      "en" => "Identify 3-to-2 and 2-to-1 nap transitions with practical steps.",
      "es" => "Identifica transiciones 3-2 y 2-1 siestas con pasos prácticos.",
      "fr" => "Identifiez transitions 3-2 et 2-1 siestes avec étapes pratiques.",
      "pt" => "Identifique transições 3-2 e 2-1 sonecas com passos práticos."
    }
  },
  "solids_companion" => {
    routes: {
      "en" => "/en/articles/solids-progression-by-age-guide.html",
      "es" => "/es/articulos/guia-progresion-solidos-por-edad.html",
      "fr" => "/fr/articles/guide-progression-diversification-par-age.html",
      "pt" => "/pt/artigos/guia-progresso-alimentacao-por-idade.html"
    },
    titles: {
      "en" => "Solids Progression by Age: Texture and Variety Guide | Raffy",
      "es" => "Progresión de sólidos por edad: guía de textura y variedad | Raffy",
      "fr" => "Progression diversification par âge: textures et variété | Raffy",
      "pt" => "Progressão alimentar por idade: guia de textura e variedade | Raffy"
    },
    desc: {
      "en" => "Move from purees to family meals safely with age-appropriate progression.",
      "es" => "Pasa de purés a comida familiar con progresión segura por edad.",
      "fr" => "Passez des purées aux repas familiaux avec progression sécurisée par âge.",
      "pt" => "Passe de purês para refeições da família com progressão segura por idade."
    }
  },
  "diaper_companion" => {
    routes: {
      "en" => "/en/articles/diaper-output-by-age-guide.html",
      "es" => "/es/articulos/guia-panales-eliminacion-por-edad.html",
      "fr" => "/fr/articles/guide-couches-elimination-par-age.html",
      "pt" => "/pt/artigos/guia-fraldas-eliminacao-por-idade.html"
    },
    titles: {
      "en" => "Diaper Output by Age: Hydration Signals Guide | Raffy",
      "es" => "Pañales y eliminación por edad: guía de señales de hidratación | Raffy",
      "fr" => "Couches et élimination par âge: guide des signaux d'hydratation | Raffy",
      "pt" => "Fraldas e eliminações por idade: guia de sinais de hidratação | Raffy"
    },
    desc: {
      "en" => "Understand wet diaper and stool patterns by age and when to ask for care.",
      "es" => "Comprende patrones de pañales y deposiciones por edad y cuándo consultar.",
      "fr" => "Comprenez les schémas couches/selles par âge et quand consulter.",
      "pt" => "Entenda padrões de fraldas e evacuações por idade e quando consultar."
    }
  },
  "feeding_companion" => {
    routes: {
      "en" => "/en/articles/feeding-quantity-by-age-guide.html",
      "es" => "/es/articulos/guia-cantidad-alimentacion-por-edad.html",
      "fr" => "/fr/articles/guide-quantites-alimentation-par-age.html",
      "pt" => "/pt/artigos/guia-quantidade-alimentacao-por-idade.html"
    },
    titles: {
      "en" => "Feeding Quantity by Age: Practical Portion Guide | Raffy",
      "es" => "Cantidad de alimentación por edad: guía práctica de porciones | Raffy",
      "fr" => "Quantités alimentaires par âge: guide pratique des portions | Raffy",
      "pt" => "Quantidade alimentar por idade: guia prático de porções | Raffy"
    },
    desc: {
      "en" => "Estimate portions by age and appetite while tracking growth and routine consistency.",
      "es" => "Estima porciones por edad y apetito manteniendo seguimiento de crecimiento.",
      "fr" => "Estimez les portions selon âge et appétit en gardant le suivi de croissance.",
      "pt" => "Estime porções por idade e apetite com monitoramento de crescimento."
    }
  }
}.freeze

NEWSLETTER = {
  routes: {
    "en" => "/en/newsletter.html",
    "es" => "/es/boletin.html",
    "fr" => "/fr/newsletter.html",
    "pt" => "/pt/boletim.html"
  },
  titles: {
    "en" => "Weekly Baby Stage Digest Newsletter | Raffy",
    "es" => "Boletín semanal por etapa del bebé | Raffy",
    "fr" => "Newsletter hebdomadaire par étape du bébé | Raffy",
    "pt" => "Boletim semanal por fase do bebê | Raffy"
  },
  desc: {
    "en" => "Get one weekly digest with age-based sleep, feeding, growth, and milestone resources.",
    "es" => "Recibe un resumen semanal con recursos por edad de sueño, alimentación, crecimiento e hitos.",
    "fr" => "Recevez un digest hebdomadaire avec ressources sommeil, alimentation, croissance et étapes.",
    "pt" => "Receba um resumo semanal com recursos de sono, alimentação, crescimento e marcos."
  }
}.freeze

LEAD_MAGNETS = {
  "sleep_sheet" => {
    routes: {
      "en" => "/en/articles/sleep-routine-sheet-printable.html",
      "es" => "/es/articulos/plantilla-rutina-sueno-imprimible.html",
      "fr" => "/fr/articles/fiche-routine-sommeil-imprimable.html",
      "pt" => "/pt/artigos/folha-rotina-sono-imprimivel.html"
    },
    titles: {
      "en" => "Printable Sleep Routine Sheet by Age | Raffy",
      "es" => "Plantilla imprimible de rutina de sueño por edad | Raffy",
      "fr" => "Fiche imprimable routine sommeil par âge | Raffy",
      "pt" => "Folha imprimível de rotina de sono por idade | Raffy"
    },
    desc: {
      "en" => "Print and use this weekly sleep routine sheet for wake windows, naps, and bedtime notes.",
      "es" => "Imprime y usa esta plantilla semanal de sueño para ventanas, siestas y notas nocturnas.",
      "fr" => "Imprimez cette fiche hebdomadaire de sommeil pour fenêtres d'éveil, siestes et coucher.",
      "pt" => "Imprima esta folha semanal de sono para janelas de vigília, sonecas e notas noturnas."
    }
  },
  "feeding_sheet" => {
    routes: {
      "en" => "/en/articles/weekly-feeding-planner-printable.html",
      "es" => "/es/articulos/planificador-semanal-comidas-imprimible.html",
      "fr" => "/fr/articles/planificateur-repas-hebdomadaire-imprimable.html",
      "pt" => "/pt/artigos/planejador-refeicoes-semanal-imprimivel.html"
    },
    titles: {
      "en" => "Printable Weekly Feeding Planner | Raffy",
      "es" => "Planificador semanal de comidas imprimible | Raffy",
      "fr" => "Planificateur repas hebdomadaire imprimable | Raffy",
      "pt" => "Planejador semanal de refeições imprimível | Raffy"
    },
    desc: {
      "en" => "Printable weekly sheet for meals, snacks, milk targets, and tolerance notes.",
      "es" => "Hoja semanal imprimible para comidas, snacks, objetivo de leche y tolerancia.",
      "fr" => "Fiche hebdomadaire imprimable repas, collations, objectif lait et tolérance.",
      "pt" => "Folha semanal imprimível para refeições, lanches, meta de leite e tolerância."
    }
  },
  "milestone_sheet" => {
    routes: {
      "en" => "/en/articles/milestone-checklist-printable.html",
      "es" => "/es/articulos/checklist-hitos-imprimible.html",
      "fr" => "/fr/articles/checklist-etapes-imprimable.html",
      "pt" => "/pt/artigos/checklist-marcos-imprimivel.html"
    },
    titles: {
      "en" => "Printable Milestone Checklist 0-12 Months | Raffy",
      "es" => "Checklist imprimible de hitos 0-12 meses | Raffy",
      "fr" => "Checklist imprimable des étapes 0-12 mois | Raffy",
      "pt" => "Checklist imprimível de marcos 0-12 meses | Raffy"
    },
    desc: {
      "en" => "Use this printable checklist to observe monthly milestones and note pediatric questions.",
      "es" => "Usa este checklist imprimible para observar hitos mensuales y preguntas pediátricas.",
      "fr" => "Utilisez cette checklist imprimable pour observer les étapes mensuelles et questions pédiatre.",
      "pt" => "Use este checklist imprimível para observar marcos mensais e perguntas para o pediatra."
    }
  }
}.freeze

TOOL_TO_COMPANION = {
  "wake_tool" => "wake_companion",
  "nap_tool" => "nap_companion",
  "solids_tool" => "solids_companion",
  "diaper_tool" => "diaper_companion",
  "feeding_tool" => "feeding_companion"
}.freeze

ALL_NEW_ROUTE_MAPS = {}
ALL_NEW_ROUTE_MAPS.merge!(PILLARS.transform_values { |v| v[:routes] })
ALL_NEW_ROUTE_MAPS.merge!(AGE_INTENT.transform_values { |v| v[:routes] })
ALL_NEW_ROUTE_MAPS.merge!(TOOLS.transform_values { |v| v[:routes] })
ALL_NEW_ROUTE_MAPS.merge!(COMPANIONS.transform_values { |v| v[:routes] })
ALL_NEW_ROUTE_MAPS["newsletter"] = NEWSLETTER[:routes]
ALL_NEW_ROUTE_MAPS.merge!(LEAD_MAGNETS.transform_values { |v| v[:routes] })


def route_to_path(route)
  relative = route.start_with?("/") ? route[1..] : route
  relative = File.join(relative, "index.html") if route.end_with?("/")
  File.join(ROOT, relative)
end


def relative_href(from_route, to_route)
  from_file = route_to_path(from_route)
  to_file = route_to_path(to_route)
  from_dir = File.dirname(File.expand_path(from_file, ROOT))
  Pathname.new(File.expand_path(to_file, ROOT)).relative_path_from(Pathname.new(from_dir)).to_s
end


def page_shell(locale, route, title, description, alternates_html, body_html, include_article_css: false, include_tool_css: false, include_tool_js: false)
  cfg = LOCALES.fetch(locale)
  styles_href = relative_href(route, "/styles.css")
  article_css_href = relative_href(route, "/articles/article.css")
  tool_css_href = relative_href(route, "/tools/tool-cluster.css")
  script_href = relative_href(route, "/script.js")
  tool_js_href = relative_href(route, "/tools/tool-cluster.js")

  document = [
    "<!doctype html>",
    "<html lang=\"#{cfg[:lang]}\">",
    "<head>",
    "  <meta charset=\"utf-8\">",
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    "  <title>#{title}</title>",
    "  <meta name=\"description\" content=\"#{description}\">",
    "  <meta name=\"robots\" content=\"index,follow,max-snippet:160,max-image-preview:large\">",
    "  <link rel=\"canonical\" href=\"#{SITE_ORIGIN}#{route}\">",
    alternates_html,
    "  <meta property=\"og:type\" content=\"website\">",
    "  <meta property=\"og:title\" content=\"#{title}\">",
    "  <meta property=\"og:description\" content=\"#{description}\">",
    "  <meta property=\"og:url\" content=\"#{SITE_ORIGIN}#{route}\">",
    "  <meta property=\"og:image\" content=\"#{SITE_ORIGIN}/assets/raffy-social-preview.png\">",
    "  <meta name=\"twitter:card\" content=\"summary_large_image\">",
    "  <meta name=\"twitter:title\" content=\"#{title}\">",
    "  <meta name=\"twitter:description\" content=\"#{description}\">",
    "  <meta name=\"twitter:image\" content=\"#{SITE_ORIGIN}/assets/raffy-social-preview.png\">",
    "  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">",
    "  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>",
    "  <link href=\"https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap\" rel=\"stylesheet\">",
    "  <link rel=\"icon\" type=\"image/png\" href=\"#{relative_href(route, '/assets/raffy-logo.png')}\">",
    "  <link rel=\"stylesheet\" href=\"#{styles_href}\">",
    (include_article_css ? "  <link rel=\"stylesheet\" href=\"#{article_css_href}\">" : nil),
    (include_tool_css ? "  <link rel=\"stylesheet\" href=\"#{tool_css_href}\">" : nil),
    "</head>",
    body_html,
    "</html>"
  ].compact.join("\n")

  scripts = ["  <script src=\"#{script_href}\"></script>"]
  scripts << "  <script type=\"module\" src=\"#{tool_js_href}\"></script>" if include_tool_js

  document.sub("</body>", "#{scripts.join("\n")}\n</body>")
end


def build_alternates(route_map)
  lines = route_map.map do |locale, route|
    %(  <link rel="alternate" hreflang="#{LOCALES.fetch(locale)[:locale_tag]}" href="#{SITE_ORIGIN}#{route}">)
  end
  lines << %(  <link rel="alternate" hreflang="x-default" href="#{SITE_ORIGIN}/en/">)
  lines.join("\n")
end


def build_header(route, locale, page_key)
  cfg = LOCALES.fetch(locale)
  home_href = relative_href(route, cfg[:root])
  articles_href = relative_href(route, cfg[:article_dir])
  tools_href = relative_href(route, cfg[:tools_dir])

  lang_options = [
    ["en", "English"],
    ["es", "Español"],
    ["fr", "Français"],
    ["pt", "Português (Brasil)"]
  ].map { |code, label| %(<option value="#{code}"#{code == locale ? " selected" : ""}>#{label}</option>) }.join

  <<~HTML
    <body data-page-key="#{page_key}" data-locale="#{locale}">
      <div class="bg-dynamic" aria-hidden="true">
        <span class="bg-shape s1"></span><span class="bg-shape s2"></span><span class="bg-shape s3"></span><span class="bg-shape s4"></span><span class="bg-shape s5"></span>
      </div>
      <header>
        <div class="container nav">
          <a class="brand" href="#{home_href}">
            <img class="brand-logo" src="#{relative_href(route, '/assets/raffy-logo.png')}" alt="Raffy logo" width="500" height="500" decoding="async" loading="eager">
            <span>Raffy</span>
          </a>
          <nav class="navlinks">
            <a href="#{home_href}">#{cfg[:labels][:home]}</a>
            <a href="#{articles_href}">#{cfg[:labels][:articles]}</a>
            <a href="#{tools_href}">#{cfg[:labels][:tools]}</a>
          </nav>
          <div class="nav-controls">
            <div class="lang-switch">
              <label class="sr-only" for="lang-select">Language selector</label>
              <select id="lang-select" data-language-selector aria-label="Language selector">#{lang_options}</select>
            </div>
            <a class="play-store-badge-link play-store-badge-link-sm" href="https://play.google.com/store/apps/details?id=com.gurrulabs.raffy" data-track-download="true" data-page-type="#{page_key.start_with?("tool_") ? "tool" : "article"}" data-cta-location="header" aria-label="#{cfg[:labels][:app_cta]}"><img decoding="async" loading="lazy" class="play-store-badge" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="#{cfg[:labels][:app_cta]}"></a>
          </div>
        </div>
      </header>
  HTML
end


def build_footer(route, locale)
  cfg = LOCALES.fetch(locale)
  about = relative_href(route, TRUST_ROUTES["about"][locale])
  editorial = relative_href(route, TRUST_ROUTES["editorial"][locale])
  privacy = relative_href(route, TRUST_ROUTES["privacy"][locale])
  deletion = relative_href(route, TRUST_ROUTES["deletion"][locale])
  terms = relative_href(route, TRUST_ROUTES["terms"][locale])
  contact = relative_href(route, TRUST_ROUTES["contact"][locale])

  <<~HTML
      <footer class="container footer">
        <p>© <span id="year"></span> Raffy App</p>
        <nav class="footer-links" aria-label="#{cfg[:labels][:trust_aria]}">
          <a href="#{about}">#{cfg[:labels][:about]}</a>
          <a href="#{editorial}">#{cfg[:labels][:editorial]}</a>
          <a href="#{privacy}">#{cfg[:labels][:privacy]}</a>
          <a href="#{deletion}">#{cfg[:labels][:deletion]}</a>
          <a href="#{terms}">#{cfg[:labels][:terms]}</a>
          <a href="#{contact}">#{cfg[:labels][:contact]}</a>
        </nav>
      </footer>
      <button class="to-top" id="toTop" aria-label="Back to top">↑</button>
    </body>
  HTML
end


def write_page(route, html)
  out = route_to_path(route)
  FileUtils.mkdir_p(File.dirname(out))
  File.write(out, html)
end


def section_text(locale)
  {
    "en" => {
      how: "How to use this page",
      next: "What to do next",
      bullets: ["Use one anchor habit for 7 days.", "Link the plan to one tracker tool.", "Escalate to pediatric care when symptoms persist."],
      model: "Internal link model",
      summary: "This resource follows pillar -> age page -> tool -> related article -> app workflow."
    },
    "es" => {
      how: "Cómo usar esta página",
      next: "Qué hacer después",
      bullets: ["Usa un hábito ancla durante 7 días.", "Conecta el plan con una herramienta de seguimiento.", "Consulta pediatría si los síntomas persisten."],
      model: "Modelo de enlaces internos",
      summary: "Este recurso sigue pilar -> página por edad -> herramienta -> artículo relacionado -> app."
    },
    "fr" => {
      how: "Comment utiliser cette page",
      next: "Que faire ensuite",
      bullets: ["Utilisez une habitude repère pendant 7 jours.", "Reliez le plan à un outil de suivi.", "Orientez vers le pédiatre si les symptômes persistent."],
      model: "Modèle de liens internes",
      summary: "Cette ressource suit pilier -> page par âge -> outil -> article lié -> app."
    },
    "pt" => {
      how: "Como usar esta página",
      next: "Próximos passos",
      bullets: ["Use um hábito âncora por 7 dias.", "Conecte o plano com uma ferramenta de acompanhamento.", "Procure pediatra se os sintomas persistirem."],
      model: "Modelo de links internos",
      summary: "Este recurso segue pilar -> página por idade -> ferramenta -> artigo relacionado -> app."
    }
  }.fetch(locale)
end

def core_tool_descriptions(locale)
  {
    "en" => {
      who: "Unsure if growth is on track? Get WHO percentile and z-score in seconds for weight, length/height, and head circumference.",
      meal: "Out of meal ideas? Build a 7-day plan for toddlers 12-23 months with balanced variety and portions you can actually serve."
    },
    "es" => {
      who: "¿Dudas si el crecimiento va bien? Obtén percentil y z-score OMS en segundos para peso, talla/longitud y perímetro cefálico.",
      meal: "¿Sin ideas para las comidas? Genera un menú de 7 días para 12-23 meses con variedad equilibrada y porciones realistas."
    },
    "fr" => {
      who: "Vous vous demandez si la croissance suit son cours ? Obtenez rapidement le percentile et le z-score OMS pour poids, taille/longueur et périmètre crânien.",
      meal: "En panne d'idées repas ? Générez un menu de 7 jours pour 12-23 mois avec variété équilibrée et portions réalistes."
    },
    "pt" => {
      who: "Em dúvida se o crescimento está no caminho certo? Obtenha percentil e escore-z OMS em segundos para peso, comprimento/altura e perímetro cefálico.",
      meal: "Sem ideias para as refeições? Monte um cardápio de 7 dias para 12-23 meses com variedade equilibrada e porções realistas."
    }
  }.fetch(locale)
end

def tool_card(locale, base_route, target_route, cta, title, description)
  label = {
    "en" => "Tool",
    "es" => "Herramienta",
    "fr" => "Outil",
    "pt" => "Ferramenta"
  }.fetch(locale)

  href = relative_href(base_route, target_route)

  <<~HTML
        <article class="article-card reveal">
          <p class="article-tag">#{label}</p>
          <h3>#{title}</h3>
          <p>#{description}</p>
          <a href="#{href}" class="article-link">#{cta}</a>
        </article>
  HTML
end


created = 0

# Generate pillar and age-intent pages.
(PILLARS.merge(AGE_INTENT).merge(COMPANIONS).merge(LEAD_MAGNETS)).each do |page_id, page|
  route_map = page[:routes]
  alternates = build_alternates(route_map)

  route_map.each do |locale, route|
    cfg = LOCALES.fetch(locale)
    text = section_text(locale)

    body = []
    body << build_header(route, locale, page_id)
    body << "  <main class=\"article-wrap\">"
    body << "    <article class=\"article-card\">"
    body << "      <h1>#{page[:titles][locale].sub(' | Raffy', '')}</h1>"
    body << "      <p class=\"excerpt\">#{page[:desc][locale]}</p>"
    body << "      <h2>#{text[:how]}</h2>"
    body << "      <p>#{text[:summary]}</p>"
    body << "      <h2>#{text[:next]}</h2>"
    body << "      <ul>"
    text[:bullets].each { |line| body << "        <li>#{line}</li>" }
    body << "      </ul>"

    # standard internal model links
    body << "      <section class=\"related-articles\">"
    body << "        <h2>#{cfg[:labels][:related]}</h2>"
    body << "        <ul>"
    body << "          <li><a href=\"#{relative_href(route, EXISTING_CORE['sleep_article'][locale])}\">#{cfg[:labels][:articles]}: Sleep</a></li>"
    body << "          <li><a href=\"#{relative_href(route, EXISTING_CORE['solids_article'][locale])}\">#{cfg[:labels][:articles]}: Feeding</a></li>"
    body << "          <li><a href=\"#{relative_href(route, EXISTING_CORE['growth_article'][locale])}\">#{cfg[:labels][:articles]}: Growth</a></li>"
    body << "          <li><a href=\"#{relative_href(route, EXISTING_CORE['meal_tool'][locale])}\">#{cfg[:labels][:tools]}: Weekly planner</a></li>"
    body << "          <li><a href=\"#{relative_href(route, EXISTING_CORE['who_tool'][locale])}\">#{cfg[:labels][:tools]}: WHO calculator</a></li>"
    body << "          <li><a href=\"https://play.google.com/store/apps/details?id=com.gurrulabs.raffy\">#{cfg[:labels][:app_cta]}</a></li>"
    body << "        </ul>"
    body << "      </section>"

    if LEAD_MAGNETS.key?(page_id)
      body << "      <p><button class=\"btn\" type=\"button\" onclick=\"window.print()\">#{cfg[:labels][:printable]}</button></p>"
    end

    body << "    </article>"
    body << "  </main>"
    body << build_footer(route, locale)

    html = page_shell(locale, route, page[:titles][locale], page[:desc][locale], alternates, body.join("\n"), include_article_css: true)
    write_page(route, html)
    created += 1
  end
end

# Generate tool pages.
TOOLS.each do |tool_id, tool|
  route_map = tool[:routes]
  alternates = build_alternates(route_map)
  companion_routes = COMPANIONS.fetch(TOOL_TO_COMPANION.fetch(tool_id))[:routes]

  route_map.each do |locale, route|
    cfg = LOCALES.fetch(locale)
    kind = tool[:kind]

    form_fields = case kind
                  when "wake"
                    <<~HTML
                      <div class="tool-grid">
                        <div class="tool-field">
                          <label for="age_months">Age (months)</label>
                          <input id="age_months" name="age_months" type="number" min="0" max="36" step="1" value="6" required>
                        </div>
                      </div>
                    HTML
                  when "nap"
                    <<~HTML
                      <div class="tool-grid">
                        <div class="tool-field">
                          <label for="age_months">Age (months)</label>
                          <input id="age_months" name="age_months" type="number" min="0" max="36" step="1" value="10" required>
                        </div>
                        <div class="tool-field">
                          <label for="current_naps">Current naps/day</label>
                          <input id="current_naps" name="current_naps" type="number" min="1" max="5" step="1" value="3" required>
                        </div>
                      </div>
                    HTML
                  when "solids"
                    <<~HTML
                      <div class="tool-grid">
                        <div class="tool-field">
                          <label for="age_months">Age (months)</label>
                          <input id="age_months" name="age_months" type="number" min="4" max="24" step="1" value="8" required>
                        </div>
                        <div class="tool-field">
                          <label for="texture_stage">Current texture stage</label>
                          <select id="texture_stage" name="texture_stage">
                            <option value="puree">Puree</option>
                            <option value="mashed" selected>Mashed</option>
                            <option value="finger">Finger food</option>
                          </select>
                        </div>
                      </div>
                    HTML
                  when "diaper"
                    <<~HTML
                      <div class="tool-grid">
                        <div class="tool-field">
                          <label for="age_months">Age (months)</label>
                          <input id="age_months" name="age_months" type="number" min="0" max="36" step="1" value="5" required>
                        </div>
                        <div class="tool-field">
                          <label for="wet_diapers">Wet diapers/day</label>
                          <input id="wet_diapers" name="wet_diapers" type="number" min="0" max="14" step="1" value="6" required>
                        </div>
                        <div class="tool-field">
                          <label for="stools">Stools/day</label>
                          <input id="stools" name="stools" type="number" min="0" max="8" step="1" value="2" required>
                        </div>
                        <label class="tool-field" for="red_flags" style="justify-content:flex-end;">
                          <span>Warning signs present</span>
                          <input id="red_flags" name="red_flags" type="checkbox">
                        </label>
                      </div>
                    HTML
                  else
                    <<~HTML
                      <div class="tool-grid">
                        <div class="tool-field">
                          <label for="age_months">Age (months)</label>
                          <input id="age_months" name="age_months" type="number" min="4" max="36" step="1" value="12" required>
                        </div>
                        <div class="tool-field">
                          <label for="weight_kg">Weight (kg)</label>
                          <input id="weight_kg" name="weight_kg" type="number" min="3" max="20" step="0.1" value="9.5" required>
                        </div>
                        <div class="tool-field">
                          <label for="meals_per_day">Meals/day</label>
                          <input id="meals_per_day" name="meals_per_day" type="number" min="3" max="7" step="1" value="5" required>
                        </div>
                      </div>
                    HTML
                  end

    body = []
    body << build_header(route, locale, "tool_#{kind}")
    body << "  <main class=\"tool-wrap\">"
    body << "    <section class=\"tool-card\">"
    body << "      <h1>#{tool[:titles][locale].sub(' | Raffy', '')}</h1>"
    body << "      <p>#{tool[:desc][locale]}</p>"
    body << "      <form data-tool-kind=\"#{kind}\" data-locale=\"#{locale}\">"
    body << form_fields
    body << "        <div class=\"tool-actions\">"
    body << "          <button class=\"btn\" type=\"submit\">Generate plan</button>"
    body << "          <button class=\"btn btn-ghost\" type=\"reset\">Reset</button>"
    body << "        </div>"
    body << "      </form>"
    body << "      <div class=\"tool-output\" data-tool-output></div>"
    body << "      <div class=\"tool-related\">"
    body << "        <a href=\"#{relative_href(route, companion_routes[locale])}\">#{cfg[:labels][:read_guide]}</a>"
    body << "        <a href=\"#{relative_href(route, EXISTING_CORE['meal_tool'][locale])}\">#{cfg[:labels][:open_tool]}: Weekly meal planner</a>"
    body << "      </div>"
    body << "    </section>"
    body << "  </main>"
    body << build_footer(route, locale)

    html = page_shell(locale, route, tool[:titles][locale], tool[:desc][locale], alternates, body.join("\n"), include_tool_css: true, include_tool_js: true)
    write_page(route, html)
    created += 1
  end
end

# Generate newsletter page.
alternates = build_alternates(NEWSLETTER[:routes])
NEWSLETTER[:routes].each do |locale, route|
  cfg = LOCALES.fetch(locale)

  body = []
  body << build_header(route, locale, "newsletter")
  body << "  <main class=\"article-wrap\">"
  body << "    <article class=\"article-card\">"
  body << "      <h1>#{NEWSLETTER[:titles][locale].sub(' | Raffy', '')}</h1>"
  body << "      <p class=\"excerpt\">#{NEWSLETTER[:desc][locale]}</p>"
  body << "      <h2>Weekly format</h2>"
  body << "      <ul><li>One weekly digest by baby stage.</li><li>Top tools + new guides by locale.</li><li>Checklist and printable download links.</li></ul>"
  body << "      <form class=\"tool-card\" action=\"mailto:gurrulabs@gmail.com\" method=\"post\" enctype=\"text/plain\">"
  body << "        <label for=\"newsletter_email\">Email</label>"
  body << "        <input id=\"newsletter_email\" name=\"newsletter_email\" type=\"email\" placeholder=\"#{cfg[:labels][:newsletter_placeholder]}\" required>"
  body << "        <button class=\"btn\" type=\"submit\">#{cfg[:labels][:newsletter_btn]}</button>"
  body << "      </form>"
  body << "      <section class=\"related-articles\"><h2>#{cfg[:labels][:related]}</h2><ul>"
  LEAD_MAGNETS.each_value do |lead|
    body << "        <li><a href=\"#{relative_href(route, lead[:routes][locale])}\">#{lead[:titles][locale].sub(' | Raffy', '')}</a></li>"
  end
  body << "      </ul></section>"
  body << "    </article>"
  body << "  </main>"
  body << build_footer(route, locale)

  html = page_shell(locale, route, NEWSLETTER[:titles][locale], NEWSLETTER[:desc][locale], alternates, body.join("\n"), include_article_css: true)
  write_page(route, html)
  created += 1
end

# Rewrite tools index pages with expanded cluster links.
LOCALES.each do |locale, cfg|
  route = cfg[:tools_dir]
  alternates = build_alternates(LOCALES.transform_values { |v| v[:tools_dir] })
  body = []
  body << build_header(route, locale, "tool_library")
  body << "  <main class=\"container section\">"
  body << "    <article class=\"section-card\">"
  body << "      <h1>#{cfg[:labels][:tools]} Hub</h1>"
  body << "      <p>Solve everyday parenting bottlenecks with practical tools for sleep, feeding, growth, and daily tracking.</p>"
  body << "      <section class=\"article-grid\" style=\"margin-top:18px;\">"

  # Existing core tools first
  core_descriptions = core_tool_descriptions(locale)
  body << tool_card(locale, route, EXISTING_CORE['who_tool'][locale], cfg[:labels][:open_tool], "WHO Baby Growth Percentile Calculator", core_descriptions[:who])
  body << tool_card(locale, route, EXISTING_CORE['meal_tool'][locale], cfg[:labels][:open_tool], "Weekly Meal Planner 12-23 months", core_descriptions[:meal])

  TOOLS.each_value do |tool|
    body << tool_card(locale, route, tool[:routes][locale], cfg[:labels][:open_tool], tool[:titles][locale].sub(' | Raffy', ''), tool[:desc][locale])
  end

  body << "      </section>"
  body << "    </article>"
  body << "  </main>"
  body << build_footer(route, locale)

  html = page_shell(locale, route, "#{cfg[:labels][:tools]} Hub | Raffy", "Problem-solving parenting tools for sleep, feeding, growth, and daily tracking.", alternates, body.join("\n"))
  write_page(route, html)
  created += 1
end

puts "Phase 2-4 generation complete. Files created/updated: #{created}"
