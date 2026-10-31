const localePack = {
  en: {
    resultTitle: "Plan summary",
    disclaimer: "Educational support only. For diagnosis or urgent concerns, contact your pediatrician.",
    wake: {
      summary: "Recommended wake windows and nap structure",
      napLabel: "Suggested naps",
      windowLabel: "Wake window"
    },
    nap: {
      summary: "Nap transition recommendation"
    },
    solids: {
      summary: "Solids progression recommendation"
    },
    diaper: {
      summary: "Hydration and output check"
    },
    feeding: {
      summary: "Daily intake estimate"
    }
  },
  es: {
    resultTitle: "Resumen del plan",
    disclaimer: "Apoyo educativo. Para diagnóstico o dudas urgentes, consulta con pediatría.",
    wake: {
      summary: "Ventanas de sueño y estructura de siestas",
      napLabel: "Siestas sugeridas",
      windowLabel: "Ventana de vigilia"
    },
    nap: {
      summary: "Recomendación de transición de siestas"
    },
    solids: {
      summary: "Recomendación de progresión de sólidos"
    },
    diaper: {
      summary: "Revisión de hidratación y eliminación"
    },
    feeding: {
      summary: "Estimación de ingesta diaria"
    }
  },
  fr: {
    resultTitle: "Résumé du plan",
    disclaimer: "Outil éducatif. Pour un diagnostic ou une urgence, contactez votre pédiatre.",
    wake: {
      summary: "Fenêtres d'éveil et structure des siestes",
      napLabel: "Siestes recommandées",
      windowLabel: "Fenêtre d'éveil"
    },
    nap: {
      summary: "Recommandation de transition des siestes"
    },
    solids: {
      summary: "Recommandation de progression de la diversification"
    },
    diaper: {
      summary: "Vérification hydratation et élimination"
    },
    feeding: {
      summary: "Estimation des apports quotidiens"
    }
  },
  pt: {
    resultTitle: "Resumo do plano",
    disclaimer: "Suporte educativo. Para diagnóstico ou urgência, procure seu pediatra.",
    wake: {
      summary: "Janelas de vigília e estrutura de sonecas",
      napLabel: "Sonecas sugeridas",
      windowLabel: "Janela de vigília"
    },
    nap: {
      summary: "Recomendação de transição de sonecas"
    },
    solids: {
      summary: "Recomendação de progressão alimentar"
    },
    diaper: {
      summary: "Verificação de hidratação e eliminações"
    },
    feeding: {
      summary: "Estimativa de ingestão diária"
    }
  },
  it: {
    resultTitle: "Riepilogo del piano",
    disclaimer: "Strumento educativo. Per una diagnosi o un'urgenza, contatta il tuo pediatra.",
    wake: {
      summary: "Finestre di veglia e struttura dei pisolini",
      napLabel: "Pisolini consigliati",
      windowLabel: "Finestra di veglia"
    },
    nap: {
      summary: "Indicazione sul passaggio tra pisolini"
    },
    solids: {
      summary: "Indicazione sulla progressione dello svezzamento"
    },
    diaper: {
      summary: "Controllo di idratazione e pannolini"
    },
    feeding: {
      summary: "Stima dell'apporto giornaliero"
    }
  },
  de: {
    resultTitle: "Zusammenfassung deines Plans",
    disclaimer: "Nur zur Information. Bei Verdacht auf eine Erkrankung oder in dringenden Fällen wende dich an deine Kinderarztpraxis.",
    wake: {
      summary: "Wachfenster und Aufbau der Schläfchen",
      napLabel: "Empfohlene Schläfchen",
      windowLabel: "Wachfenster"
    },
    nap: {
      summary: "Empfehlung zum Wechsel der Schläfchen"
    },
    solids: {
      summary: "Empfehlung zur Beikost-Steigerung"
    },
    diaper: {
      summary: "Check von Flüssigkeitshaushalt und Ausscheidung"
    },
    feeding: {
      summary: "Schätzung der täglichen Nahrungsmenge"
    }
  }
};

/* ---------- Mixpanel tracking (same base payload as tools/percentile-calculator.js) ---------- */
const TRACKING_LANGUAGES = ["en", "es", "fr", "pt", "it", "de"];
const TOOL_NAMES = {
  wake: "Wake Window Planner",
  nap: "Nap Transition Helper",
  feeding: "Feeding Quantity Estimator",
  diaper: "Diaper Output Tracker",
  solids: "Solids Progression Planner"
};

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

function detectAiReferrer() {
  const referrer = (document.referrer || "").toLowerCase();
  if (!referrer) return { ai_referral: false, ai_referrer_source: "unknown" };
  const knownSources = [
    { source: "chatgpt", patterns: ["chatgpt.com", "chat.openai.com"] },
    { source: "perplexity", patterns: ["perplexity.ai"] },
    { source: "gemini", patterns: ["gemini.google.com"] },
    { source: "copilot", patterns: ["copilot.microsoft.com", "bing.com/chat"] },
    { source: "claude", patterns: ["claude.ai"] }
  ];
  for (const known of knownSources) {
    if (known.patterns.some((pattern) => referrer.includes(pattern))) {
      return { ai_referral: true, ai_referrer_source: known.source };
    }
  }
  const otherAiPatterns = ["you.com", "phind.com", "poe.com", "meta.ai", "mistral.ai", "grok.com"];
  if (otherAiPatterns.some((pattern) => referrer.includes(pattern))) {
    return { ai_referral: true, ai_referrer_source: "other" };
  }
  return { ai_referral: false, ai_referrer_source: "unknown" };
}

function baseTrackingPayload(toolName) {
  const language = TRACKING_LANGUAGES.includes(document.body?.dataset?.locale)
    ? document.body.dataset.locale
    : "en";

  return {
    language,
    page: toolName,
    page_key: document.body?.dataset?.pageKey || "unknown",
    path: window.location.pathname,
    url: window.location.href,
    ...getUtmParams(),
    ...detectAiReferrer()
  };
}

function trackToolEvent(kind, suffix, properties) {
  try {
    const toolName = TOOL_NAMES[kind];
    if (!toolName || !window.mixpanel || typeof window.mixpanel.track !== "function") return;
    window.mixpanel.track(`Raffy Webpage - ${toolName} ${suffix}`, {
      ...baseTrackingPayload(toolName),
      ...properties
    });
  } catch (error) {
    // Tracking must never break the tool.
  }
}

// Raw numeric inputs (snake_case names carry the unit); selects/checkboxes use their internal English values.
function toolInputs(kind, form) {
  const props = toolInputValues(kind, form);
  // Blank fields are omitted rather than sent as 0
  Object.keys(props).forEach((key) => props[key] === undefined && delete props[key]);
  return props;
}

function toolInputValues(kind, form) {
  const num = (name) => {
    const raw = String(form.elements[name]?.value ?? "").trim();
    return raw === "" || !Number.isFinite(Number(raw)) ? undefined : Number(raw);
  };
  const ageMonths = num("age_months");
  if (kind === "wake") return { age_months: ageMonths };
  if (kind === "nap") return { age_months: ageMonths, naps_per_day: num("current_naps") };
  if (kind === "solids") return { age_months: ageMonths, texture_stage: String(form.elements.texture_stage?.value || "mashed") };
  if (kind === "diaper") {
    return {
      age_months: ageMonths,
      wet_diapers_per_day: num("wet_diapers"),
      stools_per_day: num("stools"),
      warning_signs: Boolean(form.elements.red_flags?.checked)
    };
  }
  if (kind === "feeding") {
    return { age_months: ageMonths, weight_kg: num("weight_kg"), meals_per_day: num("meals_per_day") };
  }
  return {};
}

function resolveLocale(locale) {
  return localePack[locale] ? locale : "en";
}

function wakeWindowModel(ageMonths, locale) {
  const lang = resolveLocale(locale);

  if (ageMonths <= 3) {
    return {
      naps: "4-6",
      window: "45-90 min",
      notes: {
        en: ["Keep short calming wind-downs.", "Prioritize daytime light exposure."],
        es: ["Mantén rutinas cortas y calmadas antes de dormir.", "Prioriza la exposición a la luz durante el día."],
        fr: ["Gardez des routines d'endormissement courtes et apaisantes.", "Privilégiez l'exposition à la lumière en journée."],
        pt: ["Mantenha rotinas curtas e calmantes antes de dormir.", "Priorize a exposição à luz durante o dia."],
        it: ["Mantieni routine brevi e rilassanti prima della nanna.", "Dai priorità all'esposizione alla luce durante il giorno."],
        de: ["Halte die Einschlafrituale kurz und beruhigend.", "Achte auf viel Tageslicht am Tag."]
      }[lang]
    };
  }

  if (ageMonths <= 6) {
    return {
      naps: "3-4",
      window: "1.5-2.5 h",
      notes: {
        en: ["Protect first morning nap.", "Start consistent bedtime cue."],
        es: ["Protege la primera siesta de la mañana.", "Empieza una señal constante para la hora de dormir."],
        fr: ["Protégez la première sieste du matin.", "Mettez en place un repère de coucher régulier."],
        pt: ["Proteja a primeira soneca da manhã.", "Comece um sinal consistente para a hora de dormir."],
        it: ["Proteggi il primo pisolino del mattino.", "Introduci un segnale costante per l'ora della nanna."],
        de: ["Schütze das erste Vormittagsschläfchen.", "Führe ein gleichbleibendes Signal für die Schlafenszeit ein."]
      }[lang]
    };
  }

  if (ageMonths <= 11) {
    return {
      naps: "2-3",
      window: "2-3.5 h",
      notes: {
        en: ["Anchor wake-up time.", "Use 10-20 minute bridge nap if overtired."],
        es: ["Ancla una hora fija de despertar.", "Usa una siesta puente de 10-20 minutos si hay mucho cansancio."],
        fr: ["Ancrez une heure de réveil stable.", "Utilisez une sieste relais de 10 à 20 minutes en cas de grande fatigue."],
        pt: ["Fixe um horário estável para acordar.", "Use uma soneca ponte de 10-20 minutos se houver cansaço excessivo."],
        it: ["Fissa un orario di risveglio stabile.", "Usa un pisolino ponte di 10-20 minuti se c'è troppa stanchezza."],
        de: ["Lege eine feste Aufwachzeit fest.", "Nutze bei Übermüdung ein kurzes Überbrückungsschläfchen von 10–20 Minuten."]
      }[lang]
    };
  }

  if (ageMonths <= 18) {
    return {
      naps: "1-2",
      window: "3-4.5 h",
      notes: {
        en: ["One long midday nap is common.", "Keep bedtime stable 7 days."],
        es: ["Es habitual una siesta larga al mediodía.", "Mantén la hora de dormir estable los 7 días."],
        fr: ["Une longue sieste de milieu de journée est fréquente.", "Gardez l'heure du coucher stable 7 jours sur 7."],
        pt: ["Uma soneca longa ao meio-dia é comum.", "Mantenha a hora de dormir estável nos 7 dias."],
        it: ["Un pisolino lungo a metà giornata è comune.", "Mantieni stabile l'ora della nanna tutti i 7 giorni."],
        de: ["Ein langer Mittagsschlaf ist typisch.", "Halte die Schlafenszeit an allen 7 Tagen stabil."]
      }[lang]
    };
  }

  return {
    naps: "1",
    window: "4-6 h",
    notes: {
      en: ["Avoid late naps that push bedtime.", "Use quiet routine before sleep."],
      es: ["Evita siestas tardías que retrasen la noche.", "Usa una rutina tranquila antes de dormir."],
      fr: ["Évitez les siestes tardives qui repoussent le coucher.", "Utilisez une routine calme avant le sommeil."],
      pt: ["Evite sonecas tardias que empurrem a hora de dormir.", "Use uma rotina tranquila antes de dormir."],
      it: ["Evita pisolini tardivi che spostano in avanti la nanna.", "Usa una routine tranquilla prima di dormire."],
      de: ["Vermeide späte Schläfchen, die das Zubettgehen nach hinten verschieben.", "Nutze vor dem Schlafen eine ruhige Routine."]
    }[lang]
  };
}

function napTransitionModel(ageMonths, currentNaps, locale) {
  const lang = resolveLocale(locale);
  if (currentNaps >= 3 && ageMonths >= 7) {
    return {
      en: ["You may be entering a 3 to 2 nap transition.", "Hold bedtime earlier for 7-10 days.", "Watch for shorter morning nap and longer midday nap."],
      es: ["Puede que estés entrando en una transición de 3 a 2 siestas.", "Adelanta la hora de dormir durante 7-10 días.", "Observa si la siesta de la mañana se acorta y la del mediodía se alarga."],
      fr: ["Vous entrez peut-être dans une transition de 3 à 2 siestes.", "Avancez l'heure du coucher pendant 7 à 10 jours.", "Surveillez une sieste du matin plus courte et une sieste de midi plus longue."],
      pt: ["Você pode estar entrando em uma transição de 3 para 2 sonecas.", "Antecipe a hora de dormir por 7-10 dias.", "Observe soneca da manhã mais curta e soneca do meio-dia mais longa."],
      it: ["Potresti essere all'inizio del passaggio da 3 a 2 pisolini.", "Anticipa l'ora della nanna per 7-10 giorni.", "Osserva se il pisolino del mattino si accorcia e quello di metà giornata si allunga."],
      de: ["Möglicherweise beginnt gerade der Übergang von 3 auf 2 Schläfchen.", "Verlege die Schlafenszeit für 7–10 Tage nach vorn.", "Beobachte, ob das Vormittagsschläfchen kürzer und der Mittagsschlaf länger wird."]
    }[lang];
  }
  if (currentNaps === 2 && ageMonths >= 14) {
    return {
      en: ["You may be approaching a 2 to 1 nap transition.", "Delay nap start by 10-15 minutes every few days.", "Use quiet time if second nap is refused repeatedly."],
      es: ["Puede que te acerques a una transición de 2 a 1 siesta.", "Retrasa el inicio de la siesta 10-15 minutos cada pocos días.", "Usa tiempo tranquilo si rechaza la segunda siesta repetidamente."],
      fr: ["Vous approchez peut-être d'une transition de 2 à 1 sieste.", "Décalez le début de la sieste de 10 à 15 minutes tous les quelques jours.", "Prévoyez un temps calme si la deuxième sieste est refusée de façon répétée."],
      pt: ["Você pode estar se aproximando de uma transição de 2 para 1 soneca.", "Atrase o início da soneca em 10-15 minutos a cada poucos dias.", "Use tempo calmo se a segunda soneca for recusada repetidamente."],
      it: ["Potresti essere vicino al passaggio da 2 a 1 pisolino.", "Posticipa l'inizio del pisolino di 10-15 minuti ogni pochi giorni.", "Prevedi un momento di calma se il secondo pisolino viene rifiutato ripetutamente."],
      de: ["Möglicherweise steht bald der Übergang von 2 auf 1 Schläfchen an.", "Verschiebe den Beginn des Schläfchens alle paar Tage um 10–15 Minuten nach hinten.", "Plane eine ruhige Auszeit ein, wenn das zweite Schläfchen wiederholt abgelehnt wird."]
    }[lang];
  }
  return {
    en: ["Current nap count looks age-appropriate.", "Maintain stable wake-up anchor.", "Reassess if bedtime resistance lasts over one week."],
    es: ["El número actual de siestas parece adecuado para la edad.", "Mantén una hora de despertar estable.", "Reevalúa si la resistencia al sueño dura más de una semana."],
    fr: ["Le nombre actuel de siestes semble adapté à l'âge.", "Maintenez une heure de réveil stable.", "Réévaluez si la résistance au coucher dure plus d'une semaine."],
    pt: ["A quantidade atual de sonecas parece adequada para a idade.", "Mantenha um horário fixo para acordar.", "Reavalie se a resistência para dormir durar mais de uma semana."],
    it: ["Il numero attuale di pisolini sembra adatto all'età.", "Mantieni un orario di risveglio stabile.", "Rivaluta se la resistenza alla nanna dura più di una settimana."],
    de: ["Die aktuelle Anzahl der Schläfchen scheint altersgerecht.", "Behalte eine feste Aufwachzeit bei.", "Überprüfe die Lage erneut, wenn das Einschlafen länger als eine Woche schwerfällt."]
  }[lang];
}

function solidsModel(ageMonths, stage, locale) {
  const lang = resolveLocale(locale);
  const base = [];
  if (ageMonths < 6) {
    base.push({
      en: "Complementary solids are usually introduced around 6 months with pediatric guidance.",
      es: "Los sólidos complementarios suelen introducirse alrededor de los 6 meses con orientación pediátrica.",
      fr: "Les aliments complémentaires sont généralement introduits vers 6 mois avec l'avis du pédiatre.",
      pt: "A introdução alimentar complementar geralmente começa por volta dos 6 meses com orientação pediátrica.",
      it: "Lo svezzamento di solito inizia verso i 6 mesi, con il consiglio del pediatra.",
      de: "Die Beikost wird in der Regel um den 6. Lebensmonat herum eingeführt, in Absprache mit der Kinderarztpraxis."
    }[lang]);
  } else if (ageMonths <= 8) {
    base.push({
      en: "Offer iron-rich foods daily and repeat exposure to new tastes.",
      es: "Ofrece alimentos ricos en hierro a diario y repite la exposición a sabores nuevos.",
      fr: "Proposez chaque jour des aliments riches en fer et répétez l'exposition aux nouvelles saveurs.",
      pt: "Ofereça alimentos ricos em ferro diariamente e repita a exposição a novos sabores.",
      it: "Offri ogni giorno alimenti ricchi di ferro e ripeti l'esposizione ai nuovi sapori.",
      de: "Biete täglich eisenreiche Lebensmittel an und wiederhole neue Geschmacksrichtungen immer wieder."
    }[lang]);
  } else if (ageMonths <= 12) {
    base.push({
      en: "Increase texture complexity and encourage self-feeding practice.",
      es: "Aumenta la complejidad de texturas y fomenta la autoalimentación.",
      fr: "Augmentez la complexité des textures et encouragez l'alimentation autonome.",
      pt: "Aumente a complexidade das texturas e incentive a autoalimentação.",
      it: "Aumenta la complessità delle consistenze e incoraggia il bambino a mangiare da solo.",
      de: "Steigere nach und nach die Konsistenz der Mahlzeiten und fördere das selbstständige Essen."
    }[lang]);
  } else {
    base.push({
      en: "Shift toward shared family meals with age-adapted cuts and portions.",
      es: "Pasa gradualmente a comidas familiares compartidas con cortes y porciones adaptadas a la edad.",
      fr: "Évoluez vers les repas familiaux partagés avec des morceaux et portions adaptés à l'âge.",
      pt: "Faça a transição para refeições em família com cortes e porções adequados à idade.",
      it: "Passa gradualmente ai pasti in famiglia, con tagli e porzioni adatti all'età.",
      de: "Gehe schrittweise zu gemeinsamen Familienmahlzeiten über, mit altersgerecht geschnittenen Stücken und Portionen."
    }[lang]);
  }

  if (stage === "puree") {
    base.push({
      en: "Plan 1 thicker texture step every 5-7 days.",
      es: "Planifica un paso hacia textura más espesa cada 5-7 días.",
      fr: "Prévoyez une étape vers une texture plus épaisse tous les 5 à 7 jours.",
      pt: "Planeje um passo para textura mais espessa a cada 5-7 dias.",
      it: "Programma un passo verso una consistenza più densa ogni 5-7 giorni.",
      de: "Plane alle 5–7 Tage einen Schritt zu einer festeren Konsistenz ein."
    }[lang]);
  }
  if (stage === "mashed") {
    base.push({
      en: "Introduce soft finger foods and mixed textures.",
      es: "Introduce trozos blandos y texturas mixtas.",
      fr: "Introduisez des morceaux fondants et des textures mixtes.",
      pt: "Introduza alimentos em pedaços macios e texturas mistas.",
      it: "Introduci pezzetti morbidi da prendere con le mani e consistenze miste.",
      de: "Führe weiche Fingerfood-Stücke und gemischte Konsistenzen ein."
    }[lang]);
  }
  if (stage === "finger") {
    base.push({
      en: "Expand food variety and rotate protein sources across the week.",
      es: "Amplía la variedad de alimentos y rota fuentes de proteína durante la semana.",
      fr: "Élargissez la variété des aliments et alternez les sources de protéines sur la semaine.",
      pt: "Amplie a variedade de alimentos e alterne fontes de proteína ao longo da semana.",
      it: "Amplia la varietà di alimenti e alterna le fonti di proteine nel corso della settimana.",
      de: "Erweitere die Vielfalt der Lebensmittel und wechsle die Eiweißquellen im Lauf der Woche ab."
    }[lang]);
  }

  base.push({
    en: "Keep no added sugar/salt and monitor choking-risk shapes.",
    es: "Mantén sin azúcar ni sal añadidas y vigila formas con riesgo de atragantamiento.",
    fr: "Sans sucre ni sel ajoutés, et surveillez les formes à risque d'étouffement.",
    pt: "Mantenha sem açúcar/sal adicionados e monitore formatos com risco de engasgo.",
    it: "Evita zucchero e sale aggiunti e fai attenzione ai formati a rischio di soffocamento.",
    de: "Verzichte auf Zucker und Salz und achte auf Formen, die sich verschlucken lassen."
  }[lang]);
  return base;
}

function diaperModel(ageMonths, wetDiapers, stools, redFlag, locale) {
  const lang = resolveLocale(locale);
  const tips = [];
  if (wetDiapers < 4) {
    tips.push({
      en: "Low wet diaper count may suggest hydration risk.",
      es: "Un número bajo de pañales mojados puede sugerir riesgo de hidratación.",
      fr: "Un faible nombre de couches mouillées peut indiquer un risque d'hydratation.",
      pt: "Poucas fraldas molhadas podem sugerir risco de hidratação.",
      it: "Pochi pannolini bagnati possono indicare un rischio di disidratazione.",
      de: "Wenige nasse Windeln können auf ein Risiko für Flüssigkeitsmangel hinweisen."
    }[lang]);
  } else {
    tips.push({
      en: "Wet diaper count is usually within a reassuring range.",
      es: "La cantidad de pañales mojados suele estar en un rango tranquilizador.",
      fr: "La fréquence des couches mouillées est généralement dans une zone rassurante.",
      pt: "A quantidade de fraldas molhadas costuma ficar em uma faixa tranquilizadora.",
      it: "Il numero di pannolini bagnati è di solito in un intervallo rassicurante.",
      de: "Die Zahl der nassen Windeln liegt meist in einem beruhigenden Bereich."
    }[lang]);
  }

  if (ageMonths < 6 && stools === 0) {
    tips.push({
      en: "No stool can be normal in some breastfed babies, but watch comfort and feeding.",
      es: "No evacuar puede ser normal en algunos bebés amamantados; vigila confort y alimentación.",
      fr: "Une absence de selles peut être normale chez certains bébés allaités, mais surveillez confort et alimentation.",
      pt: "Ausência de evacuação pode ser normal em alguns bebês amamentados, mas observe conforto e alimentação.",
      it: "Non fare la cacca può essere normale in alcuni neonati allattati al seno, ma osserva il loro benessere e l'alimentazione.",
      de: "Kein Stuhlgang kann bei manchen gestillten Babys normal sein, achte aber auf das Wohlbefinden und die Ernährung."
    }[lang]);
  }
  if (ageMonths >= 6 && stools === 0) {
    tips.push({
      en: "Review fiber/fluid pattern if stool frequency drops.",
      es: "Revisa fibra y líquidos si baja la frecuencia de evacuaciones.",
      fr: "Revoyez fibres et liquides si la fréquence des selles baisse.",
      pt: "Revise padrão de fibras e líquidos se a frequência de evacuações cair.",
      it: "Controlla fibre e liquidi se la frequenza delle evacuazioni diminuisce.",
      de: "Prüfe Ballaststoffe und Flüssigkeit, wenn der Stuhlgang seltener wird."
    }[lang]);
  }
  if (stools >= 5) {
    tips.push({
      en: "Frequent stools may need hydration monitoring.",
      es: "Evacuaciones frecuentes pueden requerir vigilar hidratación.",
      fr: "Des selles fréquentes peuvent nécessiter une surveillance de l'hydratation.",
      pt: "Evacuações frequentes podem exigir monitoramento da hidratação.",
      it: "Evacuazioni frequenti possono richiedere di tenere sotto controllo l'idratazione.",
      de: "Häufiger Stuhlgang kann es nötig machen, die Flüssigkeitszufuhr im Blick zu behalten."
    }[lang]);
  }

  if (redFlag) {
    tips.push({
      en: "Because warning signs were selected, contact pediatric care promptly.",
      es: "Como se marcaron señales de alerta, contacta a pediatría cuanto antes.",
      fr: "Des signes d'alerte ont été signalés: contactez rapidement votre pédiatre.",
      pt: "Como sinais de alerta foram marcados, procure atendimento pediátrico rapidamente.",
      it: "Poiché hai segnalato dei campanelli d'allarme, contatta subito il pediatra.",
      de: "Da du Warnzeichen angekreuzt hast, wende dich bitte umgehend an die Kinderarztpraxis."
    }[lang]);
  } else {
    tips.push({
      en: "If mood, feeding, or hydration changes abruptly, seek pediatric advice.",
      es: "Si el estado de ánimo, la alimentación o la hidratación cambian de forma brusca, busca consejo pediátrico.",
      fr: "Si l'humeur, l'alimentation ou l'hydratation changent brutalement, demandez un avis pédiatrique.",
      pt: "Se humor, alimentação ou hidratação mudarem de forma abrupta, procure orientação pediátrica.",
      it: "Se umore, alimentazione o idratazione cambiano all'improvviso, chiedi consiglio al pediatra.",
      de: "Wenn sich Stimmung, Essverhalten oder Trinkmenge plötzlich verändern, lass dich kinderärztlich beraten."
    }[lang]);
  }
  return tips;
}

function feedingNumbers(ageMonths, weightKg, mealsPerDay) {
  const kcalPerKg = ageMonths <= 12 ? 82 : 78;
  const dailyKcal = Math.round(weightKg * kcalPerKg);
  const perMeal = Math.round(dailyKcal / Math.max(mealsPerDay, 1));
  let milk = [400, 500];
  if (ageMonths <= 8) milk = [500, 700];
  if (ageMonths >= 18) milk = [300, 450];
  return { dailyKcal, perMeal, milkMinMl: milk[0], milkMaxMl: milk[1] };
}

function feedingModel(ageMonths, weightKg, mealsPerDay, locale) {
  const lang = resolveLocale(locale);
  const { dailyKcal, perMeal } = feedingNumbers(ageMonths, weightKg, mealsPerDay);

  const milkRangeByLocale = {
    en: { base: "400-500 ml/day", early: "500-700 ml/day", late: "300-450 ml/day" },
    es: { base: "400-500 ml/día", early: "500-700 ml/día", late: "300-450 ml/día" },
    fr: { base: "400-500 ml/jour", early: "500-700 ml/jour", late: "300-450 ml/jour" },
    pt: { base: "400-500 ml/dia", early: "500-700 ml/dia", late: "300-450 ml/dia" },
    it: { base: "400-500 ml/giorno", early: "500-700 ml/giorno", late: "300-450 ml/giorno" },
    de: { base: "400–500 ml/Tag", early: "500–700 ml/Tag", late: "300–450 ml/Tag" }
  };

  const ranges = milkRangeByLocale[lang];
  let milkRange = ranges.base;
  if (ageMonths <= 8) milkRange = ranges.early;
  if (ageMonths >= 18) milkRange = ranges.late;

  if (lang === "es") {
    return [
      `Energía diaria estimada: ${dailyKcal} kcal/día`,
      `Objetivo aproximado por comida (${mealsPerDay} comidas): ${perMeal} kcal/comida`,
      `Rango típico de leche por edad: ${milkRange}`,
      "Ajusta porciones según apetito y curva de crecimiento con tu equipo pediátrico."
    ];
  }

  if (lang === "fr") {
    return [
      `Apport énergétique quotidien estimé: ${dailyKcal} kcal/jour`,
      `Objectif approximatif par repas (${mealsPerDay} repas): ${perMeal} kcal/repas`,
      `Volume de lait typique selon l'âge: ${milkRange}`,
      "Ajustez les portions selon l'appétit et la courbe de croissance avec votre équipe pédiatrique."
    ];
  }

  if (lang === "pt") {
    return [
      `Energia diária estimada: ${dailyKcal} kcal/dia`,
      `Meta aproximada por refeição (${mealsPerDay} refeições): ${perMeal} kcal/refeição`,
      `Faixa típica de leite por idade: ${milkRange}`,
      "Ajuste porções conforme apetite e curva de crescimento com sua equipe pediátrica."
    ];
  }

  if (lang === "it") {
    return [
      `Energia giornaliera stimata: ${dailyKcal} kcal/giorno`,
      `Obiettivo indicativo per pasto (${mealsPerDay} pasti): ${perMeal} kcal/pasto`,
      `Quantità tipica di latte in base all'età: ${milkRange}`,
      "Adatta le porzioni all'appetito e alla curva di crescita insieme al tuo pediatra."
    ];
  }

  if (lang === "de") {
    return [
      `Geschätzter Tagesenergiebedarf: ${dailyKcal} kcal/Tag`,
      `Richtwert pro Mahlzeit (${mealsPerDay} Mahlzeiten): ${perMeal} kcal/Mahlzeit`,
      `Typische Milchmenge je nach Alter: ${milkRange}`,
      "Passe die Portionen gemeinsam mit deiner Kinderarztpraxis an Appetit und Wachstumskurve an."
    ];
  }

  return [
    `Estimated daily energy: ${dailyKcal} kcal/day`,
    `Approximate per meal target (${mealsPerDay} meals): ${perMeal} kcal/meal`,
    `Typical milk range by age: ${milkRange}`,
    "Adjust portions to appetite and growth trend with your pediatric team."
  ];
}

function renderOutput(form, lines, summary, locale) {
  const pack = localePack[locale] || localePack.en;
  const output = form.closest(".tool-card")?.querySelector("[data-tool-output]");
  if (!output) return;

  output.innerHTML = `
    <h2>${pack.resultTitle}</h2>
    <p>${summary}</p>
    <ul>${lines.map((line) => `<li>${line}</li>`).join("")}</ul>
    <p class="tool-disclaimer">${pack.disclaimer}</p>
  `;
}

/* ---------- B v2 markup (all locales; the legacy renderer stays as a fallback for old markup) ----------
   Static HTML carries the form, hints, inline error text, empty/error states and the app card.
   The script only fills values: [data-r-title|summary|disclaimer] from localePack, [data-r-stats],
   [data-r-headline], [data-r-tips]. Everything is guarded so legacy markup keeps working. */
const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 4.5 4.5L19 7"/></svg>';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function setState(state) {
  document.body.classList.remove("state-empty", "state-result", "state-error");
  document.body.classList.add(`state-${state}`);
}

// "820 kcal/day" -> big number + small unit; values without a unit ("4-6") stay as they are.
function statValueHtml(value) {
  const match = /^(.*?\d)\s+([^\d\s].*)$/.exec(value);
  return match ? `${escapeHtml(match[1])} <small>${escapeHtml(match[2])}</small>` : escapeHtml(value);
}

function renderResult(root, { lines = [], stats = [], headline = "", alert = "", bullet = "check", summary, locale }) {
  const pack = localePack[locale] || localePack.en;
  const result = root.querySelector(".result");
  if (!result) return;
  const fill = (selector, text) => {
    const el = result.querySelector(selector);
    if (el) el.textContent = text;
  };
  fill("[data-r-title]", pack.resultTitle);
  fill("[data-r-summary]", summary);
  fill("[data-r-disclaimer]", pack.disclaimer);
  fill("[data-r-headline]", headline);

  // Warning line (diaper tool with warning signs): amber alert above the tips, never a check-marked tip.
  const alertEl = result.querySelector("[data-r-alert]");
  if (alertEl) {
    const text = alertEl.querySelector("[data-r-alert-text]");
    if (text) text.textContent = alert;
    alertEl.hidden = !alert;
  } else if (alert) {
    lines = [...lines, alert];
  }

  const statsEl = result.querySelector("[data-r-stats]");
  if (statsEl) {
    statsEl.innerHTML = stats
      .map(([label, value]) => `<div class="stat"><p class="k">${escapeHtml(label)}</p><p class="v">${statValueHtml(value)}</p></div>`)
      .join("");
  }
  const tipsEl = result.querySelector("[data-r-tips]");
  if (tipsEl) {
    // "dot" bullets for lists that mix reassurance with cautions (a check mark would read as "all clear").
    const marker = bullet === "dot" ? '<span class="dot" aria-hidden="true"></span>' : CHECK_ICON;
    tipsEl.innerHTML = lines.map((line) => `<li>${marker}<span>${escapeHtml(line)}</span></li>`).join("");
  }

  setState("result");
  window.RaffyStickyCta?.show();
  if (window.matchMedia("(max-width: 980px)").matches) {
    root.querySelector(".pane.res")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function clearFieldError(control) {
  const field = control.closest(".field");
  if (!field) return;
  field.classList.remove("has-error");
  control.removeAttribute("aria-invalid");
}

// Returns true when every control is valid; otherwise marks the invalid fields and focuses the first one.
function validateForm(form) {
  const controls = [...form.elements].filter((el) => el.willValidate);
  const invalid = controls.filter((el) => !el.checkValidity());
  controls.filter((el) => !invalid.includes(el)).forEach(clearFieldError);
  if (!invalid.length) return true;
  invalid.forEach((el) => {
    el.closest(".field")?.classList.add("has-error");
    el.setAttribute("aria-invalid", "true");
  });
  invalid[0].focus();
  return false;
}

function attachTool(form) {
  const locale = form.dataset.locale || "en";
  const kind = form.dataset.toolKind;
  const pack = localePack[locale] || localePack.en;
  const root = form.closest("[data-tool-root]");

  // Legacy markup renders into [data-tool-output]; B v2 markup renders into the result pane.
  const show = ({ lines, summary, stats = [], headline = "", alert = "", bullet }) => {
    if (root) renderResult(root, { lines, stats, headline, alert, bullet, summary, locale });
    else renderOutput(form, [...stats.map(([label, value]) => `${label}: ${value}`), ...lines], summary, locale);
  };
  // Lists whose first entry is a headline sentence (nap, solids, diaper) show it large above the tips.
  const withHeadline = (lines) => (root ? { headline: lines[0], lines: lines.slice(1) } : { lines });

  if (root) {
    form.addEventListener("input", (event) => {
      const control = event.target;
      if (control instanceof HTMLInputElement && control.checkValidity()) clearFieldError(control);
    });
    form.addEventListener("reset", () => {
      form.querySelectorAll(".field").forEach((field) => field.classList.remove("has-error"));
      form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
      setState("empty");
      window.RaffyStickyCta?.hide();
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    trackToolEvent(kind, "Submit Clicked", toolInputs(kind, form));

    if (root && !validateForm(form)) {
      setState("error");
      window.RaffyStickyCta?.hide();
      return;
    }

    if (kind === "wake") {
      const ageMonths = Number(form.age_months.value || 0);
      const model = wakeWindowModel(ageMonths, locale);
      show({
        stats: [[pack.wake.napLabel, model.naps], [pack.wake.windowLabel, resolveLocale(locale) === "de" ? model.window.replace(".", ",") : model.window]],
        lines: model.notes,
        summary: pack.wake.summary
      });
      trackToolEvent(kind, "Results Shown", {
        ...toolInputs(kind, form),
        naps_per_day_range: model.naps,
        wake_window_range: model.window
      });
    }

    if (kind === "nap") {
      const ageMonths = Number(form.age_months.value || 0);
      const currentNaps = Number(form.current_naps.value || 0);
      show({ ...withHeadline(napTransitionModel(ageMonths, currentNaps, locale)), summary: pack.nap.summary });
      // Mirrors the branches in napTransitionModel.
      const transition = currentNaps >= 3 && ageMonths >= 7 ? "3_to_2" : currentNaps === 2 && ageMonths >= 14 ? "2_to_1" : "none";
      trackToolEvent(kind, "Results Shown", { ...toolInputs(kind, form), transition_suggestion: transition });
    }

    if (kind === "solids") {
      const ageMonths = Number(form.age_months.value || 0);
      const stage = String(form.texture_stage.value || "mashed");
      show({ ...withHeadline(solidsModel(ageMonths, stage, locale)), summary: pack.solids.summary });
      const ageStage = ageMonths < 6 ? "under_6_months" : ageMonths <= 8 ? "6_to_8_months" : ageMonths <= 12 ? "9_to_12_months" : "13_months_plus";
      trackToolEvent(kind, "Results Shown", { ...toolInputs(kind, form), age_stage: ageStage });
    }

    if (kind === "diaper") {
      const ageMonths = Number(form.age_months.value || 0);
      const wetDiapers = Number(form.wet_diapers.value || 0);
      const stools = Number(form.stools.value || 0);
      const redFlag = Boolean(form.red_flags.checked);
      const lines = diaperModel(ageMonths, wetDiapers, stools, redFlag, locale);
      if (root) {
        // With warning signs the last line is the escalation advice: shown as an alert, not as a tip.
        const alert = redFlag ? lines[lines.length - 1] : "";
        const rest = redFlag ? lines.slice(0, -1) : lines;
        show({ headline: rest[0], lines: rest.slice(1), alert, bullet: "dot", summary: pack.diaper.summary });
      } else {
        show({ lines, summary: pack.diaper.summary });
      }
      trackToolEvent(kind, "Results Shown", {
        ...toolInputs(kind, form),
        low_wet_diapers: wetDiapers < 4,
        pediatric_contact_advised: redFlag
      });
    }

    if (kind === "feeding") {
      const ageMonths = Number(form.age_months.value || 0);
      const weightKg = Number(form.weight_kg.value || 0);
      const mealsPerDay = Number(form.meals_per_day.value || 1);
      const lines = feedingModel(ageMonths, weightKg, mealsPerDay, locale);
      if (root) {
        // The first two lines are "label: value" (daily energy, per-meal target): shown as big numbers.
        const stats = lines.slice(0, 2).map((line) => {
          const at = line.indexOf(": ");
          return at < 0 ? ["", line] : [line.slice(0, at), line.slice(at + 2)];
        });
        show({ stats, lines: lines.slice(2), summary: pack.feeding.summary });
      } else {
        show({ lines, summary: pack.feeding.summary });
      }
      const numbers = feedingNumbers(ageMonths, weightKg, mealsPerDay);
      trackToolEvent(kind, "Results Shown", {
        ...toolInputs(kind, form),
        daily_energy_kcal: numbers.dailyKcal,
        energy_per_meal_kcal: numbers.perMeal,
        milk_min_ml_per_day: numbers.milkMinMl,
        milk_max_ml_per_day: numbers.milkMaxMl
      });
    }
  });
}

document.querySelectorAll("form[data-tool-kind]").forEach(attachTool);
