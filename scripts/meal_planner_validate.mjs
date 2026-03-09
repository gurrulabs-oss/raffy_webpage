import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateMealPlanner, computeDishNutrition, getDailyMilkTargetMl } from "../tools/meal-planner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "tools", "meal-planner-data.json");

const REQUIRED_LOCALES = ["en", "es", "fr", "pt"];
const REQUIRED_MEALS = ["breakfast", "snack_am", "lunch", "snack_pm", "dinner"];
const VALID_FOOD_GROUPS = new Set(["dairy", "fruit", "vegetable", "grain", "legume", "animal_protein", "starchy_veg", "fat"]);
const CORE_FOOD_GROUPS = new Set(["dairy", "fruit", "vegetable", "grain", "legume", "animal_protein", "starchy_veg"]);
const SNACK_AND_BREAKFAST_MEALS = new Set(["breakfast", "snack_am", "snack_pm"]);
const MAIN_MEALS = new Set(["lunch", "dinner"]);
const MAIN_MEAL_PRIMARY_GROUPS = new Set(["animal_protein", "legume"]);
const MAIN_MEAL_SIDE_GROUPS = new Set(["vegetable", "grain", "starchy_veg"]);
const EXPECTED_SELECTABLE_COUNTS = {
  breakfast: 15,
  snack_am: 34,
  lunch: 20,
  snack_pm: 34,
  dinner: 26
};
const REPLACED_OLD_IDS = [
  "yogurt_plain",
  "homemade_apple_pear_compote",
  "cooked_apple_prune_puree",
  "pasteurized_fresh_cheese_tomato"
];
const REQUIRED_NEW_IDS = [
  "yogurt_pear_oats",
  "apple_pear_compote_yogurt",
  "apple_prune_oats_yogurt",
  "soft_bread_fresh_cheese_tomato",
  "soft_bread_fresh_cheese_pear",
  "banana_berries_yogurt_oats",
  "soft_bread_avocado_egg",
  "apple_oat_yogurt_bowl",
  "soft_bread_hummus_tomato",
  "pear_avocado_yogurt",
  "banana_fresh_cheese",
  "berries_yogurt_pear",
  "hake_rice_zucchini",
  "turkey_sweetpotato_broccoli",
  "lentils_pumpkin_quinoa",
  "beef_couscous_leek_carrot",
  "roasted_sweetpotato_hummus",
  "soft_bread_avocado_turkey",
  "pear_yogurt_oats_pm",
  "soft_bread_fresh_cheese_berries",
  "zucchini_potato_hake_cream",
  "rice_spinach_egg",
  "white_beans_pumpkin_carrot",
  "couscous_turkey_broccoli",
  "pear_banana_yogurt_oats",
  "soft_bread_egg_tomato_breakfast",
  "avocado_yogurt_berries_oats",
  "apple_prune_oat_bowl",
  "soft_bread_avocado_fresh_cheese",
  "apple_berries_yogurt_snack",
  "pear_banana_fresh_cheese",
  "soft_bread_egg_tomato_snack",
  "salmon_rice_broccoli",
  "chicken_potato_carrot",
  "cod_quinoa_pumpkin",
  "turkey_couscous_zucchini",
  "soft_bread_hummus_avocado",
  "apple_yogurt_berries_pm",
  "sweetpotato_yogurt_pear",
  "banana_oat_fresh_cheese",
  "pumpkin_cod_rice",
  "potato_broccoli_chicken",
  "quinoa_zucchini_turkey",
  "lentils_carrot_potato",
  "snack_am_banana_yogurt_small",
  "snack_am_soft_bread_avocado",
  "snack_am_yogurt_pear_bits",
  "snack_am_pear_banana_yogurt",
  "snack_am_bread_tomato_oil",
  "snack_am_mini_omelette_bread",
  "snack_am_fresh_cheese_pear_bread",
  "snack_am_pear_yogurt_oats",
  "snack_am_oat_banana_cookie_style",
  "snack_am_apple_compote_yogurt",
  "snack_am_mini_bread_hummus",
  "snack_am_yogurt_berries_soft",
  "snack_am_pear_berries_yogurt",
  "snack_am_oat_banana_egg_pancake",
  "snack_am_fresh_cheese_tomato_bread",
  "snack_am_bread_fresh_cheese_pear",
  "snack_am_berries_yogurt_pear_small",
  "snack_am_bread_avocado_tomato",
  "snack_am_milk_banana_oats_shake",
  "snack_am_egg_bread_tomato",
  "snack_pm_yogurt_crushed_berries_soft",
  "snack_pm_bread_avocado_oil",
  "snack_pm_oats_banana_milk",
  "snack_pm_mini_sandwich_cheese_tomato",
  "snack_pm_mini_omelette_bread",
  "snack_pm_pear_apple_compote_yogurt",
  "snack_pm_yogurt_oats_pear",
  "snack_pm_yogurt_berries_banana",
  "snack_pm_bread_avocado_egg_mash",
  "snack_pm_fresh_cheese_bread_tomato",
  "snack_pm_pear_yogurt_oats_soft",
  "snack_pm_oat_apple_egg_pancake",
  "snack_pm_bread_hummus_tomato",
  "snack_pm_yogurt_banana_oats",
  "snack_pm_mini_chicken_croquette",
  "snack_pm_zucchini_fresh_cheese_soft",
  "snack_pm_bread_avocado_pear",
  "snack_pm_yogurt_pear_berries",
  "snack_pm_mini_muffin_banana_oats",
  "snack_pm_milk_oats_banana_shake"
];
const errorList = [];

const dataset = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
const foodsById = new Map((dataset.foods || []).map((food) => [food.id, food]));
const dishesById = new Map((dataset.dishes || []).map((dish) => [dish.id, dish]));
const selectableDishes = (dataset.dishes || []).filter(isSelectableDish);

assert(Array.isArray(dataset.foods) && dataset.foods.length === 39, "Dataset must include exactly 39 foods");
assert(Array.isArray(dataset.dishes) && dataset.dishes.length === 110, "Dataset must include exactly 110 dishes");
assert(selectableDishes.length === 109, "Dataset must expose exactly 109 selectable dishes");
assert(Array.isArray(dataset.references) && dataset.references.length >= 5, "Dataset must include references[]");
assert(Number(dataset.rules?.maxDishRepeatsPerWeek) === 1, "maxDishRepeatsPerWeek must be 1 to enforce weekly variety");
assert(Number(dataset.rules?.minUniqueDishesPerWeek) === 33, "minUniqueDishesPerWeek must be 33");
assert(JSON.stringify(dataset.rules?.repeatExceptions || []) === JSON.stringify(["milk_plain"]), "repeatExceptions must contain only milk_plain");

assert(getDailyMilkTargetMl(12) === 500, "Milk target at 12 months must be 500 ml");
assert(getDailyMilkTargetMl(14) === 500, "Milk target at 14 months must be 500 ml");
assert(getDailyMilkTargetMl(15) === 450, "Milk target at 15 months must be 450 ml");
assert(getDailyMilkTargetMl(17) === 450, "Milk target at 17 months must be 450 ml");
assert(getDailyMilkTargetMl(18) === 450, "Milk target at 18 months must be 450 ml");
assert(getDailyMilkTargetMl(20) === 450, "Milk target at 20 months must be 450 ml");
assert(getDailyMilkTargetMl(21) === 450, "Milk target at 21 months must be 450 ml");
assert(getDailyMilkTargetMl(23) === 450, "Milk target at 23 months must be 450 ml");

for (const food of dataset.foods || []) {
  assert(Boolean(food.id), "Each food needs an id");
  assert(Array.isArray(food.foodGroups) && food.foodGroups.length > 0, `Food ${food.id} must define foodGroups`);
  for (const group of food.foodGroups || []) {
    assert(VALID_FOOD_GROUPS.has(group), `Food ${food.id} has unsupported food group ${group}`);
  }
}

for (const oldId of REPLACED_OLD_IDS) {
  assert(!dishesById.has(oldId), `Deprecated dish ${oldId} should not exist anymore`);
}

for (const dishId of REQUIRED_NEW_IDS) {
  assert(dishesById.has(dishId), `Expected dish ${dishId} is missing`);
}

const milkDish = dishesById.get("milk_plain");
assert(Boolean(milkDish), "milk_plain must still exist as supplemental milk record");
assert(milkDish?.selectable === false, "milk_plain must be marked selectable=false");

for (const [mealKey, expectedCount] of Object.entries(EXPECTED_SELECTABLE_COUNTS)) {
  const actual = selectableDishes.filter((dish) => (dish.allowedMeals || []).includes(mealKey)).length;
  assert(actual === expectedCount, `Selectable pool for ${mealKey} must be ${expectedCount}, got ${actual}`);
}

for (const dish of dataset.dishes || []) {
  assert(Boolean(dish.id), "Each dish needs an id");
  assert(typeof dish.selectable === "boolean", `Dish ${dish.id} must define selectable`);
  assert(Array.isArray(dish.allowedMeals) && dish.allowedMeals.length > 0, `Dish ${dish.id} must define allowedMeals`);
  assert(Array.isArray(dish.ingredients) && dish.ingredients.length > 0, `Dish ${dish.id} must define ingredients`);

  for (const meal of dish.allowedMeals) {
    assert(REQUIRED_MEALS.includes(meal), `Dish ${dish.id} has unsupported meal slot ${meal}`);
  }

  for (const locale of REQUIRED_LOCALES) {
    assert(Boolean(dish.names?.[locale]), `Dish ${dish.id} is missing localized name for ${locale}`);
  }

  for (const ingredient of dish.ingredients) {
    assert(foodsById.has(ingredient.foodId), `Dish ${dish.id} references unknown food ${ingredient.foodId}`);
    assert(Number(ingredient.grams) > 0, `Dish ${dish.id} has non-positive grams for ${ingredient.foodId}`);
  }

  const nutrition = computeDishNutrition(dish, foodsById, 1);
  const kcalFromMacros = nutrition.proteinG * 4 + nutrition.carbG * 4 + nutrition.fatG * 9;
  const kcalGap = Math.abs(kcalFromMacros - nutrition.kcal);
  assert(kcalGap <= 45, `Dish ${dish.id} has large macro/kcal gap (${kcalGap.toFixed(2)} kcal)`);

  if (!isSelectableDish(dish)) continue;

  for (const meal of dish.allowedMeals) {
    assert(hasValidMealSemantics(dish, meal), `Dish ${dish.id} is not semantically valid for ${meal}`);
  }
}

for (let seed = 1; seed <= 100; seed += 1) {
  const ageMonths = 18;
  const expectedMilkMl = getDailyMilkTargetMl(ageMonths);
  const result = generateMealPlanner(
    {
      locale: "es",
      ageMonths,
      sex: seed % 2 === 0 ? "male" : "female",
      seed,
      milkMlPerDay: expectedMilkMl,
      dietProfile: "omnivore",
      strictMode: true
    },
    dataset
  );

  assert(result.week.length === 7, `Seed ${seed} does not produce 7 days`);
  const mealCount = result.week.reduce((sum, day) => sum + day.meals.length, 0);
  assert(mealCount === 35, `Seed ${seed} does not produce 35 meal slots`);

  for (const day of result.week) {
    assert(day.meals.length === 5, `Seed ${seed} has a day without 5 meals`);
    assert(day.milkTargetMl === expectedMilkMl, `Seed ${seed} has wrong milk target for age`);
    assert(Math.abs(day.milkPlannedMl - day.milkTargetMl) <= 5, `Seed ${seed} has milk planned mismatch`);
    assert(day.milkByMeal.breakfast > 0 && day.milkByMeal.dinner > 0, `Seed ${seed} has missing milk in breakfast/dinner`);
    assert(day.milkByMeal.snack_am === 0 && day.milkByMeal.snack_pm === 0 && day.milkByMeal.lunch === 0, `Seed ${seed} has milk outside breakfast/dinner`);

    for (const meal of day.meals) {
      const dish = dishesById.get(meal.dishId);
      assert(Boolean(meal.dishId), `Seed ${seed} has an empty meal slot`);
      assert(Number(meal.nutrition.kcal) > 0, `Seed ${seed} has a meal with zero kcal`);
      assert(isSelectableDish(dish), `Seed ${seed} selected a non-selectable dish ${meal.dishId}`);
      assert(meal.dishId !== "milk_plain", `Seed ${seed} selected milk_plain as random dish`);
      assert(hasValidMealSemantics(dish, meal.mealKey), `Seed ${seed} selected semantically invalid dish ${meal.dishId} for ${meal.mealKey}`);

      if (meal.mealKey === "breakfast" || meal.mealKey === "dinner") {
        assert(Number(meal.milkMl) > 0, `Seed ${seed} missing milk on ${meal.mealKey}`);
      } else {
        assert(Number(meal.milkMl) === 0, `Seed ${seed} has unexpected milk on ${meal.mealKey}`);
      }
    }
  }

  for (let index = 1; index < result.week.length; index += 1) {
    const currentDishIds = new Set(result.week[index].meals.map((meal) => meal.dishId));
    const previousDishIds = new Set(result.week[index - 1].meals.map((meal) => meal.dishId));
    const repeated = Array.from(currentDishIds).filter((dishId) => previousDishIds.has(dishId));
    assert(repeated.length === 0, `Seed ${seed} repeats dishes on consecutive days: ${repeated.join(", ")}`);
  }

  const weeklyUseCount = new Map();
  for (const day of result.week) {
    for (const meal of day.meals) {
      weeklyUseCount.set(meal.dishId, (weeklyUseCount.get(meal.dishId) || 0) + 1);
    }
  }
  for (const [dishId, uses] of weeklyUseCount.entries()) {
    if (dishId === "milk_plain") continue;
    assert(uses <= 1, `Seed ${seed} repeats dish ${dishId} ${uses} times in one week`);
  }
  const uniqueDishCount = Array.from(weeklyUseCount.keys()).filter((dishId) => dishId !== "milk_plain").length;
  assert(uniqueDishCount >= Number(dataset.rules?.minUniqueDishesPerWeek || 33), `Seed ${seed} has low dish variety (${uniqueDishCount})`);

  assert(result.validations.dailyKcal.passed, `Seed ${seed} fails daily calorie validation`);
  assert(result.validations.weeklyAverageKcal.passed, `Seed ${seed} fails weekly average validation`);
  assert(result.validations.macroDistribution.passed, `Seed ${seed} fails macro validation`);
  assert(result.validations.repetition.passed, `Seed ${seed} fails repetition validation`);
  assert(result.validations.uniqueDishes?.passed, `Seed ${seed} fails unique dishes validation`);
  assert(result.validations.consecutiveDays?.passed, `Seed ${seed} fails consecutive day repetition validation`);
  assert(result.validations.strictMode.passed, `Seed ${seed} fails strict mode validation`);
  assert(result.validations.milkCompliance.passed, `Seed ${seed} fails milk compliance validation`);
  assert(result.validations.whoPediatric.passed, `Seed ${seed} fails WHO/Pediatric validation`);
}

for (const ageMonths of [12, 18, 23]) {
  const result = generateMealPlanner(
    {
      locale: "es",
      ageMonths,
      sex: "female",
      seed: `spot-${ageMonths}`,
      milkMlPerDay: getDailyMilkTargetMl(ageMonths),
      dietProfile: "omnivore",
      strictMode: true
    },
    dataset
  );

  for (const day of result.week) {
    for (const meal of day.meals) {
      const dish = dishesById.get(meal.dishId);
      assert(hasValidMealSemantics(dish, meal.mealKey), `Spot check ${ageMonths}m found invalid ${meal.dishId} on ${meal.mealKey}`);
    }
  }

  assert(result.validations.dailyKcal.passed, `Spot check ${ageMonths}m fails daily calories`);
  assert(result.validations.weeklyAverageKcal.passed, `Spot check ${ageMonths}m fails weekly average`);
  assert(result.validations.macroDistribution.passed, `Spot check ${ageMonths}m fails macro distribution`);
  assert(result.validations.repetition.passed, `Spot check ${ageMonths}m fails repetition`);
  assert(result.validations.uniqueDishes?.passed, `Spot check ${ageMonths}m fails unique dishes`);
  assert(result.validations.consecutiveDays?.passed, `Spot check ${ageMonths}m fails consecutive day repetition`);
  assert(result.validations.strictMode.passed, `Spot check ${ageMonths}m fails strict mode`);
  assert(result.validations.milkCompliance.passed, `Spot check ${ageMonths}m fails milk compliance`);
  assert(result.validations.whoPediatric.passed, `Spot check ${ageMonths}m fails WHO/Pediatric validation`);

  for (let index = 1; index < result.week.length; index += 1) {
    const currentDishIds = new Set(result.week[index].meals.map((meal) => meal.dishId));
    const previousDishIds = new Set(result.week[index - 1].meals.map((meal) => meal.dishId));
    const repeated = Array.from(currentDishIds).filter((dishId) => previousDishIds.has(dishId));
    assert(repeated.length === 0, `Spot check ${ageMonths}m repeats dishes on consecutive days: ${repeated.join(", ")}`);
  }
}

const autoSeedA = generateMealPlanner(
  {
    locale: "es",
    ageMonths: 18,
    sex: "female",
    dietProfile: "omnivore",
    strictMode: true
  },
  dataset
);
const autoSeedB = generateMealPlanner(
  {
    locale: "es",
    ageMonths: 18,
    sex: "female",
    dietProfile: "omnivore",
    strictMode: true
  },
  dataset
);
assert(autoSeedA.input.seed !== autoSeedB.input.seed, "Auto seed should be regenerated on each run");

for (let seed = 1; seed <= 10; seed += 1) {
  const baseline = generateMealPlanner(
    {
      locale: "en",
      ageMonths: 18,
      sex: "female",
      seed,
      milkMlPerDay: getDailyMilkTargetMl(18),
      dietProfile: "omnivore",
      strictMode: true
    },
    dataset
  );
  const baselineIds = baseline.week.flatMap((day) => day.meals.map((meal) => meal.dishId));

  for (const locale of ["es", "fr", "pt"]) {
    const candidate = generateMealPlanner(
      {
        locale,
        ageMonths: 18,
        sex: "female",
        seed,
        milkMlPerDay: getDailyMilkTargetMl(18),
        dietProfile: "omnivore",
        strictMode: true
      },
      dataset
    );
    const candidateIds = candidate.week.flatMap((day) => day.meals.map((meal) => meal.dishId));
    assert(
      JSON.stringify(baselineIds) === JSON.stringify(candidateIds),
      `Locale mismatch for seed ${seed}: ${locale} differs from en`
    );
  }
}

if (errorList.length > 0) {
  console.error(`Meal planner validation failed with ${errorList.length} issue(s):`);
  for (const issue of errorList) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log("Meal planner validation passed.");

function isSelectableDish(dish) {
  return Boolean(dish) && dish.selectable !== false;
}

function getDishGroups(dish) {
  const groups = new Set();
  for (const ingredient of dish?.ingredients || []) {
    const food = foodsById.get(ingredient.foodId);
    for (const group of food?.foodGroups || []) {
      groups.add(group);
    }
  }
  return groups;
}

function getCoreDishGroups(dish) {
  return new Set(Array.from(getDishGroups(dish)).filter((group) => CORE_FOOD_GROUPS.has(group)));
}

function hasValidMealSemantics(dish, mealKey) {
  if (!dish) return false;

  const dishGroups = getDishGroups(dish);
  const coreGroups = getCoreDishGroups(dish);

  if (SNACK_AND_BREAKFAST_MEALS.has(mealKey)) {
    if ((dish.ingredients || []).length < 2) return false;
    if (coreGroups.size < 2) return false;
    if (coreGroups.size === 1 && (coreGroups.has("dairy") || coreGroups.has("fruit"))) return false;
    return true;
  }

  if (MAIN_MEALS.has(mealKey)) {
    return intersects(dishGroups, MAIN_MEAL_PRIMARY_GROUPS) && intersects(dishGroups, MAIN_MEAL_SIDE_GROUPS);
  }

  return true;
}

function intersects(values, expected) {
  for (const value of values || []) {
    if (expected.has(value)) return true;
  }
  return false;
}

function assert(condition, message) {
  if (!condition) {
    errorList.push(message);
  }
}
