const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MEAL_KEYS = ["breakfast", "snack_am", "lunch", "snack_pm", "dinner"];
const DEFAULT_INPUT = {
  locale: "es",
  ageMonths: 12,
  sex: "female",
  milkMlPerDay: 500,
  dietProfile: "omnivore",
  strictMode: true
};
const DEFAULT_DATA_PATH = new URL("./meal-planner-data.json", import.meta.url);

const LOCALES = {
  en: {
    dayLabels: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    },
    mealLabels: {
      breakfast: "Breakfast",
      snack_am: "Morning snack",
      lunch: "Lunch",
      snack_pm: "Afternoon snack",
      dinner: "Dinner"
    },
    statusOk: "OK",
    statusWarn: "Review",
    unitKcal: "kcal",
    summaryTitle: "Weekly summary",
    validationTitle: "Validation",
    repetitionTitle: "Dish usage",
    targetLabel: "Daily target",
    weeklyAverageLabel: "Weekly average",
    macroSplitLabel: "Carbs / Fat / Protein",
    unitPerDay: "per day",
    validationDailyCaloriesLabel: "daily calories",
    validationWeeklyAverageLabel: "weekly average",
    validationMacroDistributionLabel: "macro distribution",
    validationRepetitionLabel: "max repetitions",
    validationUniqueDishesLabel: "weekly unique dishes",
    validationStrictModeLabel: "strict mode",
    validationMilkComplianceLabel: "milk placement and target",
    validationWhoPediatricLabel: "WHO/Pediatric compliance",
    tableTitle: "Weekly menu",
    tableDayLabel: "Day",
    tableMealsLabel: "Meals",
    tableTotalLabel: "Daily total",
    usageCountSuffix: "x",
    milkTargetLabel: "Daily milk target (auto by age)",
    milkTag: "Milk",
    breakfastDinnerSplitLabel: "Breakfast/Dinner split"
  },
  es: {
    dayLabels: {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo"
    },
    mealLabels: {
      breakfast: "Desayuno",
      snack_am: "Media mañana",
      lunch: "Comida",
      snack_pm: "Merienda",
      dinner: "Cena"
    },
    statusOk: "OK",
    statusWarn: "Revisar",
    unitKcal: "kcal",
    summaryTitle: "Resumen semanal",
    validationTitle: "Validación",
    repetitionTitle: "Uso de platos",
    targetLabel: "Calorías objetivo del día",
    weeklyAverageLabel: "Calorías promedio del menú semanal",
    macroSplitLabel: "Distribución energética (carbohidratos / grasa / proteína)",
    unitPerDay: "al día",
    validationDailyCaloriesLabel: "calorías diarias",
    validationWeeklyAverageLabel: "promedio semanal",
    validationMacroDistributionLabel: "distribución de macros",
    validationRepetitionLabel: "máximo de repeticiones",
    validationUniqueDishesLabel: "platos únicos semanales",
    validationStrictModeLabel: "modo estricto",
    validationMilkComplianceLabel: "ingesta y reparto de leche",
    validationWhoPediatricLabel: "cumplimiento OMS/Pediatría",
    tableTitle: "Menú semanal",
    tableDayLabel: "Día",
    tableMealsLabel: "Comidas",
    tableTotalLabel: "Total diario",
    usageCountSuffix: "x",
    milkTargetLabel: "Leche recomendada al día (calculada por edad)",
    milkTag: "Leche",
    breakfastDinnerSplitLabel: "Reparto desayuno/cena"
  },
  fr: {
    dayLabels: {
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
      saturday: "Samedi",
      sunday: "Dimanche"
    },
    mealLabels: {
      breakfast: "Petit-dejeuner",
      snack_am: "Collation matin",
      lunch: "Dejeuner",
      snack_pm: "Collation apres-midi",
      dinner: "Diner"
    },
    statusOk: "OK",
    statusWarn: "Verifier",
    unitKcal: "kcal",
    summaryTitle: "Resume hebdomadaire",
    validationTitle: "Validation",
    repetitionTitle: "Frequence des plats",
    targetLabel: "Objectif quotidien",
    weeklyAverageLabel: "Moyenne hebdomadaire",
    macroSplitLabel: "Glucides / Lipides / Proteines",
    unitPerDay: "par jour",
    validationDailyCaloriesLabel: "calories quotidiennes",
    validationWeeklyAverageLabel: "moyenne hebdomadaire",
    validationMacroDistributionLabel: "repartition des macros",
    validationRepetitionLabel: "repetitions maximales",
    validationUniqueDishesLabel: "plats uniques hebdomadaires",
    validationStrictModeLabel: "mode strict",
    validationMilkComplianceLabel: "apport et repartition du lait",
    validationWhoPediatricLabel: "conformite OMS/Pediatrie",
    tableTitle: "Menu hebdomadaire",
    tableDayLabel: "Jour",
    tableMealsLabel: "Repas",
    tableTotalLabel: "Total quotidien",
    usageCountSuffix: "x",
    milkTargetLabel: "Objectif quotidien de lait (auto selon age)",
    milkTag: "Lait",
    breakfastDinnerSplitLabel: "Repartition petit-dejeuner/diner"
  },
  pt: {
    dayLabels: {
      monday: "Segunda",
      tuesday: "Terca",
      wednesday: "Quarta",
      thursday: "Quinta",
      friday: "Sexta",
      saturday: "Sabado",
      sunday: "Domingo"
    },
    mealLabels: {
      breakfast: "Cafe da manha",
      snack_am: "Lanche da manha",
      lunch: "Almoco",
      snack_pm: "Lanche da tarde",
      dinner: "Jantar"
    },
    statusOk: "OK",
    statusWarn: "Revisar",
    unitKcal: "kcal",
    summaryTitle: "Resumo semanal",
    validationTitle: "Validacao",
    repetitionTitle: "Uso dos pratos",
    targetLabel: "Meta diaria",
    weeklyAverageLabel: "Media semanal",
    macroSplitLabel: "Carboidratos / Gordura / Proteina",
    unitPerDay: "por dia",
    validationDailyCaloriesLabel: "calorias diarias",
    validationWeeklyAverageLabel: "media semanal",
    validationMacroDistributionLabel: "distribuicao de macros",
    validationRepetitionLabel: "maximo de repeticoes",
    validationUniqueDishesLabel: "pratos unicos semanais",
    validationStrictModeLabel: "modo estrito",
    validationMilkComplianceLabel: "ingestao e distribuicao de leite",
    validationWhoPediatricLabel: "conformidade OMS/Pediatria",
    tableTitle: "Cardapio semanal",
    tableDayLabel: "Dia",
    tableMealsLabel: "Refeicoes",
    tableTotalLabel: "Total diario",
    usageCountSuffix: "x",
    milkTargetLabel: "Meta diaria de leite (auto por idade)",
    milkTag: "Leite",
    breakfastDinnerSplitLabel: "Divisao cafe da manha/jantar"
  }
};

let datasetPromise;

/**
 * @typedef {Object} NutritionSummary
 * @property {number} kcal
 * @property {number} proteinG
 * @property {number} fatG
 * @property {number} carbG
 * @property {number} fiberG
 * @property {number} sugarsG
 * @property {number} sodiumMg
 */

/**
 * @typedef {Object} MealPlannerInput
 * @property {string} locale
 * @property {number} ageMonths
 * @property {"female"|"male"} sex
 * @property {string|number=} seed
 * @property {number} milkMlPerDay Kept for compatibility; generation uses age-banded automatic target.
 * @property {string} dietProfile
 * @property {boolean} strictMode
 */

/**
 * @typedef {Object} MealPlanMeal
 * @property {string} mealKey
 * @property {string} mealLabel
 * @property {string} dishId
 * @property {string} dishName
 * @property {number} portionScale
 * @property {NutritionSummary} nutrition
 * @property {number} milkMl
 * @property {NutritionSummary} milkNutrition
 * @property {number} addedSugarG
 * @property {number} addedSaltMg
 */

/**
 * @typedef {Object} MealPlanDay
 * @property {number} dayIndex
 * @property {string} dayKey
 * @property {string} dayLabel
 * @property {Array<MealPlanMeal>} meals
 * @property {number} milkTargetMl
 * @property {number} milkPlannedMl
 * @property {{breakfast:number,snack_am:number,lunch:number,snack_pm:number,dinner:number}} milkByMeal
 * @property {NutritionSummary} totals
 * @property {{kcalWithinRange:boolean,kcalBounds:{min:number,max:number}}} validations
 */

/**
 * @typedef {Object} MealPlannerOutput
 * @property {MealPlannerInput} input
 * @property {Object} targets
 * @property {number} targets.kcalTarget
 * @property {number} targets.milkTargetMl
 * @property {{breakfast:number,dinner:number}} targets.milkSplitPct
 * @property {Object} targets.mealDistribution
 * @property {Object} targets.mealTargets
 * @property {number} targets.weeklyAverageKcal
 * @property {Array<MealPlanDay>} week
 * @property {NutritionSummary} weeklyTotals
 * @property {{carbPct:number,fatPct:number,proteinPct:number}} weeklyMacroPct
 * @property {Object} validations
 * @property {Array<string>} warnings
 */

export async function loadMealPlannerDataset() {
  if (!datasetPromise) {
    datasetPromise = fetch(DEFAULT_DATA_PATH, { cache: "no-store" }).then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load meal planner dataset (${response.status}).`);
      }
      return response.json();
    });
  }
  return datasetPromise;
}

/**
 * @param {Partial<MealPlannerInput>} rawInput
 * @param {Object} dataset
 * @returns {MealPlannerOutput}
 */
export function generateMealPlanner(rawInput, dataset) {
  const warnings = [];
  const rules = dataset?.rules || {};
  const ageMin = Number(rules?.ageMonths?.min || 12);
  const ageMax = Number(rules?.ageMonths?.max || 23);
  const normalizedAge = clampNumber(rawInput?.ageMonths, ageMin, ageMax, DEFAULT_INPUT.ageMonths);
  const milkTargetMl = getDailyMilkTargetMl(normalizedAge);

  const input = {
    locale: normalizeLocale(rawInput?.locale || DEFAULT_INPUT.locale),
    ageMonths: normalizedAge,
    sex: rawInput?.sex === "male" ? "male" : "female",
    seed: String(rawInput?.seed ?? createAutoSeed()),
    milkMlPerDay: milkTargetMl,
    dietProfile: String(rawInput?.dietProfile || DEFAULT_INPUT.dietProfile),
    strictMode: rawInput?.strictMode !== false
  };

  if (Number(rawInput?.ageMonths) < ageMin || Number(rawInput?.ageMonths) > ageMax) {
    warnings.push(`Age adjusted to supported range (${ageMin}-${ageMax} months).`);
  }

  const foodsById = new Map((dataset.foods || []).map((food) => [food.id, food]));
  const repeatExceptions = new Set(rules.repeatExceptions || []);
  const maxRepeats = Number(rules.maxDishRepeatsPerWeek || 2);
  const distribution = rules.mealDistribution || DEFAULT_MEAL_DISTRIBUTION;
  const localeCopy = getLocaleCopy(input.locale);

  const kcalTarget = computeKcalTarget(input.ageMonths, rules.kcalFormula);
  const mealTargets = {};
  for (const mealKey of MEAL_KEYS) {
    mealTargets[mealKey] = kcalTarget * Number(distribution[mealKey] || 0);
  }

  const dishStatsById = new Map();
  for (const dish of dataset.dishes || []) {
    const baseline = computeDishNutrition(dish, foodsById, 1);
    dishStatsById.set(dish.id, baseline);
  }
  const minPortionScale = getMinPortionScale(input.ageMonths);

  const repeatCount = new Map();
  const week = [];
  const rng = createRng(input.seed);

  for (let dayIndex = 0; dayIndex < DAY_KEYS.length; dayIndex += 1) {
    const dayKey = DAY_KEYS[dayIndex];
    const dayLabel = localeCopy.dayLabels[dayKey];
    const meals = [];
    const usedThisDay = new Set();
    const previousDayDishIds = new Set((week[dayIndex - 1]?.meals || []).map((meal) => meal.dishId));
    const recentDishIds = new Set(
      week
        .slice(Math.max(0, dayIndex - 2), dayIndex)
        .flatMap((day) => (day.meals || []).map((meal) => meal.dishId))
    );
    const milkByMeal = splitDailyMilkByMeal(milkTargetMl);
    const milkNutritionByMeal = {};

    for (const mealKey of MEAL_KEYS) {
      milkNutritionByMeal[mealKey] = computeMilkNutrition(foodsById, milkByMeal[mealKey] || 0);
    }

    const dayMilkTotals = aggregateNutrition(Object.values(milkNutritionByMeal));
    const daySolidTargetKcal = Math.max(kcalTarget - dayMilkTotals.kcal, 220);
    const solidMealTargets = {};
    for (const mealKey of MEAL_KEYS) {
      solidMealTargets[mealKey] = daySolidTargetKcal * Number(distribution[mealKey] || 0);
    }

    for (const mealKey of MEAL_KEYS) {
      const candidate = chooseDish({
        mealKey,
        dataset,
        input,
        dishStatsById,
        repeatCount,
        repeatExceptions,
        maxRepeats,
        usedThisDay,
        previousDayDishIds,
        recentDishIds,
        minPortionScale,
        slotTarget: solidMealTargets[mealKey],
        rng
      });

      repeatCount.set(candidate.id, (repeatCount.get(candidate.id) || 0) + 1);
      usedThisDay.add(candidate.id);

      const baseline = dishStatsById.get(candidate.id);
      const scale = computeInitialScale(candidate, baseline.kcal, solidMealTargets[mealKey], minPortionScale);
      const nutrition = computeDishNutrition(candidate, foodsById, scale);

      meals.push({
        mealKey,
        mealLabel: localeCopy.mealLabels[mealKey],
        dishId: candidate.id,
        dishName: getDishName(candidate, input.locale),
        portionScale: round(scale, 3),
        nutrition,
        milkMl: milkByMeal[mealKey] || 0,
        milkNutrition: milkNutritionByMeal[mealKey] || emptyNutrition(),
        addedSugarG: Number(candidate.addedSugarG || 0) * scale,
        addedSaltMg: Number(candidate.addedSaltMg || 0) * scale
      });
    }

    normalizeDayEnergy(meals, daySolidTargetKcal, foodsById, dataset.dishes, minPortionScale);

    const totals = aggregateNutrition(
      meals.map((meal) => sumNutrition(meal.nutrition, meal.milkNutrition))
    );
    const dayValidation = validateDayCalories(totals.kcal, kcalTarget, Number(rules.dailyKcalTolerancePct || 10));
    const milkPlannedMl = meals.reduce((sum, meal) => sum + Number(meal.milkMl || 0), 0);

    week.push({
      dayIndex,
      dayKey,
      dayLabel,
      meals,
      milkTargetMl,
      milkPlannedMl,
      milkByMeal,
      totals,
      validations: {
        kcalWithinRange: dayValidation.passed,
        kcalBounds: dayValidation.bounds
      }
    });
  }

  const weeklyTotals = aggregateNutrition(week.map((day) => day.totals));
  const weeklyAverageKcal = weeklyTotals.kcal / DAY_KEYS.length;
  const weeklyMacroPct = calcMacroPct(weeklyTotals);

  const validations = buildValidations({
    week,
    weeklyTotals,
    weeklyAverageKcal,
    weeklyMacroPct,
    kcalTarget,
    rules,
    repeatCount,
    repeatExceptions,
    maxRepeats,
    input
  });

  return {
    input,
    targets: {
      kcalTarget,
      milkTargetMl,
      milkSplitPct: MILK_SPLIT_BY_MEAL,
      mealDistribution: distribution,
      mealTargets,
      weeklyAverageKcal
    },
    week,
    weeklyTotals,
    weeklyMacroPct,
    validations,
    dishUsage: Array.from(repeatCount.entries())
      .map(([dishId, uses]) => ({
        dishId,
        uses,
        dishName: getDishName((dataset.dishes || []).find((dish) => dish.id === dishId), input.locale)
      }))
      .sort((a, b) => b.uses - a.uses || a.dishName.localeCompare(b.dishName)),
    warnings
  };
}

export function computeDishNutrition(dish, foodsById, scale = 1) {
  const totals = {
    kcal: 0,
    proteinG: 0,
    fatG: 0,
    carbG: 0,
    fiberG: 0,
    sugarsG: 0,
    sodiumMg: 0
  };

  for (const ingredient of dish.ingredients || []) {
    const food = foodsById.get(ingredient.foodId);
    if (!food) continue;

    const grams = Number(ingredient.grams || 0) * scale;
    const ratio = grams / 100;
    const per100 = food.nutritionPer100g;
    totals.kcal += Number(per100.kcal || 0) * ratio;
    totals.proteinG += Number(per100.proteinG || 0) * ratio;
    totals.fatG += Number(per100.fatG || 0) * ratio;
    totals.carbG += Number(per100.carbG || 0) * ratio;
    totals.fiberG += Number(per100.fiberG || 0) * ratio;
    totals.sugarsG += Number(per100.sugarsG || 0) * ratio;
    totals.sodiumMg += Number(per100.sodiumMg || 0) * ratio;
  }

  return roundNutrition(totals);
}

function chooseDish(context) {
  const {
    mealKey,
    dataset,
    input,
    dishStatsById,
    repeatCount,
    repeatExceptions,
    maxRepeats,
    usedThisDay,
    previousDayDishIds,
    recentDishIds,
    minPortionScale,
    slotTarget,
    rng
  } = context;

  const allCandidates = (dataset.dishes || []).filter(
    (dish) =>
      (dish.allowedMeals || []).includes(mealKey) &&
      (dish.dietProfiles || []).includes(input.dietProfile) &&
      dish.selectable !== false &&
      dish.id !== "milk_plain"
  );

  const withinRepeats = allCandidates.filter((dish) => {
    if (repeatExceptions.has(dish.id)) return true;
    return (repeatCount.get(dish.id) || 0) < maxRepeats;
  });

  const avoidSameDay = withinRepeats.filter((dish) => !usedThisDay.has(dish.id));
  const avoidConsecutiveDays = avoidSameDay.filter((dish) => !previousDayDishIds.has(dish.id));
  const avoidRecentDays = avoidConsecutiveDays.filter((dish) => !recentDishIds.has(dish.id));
  const fallbackPool = maxRepeats > 1 ? allCandidates : withinRepeats;
  const fallbackAvoidSameDay = fallbackPool.filter((dish) => !usedThisDay.has(dish.id));
  const fallbackAvoidConsecutiveDays = fallbackAvoidSameDay.filter((dish) => !previousDayDishIds.has(dish.id));
  const fallbackAvoidRecentDays = fallbackAvoidConsecutiveDays.filter((dish) => !recentDishIds.has(dish.id));
  const candidates =
    avoidRecentDays.length > 0
      ? avoidRecentDays
      : avoidConsecutiveDays.length > 0
        ? avoidConsecutiveDays
        : avoidSameDay.length > 0
          ? avoidSameDay
          : fallbackAvoidRecentDays.length > 0
            ? fallbackAvoidRecentDays
            : fallbackAvoidConsecutiveDays.length > 0
              ? fallbackAvoidConsecutiveDays
              : fallbackAvoidSameDay.length > 0
                ? fallbackAvoidSameDay
                : fallbackPool;

  if (candidates.length === 0) {
    throw new Error(`No dish candidates for meal slot ${mealKey}.`);
  }

  let best = candidates[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const dish of candidates) {
    const baseline = dishStatsById.get(dish.id);
    const projectedScale = computeInitialScale(dish, baseline.kcal, slotTarget, minPortionScale);
    const projectedKcal = baseline.kcal * projectedScale;
    const diff = Math.abs(slotTarget - projectedKcal);
    const energyScore = 1 / (1 + diff / 80);
    const currentUses = repeatCount.get(dish.id) || 0;
    const repeatPenalty = currentUses * 0.12;
    const exceptionPenalty = repeatExceptions.has(dish.id) ? 0.08 : 0;
    const randomBoost = rng() * 0.6;
    const score = energyScore + randomBoost - repeatPenalty - exceptionPenalty;

    if (score > bestScore) {
      bestScore = score;
      best = dish;
    }
  }

  return best;
}

function normalizeDayEnergy(meals, dayTargetKcal, foodsById, dishes, minPortionScale = 0.55) {
  const byDishId = new Map((dishes || []).map((dish) => [dish.id, dish]));

  for (let pass = 0; pass < 2; pass += 1) {
    const currentTotal = meals.reduce((sum, meal) => sum + meal.nutrition.kcal, 0);
    if (currentTotal <= 0) return;

    const correction = dayTargetKcal / currentTotal;

    for (const meal of meals) {
      meal.portionScale = round(clampNumber(meal.portionScale * correction, minPortionScale, 1.85, meal.portionScale), 3);
      const dish = byDishId.get(meal.dishId);
      meal.nutrition = computeDishNutrition(dish, foodsById, meal.portionScale);
      meal.addedSugarG = Number(dish.addedSugarG || 0) * meal.portionScale;
      meal.addedSaltMg = Number(dish.addedSaltMg || 0) * meal.portionScale;
    }
  }
}

function buildValidations(context) {
  const {
    week,
    weeklyAverageKcal,
    weeklyMacroPct,
    kcalTarget,
    rules,
    repeatCount,
    repeatExceptions,
    maxRepeats,
    input
  } = context;

  const dailyTolerance = Number(rules.dailyKcalTolerancePct || 10);
  const weeklyTolerance = Number(rules.weeklyAverageTolerancePct || 5);
  const amdr = rules.amdrPct || {};

  const dailyViolations = [];
  for (const day of week) {
    const check = validateDayCalories(day.totals.kcal, kcalTarget, dailyTolerance);
    if (!check.passed) {
      dailyViolations.push({ dayKey: day.dayKey, kcal: day.totals.kcal, bounds: check.bounds });
    }
  }

  const weeklyBounds = calcBounds(kcalTarget, weeklyTolerance);
  const weeklyAvgPassed = weeklyAverageKcal >= weeklyBounds.min && weeklyAverageKcal <= weeklyBounds.max;

  const macroChecks = {
    carb: withinRange(weeklyMacroPct.carbPct, amdr?.carb?.min, amdr?.carb?.max),
    fat: withinRange(weeklyMacroPct.fatPct, amdr?.fat?.min, amdr?.fat?.max),
    protein: withinRange(weeklyMacroPct.proteinPct, amdr?.protein?.min, amdr?.protein?.max)
  };

  const repetitionViolations = [];
  for (const [dishId, count] of repeatCount.entries()) {
    if (repeatExceptions.has(dishId)) continue;
    if (count > maxRepeats) {
      repetitionViolations.push({ dishId, count, maxAllowed: maxRepeats });
    }
  }
  const minUniqueDishesPerWeek = Number(rules.minUniqueDishesPerWeek || 33);
  const uniqueDishIds = new Set(
    week
      .flatMap((day) => day.meals || [])
      .map((meal) => meal.dishId)
      .filter((dishId) => !repeatExceptions.has(dishId))
  );
  const uniqueDishesCount = uniqueDishIds.size;
  const uniqueDishesPass = uniqueDishesCount >= minUniqueDishesPerWeek;

  const consecutiveDayViolations = [];
  for (let dayIndex = 1; dayIndex < week.length; dayIndex += 1) {
    const currentDishIds = new Set((week[dayIndex].meals || []).map((meal) => meal.dishId));
    const previousDishIds = new Set((week[dayIndex - 1].meals || []).map((meal) => meal.dishId));
    const repeatedDishIds = Array.from(currentDishIds).filter((dishId) => previousDishIds.has(dishId));

    if (repeatedDishIds.length > 0) {
      consecutiveDayViolations.push({
        dayKey: week[dayIndex].dayKey,
        previousDayKey: week[dayIndex - 1].dayKey,
        repeatedDishIds
      });
    }
  }

  const strictViolations = [];
  if (input.strictMode) {
    for (const day of week) {
      const addedSugarG = day.meals.reduce((sum, meal) => sum + meal.addedSugarG, 0);
      const addedSaltMg = day.meals.reduce((sum, meal) => sum + meal.addedSaltMg, 0);
      if (addedSugarG > Number(rules?.strictMode?.maxAddedSugarGPerDay || 0) || addedSaltMg > Number(rules?.strictMode?.maxAddedSaltMgPerDay || 0)) {
        strictViolations.push({ dayKey: day.dayKey, addedSugarG: round(addedSugarG, 3), addedSaltMg: round(addedSaltMg, 3) });
      }
    }
  }

  const dailyKcalPass = dailyViolations.length === 0;
  const macroPass = macroChecks.carb && macroChecks.fat && macroChecks.protein;
  const repetitionPass = repetitionViolations.length === 0;
  const consecutiveDaysPass = consecutiveDayViolations.length === 0;
  const strictPass = strictViolations.length === 0;
  const expectedMilkTargetMl = getDailyMilkTargetMl(input.ageMonths);
  const expectedMilkByMeal = splitDailyMilkByMeal(expectedMilkTargetMl);
  const milkViolations = [];

  for (const day of week) {
    const breakfastMeal = day.meals.find((meal) => meal.mealKey === "breakfast");
    const dinnerMeal = day.meals.find((meal) => meal.mealKey === "dinner");
    const outsideMealsMilkMl = day.meals
      .filter((meal) => meal.mealKey !== "breakfast" && meal.mealKey !== "dinner")
      .reduce((sum, meal) => sum + Number(meal.milkMl || 0), 0);
    const breakfastMilkMl = Number(breakfastMeal?.milkMl || 0);
    const dinnerMilkMl = Number(dinnerMeal?.milkMl || 0);
    const breakfastPresent = Boolean(breakfastMeal);
    const dinnerPresent = Boolean(dinnerMeal);
    const milkTargetMatch = Number(day.milkTargetMl) === expectedMilkTargetMl;
    const milkPlanMatch = Math.abs(Number(day.milkPlannedMl) - Number(day.milkTargetMl)) <= 5;
    const splitMatch =
      Math.abs(breakfastMilkMl - expectedMilkByMeal.breakfast) <= 5 &&
      Math.abs(dinnerMilkMl - expectedMilkByMeal.dinner) <= 5;
    const placementOk = breakfastPresent && dinnerPresent && breakfastMilkMl > 0 && dinnerMilkMl > 0 && outsideMealsMilkMl === 0;

    if (!milkTargetMatch || !milkPlanMatch || !placementOk || !splitMatch) {
      milkViolations.push({
        dayKey: day.dayKey,
        milkTargetMl: day.milkTargetMl,
        milkPlannedMl: day.milkPlannedMl,
        expectedBreakfastMilkMl: expectedMilkByMeal.breakfast,
        expectedDinnerMilkMl: expectedMilkByMeal.dinner,
        breakfastMilkMl,
        dinnerMilkMl,
        outsideMealsMilkMl,
        breakfastPresent,
        dinnerPresent
      });
    }
  }

  const milkPass = milkViolations.length === 0;
  const whoPediatricPass = dailyKcalPass && weeklyAvgPassed && macroPass && repetitionPass && uniqueDishesPass && consecutiveDaysPass && strictPass && milkPass;

  return {
    overallPassed: dailyKcalPass && weeklyAvgPassed && macroPass && repetitionPass && uniqueDishesPass && consecutiveDaysPass && strictPass && milkPass,
    dailyKcal: {
      passed: dailyKcalPass,
      tolerancePct: dailyTolerance,
      failedDays: dailyViolations
    },
    weeklyAverageKcal: {
      passed: weeklyAvgPassed,
      bounds: weeklyBounds,
      value: round(weeklyAverageKcal, 1)
    },
    macroDistribution: {
      passed: macroPass,
      value: weeklyMacroPct,
      ranges: amdr,
      checks: macroChecks
    },
    repetition: {
      passed: repetitionPass,
      maxPerDish: maxRepeats,
      exceptions: Array.from(repeatExceptions),
      violations: repetitionViolations
    },
    uniqueDishes: {
      passed: uniqueDishesPass,
      value: uniqueDishesCount,
      minRequired: minUniqueDishesPerWeek
    },
    consecutiveDays: {
      passed: consecutiveDaysPass,
      violations: consecutiveDayViolations
    },
    strictMode: {
      enabled: input.strictMode,
      passed: strictPass,
      violations: strictViolations
    },
    milkCompliance: {
      passed: milkPass,
      expectedTargetMl: expectedMilkTargetMl,
      expectedMilkByMeal,
      splitPct: MILK_SPLIT_BY_MEAL,
      toleranceMl: 5,
      violations: milkViolations
    },
    whoPediatric: {
      passed: whoPediatricPass,
      checks: {
        dailyKcal: dailyKcalPass,
        weeklyAverage: weeklyAvgPassed,
        macroDistribution: macroPass,
        repetition: repetitionPass,
        uniqueDishes: uniqueDishesPass,
        consecutiveDays: consecutiveDaysPass,
        strictMode: strictPass,
        milkCompliance: milkPass
      }
    }
  };
}

function validateDayCalories(kcal, target, tolerancePct) {
  const bounds = calcBounds(target, tolerancePct);
  return {
    passed: kcal >= bounds.min && kcal <= bounds.max,
    bounds
  };
}

function calcBounds(target, tolerancePct) {
  const tolerance = target * (Number(tolerancePct || 0) / 100);
  return {
    min: round(target - tolerance, 1),
    max: round(target + tolerance, 1)
  };
}

function computeKcalTarget(ageMonths, formula) {
  const base = Number(formula?.baseKcal || 700);
  const slope = Number(formula?.slopePerMonth || 300 / 11);
  const max = Number(formula?.maxKcal || 1000);
  const raw = Math.round(base + (ageMonths - 12) * slope);
  return Math.min(max, Math.max(base, raw));
}

function computeInitialScale(dish, baselineKcal, slotTarget, minPortionScale = 0.55) {
  if (baselineKcal <= 0) return 1;
  const scale = slotTarget / baselineKcal;
  return clampNumber(scale, minPortionScale, 1.85, 1);
}

function getMinPortionScale(ageMonths) {
  if (ageMonths <= 14) return 0.35;
  if (ageMonths <= 17) return 0.45;
  return 0.55;
}

function aggregateNutrition(items) {
  const totals = {
    kcal: 0,
    proteinG: 0,
    fatG: 0,
    carbG: 0,
    fiberG: 0,
    sugarsG: 0,
    sodiumMg: 0
  };

  for (const item of items) {
    totals.kcal += Number(item.kcal || 0);
    totals.proteinG += Number(item.proteinG || 0);
    totals.fatG += Number(item.fatG || 0);
    totals.carbG += Number(item.carbG || 0);
    totals.fiberG += Number(item.fiberG || 0);
    totals.sugarsG += Number(item.sugarsG || 0);
    totals.sodiumMg += Number(item.sodiumMg || 0);
  }

  return roundNutrition(totals);
}

function calcMacroPct(nutrition) {
  const carbKcal = nutrition.carbG * 4;
  const proteinKcal = nutrition.proteinG * 4;
  const fatKcal = nutrition.fatG * 9;
  const total = carbKcal + proteinKcal + fatKcal;

  if (!total) {
    return {
      carbPct: 0,
      fatPct: 0,
      proteinPct: 0
    };
  }

  return {
    carbPct: round((carbKcal / total) * 100, 1),
    fatPct: round((fatKcal / total) * 100, 1),
    proteinPct: round((proteinKcal / total) * 100, 1)
  };
}

function roundNutrition(nutrition) {
  return {
    kcal: round(nutrition.kcal, 1),
    proteinG: round(nutrition.proteinG, 2),
    fatG: round(nutrition.fatG, 2),
    carbG: round(nutrition.carbG, 2),
    fiberG: round(nutrition.fiberG, 2),
    sugarsG: round(nutrition.sugarsG, 2),
    sodiumMg: round(nutrition.sodiumMg, 2)
  };
}

function withinRange(value, min, max) {
  return value >= Number(min) && value <= Number(max);
}

function normalizeLocale(locale) {
  return LOCALES[locale] ? locale : "es";
}

function getLocaleCopy(locale) {
  return LOCALES[normalizeLocale(locale)];
}

function getDishName(dish, locale) {
  if (!dish) return "Unknown dish";
  const names = dish.names || {};
  return names[locale] || names.es || names.en || dish.id;
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  if (numeric < min) return min;
  if (numeric > max) return max;
  return numeric;
}

function createRng(seed) {
  let state = hashString(String(seed));
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value) {
  let hash = 1779033703 ^ value.length;
  for (let i = 0; i < value.length; i += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return hash >>> 0;
}

const DEFAULT_MEAL_DISTRIBUTION = {
  breakfast: 0.2,
  snack_am: 0.1,
  lunch: 0.3,
  snack_pm: 0.15,
  dinner: 0.25
};

const MILK_SPLIT_BY_MEAL = {
  breakfast: 0.6,
  dinner: 0.4
};

export function getDailyMilkTargetMl(ageMonths) {
  const age = clampNumber(ageMonths, 12, 23, 12);
  // Rounded operational targets aligned to WHO 1-2 cups/day context and AAP practical guidance.
  if (age <= 14) return 500;
  return 450;
}

function splitDailyMilkByMeal(totalMilkMl) {
  const breakfast = Math.round(totalMilkMl * MILK_SPLIT_BY_MEAL.breakfast);
  const dinner = totalMilkMl - breakfast;
  return {
    breakfast,
    snack_am: 0,
    lunch: 0,
    snack_pm: 0,
    dinner
  };
}

function computeMilkNutrition(foodsById, milkMl) {
  if (!milkMl) return emptyNutrition();
  const milkFood = foodsById.get("whole_milk");
  if (!milkFood) return emptyNutrition();
  const ratio = Number(milkMl) / 100;
  return roundNutrition({
    kcal: Number(milkFood.nutritionPer100g.kcal || 0) * ratio,
    proteinG: Number(milkFood.nutritionPer100g.proteinG || 0) * ratio,
    fatG: Number(milkFood.nutritionPer100g.fatG || 0) * ratio,
    carbG: Number(milkFood.nutritionPer100g.carbG || 0) * ratio,
    fiberG: Number(milkFood.nutritionPer100g.fiberG || 0) * ratio,
    sugarsG: Number(milkFood.nutritionPer100g.sugarsG || 0) * ratio,
    sodiumMg: Number(milkFood.nutritionPer100g.sodiumMg || 0) * ratio
  });
}

function emptyNutrition() {
  return {
    kcal: 0,
    proteinG: 0,
    fatG: 0,
    carbG: 0,
    fiberG: 0,
    sugarsG: 0,
    sodiumMg: 0
  };
}

function sumNutrition(a, b) {
  return roundNutrition({
    kcal: Number(a?.kcal || 0) + Number(b?.kcal || 0),
    proteinG: Number(a?.proteinG || 0) + Number(b?.proteinG || 0),
    fatG: Number(a?.fatG || 0) + Number(b?.fatG || 0),
    carbG: Number(a?.carbG || 0) + Number(b?.carbG || 0),
    fiberG: Number(a?.fiberG || 0) + Number(b?.fiberG || 0),
    sugarsG: Number(a?.sugarsG || 0) + Number(b?.sugarsG || 0),
    sodiumMg: Number(a?.sodiumMg || 0) + Number(b?.sodiumMg || 0)
  });
}

function createAutoSeed() {
  const randomChunk = Math.floor(Math.random() * 1e9);
  return `${Date.now()}-${randomChunk}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNumber(locale, value, fraction = 1) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fraction
  }).format(value);
}

async function initBrowserTool() {
  if (typeof document === "undefined") return;

  const form = document.querySelector("[data-meal-planner-form]");
  if (!form) return;

  const locale = normalizeLocale(document.body?.dataset?.locale || "es");
  const copy = getLocaleCopy(locale);
  const ageInput = form.querySelector("[name='age_months']");
  const milkInput = form.querySelector("[name='milk_ml_per_day']");
  const errorBox = document.querySelector("[data-plan-error]");
  const summaryBox = document.querySelector("[data-plan-summary]");
  const validationBox = document.querySelector("[data-plan-validation]");
  const tableBox = document.querySelector("[data-plan-table]");
  const usageBox = document.querySelector("[data-plan-dishes]");

  let dataset;
  try {
    dataset = await loadMealPlannerDataset();
  } catch (error) {
    if (errorBox) errorBox.textContent = error.message;
    return;
  }

  const defaults = {
    locale,
    ageMonths: 12,
    sex: "female",
    seed: createAutoSeed(),
    milkMlPerDay: getDailyMilkTargetMl(12),
    dietProfile: "omnivore",
    strictMode: true
  };

  syncMilkFromAge();
  renderPlan(generateMealPlanner(defaults, dataset));

  ageInput?.addEventListener("input", () => {
    syncMilkFromAge();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const ageMonths = Number(formData.get("age_months"));
    const adjustedMilk = getDailyMilkTargetMl(ageMonths);

    if (milkInput) {
      milkInput.value = String(adjustedMilk);
    }

    const input = {
      locale,
      ageMonths,
      sex: formData.get("sex") === "male" ? "male" : "female",
      seed: createAutoSeed(),
      milkMlPerDay: adjustedMilk,
      dietProfile: "omnivore",
      strictMode: formData.get("strict_mode") === "on"
    };

    try {
      const result = generateMealPlanner(input, dataset);
      renderPlan(result);
    } catch (error) {
      if (errorBox) errorBox.textContent = error.message;
    }
  });

  function syncMilkFromAge() {
    if (!milkInput || !ageInput) return;
    const ageMonths = Number(ageInput.value || 12);
    milkInput.value = String(getDailyMilkTargetMl(ageMonths));
  }

  function renderPlan(result) {
    if (errorBox) errorBox.textContent = "";

    if (summaryBox) {
      summaryBox.innerHTML = `
        <section class="planner-panel">
          <h3>${copy.summaryTitle}</h3>
          <div class="planner-metrics">
            <article class="planner-metric">
              <p class="planner-metric-label">${copy.targetLabel}</p>
              <p class="planner-metric-value">${formatNumber(locale, result.targets.kcalTarget, 0)} <span>${copy.unitKcal} ${copy.unitPerDay}</span></p>
            </article>
            <article class="planner-metric">
              <p class="planner-metric-label">${copy.weeklyAverageLabel}</p>
              <p class="planner-metric-value">${formatNumber(locale, result.targets.weeklyAverageKcal, 1)} <span>${copy.unitKcal} ${copy.unitPerDay}</span></p>
            </article>
            <article class="planner-metric">
              <p class="planner-metric-label">${copy.macroSplitLabel}</p>
              <p class="planner-metric-value planner-metric-value-compact">${formatNumber(locale, result.weeklyMacroPct.carbPct, 1)}% / ${formatNumber(locale, result.weeklyMacroPct.fatPct, 1)}% / ${formatNumber(locale, result.weeklyMacroPct.proteinPct, 1)}%</p>
            </article>
            <article class="planner-metric">
              <p class="planner-metric-label">${copy.milkTargetLabel}</p>
              <p class="planner-metric-value">${formatNumber(locale, result.targets.milkTargetMl, 0)} <span>ml ${copy.unitPerDay}</span></p>
            </article>
          </div>
        </section>
      `;
    }

    if (validationBox) {
      validationBox.innerHTML = "";
    }

    if (tableBox) {
      const rows = [];
      for (const day of result.week) {
        const mealItems = day.meals
          .map(
            (meal) => {
              const mealTotalKcal = Number(meal.nutrition.kcal || 0) + Number(meal.milkNutrition?.kcal || 0);
              const milkLine = Number(meal.milkMl || 0) > 0
                ? `<span class="meal-milk">+ ${copy.milkTag}: ${formatNumber(locale, meal.milkMl, 0)} ml (${formatNumber(locale, meal.milkNutrition.kcal, 0)} ${copy.unitKcal})</span>`
                : "";
              return `
              <li>
                <span class="meal-name">${escapeHtml(meal.mealLabel)}</span>
                <span class="meal-dish">${escapeHtml(meal.dishName)}</span>
                ${milkLine}
                <span class="meal-kcal">${formatNumber(locale, mealTotalKcal, 0)} ${copy.unitKcal}</span>
              </li>
            `
            }
          )
          .join("");

        rows.push(`
          <tr>
            <td class="meal-plan-day" data-label="${escapeHtml(copy.tableDayLabel)}">
              <span class="meal-day-pill">${escapeHtml(day.dayLabel)}</span>
            </td>
            <td data-label="${escapeHtml(copy.tableMealsLabel)}"><ul class="meal-list">${mealItems}</ul></td>
            <td class="meal-plan-total" data-label="${escapeHtml(copy.tableTotalLabel)}">${formatNumber(locale, day.totals.kcal, 0)} ${copy.unitKcal}</td>
          </tr>
        `);
      }

      tableBox.innerHTML = `
        <div class="meal-plan-table-wrap">
          <table class="meal-plan-table">
            <caption>${copy.tableTitle}</caption>
            <thead>
              <tr>
                <th>${copy.tableDayLabel}</th>
                <th>${copy.tableMealsLabel}</th>
                <th>${copy.tableTotalLabel}</th>
              </tr>
            </thead>
            <tbody>
              ${rows.join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    if (usageBox) {
      const usageItems = result.dishUsage
        .slice(0, 12)
        .map(
          (item) => `
            <li>
              <span>${escapeHtml(item.dishName)}</span>
              <strong>${item.uses}${copy.usageCountSuffix}</strong>
            </li>
          `
        )
        .join("");
      usageBox.innerHTML = `
        <section class="planner-panel">
          <h3>${copy.repetitionTitle}</h3>
          <ul class="meal-usage-list">${usageItems}</ul>
        </section>
      `;
    }
  }
}

if (typeof document !== "undefined") {
  initBrowserTool();
}
