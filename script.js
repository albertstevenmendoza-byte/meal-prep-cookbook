/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MISE — Meal Prep Studio  |  script.js                      ║
 * ║                                                               ║
 * ║  Architecture notes:                                          ║
 * ║  • All data models are shaped to mirror future Supabase       ║
 * ║    tables (snake_case keys, id fields, user_id references).   ║
 * ║  • State is managed via a single APP_STATE object.            ║
 * ║  • The "db" namespace simulates async Supabase calls so       ║
 * ║    swapping to real Supabase later requires minimal changes.  ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   SECTION 1 — FOOD DATABASE
   ---------------------------------------------------------------
   Supabase table equivalent: `foods`
   Columns: id, name, category, emoji, description,
            cal_per_100g, protein_g, carbs_g, fat_g,
            serving_size_g, serving_label, tags[]
   ═══════════════════════════════════════════════════════════════ */

const FOODS_DB = [
  // ── PROTEIN ──────────────────────────────────────────────────
  {
    id: 'chicken-breast', name: 'Chicken Breast', category: 'protein',
    emoji: '🍗', description: 'Lean, versatile, high in protein.',
    cal_per_100g: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6,
    serving_size_g: 140, serving_label: '1 breast', tags: [],
  },
  {
    id: 'ground-turkey', name: 'Ground Turkey', category: 'protein',
    emoji: '🦃', description: '93% lean. Great for bowls and stir-fry.',
    cal_per_100g: 150, protein_g: 22, carbs_g: 0, fat_g: 7,
    serving_size_g: 113, serving_label: '4 oz raw', tags: [],
  },
  {
    id: 'salmon', name: 'Salmon Fillet', category: 'protein',
    emoji: '🐟', description: 'Rich in omega-3s. Pan-sear or bake.',
    cal_per_100g: 208, protein_g: 20, carbs_g: 0, fat_g: 13,
    serving_size_g: 170, serving_label: '6 oz fillet', tags: [],
  },
  {
    id: 'eggs', name: 'Eggs', category: 'protein',
    emoji: '🥚', description: 'Complete protein. Works at any meal.',
    cal_per_100g: 143, protein_g: 13, carbs_g: 1.1, fat_g: 9.5,
    serving_size_g: 50, serving_label: '1 large egg', tags: [],
  },
  {
    id: 'greek-yogurt', name: 'Greek Yogurt', category: 'protein',
    emoji: '🫙', description: '0% plain. High protein, probiotic.',
    cal_per_100g: 59, protein_g: 10, carbs_g: 3.6, fat_g: 0.4,
    serving_size_g: 170, serving_label: '¾ cup', tags: ['no-gluten'],
  },
  {
    id: 'canned-tuna', name: 'Canned Tuna', category: 'protein',
    emoji: '🥫', description: 'Budget-friendly lean protein.',
    cal_per_100g: 116, protein_g: 26, carbs_g: 0, fat_g: 1,
    serving_size_g: 113, serving_label: '1 can (drained)', tags: ['no-gluten', 'no-dairy'],
  },
  {
    id: 'lentils', name: 'Lentils', category: 'protein',
    emoji: '🫘', description: 'Plant-based protein + fiber combo.',
    cal_per_100g: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4,
    serving_size_g: 198, serving_label: '1 cup cooked', tags: ['vegan', 'vegetarian', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'tofu', name: 'Firm Tofu', category: 'protein',
    emoji: '🧱', description: 'Neutral flavor — absorbs any seasoning.',
    cal_per_100g: 76, protein_g: 8, carbs_g: 1.9, fat_g: 4.2,
    serving_size_g: 126, serving_label: '¼ block', tags: ['vegan', 'vegetarian', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'shrimp', name: 'Shrimp', category: 'protein',
    emoji: '🍤', description: 'Ultra-lean, quick-cooking.',
    cal_per_100g: 99, protein_g: 24, carbs_g: 0.2, fat_g: 0.3,
    serving_size_g: 113, serving_label: '4 oz', tags: ['no-gluten', 'no-dairy'],
  },
  {
    id: 'cottage-cheese', name: 'Cottage Cheese', category: 'protein',
    emoji: '🫙', description: 'Low-fat, high-protein snack or topper.',
    cal_per_100g: 72, protein_g: 12.4, carbs_g: 2.7, fat_g: 1,
    serving_size_g: 113, serving_label: '½ cup', tags: ['no-gluten'],
  },

  // ── CARBS ─────────────────────────────────────────────────────
  {
    id: 'brown-rice', name: 'Brown Rice', category: 'carbs',
    emoji: '🍚', description: 'Whole grain. Batch-cook on prep day.',
    cal_per_100g: 112, protein_g: 2.6, carbs_g: 23.5, fat_g: 0.9,
    serving_size_g: 195, serving_label: '1 cup cooked', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'quinoa', name: 'Quinoa', category: 'carbs',
    emoji: '🌾', description: 'Complete protein grain. Gluten-free.',
    cal_per_100g: 120, protein_g: 4.4, carbs_g: 21.3, fat_g: 1.9,
    serving_size_g: 185, serving_label: '1 cup cooked', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'oats', name: 'Rolled Oats', category: 'carbs',
    emoji: '🥣', description: 'Slow-release energy. Ideal for breakfast.',
    cal_per_100g: 389, protein_g: 17, carbs_g: 66, fat_g: 7,
    serving_size_g: 40, serving_label: '½ cup dry', tags: ['vegan', 'vegetarian'],
  },
  {
    id: 'sweet-potato', name: 'Sweet Potato', category: 'carbs',
    emoji: '🍠', description: 'Beta-carotene + complex carbs.',
    cal_per_100g: 86, protein_g: 1.6, carbs_g: 20, fat_g: 0.1,
    serving_size_g: 130, serving_label: '1 medium', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'whole-wheat-bread', name: 'Whole Wheat Bread', category: 'carbs',
    emoji: '🍞', description: 'Higher fiber than white bread.',
    cal_per_100g: 247, protein_g: 9, carbs_g: 43, fat_g: 3.5,
    serving_size_g: 28, serving_label: '1 slice', tags: ['vegetarian'],
  },
  {
    id: 'chickpeas', name: 'Chickpeas', category: 'carbs',
    emoji: '🫘', description: 'Fiber-rich, versatile legume.',
    cal_per_100g: 164, protein_g: 8.9, carbs_g: 27, fat_g: 2.6,
    serving_size_g: 164, serving_label: '1 cup cooked', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'banana', name: 'Banana', category: 'fruit',
    emoji: '🍌', description: 'Quick energy. Great pre-workout.',
    cal_per_100g: 89, protein_g: 1.1, carbs_g: 23, fat_g: 0.3,
    serving_size_g: 118, serving_label: '1 medium', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },

  // ── FATS ──────────────────────────────────────────────────────
  {
    id: 'avocado', name: 'Avocado', category: 'fats',
    emoji: '🥑', description: 'Heart-healthy monounsaturated fats.',
    cal_per_100g: 160, protein_g: 2, carbs_g: 9, fat_g: 15,
    serving_size_g: 150, serving_label: '½ large', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'olive-oil', name: 'Olive Oil', category: 'fats',
    emoji: '🫒', description: 'Extra virgin. Use for sautéing / dressing.',
    cal_per_100g: 884, protein_g: 0, carbs_g: 0, fat_g: 100,
    serving_size_g: 14, serving_label: '1 tbsp', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'almonds', name: 'Almonds', category: 'fats',
    emoji: '🌰', description: 'Vitamin E, magnesium, healthy fats.',
    cal_per_100g: 579, protein_g: 21, carbs_g: 22, fat_g: 50,
    serving_size_g: 28, serving_label: '1 oz (~23 nuts)', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'peanut-butter', name: 'Peanut Butter', category: 'fats',
    emoji: '🥜', description: 'Natural, no sugar added. Calorie-dense.',
    cal_per_100g: 588, protein_g: 25, carbs_g: 20, fat_g: 50,
    serving_size_g: 32, serving_label: '2 tbsp', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'walnuts', name: 'Walnuts', category: 'fats',
    emoji: '🌰', description: 'Excellent omega-3 source. Anti-inflammatory.',
    cal_per_100g: 654, protein_g: 15, carbs_g: 14, fat_g: 65,
    serving_size_g: 28, serving_label: '1 oz', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },

  // ── VEGGIES ───────────────────────────────────────────────────
  {
    id: 'broccoli', name: 'Broccoli', category: 'veggies',
    emoji: '🥦', description: 'Cruciferous powerhouse. Roast or steam.',
    cal_per_100g: 34, protein_g: 2.8, carbs_g: 7, fat_g: 0.4,
    serving_size_g: 91, serving_label: '1 cup florets', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'spinach', name: 'Baby Spinach', category: 'veggies',
    emoji: '🥬', description: 'Iron-rich greens. Wilts into anything.',
    cal_per_100g: 23, protein_g: 2.9, carbs_g: 3.6, fat_g: 0.4,
    serving_size_g: 30, serving_label: '1 cup raw', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'bell-pepper', name: 'Bell Pepper', category: 'veggies',
    emoji: '🫑', description: 'Vitamin C bomb. Crisp raw or roasted.',
    cal_per_100g: 31, protein_g: 1, carbs_g: 6, fat_g: 0.3,
    serving_size_g: 119, serving_label: '1 medium', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'zucchini', name: 'Zucchini', category: 'veggies',
    emoji: '🥒', description: 'Low-cal filler. Spiralizes, sautés.',
    cal_per_100g: 17, protein_g: 1.2, carbs_g: 3.1, fat_g: 0.3,
    serving_size_g: 113, serving_label: '1 medium', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'kale', name: 'Kale', category: 'veggies',
    emoji: '🥬', description: 'Nutrient-dense. Massage for salads.',
    cal_per_100g: 35, protein_g: 2.9, carbs_g: 4.4, fat_g: 1.5,
    serving_size_g: 67, serving_label: '1 cup chopped', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'cauliflower', name: 'Cauliflower', category: 'veggies',
    emoji: '🥦', description: 'Chameleon veggie. Roast, mash, rice.',
    cal_per_100g: 25, protein_g: 1.9, carbs_g: 5, fat_g: 0.3,
    serving_size_g: 107, serving_label: '1 cup', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },

  // ── FRUIT ─────────────────────────────────────────────────────
  {
    id: 'blueberries', name: 'Blueberries', category: 'fruit',
    emoji: '🫐', description: 'Antioxidant-rich. Great in oats or yogurt.',
    cal_per_100g: 57, protein_g: 0.7, carbs_g: 14, fat_g: 0.3,
    serving_size_g: 148, serving_label: '1 cup', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'apple', name: 'Apple', category: 'fruit',
    emoji: '🍎', description: 'Fiber and crunch. Pairs with nut butter.',
    cal_per_100g: 52, protein_g: 0.3, carbs_g: 14, fat_g: 0.2,
    serving_size_g: 182, serving_label: '1 medium', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
  {
    id: 'strawberries', name: 'Strawberries', category: 'fruit',
    emoji: '🍓', description: 'Low sugar, high vitamin C.',
    cal_per_100g: 32, protein_g: 0.7, carbs_g: 7.7, fat_g: 0.3,
    serving_size_g: 152, serving_label: '1 cup sliced', tags: ['vegan', 'no-gluten', 'no-dairy'],
  },
];

/* ═══════════════════════════════════════════════════════════════
   SECTION 2 — UNIT CONVERSION ENGINE
   ---------------------------------------------------------------
   All weights stored internally in GRAMS.
   All volumes stored internally in ML.
   ═══════════════════════════════════════════════════════════════ */

const UNITS = {
  // Weight conversions (base: grams)
  g:   { label: 'g',    type: 'weight', toBase: 1,          fromBase: 1           },
  oz:  { label: 'oz',   type: 'weight', toBase: 28.3495,    fromBase: 1/28.3495   },
  lbs: { label: 'lbs',  type: 'weight', toBase: 453.592,    fromBase: 1/453.592   },
  kg:  { label: 'kg',   type: 'weight', toBase: 1000,       fromBase: 1/1000      },

  // Volume conversions (base: ml)
  ml:   { label: 'ml',   type: 'volume', toBase: 1,         fromBase: 1           },
  cups: { label: 'cups', type: 'volume', toBase: 236.588,   fromBase: 1/236.588   },
  tbsp: { label: 'tbsp', type: 'volume', toBase: 14.7868,   fromBase: 1/14.7868   },
  tsp:  { label: 'tsp',  type: 'volume', toBase: 4.92892,   fromBase: 1/4.92892   },
  fl_oz:{ label: 'fl oz',type: 'volume', toBase: 29.5735,   fromBase: 1/29.5735   },

  // Density approximation for food weight ↔ volume (g/ml ≈ 1 for typical foods)
  FOOD_DENSITY: 0.85, // g/ml – rough average for solid foods
};

/**
 * Convert a food amount from one unit to another.
 * @param {number} value - The amount to convert.
 * @param {string} fromUnit - Source unit key.
 * @param {string} toUnit   - Target unit key.
 * @returns {number} Converted value.
 */
function convertUnit(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value;

  const from = UNITS[fromUnit];
  const to   = UNITS[toUnit];
  if (!from || !to) { console.warn(`Unknown unit: ${fromUnit} or ${toUnit}`); return value; }

  // Same type: direct conversion through base
  if (from.type === to.type) {
    return value * from.toBase * to.fromBase;
  }

  // Cross-type (weight ↔ volume): apply density factor
  const density = UNITS.FOOD_DENSITY;
  if (from.type === 'weight' && to.type === 'volume') {
    // grams → ml → target volume
    const ml = (value * from.toBase) / density;
    return ml * to.fromBase;
  } else {
    // ml → grams → target weight
    const grams = (value * from.toBase) * density;
    return grams * to.fromBase;
  }
}

/**
 * Format a converted value to a sensible number of decimal places.
 * @param {number} val
 * @param {string} unit
 * @returns {string}
 */
function formatAmount(val, unit) {
  if (val >= 100)  return val.toFixed(0);
  if (val >= 10)   return val.toFixed(1);
  return val.toFixed(2);
}

/**
 * Return a food's macros scaled to any unit/amount combo.
 * @param {Object} food        - Food item from FOODS_DB.
 * @param {number} amountGrams - Amount in grams.
 * @returns {{cal, protein, carbs, fat}}
 */
function scaleMacros(food, amountGrams) {
  const ratio = amountGrams / 100;
  return {
    cal:     Math.round(food.cal_per_100g  * ratio),
    protein: +(food.protein_g * ratio).toFixed(1),
    carbs:   +(food.carbs_g  * ratio).toFixed(1),
    fat:     +(food.fat_g    * ratio).toFixed(1),
  };
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — TDEE / MACRO CALCULATOR
   ---------------------------------------------------------------
   Mifflin-St Jeor BMR → Harris-Benedict activity multiplier
   ═══════════════════════════════════════════════════════════════ */

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
  very:      1.725,
  extra:     1.9,
};

const GOAL_ADJUSTMENTS = {
  cut:      -500,  // caloric deficit
  maintain:  0,
  build:    +300,  // lean bulk surplus
};

// Macro ratios per goal [protein%, carbs%, fat%]
const GOAL_MACRO_RATIOS = {
  cut:      { protein: 0.40, carbs: 0.35, fat: 0.25 },
  maintain: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  build:    { protein: 0.35, carbs: 0.45, fat: 0.20 },
};

/**
 * Calculate TDEE and macros from user profile.
 * @param {Object} profile - { weight_kg, height_cm, age, sex, activity, goal }
 * @returns {{ tdee, calories, protein_g, carbs_g, fat_g }}
 */
function calculateNutritionTargets(profile) {
  const { weight_kg, height_cm, age, sex, activity, goal } = profile;

  // BMR (Mifflin-St Jeor)
  let bmr;
  if (sex === 'male') {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }

  const tdee     = Math.round(bmr * (ACTIVITY_MULTIPLIERS[activity] || 1.55));
  const calories = Math.max(1200, tdee + (GOAL_ADJUSTMENTS[goal] || 0));
  const ratios   = GOAL_MACRO_RATIOS[goal] || GOAL_MACRO_RATIOS.maintain;

  return {
    tdee,
    calories,
    protein_g: Math.round((calories * ratios.protein) / 4),
    carbs_g:   Math.round((calories * ratios.carbs)   / 4),
    fat_g:     Math.round((calories * ratios.fat)     / 9),
  };
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 4 — MEAL PLAN GENERATOR
   ---------------------------------------------------------------
   Supabase table equivalent: `meal_plans`
   Columns: id, user_id, created_at, goal, calories_per_day,
            days[] (JSONB), grocery_list[] (JSONB)
   ═══════════════════════════════════════════════════════════════ */

const MEAL_ICONS = ['☀️', '🥗', '🍱', '🌙', '🍎'];
const MEAL_NAMES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout'];
const DAY_NAMES  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Generate a structured 7-day meal plan.
 *
 * Strategy:
 *  1. Divide daily calories among meals.
 *  2. For each meal pick foods from user's preferred list
 *     (respecting category balance: 1 protein, 1 carb, 1 veggie/fat).
 *  3. Calculate serving sizes to hit calorie target per meal.
 *  4. Mark prep-batch items on prep days.
 *
 * @param {Object} opts - { targets, preferredFoods, mealsPerDay, prepDays, dietTags, goal }
 * @returns {Object} planData
 */
function generateMealPlan(opts) {
  const { targets, preferredFoods, mealsPerDay, prepDays, dietTags, goal } = opts;

  const caloriesPerMeal = Math.round(targets.calories / mealsPerDay);

  // Split prep days evenly across the week (e.g., 2 → Sun+Wed)
  const prepDayIndices = getPrepDayIndices(prepDays);

  const plan = { days: [] };

  // Filter preferred foods into categories
  const categorized = categorizePreferred(preferredFoods, dietTags);

  for (let d = 0; d < 7; d++) {
    const dayPlan = {
      day_index: d,
      day_name:  DAY_NAMES[d],
      is_prep_day: prepDayIndices.includes(d),
      meals: [],
    };

    for (let m = 0; m < mealsPerDay; m++) {
      const mealName = getMealName(m, mealsPerDay);
      const mealIcon = getMealIcon(m, mealsPerDay);

      // Pick foods for this meal (cycle to ensure variety)
      const mealFoods = pickMealFoods(categorized, m, d, mealsPerDay);

      // Distribute calories among picked foods
      const items = distributeCalories(mealFoods, caloriesPerMeal, targets, goal);

      const mealTotals = items.reduce((acc, item) => {
        acc.cal     += item.cal;
        acc.protein += item.protein;
        acc.carbs   += item.carbs;
        acc.fat     += item.fat;
        return acc;
      }, { cal: 0, protein: 0, carbs: 0, fat: 0 });

      dayPlan.meals.push({
        id:        `meal-${d}-${m}`,
        name:      mealName,
        icon:      mealIcon,
        items,
        totals:    mealTotals,
        is_batch_prep: dayPlan.is_prep_day,
      });
    }

    plan.days.push(dayPlan);
  }

  plan.grocery_list = buildGroceryList(plan.days);
  return plan;
}

/** Determine which day indices are prep days, spread across the week. */
function getPrepDayIndices(prepDaysCount) {
  const interval = Math.floor(7 / Math.max(1, prepDaysCount));
  const indices = [];
  for (let i = 0; i < prepDaysCount; i++) {
    indices.push(i * interval);
  }
  return indices;
}

/** Group preferred foods by category, filtered by diet tags. */
function categorizePreferred(preferredFoods, dietTags) {
  const all = preferredFoods.map(id => FOODS_DB.find(f => f.id === id)).filter(Boolean);

  // Filter by diet tags if any are selected
  const filtered = dietTags.length === 0 ? all : all.filter(food =>
    dietTags.every(tag => food.tags.includes(tag))
  );

  // If filtering removes everything, fall back to unfiltered preferred
  const pool = filtered.length > 0 ? filtered : all;

  return {
    protein: pool.filter(f => f.category === 'protein'),
    carbs:   pool.filter(f => f.category === 'carbs'),
    fats:    pool.filter(f => f.category === 'fats'),
    veggies: pool.filter(f => f.category === 'veggies'),
    fruit:   pool.filter(f => f.category === 'fruit'),
    all:     pool,
  };
}

/** Rotate through arrays to ensure variety across days/meals. */
function rotate(arr, index) {
  if (!arr || arr.length === 0) return null;
  return arr[index % arr.length];
}

/** Pick a balanced set of foods for one meal slot. */
function pickMealFoods(cat, mealIndex, dayIndex, mealsPerDay) {
  const seed = dayIndex * 13 + mealIndex * 7; // deterministic variety seed
  const foods = [];

  // Breakfast: oats/fruit + protein
  if (mealIndex === 0) {
    const carbFood = rotate(cat.carbs.filter(f => ['oats','quinoa','banana'].includes(f.id)).concat(cat.carbs), seed);
    const protFood = rotate(cat.protein, seed + 3);
    const fruitFood = rotate(cat.fruit, seed + 1);
    if (carbFood) foods.push(carbFood);
    if (protFood) foods.push(protFood);
    if (fruitFood && foods.length < 3) foods.push(fruitFood);
    return foods.slice(0,3);
  }

  // Snack: if last meal and 4+ meals per day
  if (mealIndex >= mealsPerDay - 1 && mealsPerDay >= 4) {
    const snackFat = rotate(cat.fats, seed);
    const snackFruit = rotate(cat.fruit, seed + 2);
    if (snackFat) foods.push(snackFat);
    if (snackFruit) foods.push(snackFruit);
    return foods.slice(0,2);
  }

  // Lunch / Dinner: protein + carb + veggie
  const prot  = rotate(cat.protein, seed);
  const carb  = rotate(cat.carbs, seed + 5);
  const veggie = rotate(cat.veggies, seed + 9);
  const fat   = rotate(cat.fats, seed + 2);
  if (prot)   foods.push(prot);
  if (carb)   foods.push(carb);
  if (veggie) foods.push(veggie);
  if (fat && foods.length < 4) foods.push(fat);
  return foods.slice(0,4);
}

/** Distribute calories across a set of foods, returning portioned items. */
function distributeCalories(foods, targetCal, targets, goal) {
  if (foods.length === 0) return [];

  // Weight allocation per category
  const catWeights = { protein: 1.5, carbs: 1.2, fats: 0.6, veggies: 0.5, fruit: 0.7 };
  const totalWeight = foods.reduce((s, f) => s + (catWeights[f.category] || 1), 0);

  return foods.map(food => {
    const weight  = catWeights[food.category] || 1;
    const allocCal = targetCal * (weight / totalWeight);
    // grams needed to hit allocated calories
    const grams   = Math.round((allocCal / food.cal_per_100g) * 100);
    const macros  = scaleMacros(food, grams);

    return {
      food_id:    food.id,
      name:       food.name,
      emoji:      food.emoji,
      category:   food.category,
      grams,
      ...macros,
      is_batch:   ['brown-rice','quinoa','oats','lentils','chickpeas','sweet-potato'].includes(food.id),
    };
  });
}

/** Meal name based on position */
function getMealName(index, total) {
  if (total === 1) return 'Daily Meal';
  if (total === 2) return index === 0 ? 'Breakfast' : 'Dinner';
  if (total === 3) return ['Breakfast', 'Lunch', 'Dinner'][index] || `Meal ${index+1}`;
  if (total === 4) return ['Breakfast', 'Lunch', 'Dinner', 'Snack'][index] || `Meal ${index+1}`;
  return ['Breakfast', 'Mid-Morning', 'Lunch', 'Dinner', 'Evening Snack'][index] || `Meal ${index+1}`;
}

/** Meal icon based on position */
function getMealIcon(index, total) {
  if (total <= 3) return ['☀️', '🥗', '🌙'][index] || '🍽️';
  return ['☀️', '🥗', '🍱', '🌙', '🍎'][index] || '🍽️';
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 5 — GROCERY LIST BUILDER
   ---------------------------------------------------------------
   Supabase table equivalent: `grocery_items`
   Columns: id, plan_id, food_id, name, category, total_grams,
            checked, emoji
   ═══════════════════════════════════════════════════════════════ */

/**
 * Aggregate all plan items into a grocery list, summing quantities.
 * @param {Array} days - Plan days array.
 * @returns {Array} grocery items sorted by category.
 */
function buildGroceryList(days) {
  const totals = {}; // keyed by food_id

  days.forEach(day => {
    day.meals.forEach(meal => {
      meal.items.forEach(item => {
        if (!totals[item.food_id]) {
          totals[item.food_id] = {
            id:          `grocery-${item.food_id}`,
            food_id:     item.food_id,
            name:        item.name,
            category:    item.category,
            emoji:       item.emoji,
            total_grams: 0,
            checked:     false,
          };
        }
        totals[item.food_id].total_grams += item.grams;
      });
    });
  });

  // Sort by category order
  const categoryOrder = ['protein', 'carbs', 'veggies', 'fruit', 'fats'];
  return Object.values(totals).sort((a, b) => {
    return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
  });
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 6 — APPLICATION STATE
   ---------------------------------------------------------------
   Supabase table equivalent: `user_profiles`
   ═══════════════════════════════════════════════════════════════ */

const APP_STATE = {
  // User profile (mirrors future Supabase `user_profiles` row)
  profile: {
    id:          null,   // uuid – set on real Supabase auth
    user_id:     null,
    name:        '',
    age:         null,
    weight_kg:   null,
    height_cm:   null,
    sex:         'male',
    activity:    'moderate',
    goal:        'maintain',
    meals_per_day: 3,
    prep_days:   2,
    diet_tags:   [],
  },

  // User's preferred food IDs
  preferred_foods: [],

  // Custom food names (not in DB)
  custom_foods: [],

  // Current unit preferences
  weight_unit: 'lbs',
  height_unit: 'in',
  display_unit: 'g',  // global food display unit

  // Generated plan
  plan: null,
  nutrition_targets: null,

  // Grocery state (checked items persisted locally)
  grocery_checked: {},

  // UI state
  active_view:      'onboarding',
  active_day:       0,
  active_food_cat:  'protein',
  active_lib_filter:'all',
  dark_mode:        false,
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 7 — SIMULATED DB LAYER
   ---------------------------------------------------------------
   These async wrappers mimic Supabase client calls.
   Replace internals with real Supabase when ready:
     const { data, error } = await supabase.from('foods').select()
   ═══════════════════════════════════════════════════════════════ */

const db = {
  /** Fetch all foods (optionally by category). */
  async getFoods(category = null) {
    await tick(10); // simulate network latency
    return category
      ? FOODS_DB.filter(f => f.category === category)
      : [...FOODS_DB];
  },

  /** Fetch a single food by ID. */
  async getFood(id) {
    await tick(10);
    return FOODS_DB.find(f => f.id === id) || null;
  },

  /** Save user profile to localStorage (swap with supabase.upsert later). */
  async saveProfile(profile) {
    await tick(5);
    localStorage.setItem('mise_profile', JSON.stringify(profile));
    return { data: profile, error: null };
  },

  /** Load user profile. */
  async loadProfile() {
    await tick(5);
    const raw = localStorage.getItem('mise_profile');
    return raw ? { data: JSON.parse(raw), error: null } : { data: null, error: null };
  },

  /** Save meal plan. */
  async savePlan(plan) {
    await tick(5);
    localStorage.setItem('mise_plan', JSON.stringify(plan));
    return { data: plan, error: null };
  },

  /** Load meal plan. */
  async loadPlan() {
    await tick(5);
    const raw = localStorage.getItem('mise_plan');
    return raw ? { data: JSON.parse(raw), error: null } : { data: null, error: null };
  },

  /** Save grocery checked state. */
  async saveGroceryChecked(state) {
    localStorage.setItem('mise_grocery_checked', JSON.stringify(state));
    return { data: state, error: null };
  },

  /** Load grocery checked state. */
  async loadGroceryChecked() {
    const raw = localStorage.getItem('mise_grocery_checked');
    return raw ? JSON.parse(raw) : {};
  },
};

/** Minimal async delay helper. */
function tick(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 8 — VIEW ROUTER
   ═══════════════════════════════════════════════════════════════ */

function switchView(viewId) {
  APP_STATE.active_view = viewId;

  // Update main views
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === `view-${viewId}`);
  });

  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });

  // View-specific refresh
  if (viewId === 'plan' && APP_STATE.plan) renderPlanView();
  if (viewId === 'foods') renderFoodLibrary();
  if (viewId === 'grocery') renderGroceryView();
}

// Expose globally for inline onclick handlers
window.switchView = switchView;

/* ═══════════════════════════════════════════════════════════════
   SECTION 9 — ONBOARDING RENDER
   ═══════════════════════════════════════════════════════════════ */

function initOnboarding() {
  // Food category tab switching
  document.querySelectorAll('.food-cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.food-cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      APP_STATE.active_food_cat = tab.dataset.cat;
      renderFoodPickerGrid();
    });
  });

  // Initial food picker render
  renderFoodPickerGrid();

  // Stepper buttons
  makeStepperWork('mealsDown', 'mealsUp', 'mealsPerDay', 'mealsDisplay', 1, 6);
  makeStepperWork('prepDown', 'prepUp', 'prepDays', 'prepDisplay', 1, 7);

  // Diet tag toggles
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      const tag = btn.dataset.tag;
      if (btn.classList.contains('selected')) {
        APP_STATE.profile.diet_tags.push(tag);
      } else {
        APP_STATE.profile.diet_tags = APP_STATE.profile.diet_tags.filter(t => t !== tag);
      }
    });
  });

  // Custom food add
  document.getElementById('addCustomFoodBtn').addEventListener('click', addCustomFood);
  document.getElementById('customFoodInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addCustomFood();
  });

  // Unit toggles (profile)
  document.querySelectorAll('.unit-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      document.querySelectorAll(`.unit-toggle[data-group="${group}"]`)
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (group === 'weight') APP_STATE.weight_unit = btn.dataset.unit;
      if (group === 'height') APP_STATE.height_unit = btn.dataset.unit;
    });
  });

  // Generate button
  document.getElementById('generatePlanBtn').addEventListener('click', handleGeneratePlan);
}

/** Render the food picker grid for the current category. */
function renderFoodPickerGrid() {
  const cat  = APP_STATE.active_food_cat;
  const grid = document.getElementById('foodPickerGrid');
  const foods = FOODS_DB.filter(f => f.category === cat);

  grid.innerHTML = foods.map(food => `
    <div class="food-picker-item ${APP_STATE.preferred_foods.includes(food.id) ? 'selected' : ''}"
         data-food-id="${food.id}" title="${food.description}">
      <span class="food-emoji">${food.emoji}</span>
      ${food.name}
    </div>
  `).join('');

  grid.querySelectorAll('.food-picker-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.foodId;
      if (APP_STATE.preferred_foods.includes(id)) {
        APP_STATE.preferred_foods = APP_STATE.preferred_foods.filter(f => f !== id);
        item.classList.remove('selected');
      } else {
        APP_STATE.preferred_foods.push(id);
        item.classList.add('selected');
      }
    });
  });
}

/** Wire up stepper +/- buttons. */
function makeStepperWork(downId, upId, hiddenId, displayId, min, max) {
  const hiddenEl  = document.getElementById(hiddenId);
  const displayEl = document.getElementById(displayId);
  let val = parseInt(hiddenEl.value);

  document.getElementById(downId).addEventListener('click', () => {
    if (val > min) {
      val--;
      hiddenEl.value = val;
      displayEl.textContent = val;
      if (hiddenId === 'mealsPerDay') APP_STATE.profile.meals_per_day = val;
      if (hiddenId === 'prepDays')   APP_STATE.profile.prep_days = val;
    }
  });

  document.getElementById(upId).addEventListener('click', () => {
    if (val < max) {
      val++;
      hiddenEl.value = val;
      displayEl.textContent = val;
      if (hiddenId === 'mealsPerDay') APP_STATE.profile.meals_per_day = val;
      if (hiddenId === 'prepDays')   APP_STATE.profile.prep_days = val;
    }
  });
}

/** Add a custom food chip. */
function addCustomFood() {
  const input = document.getElementById('customFoodInput');
  const name  = input.value.trim();
  if (!name) return;

  APP_STATE.custom_foods.push(name);
  input.value = '';

  const chip = document.createElement('div');
  chip.className = 'chip';
  chip.innerHTML = `${name} <button class="chip-remove" data-name="${name}">×</button>`;
  document.getElementById('customFoodChips').appendChild(chip);

  chip.querySelector('.chip-remove').addEventListener('click', () => {
    APP_STATE.custom_foods = APP_STATE.custom_foods.filter(f => f !== name);
    chip.remove();
  });
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 10 — PLAN GENERATION HANDLER
   ═══════════════════════════════════════════════════════════════ */

async function handleGeneratePlan() {
  const btn = document.getElementById('generatePlanBtn');

  // Collect form values
  const name     = document.getElementById('userName').value.trim() || 'Friend';
  const age      = parseInt(document.getElementById('userAge').value) || 30;
  const weightRaw = parseFloat(document.getElementById('userWeight').value) || 154;
  const heightRaw = parseFloat(document.getElementById('userHeight').value) || 67;
  const sex      = document.getElementById('userSex').value || 'male';
  const activity = document.getElementById('userActivity').value;
  const goal     = document.querySelector('input[name="goal"]:checked')?.value || 'maintain';
  const mealsPerDay = parseInt(document.getElementById('mealsPerDay').value);
  const prepDays  = parseInt(document.getElementById('prepDays').value);

  // Convert weight/height to kg/cm (internal units)
  const weight_kg = APP_STATE.weight_unit === 'lbs'
    ? weightRaw * 0.453592
    : weightRaw;

  const height_cm = APP_STATE.height_unit === 'in'
    ? heightRaw * 2.54
    : heightRaw;

  // Validate we have at least some food preferences
  if (APP_STATE.preferred_foods.length < 2) {
    showToast('Please select at least 2 foods you like.', 'error');
    return;
  }

  // Update state
  Object.assign(APP_STATE.profile, { name, age, weight_kg, height_cm, sex, activity, goal, meals_per_day: mealsPerDay, prep_days: prepDays });

  // Show loading state
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner" style="width:20px;height:20px;border-width:2px"></div> Generating…`;

  await tick(600); // simulate async work

  // Calculate nutrition targets
  const targets = calculateNutritionTargets(APP_STATE.profile);
  APP_STATE.nutrition_targets = targets;

  // Generate plan
  const plan = generateMealPlan({
    targets,
    preferredFoods: APP_STATE.preferred_foods,
    mealsPerDay,
    prepDays,
    dietTags: APP_STATE.profile.diet_tags,
    goal,
  });

  APP_STATE.plan = plan;

  // Load existing grocery checked state
  APP_STATE.grocery_checked = await db.loadGroceryChecked();

  // Persist
  await db.saveProfile(APP_STATE.profile);
  await db.savePlan(plan);

  // Restore button
  btn.disabled = false;
  btn.innerHTML = `<span>Generate My Meal Plan</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;

  showToast('✓ Plan generated!', 'success');
  switchView('plan');
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 11 — PLAN VIEW RENDERER
   ═══════════════════════════════════════════════════════════════ */

function renderPlanView() {
  if (!APP_STATE.plan) return;

  const plan    = APP_STATE.plan;
  const targets = APP_STATE.nutrition_targets;
  const profile = APP_STATE.profile;

  // Update header
  document.getElementById('planTitle').textContent = `${profile.name}'s Week`;
  document.getElementById('planSubtitle').textContent =
    `${profile.goal.charAt(0).toUpperCase() + profile.goal.slice(1)} plan · ${targets.calories} kcal/day`;

  // Macro strip
  document.getElementById('macroCalories').textContent = targets.calories.toLocaleString();
  document.getElementById('macroProtein').innerHTML  = `${targets.protein_g}<small>g</small>`;
  document.getElementById('macroCarbs').innerHTML    = `${targets.carbs_g}<small>g</small>`;
  document.getElementById('macroFat').innerHTML      = `${targets.fat_g}<small>g</small>`;
  document.getElementById('macroPrepSessions').textContent = profile.prep_days;

  // Show progress bar
  document.getElementById('planProgressBar').style.display = 'block';
  document.getElementById('progressFill').style.width = '33%';

  // Day tabs
  const tabBar = document.getElementById('dayTabBar');
  tabBar.innerHTML = plan.days.map((day, i) => `
    <button class="day-tab ${i === APP_STATE.active_day ? 'active' : ''} ${day.is_prep_day ? 'prep-day' : ''}"
            data-day="${i}">
      ${day.day_name.slice(0,3)}
      ${day.is_prep_day ? '<br><small style="font-size:.65rem">prep</small>' : ''}
    </button>
  `).join('');

  tabBar.querySelectorAll('.day-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      APP_STATE.active_day = parseInt(tab.dataset.day);
      renderPlanView();
    });
  });

  // Render meals for active day
  renderDayMeals(plan.days[APP_STATE.active_day]);
}

/** Render meals for a specific day. */
function renderDayMeals(day) {
  const container = document.getElementById('mealsContainer');

  let html = '';

  if (day.is_prep_day) {
    html += `<div class="prep-day-notice">
      🥘 <strong>Prep Day!</strong> Batch-cook grains, roast veggies, and portion proteins for the week.
    </div>`;
  }

  html += day.meals.map(meal => `
    <div class="meal-card" id="${meal.id}">
      <div class="meal-header" onclick="toggleMealCard('${meal.id}')">
        <div class="meal-header-left">
          <span class="meal-icon">${meal.icon}</span>
          <span class="meal-name">${meal.name}</span>
        </div>
        <div style="display:flex;align-items:center;gap:.75rem">
          <span class="meal-cal-badge">${meal.totals.cal} kcal</span>
          <span class="meal-expand-icon">▾</span>
        </div>
      </div>
      <div class="meal-body">
        <table class="meal-items-table">
          <thead>
            <tr>
              <th>Food</th>
              <th>Amount</th>
              <th>Protein</th>
              <th>Carbs</th>
              <th>Fat</th>
            </tr>
          </thead>
          <tbody>
            ${meal.items.map(item => `
              <tr>
                <td class="food-name-cell">
                  ${item.emoji} ${item.name}
                  ${item.is_batch ? `<span class="prep-badge">batch</span>` : ''}
                </td>
                <td class="food-amount-cell" data-grams="${item.grams}" data-item-amount>
                  ${renderAmount(item.grams, APP_STATE.display_unit)}
                </td>
                <td class="food-macro-cell">${item.protein}g</td>
                <td class="food-macro-cell">${item.carbs}g</td>
                <td class="food-macro-cell">${item.fat}g</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="border-top:2px solid var(--border)">
              <td style="font-weight:600;padding-top:.75rem">Meal Total</td>
              <td></td>
              <td style="font-weight:600;color:var(--terra)">${meal.totals.protein.toFixed(1)}g</td>
              <td style="font-weight:600;color:var(--green-mid)">${meal.totals.carbs.toFixed(1)}g</td>
              <td style="font-weight:600;color:var(--amber)">${meal.totals.fat.toFixed(1)}g</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;

  // Auto-open first meal
  const firstCard = container.querySelector('.meal-card');
  if (firstCard) firstCard.classList.add('open');
}

/** Toggle meal card expand/collapse. */
function toggleMealCard(id) {
  const card = document.getElementById(id);
  if (card) card.classList.toggle('open');
}

window.toggleMealCard = toggleMealCard;

/** Render an amount in the current display unit. */
function renderAmount(grams, unit) {
  const converted = convertUnit(grams, 'g', unit);
  return `${formatAmount(converted, unit)} ${unit}`;
}

/** Update all amount cells when unit changes. */
function updateAllAmounts(unit) {
  APP_STATE.display_unit = unit;
  document.querySelectorAll('[data-item-amount]').forEach(cell => {
    const grams = parseFloat(cell.dataset.grams);
    cell.textContent = renderAmount(grams, unit);
  });
  // Also update library cards if visible
  document.querySelectorAll('[data-lib-grams]').forEach(el => {
    const grams = parseFloat(el.dataset.libGrams);
    el.textContent = renderAmount(grams, unit);
  });
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 12 — FOOD LIBRARY RENDERER
   ═══════════════════════════════════════════════════════════════ */

const CATEGORY_COLORS = {
  protein: '#b85c38',
  carbs:   '#2d5a3d',
  fats:    '#c9922a',
  veggies: '#3e7a55',
  fruit:   '#b85c38',
};

function renderFoodLibrary(filter = APP_STATE.active_lib_filter, searchTerm = '') {
  const grid = document.getElementById('foodLibraryGrid');

  let foods = FOODS_DB;
  if (filter !== 'all') foods = foods.filter(f => f.category === filter);
  if (searchTerm) {
    const s = searchTerm.toLowerCase();
    foods = foods.filter(f =>
      f.name.toLowerCase().includes(s) ||
      f.description.toLowerCase().includes(s)
    );
  }

  if (foods.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>No foods match your search.</p></div>`;
    return;
  }

  grid.innerHTML = foods.map(food => {
    const servinglMacros = scaleMacros(food, food.serving_size_g);
    const color = CATEGORY_COLORS[food.category] || '#2d5a3d';

    return `
      <div class="food-lib-card" data-food-id="${food.id}"
           style="--category-color:${color}"
           onclick="openFoodModal('${food.id}')">
        <div class="food-lib-header">
          <span class="food-lib-emoji">${food.emoji}</span>
          <span class="food-lib-category">${food.category}</span>
        </div>
        <div class="food-lib-name">${food.name}</div>
        <div class="food-lib-desc">${food.description}</div>
        <div class="food-lib-macros">
          <span class="food-macro-pill pill-cal">${servinglMacros.cal} kcal</span>
          <span class="food-macro-pill pill-p">P ${servinglMacros.protein}g</span>
          <span class="food-macro-pill pill-c">C ${servinglMacros.carbs}g</span>
          <span class="food-macro-pill pill-f">F ${servinglMacros.fat}g</span>
        </div>
        <div class="food-lib-measure">
          <span class="food-lib-amount" data-lib-grams="${food.serving_size_g}">
            ${renderAmount(food.serving_size_g, APP_STATE.display_unit)}
          </span>
          <small style="color:var(--ink-xlight)">per ${food.serving_label}</small>
        </div>
      </div>
    `;
  }).join('');
}

/** Open food detail modal. */
function openFoodModal(foodId) {
  const food = FOODS_DB.find(f => f.id === foodId);
  if (!food) return;

  let currentUnit = 'g';
  const baseGrams = food.serving_size_g;
  const overlay   = document.getElementById('modalOverlay');
  const content   = document.getElementById('modalContent');

  const renderModalAmount = (unit) => {
    const converted = convertUnit(baseGrams, 'g', unit);
    return `${formatAmount(converted, unit)} ${unit}`;
  };

  const allUnits = ['g', 'oz', 'cups', 'ml', 'lbs'];

  content.innerHTML = `
    <div class="modal-food-header">
      <span class="modal-food-emoji">${food.emoji}</span>
      <div>
        <div class="modal-food-name">${food.name}</div>
        <div class="modal-food-desc">${food.description}</div>
      </div>
    </div>

    <div class="modal-measure-section">
      <div class="modal-measure-label">Per serving (${food.serving_label})</div>
      <div class="modal-unit-bar" id="modalUnitBar">
        ${allUnits.map(u => `
          <button class="modal-unit-btn ${u === 'g' ? 'active' : ''}" data-unit="${u}">${u}</button>
        `).join('')}
      </div>
      <div class="modal-amount-display" id="modalAmountDisplay">
        ${renderModalAmount('g')}
      </div>
    </div>

    <div class="modal-macro-grid">
      ${[
        ['Calories', `${scaleMacros(food, baseGrams).cal}`, 'kcal'],
        ['Protein',  `${scaleMacros(food, baseGrams).protein}`, 'g'],
        ['Carbs',    `${scaleMacros(food, baseGrams).carbs}`, 'g'],
        ['Fat',      `${scaleMacros(food, baseGrams).fat}`, 'g'],
      ].map(([label, val, unit]) => `
        <div class="modal-macro-item">
          <div class="modal-macro-name">${label}</div>
          <div class="modal-macro-value">${val}<small>${unit}</small></div>
        </div>
      `).join('')}
    </div>

    <div style="font-size:.8rem;color:var(--ink-light)">
      Per 100g: ${food.cal_per_100g} kcal · P ${food.protein_g}g · C ${food.carbs_g}g · F ${food.fat_g}g
    </div>
  `;

  // Unit button events
  content.querySelectorAll('.modal-unit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      content.querySelectorAll('.modal-unit-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentUnit = btn.dataset.unit;
      document.getElementById('modalAmountDisplay').textContent = renderModalAmount(currentUnit);
    });
  });

  overlay.style.display = 'flex';
}

window.openFoodModal = openFoodModal;

/* ═══════════════════════════════════════════════════════════════
   SECTION 13 — GROCERY LIST RENDERER
   ═══════════════════════════════════════════════════════════════ */

function renderGroceryView() {
  const sections   = document.getElementById('grocerySections');
  const subtitle   = document.getElementById('grocerySubtitle');

  if (!APP_STATE.plan) {
    sections.innerHTML = `
      <div class="empty-state">
        <p>Generate a meal plan first to populate your grocery list.</p>
        <button class="btn-primary" onclick="switchView('onboarding')">Go to Setup →</button>
      </div>`;
    return;
  }

  const groceryItems = APP_STATE.plan.grocery_list;

  // Apply saved checked state
  groceryItems.forEach(item => {
    item.checked = !!APP_STATE.grocery_checked[item.food_id];
  });

  subtitle.textContent = `${groceryItems.length} items · based on your current plan`;

  // Group by category
  const categoryOrder = ['protein', 'carbs', 'veggies', 'fruit', 'fats'];
  const categoryEmoji  = { protein: '🍗', carbs: '🌾', veggies: '🥦', fruit: '🍓', fats: '🥑' };
  const categoryLabel  = { protein: 'Proteins', carbs: 'Carbs & Grains', veggies: 'Vegetables', fruit: 'Fruit', fats: 'Fats & Oils' };

  const grouped = {};
  groceryItems.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  sections.innerHTML = categoryOrder
    .filter(cat => grouped[cat])
    .map(cat => {
      const items = grouped[cat];
      return `
        <div class="grocery-section">
          <div class="grocery-section-header">
            <span class="grocery-section-icon">${categoryEmoji[cat]}</span>
            <span class="grocery-section-name">${categoryLabel[cat]}</span>
            <span class="grocery-section-count">${items.length} items</span>
          </div>
          ${items.map(item => {
            const totalOz = formatAmount(convertUnit(item.total_grams, 'g', 'oz'), 'oz');
            const totalG  = formatAmount(item.total_grams, 'g');
            return `
              <div class="grocery-item ${item.checked ? 'checked' : ''}"
                   data-food-id="${item.food_id}"
                   onclick="toggleGroceryItem('${item.food_id}')">
                <div class="grocery-check"></div>
                <div class="grocery-item-info">
                  <div class="grocery-item-name">${item.emoji} ${item.name}</div>
                  <div class="grocery-item-amount">~${totalG}g / ${totalOz} oz (weekly total)</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }).join('');

  updateGroceryProgress();
}

/** Toggle checked state for a grocery item. */
function toggleGroceryItem(foodId) {
  APP_STATE.grocery_checked[foodId] = !APP_STATE.grocery_checked[foodId];

  const el = document.querySelector(`.grocery-item[data-food-id="${foodId}"]`);
  if (el) el.classList.toggle('checked', APP_STATE.grocery_checked[foodId]);

  db.saveGroceryChecked(APP_STATE.grocery_checked);
  updateGroceryProgress();
}

window.toggleGroceryItem = toggleGroceryItem;

/** Update the grocery progress bar. */
function updateGroceryProgress() {
  if (!APP_STATE.plan) return;
  const total   = APP_STATE.plan.grocery_list.length;
  const checked = Object.values(APP_STATE.grocery_checked).filter(Boolean).length;
  const pct     = total > 0 ? (checked / total) * 100 : 0;

  document.getElementById('gpBar').style.width = `${pct}%`;
  document.getElementById('gpLabel').textContent = `${checked} / ${total} items checked`;

  // Update progress bar in header
  document.getElementById('progressFill').style.width = `${Math.min(100, pct * 3)}%`;
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 14 — TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'default'|'success'|'error'} type
 * @param {number} duration - ms
 */
function showToast(message, type = 'default', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast     = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 15 — THEME TOGGLE
   ═══════════════════════════════════════════════════════════════ */

function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('mise_theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    APP_STATE.dark_mode = true;
  }

  btn.addEventListener('click', () => {
    APP_STATE.dark_mode = !APP_STATE.dark_mode;
    document.documentElement.setAttribute('data-theme', APP_STATE.dark_mode ? 'dark' : 'light');
    localStorage.setItem('mise_theme', APP_STATE.dark_mode ? 'dark' : 'light');
  });
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 16 — GLOBAL EVENT LISTENERS
   ═══════════════════════════════════════════════════════════════ */

function initGlobalEvents() {
  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Global unit toggle (plan view)
  document.querySelectorAll('[data-group="global"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="global"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateAllAmounts(btn.dataset.unit);
    });
  });

  // Regenerate plan button
  document.getElementById('regeneratePlanBtn').addEventListener('click', () => {
    APP_STATE.active_day = 0;
    handleGeneratePlan();
  });

  // Food library filter
  document.querySelectorAll('.lib-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lib-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      APP_STATE.active_lib_filter = btn.dataset.filter;
      renderFoodLibrary(btn.dataset.filter, document.getElementById('foodSearch').value);
    });
  });

  // Food search
  const foodSearch = document.getElementById('foodSearch');
  let searchTimer;
  foodSearch.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      renderFoodLibrary(APP_STATE.active_lib_filter, foodSearch.value);
    }, 200);
  });

  // Modal close
  document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('modalOverlay').style.display = 'none';
  });

  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      e.currentTarget.style.display = 'none';
    }
  });

  // Grocery: clear checked
  document.getElementById('clearCheckedBtn').addEventListener('click', () => {
    APP_STATE.grocery_checked = {};
    db.saveGroceryChecked({});
    renderGroceryView();
    showToast('Cleared all checked items.');
  });

  // Grocery: print
  document.getElementById('printGroceryBtn').addEventListener('click', () => window.print());
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 17 — INIT: RESTORE PERSISTED STATE
   ═══════════════════════════════════════════════════════════════ */

async function restorePersistedState() {
  const { data: profile } = await db.loadProfile();
  const { data: plan }    = await db.loadPlan();

  if (profile) {
    Object.assign(APP_STATE.profile, profile);
    APP_STATE.preferred_foods = profile.preferred_foods || [];
    APP_STATE.custom_foods    = profile.custom_foods    || [];
  }

  if (plan) {
    APP_STATE.plan = plan;
    // Restore nutrition targets estimate from saved profile
    if (profile && profile.weight_kg) {
      APP_STATE.nutrition_targets = calculateNutritionTargets(APP_STATE.profile);
    }

    // Show progress bar
    document.getElementById('planProgressBar').style.display = 'block';
    document.getElementById('progressFill').style.width = '33%';

    showToast('✓ Previous plan restored.', 'success');
  }

  APP_STATE.grocery_checked = await db.loadGroceryChecked();
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 18 — BOOT
   ═══════════════════════════════════════════════════════════════ */

async function boot() {
  // Restore previous session
  await restorePersistedState();

  // Initialize UI modules
  initThemeToggle();
  initOnboarding();
  initGlobalEvents();

  // Pre-render food library (lazy — only needed when visited)
  // Render food library on first visit to that view
  // (triggered by switchView → renderFoodLibrary)

  console.log(
    '%c🌿 Mise — Meal Prep Studio\n%cReady. State:', 
    'color:#2d5a3d;font-weight:bold;font-size:1.1rem',
    'color:#8a8278',
    APP_STATE
  );
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', boot);
