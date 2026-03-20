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
  }
};

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
        pt: ["Mantenha rotinas curtas e calmantes antes de dormir.", "Priorize a exposição à luz durante o dia."]
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
        pt: ["Proteja a primeira soneca da manhã.", "Comece um sinal consistente para a hora de dormir."]
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
        pt: ["Fixe um horário estável para acordar.", "Use uma soneca ponte de 10-20 minutos se houver cansaço excessivo."]
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
        pt: ["Uma soneca longa ao meio-dia é comum.", "Mantenha a hora de dormir estável nos 7 dias."]
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
      pt: ["Evite sonecas tardias que empurrem a hora de dormir.", "Use uma rotina tranquila antes de dormir."]
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
      pt: ["Você pode estar entrando em uma transição de 3 para 2 sonecas.", "Antecipe a hora de dormir por 7-10 dias.", "Observe soneca da manhã mais curta e soneca do meio-dia mais longa."]
    }[lang];
  }
  if (currentNaps === 2 && ageMonths >= 14) {
    return {
      en: ["You may be approaching a 2 to 1 nap transition.", "Delay nap start by 10-15 minutes every few days.", "Use quiet time if second nap is refused repeatedly."],
      es: ["Puede que te acerques a una transición de 2 a 1 siesta.", "Retrasa el inicio de la siesta 10-15 minutos cada pocos días.", "Usa tiempo tranquilo si rechaza la segunda siesta repetidamente."],
      fr: ["Vous approchez peut-être d'une transition de 2 à 1 sieste.", "Décalez le début de la sieste de 10 à 15 minutes tous les quelques jours.", "Prévoyez un temps calme si la deuxième sieste est refusée de façon répétée."],
      pt: ["Você pode estar se aproximando de uma transição de 2 para 1 soneca.", "Atrase o início da soneca em 10-15 minutos a cada poucos dias.", "Use tempo calmo se a segunda soneca for recusada repetidamente."]
    }[lang];
  }
  return {
    en: ["Current nap count looks age-appropriate.", "Maintain stable wake-up anchor.", "Reassess if bedtime resistance lasts over one week."],
    es: ["El número actual de siestas parece adecuado para la edad.", "Mantén una hora de despertar estable.", "Reevalúa si la resistencia al sueño dura más de una semana."],
    fr: ["Le nombre actuel de siestes semble adapté à l'âge.", "Maintenez une heure de réveil stable.", "Réévaluez si la résistance au coucher dure plus d'une semaine."],
    pt: ["A quantidade atual de sonecas parece adequada para a idade.", "Mantenha um horário fixo para acordar.", "Reavalie se a resistência para dormir durar mais de uma semana."]
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
      pt: "A introdução alimentar complementar geralmente começa por volta dos 6 meses com orientação pediátrica."
    }[lang]);
  } else if (ageMonths <= 8) {
    base.push({
      en: "Offer iron-rich foods daily and repeat exposure to new tastes.",
      es: "Ofrece alimentos ricos en hierro a diario y repite la exposición a sabores nuevos.",
      fr: "Proposez chaque jour des aliments riches en fer et répétez l'exposition aux nouvelles saveurs.",
      pt: "Ofereça alimentos ricos em ferro diariamente e repita a exposição a novos sabores."
    }[lang]);
  } else if (ageMonths <= 12) {
    base.push({
      en: "Increase texture complexity and encourage self-feeding practice.",
      es: "Aumenta la complejidad de texturas y fomenta la autoalimentación.",
      fr: "Augmentez la complexité des textures et encouragez l'alimentation autonome.",
      pt: "Aumente a complexidade das texturas e incentive a autoalimentação."
    }[lang]);
  } else {
    base.push({
      en: "Shift toward shared family meals with age-adapted cuts and portions.",
      es: "Pasa gradualmente a comidas familiares compartidas con cortes y porciones adaptadas a la edad.",
      fr: "Évoluez vers les repas familiaux partagés avec des morceaux et portions adaptés à l'âge.",
      pt: "Faça a transição para refeições em família com cortes e porções adequados à idade."
    }[lang]);
  }

  if (stage === "puree") {
    base.push({
      en: "Plan 1 thicker texture step every 5-7 days.",
      es: "Planifica un paso hacia textura más espesa cada 5-7 días.",
      fr: "Prévoyez une étape vers une texture plus épaisse tous les 5 à 7 jours.",
      pt: "Planeje um passo para textura mais espessa a cada 5-7 dias."
    }[lang]);
  }
  if (stage === "mashed") {
    base.push({
      en: "Introduce soft finger foods and mixed textures.",
      es: "Introduce trozos blandos y texturas mixtas.",
      fr: "Introduisez des morceaux fondants et des textures mixtes.",
      pt: "Introduza alimentos em pedaços macios e texturas mistas."
    }[lang]);
  }
  if (stage === "finger") {
    base.push({
      en: "Expand food variety and rotate protein sources across the week.",
      es: "Amplía la variedad de alimentos y rota fuentes de proteína durante la semana.",
      fr: "Élargissez la variété des aliments et alternez les sources de protéines sur la semaine.",
      pt: "Amplie a variedade de alimentos e alterne fontes de proteína ao longo da semana."
    }[lang]);
  }

  base.push({
    en: "Keep no added sugar/salt and monitor choking-risk shapes.",
    es: "Mantén sin azúcar ni sal añadidas y vigila formas con riesgo de atragantamiento.",
    fr: "Sans sucre ni sel ajoutés, et surveillez les formes à risque d'étouffement.",
    pt: "Mantenha sem açúcar/sal adicionados e monitore formatos com risco de engasgo."
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
      pt: "Poucas fraldas molhadas podem sugerir risco de hidratação."
    }[lang]);
  } else {
    tips.push({
      en: "Wet diaper count is usually within a reassuring range.",
      es: "La cantidad de pañales mojados suele estar en un rango tranquilizador.",
      fr: "La fréquence des couches mouillées est généralement dans une zone rassurante.",
      pt: "A quantidade de fraldas molhadas costuma ficar em uma faixa tranquilizadora."
    }[lang]);
  }

  if (ageMonths < 6 && stools === 0) {
    tips.push({
      en: "No stool can be normal in some breastfed babies, but watch comfort and feeding.",
      es: "No evacuar puede ser normal en algunos bebés amamantados; vigila confort y alimentación.",
      fr: "Une absence de selles peut être normale chez certains bébés allaités, mais surveillez confort et alimentation.",
      pt: "Ausência de evacuação pode ser normal em alguns bebês amamentados, mas observe conforto e alimentação."
    }[lang]);
  }
  if (ageMonths >= 6 && stools === 0) {
    tips.push({
      en: "Review fiber/fluid pattern if stool frequency drops.",
      es: "Revisa fibra y líquidos si baja la frecuencia de evacuaciones.",
      fr: "Revoyez fibres et liquides si la fréquence des selles baisse.",
      pt: "Revise padrão de fibras e líquidos se a frequência de evacuações cair."
    }[lang]);
  }
  if (stools >= 5) {
    tips.push({
      en: "Frequent stools may need hydration monitoring.",
      es: "Evacuaciones frecuentes pueden requerir vigilar hidratación.",
      fr: "Des selles fréquentes peuvent nécessiter une surveillance de l'hydratation.",
      pt: "Evacuações frequentes podem exigir monitoramento da hidratação."
    }[lang]);
  }

  if (redFlag) {
    tips.push({
      en: "Because warning signs were selected, contact pediatric care promptly.",
      es: "Como se marcaron señales de alerta, contacta a pediatría cuanto antes.",
      fr: "Des signes d'alerte ont été signalés: contactez rapidement votre pédiatre.",
      pt: "Como sinais de alerta foram marcados, procure atendimento pediátrico rapidamente."
    }[lang]);
  } else {
    tips.push({
      en: "If mood, feeding, or hydration changes abruptly, seek pediatric advice.",
      es: "Si el estado de ánimo, la alimentación o la hidratación cambian de forma brusca, busca consejo pediátrico.",
      fr: "Si l'humeur, l'alimentation ou l'hydratation changent brutalement, demandez un avis pédiatrique.",
      pt: "Se humor, alimentação ou hidratação mudarem de forma abrupta, procure orientação pediátrica."
    }[lang]);
  }
  return tips;
}

function feedingModel(ageMonths, weightKg, mealsPerDay, locale) {
  const lang = resolveLocale(locale);
  const kcalPerKg = ageMonths <= 12 ? 82 : 78;
  const dailyKcal = Math.round(weightKg * kcalPerKg);
  const perMeal = Math.round(dailyKcal / Math.max(mealsPerDay, 1));

  const milkRangeByLocale = {
    en: { base: "400-500 ml/day", early: "500-700 ml/day", late: "300-450 ml/day" },
    es: { base: "400-500 ml/día", early: "500-700 ml/día", late: "300-450 ml/día" },
    fr: { base: "400-500 ml/jour", early: "500-700 ml/jour", late: "300-450 ml/jour" },
    pt: { base: "400-500 ml/dia", early: "500-700 ml/dia", late: "300-450 ml/dia" }
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

function attachTool(form) {
  const locale = form.dataset.locale || "en";
  const kind = form.dataset.toolKind;
  const pack = localePack[locale] || localePack.en;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (kind === "wake") {
      const ageMonths = Number(form.age_months.value || 0);
      const model = wakeWindowModel(ageMonths, locale);
      renderOutput(
        form,
        [`${pack.wake.napLabel}: ${model.naps}`, `${pack.wake.windowLabel}: ${model.window}`, ...model.notes],
        pack.wake.summary,
        locale
      );
    }

    if (kind === "nap") {
      const ageMonths = Number(form.age_months.value || 0);
      const currentNaps = Number(form.current_naps.value || 0);
      renderOutput(form, napTransitionModel(ageMonths, currentNaps, locale), pack.nap.summary, locale);
    }

    if (kind === "solids") {
      const ageMonths = Number(form.age_months.value || 0);
      const stage = String(form.texture_stage.value || "mashed");
      renderOutput(form, solidsModel(ageMonths, stage, locale), pack.solids.summary, locale);
    }

    if (kind === "diaper") {
      const ageMonths = Number(form.age_months.value || 0);
      const wetDiapers = Number(form.wet_diapers.value || 0);
      const stools = Number(form.stools.value || 0);
      const redFlag = Boolean(form.red_flags.checked);
      renderOutput(form, diaperModel(ageMonths, wetDiapers, stools, redFlag, locale), pack.diaper.summary, locale);
    }

    if (kind === "feeding") {
      const ageMonths = Number(form.age_months.value || 0);
      const weightKg = Number(form.weight_kg.value || 0);
      const mealsPerDay = Number(form.meals_per_day.value || 1);
      renderOutput(form, feedingModel(ageMonths, weightKg, mealsPerDay, locale), pack.feeding.summary, locale);
    }
  });
}

document.querySelectorAll("form[data-tool-kind]").forEach(attachTool);
