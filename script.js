/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  MISE v2 — script.js                                            ║
 * ║  Features: Onboarding · Meal Plan · Food Library · Grocery      ║
 * ║            Unit Engine · Community Hub · Social Feed            ║
 * ║                                                                  ║
 * ║  Architecture:                                                   ║
 * ║  • Single APP_STATE object (mirrors future Supabase schema)      ║
 * ║  • db.* layer is async-first — swap bodies for supabase calls    ║
 * ║  • SOCIAL_DB mirrors `posts` + `comments` + `users` tables       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════
   §1  FOOD DATABASE
   Supabase table: `foods`
   ═══════════════════════════════════════════════════════════════════ */

const FOODS_DB = [
  // ── PROTEIN ─────────────────────────────────────────────────────
  { id:'chicken-breast', name:'Chicken Breast',  category:'protein', emoji:'🍗', description:'Lean, versatile, high in protein.',          cal_per_100g:165, protein_g:31,  carbs_g:0,    fat_g:3.6,  serving_size_g:140, serving_label:'1 breast',       tags:[] },
  { id:'ground-turkey',  name:'Ground Turkey',   category:'protein', emoji:'🦃', description:'93% lean. Bowls, stir-fry, tacos.',          cal_per_100g:150, protein_g:22,  carbs_g:0,    fat_g:7,    serving_size_g:113, serving_label:'4 oz raw',       tags:[] },
  { id:'salmon',         name:'Salmon Fillet',   category:'protein', emoji:'🐟', description:'Rich in omega-3s. Pan-sear or bake.',        cal_per_100g:208, protein_g:20,  carbs_g:0,    fat_g:13,   serving_size_g:170, serving_label:'6 oz fillet',    tags:[] },
  { id:'eggs',           name:'Eggs',            category:'protein', emoji:'🥚', description:'Complete protein. Works at any meal.',        cal_per_100g:143, protein_g:13,  carbs_g:1.1,  fat_g:9.5,  serving_size_g:50,  serving_label:'1 large egg',    tags:[] },
  { id:'greek-yogurt',   name:'Greek Yogurt',    category:'protein', emoji:'🫙', description:'0% plain. High protein, probiotic.',          cal_per_100g:59,  protein_g:10,  carbs_g:3.6,  fat_g:0.4,  serving_size_g:170, serving_label:'¾ cup',         tags:['no-gluten'] },
  { id:'canned-tuna',    name:'Canned Tuna',     category:'protein', emoji:'🥫', description:'Budget-friendly lean protein.',               cal_per_100g:116, protein_g:26,  carbs_g:0,    fat_g:1,    serving_size_g:113, serving_label:'1 can drained',  tags:['no-gluten','no-dairy'] },
  { id:'lentils',        name:'Lentils',         category:'protein', emoji:'🫘', description:'Plant protein + fiber powerhouse.',           cal_per_100g:116, protein_g:9,   carbs_g:20,   fat_g:0.4,  serving_size_g:198, serving_label:'1 cup cooked',   tags:['vegan','vegetarian','no-gluten','no-dairy'] },
  { id:'tofu',           name:'Firm Tofu',       category:'protein', emoji:'🧱', description:'Absorbs any seasoning. Highly versatile.',    cal_per_100g:76,  protein_g:8,   carbs_g:1.9,  fat_g:4.2,  serving_size_g:126, serving_label:'¼ block',        tags:['vegan','vegetarian','no-gluten','no-dairy'] },
  { id:'shrimp',         name:'Shrimp',          category:'protein', emoji:'🍤', description:'Ultra-lean and quick-cooking.',               cal_per_100g:99,  protein_g:24,  carbs_g:0.2,  fat_g:0.3,  serving_size_g:113, serving_label:'4 oz',           tags:['no-gluten','no-dairy'] },
  { id:'cottage-cheese', name:'Cottage Cheese',  category:'protein', emoji:'🫙', description:'Low-fat, high-protein. Great as a topper.',   cal_per_100g:72,  protein_g:12.4,carbs_g:2.7,  fat_g:1,    serving_size_g:113, serving_label:'½ cup',          tags:['no-gluten'] },

  // ── CARBS ────────────────────────────────────────────────────────
  { id:'brown-rice',       name:'Brown Rice',       category:'carbs', emoji:'🍚', description:'Whole grain. Batch-cook on prep day.',          cal_per_100g:112, protein_g:2.6, carbs_g:23.5, fat_g:0.9,  serving_size_g:195, serving_label:'1 cup cooked',   tags:['vegan','no-gluten','no-dairy'] },
  { id:'quinoa',           name:'Quinoa',           category:'carbs', emoji:'🌾', description:'Complete protein grain. Naturally gluten-free.', cal_per_100g:120, protein_g:4.4, carbs_g:21.3, fat_g:1.9,  serving_size_g:185, serving_label:'1 cup cooked',   tags:['vegan','no-gluten','no-dairy'] },
  { id:'oats',             name:'Rolled Oats',      category:'carbs', emoji:'🥣', description:'Slow-release energy. Ideal for breakfast.',      cal_per_100g:389, protein_g:17,  carbs_g:66,   fat_g:7,    serving_size_g:40,  serving_label:'½ cup dry',      tags:['vegan','vegetarian'] },
  { id:'sweet-potato',     name:'Sweet Potato',     category:'carbs', emoji:'🍠', description:'Beta-carotene + complex carbs.',                 cal_per_100g:86,  protein_g:1.6, carbs_g:20,   fat_g:0.1,  serving_size_g:130, serving_label:'1 medium',       tags:['vegan','no-gluten','no-dairy'] },
  { id:'whole-wheat-bread',name:'Whole Wheat Bread',category:'carbs', emoji:'🍞', description:'Higher fiber than white bread.',                 cal_per_100g:247, protein_g:9,   carbs_g:43,   fat_g:3.5,  serving_size_g:28,  serving_label:'1 slice',        tags:['vegetarian'] },
  { id:'chickpeas',        name:'Chickpeas',        category:'carbs', emoji:'🫘', description:'Fiber-rich, versatile legume.',                  cal_per_100g:164, protein_g:8.9, carbs_g:27,   fat_g:2.6,  serving_size_g:164, serving_label:'1 cup cooked',   tags:['vegan','no-gluten','no-dairy'] },

  // ── FATS ─────────────────────────────────────────────────────────
  { id:'avocado',      name:'Avocado',       category:'fats', emoji:'🥑', description:'Heart-healthy monounsaturated fats.',     cal_per_100g:160, protein_g:2,  carbs_g:9,  fat_g:15,  serving_size_g:150, serving_label:'½ large',        tags:['vegan','no-gluten','no-dairy'] },
  { id:'olive-oil',    name:'Olive Oil',     category:'fats', emoji:'🫒', description:'Extra virgin. Sauté or dress.',           cal_per_100g:884, protein_g:0,  carbs_g:0,  fat_g:100, serving_size_g:14,  serving_label:'1 tbsp',         tags:['vegan','no-gluten','no-dairy'] },
  { id:'almonds',      name:'Almonds',       category:'fats', emoji:'🌰', description:'Vitamin E, magnesium, healthy fats.',     cal_per_100g:579, protein_g:21, carbs_g:22, fat_g:50,  serving_size_g:28,  serving_label:'1 oz (~23 nuts)',tags:['vegan','no-gluten','no-dairy'] },
  { id:'peanut-butter',name:'Peanut Butter', category:'fats', emoji:'🥜', description:'Natural, no sugar. Calorie-dense.',       cal_per_100g:588, protein_g:25, carbs_g:20, fat_g:50,  serving_size_g:32,  serving_label:'2 tbsp',         tags:['vegan','no-gluten','no-dairy'] },
  { id:'walnuts',      name:'Walnuts',       category:'fats', emoji:'🌰', description:'Best plant omega-3 source.',              cal_per_100g:654, protein_g:15, carbs_g:14, fat_g:65,  serving_size_g:28,  serving_label:'1 oz',           tags:['vegan','no-gluten','no-dairy'] },

  // ── VEGGIES ──────────────────────────────────────────────────────
  { id:'broccoli',    name:'Broccoli',    category:'veggies', emoji:'🥦', description:'Cruciferous powerhouse. Roast or steam.', cal_per_100g:34, protein_g:2.8, carbs_g:7,   fat_g:0.4, serving_size_g:91,  serving_label:'1 cup florets', tags:['vegan','no-gluten','no-dairy'] },
  { id:'spinach',     name:'Baby Spinach',category:'veggies', emoji:'🥬', description:'Iron-rich. Wilts into almost anything.',  cal_per_100g:23, protein_g:2.9, carbs_g:3.6, fat_g:0.4, serving_size_g:30,  serving_label:'1 cup raw',     tags:['vegan','no-gluten','no-dairy'] },
  { id:'bell-pepper', name:'Bell Pepper', category:'veggies', emoji:'🫑', description:'Vitamin C. Crisp raw or roasted.',        cal_per_100g:31, protein_g:1,   carbs_g:6,   fat_g:0.3, serving_size_g:119, serving_label:'1 medium',      tags:['vegan','no-gluten','no-dairy'] },
  { id:'zucchini',    name:'Zucchini',    category:'veggies', emoji:'🥒', description:'Low-cal filler. Sautés beautifully.',     cal_per_100g:17, protein_g:1.2, carbs_g:3.1, fat_g:0.3, serving_size_g:113, serving_label:'1 medium',      tags:['vegan','no-gluten','no-dairy'] },
  { id:'kale',        name:'Kale',        category:'veggies', emoji:'🥬', description:'Nutrient-dense. Massage for salads.',     cal_per_100g:35, protein_g:2.9, carbs_g:4.4, fat_g:1.5, serving_size_g:67,  serving_label:'1 cup chopped', tags:['vegan','no-gluten','no-dairy'] },

  // ── FRUIT ────────────────────────────────────────────────────────
  { id:'banana',       name:'Banana',       category:'fruit', emoji:'🍌', description:'Quick energy. Great pre-workout.',     cal_per_100g:89,  protein_g:1.1, carbs_g:23,   fat_g:0.3, serving_size_g:118, serving_label:'1 medium',      tags:['vegan','no-gluten','no-dairy'] },
  { id:'blueberries',  name:'Blueberries',  category:'fruit', emoji:'🫐', description:'Antioxidant-rich. Oats or yogurt.',    cal_per_100g:57,  protein_g:0.7, carbs_g:14,   fat_g:0.3, serving_size_g:148, serving_label:'1 cup',         tags:['vegan','no-gluten','no-dairy'] },
  { id:'apple',        name:'Apple',        category:'fruit', emoji:'🍎', description:'Fiber and crunch. Pairs with nut butter.',cal_per_100g:52, protein_g:0.3, carbs_g:14,   fat_g:0.2, serving_size_g:182, serving_label:'1 medium',      tags:['vegan','no-gluten','no-dairy'] },
  { id:'strawberries', name:'Strawberries', category:'fruit', emoji:'🍓', description:'Low sugar, high vitamin C.',           cal_per_100g:32,  protein_g:0.7, carbs_g:7.7,  fat_g:0.3, serving_size_g:152, serving_label:'1 cup sliced',  tags:['vegan','no-gluten','no-dairy'] },
];

/* ═══════════════════════════════════════════════════════════════════
   §2  UNIT CONVERSION ENGINE
   All weights: grams (base). All volumes: ml (base).
   ═══════════════════════════════════════════════════════════════════ */

const UNITS = {
  g:     { type:'weight', toBase:1,           fromBase:1          },
  oz:    { type:'weight', toBase:28.3495,      fromBase:1/28.3495  },
  lbs:   { type:'weight', toBase:453.592,      fromBase:1/453.592  },
  kg:    { type:'weight', toBase:1000,         fromBase:0.001      },
  ml:    { type:'volume', toBase:1,            fromBase:1          },
  cups:  { type:'volume', toBase:236.588,      fromBase:1/236.588  },
  tbsp:  { type:'volume', toBase:14.7868,      fromBase:1/14.7868  },
  tsp:   { type:'volume', toBase:4.92892,      fromBase:1/4.92892  },
  fl_oz: { type:'volume', toBase:29.5735,      fromBase:1/29.5735  },
  DENSITY: 0.85, // g/ml average for typical foods
};

/**
 * Convert amount between any two units (weight↔volume supported via density).
 */
function convertUnit(value, from, to) {
  if (from === to) return value;
  const F = UNITS[from], T = UNITS[to];
  if (!F || !T) return value;
  if (F.type === T.type) return value * F.toBase * T.fromBase;
  // Cross-type conversion
  if (F.type === 'weight') return (value * F.toBase / UNITS.DENSITY) * T.fromBase;
  return (value * F.toBase * UNITS.DENSITY) * T.fromBase;
}

/** Smart decimal formatting. */
function fmtAmt(val) {
  if (val >= 100) return val.toFixed(0);
  if (val >= 10)  return val.toFixed(1);
  return val.toFixed(2);
}

/** Render amount in target unit with label. */
function renderAmt(grams, unit) {
  return `${fmtAmt(convertUnit(grams, 'g', unit))} ${unit}`;
}

/** Scale macros from 100g base to actual serving. */
function scaleMacros(food, grams) {
  const r = grams / 100;
  return {
    cal:     Math.round(food.cal_per_100g * r),
    protein: +(food.protein_g * r).toFixed(1),
    carbs:   +(food.carbs_g   * r).toFixed(1),
    fat:     +(food.fat_g     * r).toFixed(1),
  };
}

/* ═══════════════════════════════════════════════════════════════════
   §3  TDEE & MACRO CALCULATOR
   ═══════════════════════════════════════════════════════════════════ */

const ACTIVITY_MULT  = { sedentary:1.2, light:1.375, moderate:1.55, very:1.725, extra:1.9 };
const GOAL_DELTA     = { cut:-500, maintain:0, build:300 };
const GOAL_RATIOS    = {
  cut:      { p:0.40, c:0.35, f:0.25 },
  maintain: { p:0.30, c:0.40, f:0.30 },
  build:    { p:0.35, c:0.45, f:0.20 },
};

/**
 * Mifflin-St Jeor BMR → TDEE → adjusted calories + macro split.
 * @param {Object} profile
 * @returns {{ tdee, calories, protein_g, carbs_g, fat_g }}
 */
function calcTargets(profile) {
  const { weight_kg, height_cm, age, sex, activity, goal } = profile;
  const bmr = sex === 'male'
    ? 10*weight_kg + 6.25*height_cm - 5*age + 5
    : 10*weight_kg + 6.25*height_cm - 5*age - 161;
  const tdee     = Math.round(bmr * (ACTIVITY_MULT[activity] || 1.55));
  const calories = Math.max(1200, tdee + (GOAL_DELTA[goal] || 0));
  const r        = GOAL_RATIOS[goal] || GOAL_RATIOS.maintain;
  return {
    tdee,
    calories,
    protein_g: Math.round(calories * r.p / 4),
    carbs_g:   Math.round(calories * r.c / 4),
    fat_g:     Math.round(calories * r.f / 9),
  };
}

/* ═══════════════════════════════════════════════════════════════════
   §4  MEAL PLAN GENERATOR
   Supabase table: `meal_plans` { id, user_id, created_at, days[] }
   ═══════════════════════════════════════════════════════════════════ */

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function mealName(idx, total) {
  const maps = {
    1: ['Daily Meal'],
    2: ['Breakfast','Dinner'],
    3: ['Breakfast','Lunch','Dinner'],
    4: ['Breakfast','Lunch','Dinner','Snack'],
    5: ['Breakfast','Mid-Morning','Lunch','Dinner','Evening Snack'],
    6: ['Breakfast','Mid-Morning','Lunch','Afternoon Snack','Dinner','Evening Snack'],
  };
  return (maps[total] || maps[3])[idx] || `Meal ${idx+1}`;
}

function mealIcon(idx, total) {
  const icons = ['☀️','🥗','🍱','🌙','🍎','🥣'];
  return icons[idx] || '🍽️';
}

function prepDayIndices(count) {
  const interval = Math.floor(7 / Math.max(1, count));
  return Array.from({ length: count }, (_, i) => i * interval);
}

function categorizeFoods(preferredIds, dietTags) {
  const all = preferredIds.map(id => FOODS_DB.find(f => f.id === id)).filter(Boolean);
  const pool = dietTags.length === 0 ? all
    : (all.filter(f => dietTags.every(t => f.tags.includes(t))).length > 0
        ? all.filter(f => dietTags.every(t => f.tags.includes(t)))
        : all);
  const cat = c => pool.filter(f => f.category === c);
  return { protein: cat('protein'), carbs: cat('carbs'), fats: cat('fats'), veggies: cat('veggies'), fruit: cat('fruit') };
}

function rotate(arr, seed) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.abs(seed) % arr.length];
}

function pickFoods(cat, mealIdx, dayIdx, total) {
  const s = dayIdx * 13 + mealIdx * 7;
  const foods = [];

  if (mealIdx === 0) {
    const carb  = rotate([...cat.carbs.filter(f => ['oats','quinoa','banana'].includes(f.id)), ...cat.carbs], s);
    const prot  = rotate(cat.protein, s + 3);
    const fruit = rotate(cat.fruit, s + 1);
    [carb, prot, fruit].filter(Boolean).slice(0,3).forEach(f => foods.push(f));
    return foods;
  }

  if (mealIdx >= total - 1 && total >= 4) {
    [rotate(cat.fats, s), rotate(cat.fruit, s+2)].filter(Boolean).forEach(f => foods.push(f));
    return foods;
  }

  [rotate(cat.protein, s), rotate(cat.carbs, s+5), rotate(cat.veggies, s+9), rotate(cat.fats, s+2)]
    .filter(Boolean).slice(0,4).forEach(f => foods.push(f));
  return foods;
}

function distributeCalories(foods, targetCal) {
  if (!foods.length) return [];
  const weights = { protein:1.5, carbs:1.2, fats:0.6, veggies:0.5, fruit:0.7 };
  const total   = foods.reduce((s,f) => s + (weights[f.category]||1), 0);
  return foods.map(food => {
    const alloc  = targetCal * (weights[food.category]||1) / total;
    const grams  = Math.round(alloc / food.cal_per_100g * 100);
    const macros = scaleMacros(food, grams);
    return { food_id:food.id, name:food.name, emoji:food.emoji, category:food.category, grams, ...macros,
             is_batch: ['brown-rice','quinoa','oats','lentils','chickpeas','sweet-potato'].includes(food.id) };
  });
}

/**
 * Main plan generator.
 * @param {{ targets, preferredFoods, mealsPerDay, prepDays, dietTags }} opts
 */
function generatePlan(opts) {
  const { targets, preferredFoods, mealsPerDay, prepDays, dietTags } = opts;
  const calPerMeal = Math.round(targets.calories / mealsPerDay);
  const prepIdx    = prepDayIndices(prepDays);
  const cat        = categorizeFoods(preferredFoods, dietTags);

  const days = DAYS.map((name, d) => {
    const isPrepDay = prepIdx.includes(d);
    const meals = Array.from({ length: mealsPerDay }, (_, m) => {
      const foods = pickFoods(cat, m, d, mealsPerDay);
      const items = distributeCalories(foods, calPerMeal);
      const totals = items.reduce((a, x) => ({ cal:a.cal+x.cal, protein:a.protein+x.protein, carbs:a.carbs+x.carbs, fat:a.fat+x.fat }), { cal:0, protein:0, carbs:0, fat:0 });
      return { id:`meal-${d}-${m}`, name:mealName(m, mealsPerDay), icon:mealIcon(m, mealsPerDay), items, totals, is_batch_prep:isPrepDay };
    });
    return { day_index:d, day_name:name, is_prep_day:isPrepDay, meals };
  });

  return { days, grocery_list: buildGrocery(days) };
}

/* ═══════════════════════════════════════════════════════════════════
   §5  GROCERY BUILDER
   Supabase table: `grocery_items` { id, plan_id, food_id, total_grams, checked }
   ═══════════════════════════════════════════════════════════════════ */

function buildGrocery(days) {
  const map = {};
  days.forEach(d => d.meals.forEach(m => m.items.forEach(item => {
    if (!map[item.food_id]) {
      map[item.food_id] = { id:`gi-${item.food_id}`, food_id:item.food_id, name:item.name,
                            category:item.category, emoji:item.emoji, total_grams:0, checked:false };
    }
    map[item.food_id].total_grams += item.grams;
  })));
  const catOrder = ['protein','carbs','veggies','fruit','fats'];
  return Object.values(map).sort((a,b) => catOrder.indexOf(a.category) - catOrder.indexOf(b.category));
}

/* ═══════════════════════════════════════════════════════════════════
   §6  SOCIAL DATABASE (mock)
   Supabase tables: `posts`, `post_comments`, `users`
   ═══════════════════════════════════════════════════════════════════ */

// Avatar colour palette for generated initials avatars
const AVATAR_COLORS = ['#c0614a','#5a8a6a','#d4a853','#3a5a7a','#8a5a7a','#5a7a5a','#7a5a3a','#4a6a8a'];

/**
 * Supabase `users` table shape:
 *   id, username, avatar_initial, avatar_color, posts_count, joined_at
 *
 * Supabase `posts` table shape:
 *   id, user_id, type ('post'|'recipe'|'promote'), content,
 *   image_url, image_gradient (fallback), tags[],
 *   recipe_title, recipe_ingredients[], recipe_steps[],
 *   business_name, business_desc, promo_code,
 *   likes_count, comments_count, is_liked, is_saved,
 *   created_at
 */

const MOCK_USERS = [
  { id:'u1', username:'jordanprepmaster',  avatar_initial:'J', avatar_color:'#c0614a', posts_count:142 },
  { id:'u2', username:'sarahstronglifts',  avatar_initial:'S', avatar_color:'#5a8a6a', posts_count:88  },
  { id:'u3', username:'macromike',         avatar_initial:'M', avatar_color:'#d4a853', posts_count:214 },
  { id:'u4', username:'plantpowerprepper', avatar_initial:'P', avatar_color:'#3a5a7a', posts_count:67  },
  { id:'u5', username:'bulkseason.co',     avatar_initial:'B', avatar_color:'#7a5a3a', posts_count:32  },
  { id:'u6', username:'chef_alicia',       avatar_initial:'A', avatar_color:'#8a5a7a', posts_count:159 },
  { id:'u7', username:'leanandgreen_ryan', avatar_initial:'R', avatar_color:'#4a6a8a', posts_count:95  },
  { id:'u8', username:'mealboxpro_tm',     avatar_initial:'T', avatar_color:'#5a7a5a', posts_count:44  },
];

// Gradient themes for food placeholder images
const POST_GRADIENTS = [
  'linear-gradient(135deg, #2d4a1e 0%, #5a8a2d 50%, #3a6a1a 100%)',  // leafy green
  'linear-gradient(135deg, #4a1e0d 0%, #c06030 50%, #8a3010 100%)',  // warm terra
  'linear-gradient(135deg, #1a2a4a 0%, #3a6aaa 50%, #2a4a8a 100%)',  // ocean blue
  'linear-gradient(135deg, #3a2a0a 0%, #d4a030 50%, #8a6010 100%)',  // golden grain
  'linear-gradient(135deg, #2a1a3a 0%, #8a4a9a 50%, #5a2a6a 100%)',  // aubergine
  'linear-gradient(135deg, #0a2a1a 0%, #2a8a5a 50%, #0a5a2a 100%)',  // sage forest
  'linear-gradient(135deg, #3a0a0a 0%, #9a2020 50%, #5a0a0a 100%)',  // tomato red
  'linear-gradient(135deg, #2a2a0a 0%, #8a8a2a 50%, #5a5a0a 100%)',  // turmeric
];

const MOCK_POSTS = [
  {
    id: 'p1', user_id: 'u1', type: 'post',
    content: 'Sunday prep done! 8 portions of teriyaki chicken bowls with brown rice and broccoli. Each container is exactly 520 kcal, 42g protein. Using these divided containers has been a game-changer for portion control. 🙌',
    image_gradient: POST_GRADIENTS[0],
    image_emoji: '🍱',
    tags: ['#mealprep','#highprotein','#sundaymealprep'],
    likes_count: 284, comments_count: 31, is_liked: false, is_saved: false,
    created_at: '2h ago',
    comments: [
      { id:'c1', user_id:'u2', text:'Those containers look incredible! What brand are they?', created_at:'1h ago' },
      { id:'c2', user_id:'u3', text:'The macro tracking is on point. Respect 👊', created_at:'45m ago' },
    ],
  },
  {
    id: 'p2', user_id: 'u5', type: 'promote',
    content: 'Tired of prep taking your whole Sunday? Let us handle it. We deliver fully-prepped, macro-tracked meal containers straight to your door every Monday morning. First week 20% off with code below.',
    image_gradient: POST_GRADIENTS[3],
    image_emoji: '🚚',
    tags: ['#mealprep','#mealdelivery'],
    business_name: 'BulkSeason Meal Co.',
    business_desc: 'Fresh, chef-prepared macro meals. Weekly subscription. Local delivery.',
    promo_code: 'MISE20',
    likes_count: 107, comments_count: 18, is_liked: false, is_saved: false,
    created_at: '3h ago',
    comments: [
      { id:'c3', user_id:'u6', text:'Just ordered! Really excited to try this out.', created_at:'2h ago' },
    ],
  },
  {
    id: 'p3', user_id: 'u2', type: 'recipe',
    content: 'Sharing my go-to high-protein overnight oat recipe that I make every week. Takes 5 minutes, sits overnight, ready to grab and go. Macros per jar: 38g protein, 52g carbs, 9g fat.',
    image_gradient: POST_GRADIENTS[7],
    image_emoji: '🥣',
    tags: ['#highprotein','#breakfastprep','#overnightoats'],
    recipe_title: 'Protein Overnight Oats',
    recipe_ingredients: [
      '½ cup rolled oats',
      '1 scoop vanilla protein powder (30g)',
      '¾ cup Greek yogurt (0%)',
      '½ cup almond milk',
      '1 tbsp chia seeds',
      '1 tbsp peanut butter',
      '½ cup blueberries (fresh or frozen)',
      'Pinch of cinnamon',
    ],
    recipe_steps: [
      'Add oats, protein powder, and chia seeds to a mason jar.',
      'Mix in Greek yogurt and almond milk until combined.',
      'Stir in peanut butter and cinnamon.',
      'Top with blueberries, seal, and refrigerate overnight.',
      'Grab and go in the morning. Good for 4 days in the fridge.',
    ],
    likes_count: 512, comments_count: 64, is_liked: true, is_saved: true,
    created_at: '5h ago',
    comments: [
      { id:'c4', user_id:'u4', text:'Making this tonight! Does oat milk work too?', created_at:'4h ago' },
      { id:'c5', user_id:'u2', text:'Yes! Any plant milk works great 🌱', created_at:'3h ago' },
      { id:'c6', user_id:'u7', text:'Adding extra banana slices on top. Can\'t wait!', created_at:'2h ago' },
    ],
  },
  {
    id: 'p4', user_id: 'u4', type: 'post',
    content: 'Plant-based prep for the week 🌱 Lentil curry, roasted chickpeas, quinoa salad with kale and avocado, and a big batch of turmeric cauliflower. All 100% vegan and absolutely packed with micronutrients.',
    image_gradient: POST_GRADIENTS[5],
    image_emoji: '🥗',
    tags: ['#plantbased','#vegan','#mealprep','#lentils'],
    likes_count: 398, comments_count: 42, is_liked: false, is_saved: false,
    created_at: '8h ago',
    comments: [
      { id:'c7', user_id:'u1', text:'What brand of lentils do you use? Always searching for the best ones.', created_at:'7h ago' },
    ],
  },
  {
    id: 'p5', user_id: 'u3', type: 'recipe',
    content: 'The shrimp stir-fry that broke the internet (in my household 😂). Literally 12 minutes start to finish. I make a big batch of this for the week and it still tastes fresh on day 4.',
    image_gradient: POST_GRADIENTS[1],
    image_emoji: '🍤',
    tags: ['#quickmeal','#shrimp','#stirfry','#highprotein'],
    recipe_title: 'Garlic-Ginger Shrimp Stir-Fry',
    recipe_ingredients: [
      '400g raw shrimp, peeled and deveined',
      '2 cups broccoli florets',
      '1 red bell pepper, sliced',
      '3 garlic cloves, minced',
      '1 tbsp fresh ginger, grated',
      '2 tbsp low-sodium soy sauce',
      '1 tbsp sesame oil',
      '1 tsp cornstarch + 2 tbsp water',
    ],
    recipe_steps: [
      'Heat sesame oil in a wok over high heat.',
      'Add garlic and ginger; cook 30 seconds.',
      'Add shrimp in a single layer; cook 90 seconds per side.',
      'Add broccoli and bell pepper; stir-fry 3 min.',
      'Mix cornstarch slurry with soy sauce; pour over and toss.',
      'Cook until sauce thickens, about 1 minute. Serve over rice.',
    ],
    likes_count: 733, comments_count: 91, is_liked: false, is_saved: true,
    created_at: '1d ago',
    comments: [
      { id:'c8', user_id:'u6', text:'The sesame oil is everything in this recipe. Amazing!', created_at:'20h ago' },
      { id:'c9', user_id:'u7', text:'Added snap peas and it was even better. Thanks Mike!', created_at:'18h ago' },
    ],
  },
  {
    id: 'p6', user_id: 'u8', type: 'promote',
    content: 'We build custom weekly meal prep boxes for athletes, new parents, and busy professionals. Tell us your macros, we build and deliver. Gluten-free, dairy-free, and vegan options available.',
    image_gradient: POST_GRADIENTS[2],
    image_emoji: '📦',
    tags: ['#mealprepservice','#custommeals'],
    business_name: 'The Prep Kitchen — Meal Box Pro',
    business_desc: 'Custom macro-matched meal boxes. Weekly delivery. Starting at $79/week.',
    promo_code: 'FIRSTBOX15',
    likes_count: 89, comments_count: 12, is_liked: false, is_saved: false,
    created_at: '1d ago',
    comments: [],
  },
  {
    id: 'p7', user_id: 'u6', type: 'post',
    content: 'Batch-cooked 3kg of salmon today. Portioned into 14 servings with lemon-herb seasoning. Froze half, fridged half. This is what $38 of salmon looks like when you meal prep smart 💪',
    image_gradient: POST_GRADIENTS[2],
    image_emoji: '🐟',
    tags: ['#salmon','#batchcook','#omega3','#mealprep'],
    likes_count: 441, comments_count: 58, is_liked: false, is_saved: false,
    created_at: '2d ago',
    comments: [
      { id:'c10', user_id:'u3', text:'Smart buy. Salmon is an underrated meal prep protein.', created_at:'2d ago' },
    ],
  },
  {
    id: 'p8', user_id: 'u7', type: 'recipe',
    content: 'For anyone struggling to eat enough vegetables: roast them in big batches and add them to everything. This smoky roasted veggie medley goes with any protein and any grain. Sharing the method below.',
    image_gradient: POST_GRADIENTS[0],
    image_emoji: '🥦',
    tags: ['#roastedveggies','#vegetarian','#mealprep'],
    recipe_title: 'Smoky Roasted Veggie Medley',
    recipe_ingredients: [
      '2 cups broccoli florets',
      '1 large zucchini, cubed',
      '2 bell peppers, chunked',
      '1 red onion, wedges',
      '3 tbsp olive oil',
      '1 tsp smoked paprika',
      '1 tsp garlic powder',
      '½ tsp cumin',
      'Salt and pepper to taste',
    ],
    recipe_steps: [
      'Preheat oven to 425°F (220°C). Line two sheet pans.',
      'Toss all vegetables with olive oil and spices.',
      'Spread in a single layer across both pans (no crowding!).',
      'Roast 22–25 min, flipping once at the halfway mark.',
      'Cool and divide into containers. Lasts 5 days refrigerated.',
    ],
    likes_count: 298, comments_count: 37, is_liked: true, is_saved: false,
    created_at: '3d ago',
    comments: [
      { id:'c11', user_id:'u4', text:'The smoked paprika is what makes this! Adding to my rotation.', created_at:'3d ago' },
      { id:'c12', user_id:'u2', text:'I add sweet potato chunks and it makes it even more filling.', created_at:'2d ago' },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   §7  GLOBAL STATE
   ═══════════════════════════════════════════════════════════════════ */

const STATE = {
  // User profile
  profile: {
    id: null, user_id: null, name: '', age: null,
    weight_kg: null, height_cm: null, sex: 'male',
    activity: 'moderate', goal: 'maintain',
    meals_per_day: 3, prep_days: 2, diet_tags: [],
  },

  preferred_foods: [],  // food IDs
  custom_foods:    [],  // plain strings

  weight_unit:  'lbs',
  height_unit:  'in',
  display_unit: 'g',   // global measurement toggle

  plan:    null,
  targets: null,

  grocery_checked: {},

  // Social
  posts:          [...MOCK_POSTS],
  active_post_id: null,    // for comments drawer
  post_type:      'post',  // composer current type
  feed_filter:    'all',

  // UI
  active_view:     'onboarding',
  active_day:      0,
  food_cat:        'protein',
  lib_filter:      'all',
  dark_mode:       true,
};

/* ═══════════════════════════════════════════════════════════════════
   §8  DB LAYER (async shim → swap for Supabase client)
   ═══════════════════════════════════════════════════════════════════ */

const db = {
  async saveProfile(p)  { localStorage.setItem('mise2_profile', JSON.stringify(p)); return { data:p }; },
  async loadProfile()   { const r = localStorage.getItem('mise2_profile'); return { data: r ? JSON.parse(r) : null }; },
  async savePlan(plan)  { localStorage.setItem('mise2_plan', JSON.stringify(plan)); return { data:plan }; },
  async loadPlan()      { const r = localStorage.getItem('mise2_plan'); return { data: r ? JSON.parse(r) : null }; },
  async saveChecked(st) { localStorage.setItem('mise2_checked', JSON.stringify(st)); return { data:st }; },
  async loadChecked()   { const r = localStorage.getItem('mise2_checked'); return r ? JSON.parse(r) : {}; },
  async savePosts(ps)   { localStorage.setItem('mise2_posts', JSON.stringify(ps)); return { data:ps }; },
  async loadPosts()     { const r = localStorage.getItem('mise2_posts'); return r ? JSON.parse(r) : null; },
};

const delay = (ms = 0) => new Promise(r => setTimeout(r, ms));

/* ═══════════════════════════════════════════════════════════════════
   §9  VIEW ROUTER
   ═══════════════════════════════════════════════════════════════════ */

function switchView(id) {
  STATE.active_view = id;

  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === `view-${id}`);
  });

  // Sidebar items
  document.querySelectorAll('.snav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.view === id);
  });

  // Mobile nav items
  document.querySelectorAll('.mnav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.view === id);
  });

  // Per-view refresh
  if (id === 'plan'      && STATE.plan)  renderPlan();
  if (id === 'foods')                    renderFoodLib();
  if (id === 'grocery')                  renderGrocery();
  if (id === 'community')               { renderFeed(); renderSidebarWidgets(); }

  // Dismiss community badge
  if (id === 'community') {
    const badge = document.getElementById('communityBadge');
    if (badge) badge.style.display = 'none';
  }
}

window.switchView = switchView;

/* ═══════════════════════════════════════════════════════════════════
   §10  ONBOARDING
   ═══════════════════════════════════════════════════════════════════ */

function initOnboarding() {
  // Food category tabs
  document.querySelectorAll('.ftab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.ftab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      STATE.food_cat = t.dataset.cat;
      renderFoodChips();
    });
  });
  renderFoodChips();

  // Steppers
  initStepper('mealsDown','mealsUp','mealsPerDay','mealsDisplay', 1, 6, v => STATE.profile.meals_per_day = v);
  initStepper('prepDown','prepUp','prepDays','prepDisplay', 1, 7, v => STATE.profile.prep_days = v);

  // Diet tags
  document.querySelectorAll('.dtag').forEach(b => {
    b.addEventListener('click', () => {
      b.classList.toggle('on');
      const t = b.dataset.tag;
      STATE.profile.diet_tags = b.classList.contains('on')
        ? [...STATE.profile.diet_tags, t]
        : STATE.profile.diet_tags.filter(x => x !== t);
    });
  });

  // Custom food
  const addBtn   = document.getElementById('addCustomBtn');
  const custInp  = document.getElementById('customFoodInput');
  addBtn.addEventListener('click', addCustomFood);
  custInp.addEventListener('keydown', e => e.key === 'Enter' && addCustomFood());

  // Unit toggles (weight / height)
  document.querySelectorAll('.unit-pill').forEach(b => {
    b.addEventListener('click', () => {
      const g = b.dataset.group;
      document.querySelectorAll(`.unit-pill[data-group="${g}"]`).forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      if (g === 'weight') STATE.weight_unit = b.dataset.unit;
      if (g === 'height') STATE.height_unit = b.dataset.unit;
    });
  });

  // Generate button
  document.getElementById('generateBtn').addEventListener('click', handleGenerate);
}

function renderFoodChips() {
  const grid  = document.getElementById('foodChipGrid');
  const foods = FOODS_DB.filter(f => f.category === STATE.food_cat);
  grid.innerHTML = foods.map(f => `
    <div class="food-chip ${STATE.preferred_foods.includes(f.id) ? 'on' : ''}"
         data-id="${f.id}" title="${f.description}">
      <span class="chip-emoji">${f.emoji}</span>${f.name}
    </div>
  `).join('');
  grid.querySelectorAll('.food-chip').forEach(c => {
    c.addEventListener('click', () => {
      const id = c.dataset.id;
      if (STATE.preferred_foods.includes(id)) {
        STATE.preferred_foods = STATE.preferred_foods.filter(x => x !== id);
        c.classList.remove('on');
      } else {
        STATE.preferred_foods.push(id);
        c.classList.add('on');
      }
    });
  });
}

function initStepper(downId, upId, hiddenId, displayId, min, max, onChange) {
  const hidden  = document.getElementById(hiddenId);
  const display = document.getElementById(displayId);
  let val = parseInt(hidden.value);
  document.getElementById(downId).addEventListener('click', () => {
    if (val > min) { val--; hidden.value = val; display.textContent = val; onChange(val); }
  });
  document.getElementById(upId).addEventListener('click', () => {
    if (val < max) { val++; hidden.value = val; display.textContent = val; onChange(val); }
  });
}

function addCustomFood() {
  const input = document.getElementById('customFoodInput');
  const name  = input.value.trim();
  if (!name) return;
  STATE.custom_foods.push(name);
  input.value = '';
  const chip = document.createElement('div');
  chip.className = 'cchip';
  chip.innerHTML = `${name}<button class="cchip-rm">×</button>`;
  chip.querySelector('.cchip-rm').addEventListener('click', () => {
    STATE.custom_foods = STATE.custom_foods.filter(f => f !== name);
    chip.remove();
  });
  document.getElementById('customChips').appendChild(chip);
}

async function handleGenerate() {
  const btn = document.getElementById('generateBtn');
  const txt = document.getElementById('generateBtnText');

  if (STATE.preferred_foods.length < 2) {
    toast('Select at least 2 foods first.', 'error'); return;
  }

  const name     = document.getElementById('userName').value.trim()    || 'Friend';
  const age      = parseInt(document.getElementById('userAge').value)   || 30;
  const wtRaw    = parseFloat(document.getElementById('userWeight').value) || 154;
  const htRaw    = parseFloat(document.getElementById('userHeight').value) || 67;
  const sex      = document.getElementById('userSex').value             || 'male';
  const activity = document.getElementById('userActivity').value;
  const goal     = document.querySelector('input[name="goal"]:checked')?.value || 'maintain';

  const weight_kg = STATE.weight_unit === 'lbs' ? wtRaw * 0.453592 : wtRaw;
  const height_cm = STATE.height_unit === 'in'  ? htRaw * 2.54     : htRaw;

  Object.assign(STATE.profile, { name, age, weight_kg, height_cm, sex, activity, goal,
    meals_per_day: parseInt(document.getElementById('mealsPerDay').value),
    prep_days:     parseInt(document.getElementById('prepDays').value),
  });

  btn.disabled = true;
  txt.textContent = 'Generating…';

  await delay(500);

  STATE.targets = calcTargets(STATE.profile);
  STATE.plan    = generatePlan({
    targets:        STATE.targets,
    preferredFoods: STATE.preferred_foods,
    mealsPerDay:    STATE.profile.meals_per_day,
    prepDays:       STATE.profile.prep_days,
    dietTags:       STATE.profile.diet_tags,
  });
  STATE.grocery_checked = await db.loadChecked();

  await db.saveProfile({ ...STATE.profile, preferred_foods: STATE.preferred_foods, custom_foods: STATE.custom_foods });
  await db.savePlan(STATE.plan);

  // Update sidebar
  updateSidebarProfile();

  btn.disabled = false;
  txt.textContent = 'Generate My Meal Plan';

  toast('✓ Plan generated!', 'ok');
  switchView('plan');
}

function updateSidebarProfile() {
  const { name, goal } = STATE.profile;
  document.getElementById('sidebarAvatar').textContent   = name ? name[0].toUpperCase() : '?';
  document.getElementById('sidebarUsername').textContent  = name || 'Set up profile';
  document.getElementById('sidebarGoal').textContent      = goal || '—';
  document.getElementById('composerAvatar').textContent   = name ? name[0].toUpperCase() : '?';
}

/* ═══════════════════════════════════════════════════════════════════
   §11  PLAN VIEW
   ═══════════════════════════════════════════════════════════════════ */

function renderPlan() {
  if (!STATE.plan) return;
  const { plan, targets, profile } = STATE;

  document.getElementById('planHeading').textContent = `${profile.name}'s Week`;
  document.getElementById('planSub').textContent     =
    `${profile.goal.charAt(0).toUpperCase() + profile.goal.slice(1)} plan · ${targets.calories} kcal/day`;

  document.getElementById('mCal').textContent   = targets.calories.toLocaleString();
  document.getElementById('mPro').innerHTML     = `${targets.protein_g}<small>g</small>`;
  document.getElementById('mCarb').innerHTML    = `${targets.carbs_g}<small>g</small>`;
  document.getElementById('mFat').innerHTML     = `${targets.fat_g}<small>g</small>`;
  document.getElementById('mPrep').textContent  = profile.prep_days;

  // Day tabs
  const strip = document.getElementById('dayStrip');
  strip.innerHTML = plan.days.map((d, i) => `
    <button class="day-tab ${i === STATE.active_day ? 'active' : ''} ${d.is_prep_day ? 'prep' : ''}"
            data-day="${i}">
      ${d.day_name.slice(0,3)}
      ${d.is_prep_day ? '<br><small style="font-size:.6rem">prep</small>' : ''}
    </button>
  `).join('');

  strip.querySelectorAll('.day-tab').forEach(t => {
    t.addEventListener('click', () => { STATE.active_day = +t.dataset.day; renderPlan(); });
  });

  renderDayMeals(plan.days[STATE.active_day]);
}

function renderDayMeals(day) {
  const area = document.getElementById('mealsArea');
  let html = '';
  if (day.is_prep_day) html += `<div class="prep-notice">🥘 <strong>Prep Day</strong> — Batch cook grains, roast veggies, and portion proteins.</div>`;

  html += day.meals.map(meal => `
    <div class="meal-card" id="${meal.id}">
      <div class="meal-hdr" onclick="toggleMeal('${meal.id}')">
        <div class="meal-hdr-left">
          <span class="meal-icon-lbl">${meal.icon}</span>
          <span class="meal-name">${meal.name}</span>
        </div>
        <div style="display:flex;align-items:center;gap:.6rem">
          <span class="meal-kcal-tag">${meal.totals.cal} kcal</span>
          <span class="meal-chevron">▾</span>
        </div>
      </div>
      <div class="meal-body">
        <table class="meal-table">
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
                <td class="td-name">${item.emoji} ${item.name}${item.is_batch ? '<span class="batch-tag">batch</span>' : ''}</td>
                <td class="td-amt" data-grams="${item.grams}" data-amt-cell>${renderAmt(item.grams, STATE.display_unit)}</td>
                <td class="td-mac">${item.protein}g</td>
                <td class="td-mac">${item.carbs}g</td>
                <td class="td-mac">${item.fat}g</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="border-top:2px solid var(--border)">
              <td style="font-weight:700;padding-top:.65rem">Total</td>
              <td></td>
              <td style="font-weight:700;color:var(--terra)">${meal.totals.protein.toFixed(1)}g</td>
              <td style="font-weight:700;color:var(--sage)">${meal.totals.carbs.toFixed(1)}g</td>
              <td style="font-weight:700;color:var(--gold-dk)">${meal.totals.fat.toFixed(1)}g</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `).join('');

  area.innerHTML = html;
  // Auto-open first card
  const first = area.querySelector('.meal-card');
  if (first) first.classList.add('open');
}

function toggleMeal(id) {
  document.getElementById(id)?.classList.toggle('open');
}
window.toggleMeal = toggleMeal;

function refreshAmounts() {
  document.querySelectorAll('[data-amt-cell]').forEach(el => {
    const g = parseFloat(el.dataset.grams);
    el.textContent = renderAmt(g, STATE.display_unit);
  });
  document.querySelectorAll('[data-lib-amt]').forEach(el => {
    const g = parseFloat(el.dataset.libAmt);
    el.textContent = renderAmt(g, STATE.display_unit);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   §12  FOOD LIBRARY
   ═══════════════════════════════════════════════════════════════════ */

const CAT_COLOR = { protein:'#c0614a', carbs:'#5a8a6a', fats:'#d4a853', veggies:'#5a7a5a', fruit:'#c0614a' };

function renderFoodLib(filter = STATE.lib_filter, query = '') {
  let foods = FOODS_DB;
  if (filter !== 'all') foods = foods.filter(f => f.category === filter);
  if (query) foods = foods.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || f.description.toLowerCase().includes(query.toLowerCase()));

  const grid = document.getElementById('foodLibGrid');
  if (!foods.length) { grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>No results.</p></div>`; return; }

  grid.innerHTML = foods.map(food => {
    const m = scaleMacros(food, food.serving_size_g);
    return `
      <div class="fl-card" style="--cat-color:${CAT_COLOR[food.category]||'#d4a853'}"
           onclick="openFoodModal('${food.id}')">
        <div class="fl-header">
          <span class="fl-emoji">${food.emoji}</span>
          <span class="fl-cat-tag">${food.category}</span>
        </div>
        <div class="fl-name">${food.name}</div>
        <div class="fl-desc">${food.description}</div>
        <div class="fl-macros">
          <span class="mp mp-kcal">${m.cal} kcal</span>
          <span class="mp mp-p">P ${m.protein}g</span>
          <span class="mp mp-c">C ${m.carbs}g</span>
          <span class="mp mp-f">F ${m.fat}g</span>
        </div>
        <div class="fl-measure">
          <span data-lib-amt="${food.serving_size_g}">${renderAmt(food.serving_size_g, STATE.display_unit)}</span>
          <small style="color:var(--ink-muted)">per ${food.serving_label}</small>
        </div>
      </div>
    `;
  }).join('');
}

function openFoodModal(foodId) {
  const food = FOODS_DB.find(f => f.id === foodId);
  if (!food) return;

  let unit = 'g';
  const MODAL_UNITS = ['g','oz','cups','ml','lbs'];
  const bg = document.getElementById('modalBg');
  const body = document.getElementById('modalBody');

  const renderModalAmt = u => {
    const v = convertUnit(food.serving_size_g, 'g', u);
    return `${fmtAmt(v)} ${u}`;
  };

  const m = scaleMacros(food, food.serving_size_g);

  body.innerHTML = `
    <div class="mfd-header">
      <span class="mfd-emoji">${food.emoji}</span>
      <div>
        <div class="mfd-name">${food.name}</div>
        <div class="mfd-desc">${food.description}</div>
      </div>
    </div>

    <div class="mfd-unit-section">
      <div class="mfd-unit-label">Per serving (${food.serving_label})</div>
      <div class="mfd-unit-bar">
        ${MODAL_UNITS.map(u => `<button class="mfd-unit-btn ${u==='g'?'active':''}" data-u="${u}">${u}</button>`).join('')}
      </div>
      <div class="mfd-amount" id="mfdAmt">${renderModalAmt('g')}</div>
    </div>

    <div class="mfd-macro-grid">
      <div class="mfd-macro-item"><div class="mfd-macro-name">Calories</div><div class="mfd-macro-val">${m.cal}<small>kcal</small></div></div>
      <div class="mfd-macro-item"><div class="mfd-macro-name">Protein</div><div class="mfd-macro-val">${m.protein}<small>g</small></div></div>
      <div class="mfd-macro-item"><div class="mfd-macro-name">Carbs</div><div class="mfd-macro-val">${m.carbs}<small>g</small></div></div>
      <div class="mfd-macro-item"><div class="mfd-macro-name">Fat</div><div class="mfd-macro-val">${m.fat}<small>g</small></div></div>
    </div>

    <div class="mfd-per100">Per 100g: ${food.cal_per_100g} kcal · P ${food.protein_g}g · C ${food.carbs_g}g · F ${food.fat_g}g</div>
  `;

  body.querySelectorAll('.mfd-unit-btn').forEach(b => {
    b.addEventListener('click', () => {
      body.querySelectorAll('.mfd-unit-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      unit = b.dataset.u;
      document.getElementById('mfdAmt').textContent = renderModalAmt(unit);
    });
  });

  bg.style.display = 'flex';
}
window.openFoodModal = openFoodModal;

/* ═══════════════════════════════════════════════════════════════════
   §13  GROCERY LIST
   ═══════════════════════════════════════════════════════════════════ */

const G_CAT_ICONS  = { protein:'🍗', carbs:'🌾', veggies:'🥦', fruit:'🍓', fats:'🥑' };
const G_CAT_LABELS = { protein:'Proteins', carbs:'Carbs & Grains', veggies:'Vegetables', fruit:'Fruit', fats:'Fats & Oils' };
const G_CAT_ORDER  = ['protein','carbs','veggies','fruit','fats'];

function renderGrocery() {
  const body = document.getElementById('groceryBody');

  if (!STATE.plan) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon">🛒</div><p>Generate a meal plan first.</p><button class="btn-gold" onclick="switchView('onboarding')">Go to Setup</button></div>`;
    return;
  }

  const items = STATE.plan.grocery_list.map(item => ({
    ...item,
    checked: !!STATE.grocery_checked[item.food_id],
  }));

  document.getElementById('grocerySub').textContent = `${items.length} items · weekly total`;

  const grouped = {};
  items.forEach(i => { (grouped[i.category] = grouped[i.category] || []).push(i); });

  body.innerHTML = G_CAT_ORDER.filter(c => grouped[c]).map(cat => `
    <div class="g-section">
      <div class="g-section-hdr">
        <span class="g-section-icon">${G_CAT_ICONS[cat]}</span>
        <span class="g-section-name">${G_CAT_LABELS[cat]}</span>
        <span class="g-section-ct">${grouped[cat].length}</span>
      </div>
      ${grouped[cat].map(item => `
        <div class="g-item ${item.checked ? 'checked' : ''}" data-fid="${item.food_id}" onclick="toggleGrocery('${item.food_id}')">
          <div class="g-chk"></div>
          <div class="g-info">
            <div class="g-name">${item.emoji} ${item.name}</div>
            <div class="g-amt">~${fmtAmt(item.total_grams)}g / ${fmtAmt(convertUnit(item.total_grams,'g','oz'))} oz weekly</div>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');

  updateGroceryProgress();
}

function toggleGrocery(foodId) {
  STATE.grocery_checked[foodId] = !STATE.grocery_checked[foodId];
  const el = document.querySelector(`.g-item[data-fid="${foodId}"]`);
  if (el) el.classList.toggle('checked', STATE.grocery_checked[foodId]);
  db.saveChecked(STATE.grocery_checked);
  updateGroceryProgress();
}
window.toggleGrocery = toggleGrocery;

function updateGroceryProgress() {
  if (!STATE.plan) return;
  const total   = STATE.plan.grocery_list.length;
  const checked = Object.values(STATE.grocery_checked).filter(Boolean).length;
  const pct     = total > 0 ? (checked / total * 100) : 0;
  document.getElementById('gpFill').style.width = `${pct}%`;
  document.getElementById('gpText').textContent  = `${checked} / ${total} items`;
}

/* ═══════════════════════════════════════════════════════════════════
   §14  SOCIAL FEED
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Build the HTML for a single post card.
 * Handles types: 'post' | 'recipe' | 'promote'
 */
function buildPostCard(post) {
  const user = MOCK_USERS.find(u => u.id === post.user_id) || { username:'unknown', avatar_initial:'?', avatar_color:'#888' };

  // Type badge
  const badgeMap = { post:'badge-post', recipe:'badge-recipe', promote:'badge-promote' };
  const labelMap = { post:'Meal Post', recipe:'Recipe', promote:'🔖 Promoted' };

  // Image area
  let imageHTML = '';
  if (post.image_url) {
    imageHTML = `<img src="${post.image_url}" alt="Food photo" class="post-image" loading="lazy" onerror="this.parentElement.innerHTML='<div class=post-img-placeholder style=background:${encodeURIComponent(post.image_gradient)}>${post.image_emoji}</div>'" />`;
  } else if (post.image_gradient) {
    imageHTML = `<div class="post-img-placeholder" style="background:${post.image_gradient}">${post.image_emoji}</div>`;
  }

  // Recipe section
  let recipeHTML = '';
  if (post.type === 'recipe') {
    recipeHTML = `
      <div class="recipe-details" id="rd-${post.id}">
        <button class="recipe-toggle" onclick="toggleRecipe('${post.id}')">
          📋 View Full Recipe
          <span class="rtgl-icon">▾</span>
        </button>
        <div class="recipe-body">
          <div class="recipe-section-title">Ingredients</div>
          <ul class="recipe-list">
            ${(post.recipe_ingredients || []).map(i => `<li>${i}</li>`).join('')}
          </ul>
          <div class="recipe-section-title">Method</div>
          <ol class="recipe-list">
            ${(post.recipe_steps || []).map((s,n) => `<li>${n+1}. ${s}</li>`).join('')}
          </ol>
        </div>
      </div>
    `;
  }

  // Promote biz card
  let promoteHTML = '';
  if (post.type === 'promote' && post.business_name) {
    promoteHTML = `
      <div class="promote-biz">
        <div>
          <div class="promote-biz-name">${post.business_name}</div>
          <div class="promote-biz-desc">${post.business_desc || ''}</div>
        </div>
        ${post.promo_code ? `<div class="promo-code">${post.promo_code}</div>` : ''}
      </div>
    `;
  }

  // Tags
  const tagsHTML = (post.tags || []).length
    ? `<div class="post-tags">${post.tags.map(t => `<span class="ptag ${post.type==='promote'?'ptag-gold':''}">${t}</span>`).join('')}</div>`
    : '';

  return `
    <article class="post-card ${post.type}" data-post-id="${post.id}">

      <!-- Header -->
      <div class="post-header">
        <div class="post-avatar" style="background:${user.avatar_color}22;color:${user.avatar_color};border-color:${user.avatar_color}44">
          ${user.avatar_initial}
        </div>
        <div class="post-meta">
          <span class="post-username">@${user.username}</span>
          <span class="post-time">${post.created_at}</span>
        </div>
        <span class="post-type-badge ${badgeMap[post.type]}">${labelMap[post.type]}</span>
      </div>

      <!-- Image -->
      ${imageHTML}

      <!-- Content -->
      <div class="post-content">
        ${post.type === 'recipe' ? `<strong>${post.recipe_title}</strong>` : ''}
        ${post.content}
      </div>

      <!-- Recipe details -->
      ${recipeHTML}

      <!-- Promo -->
      ${promoteHTML}

      <!-- Tags -->
      ${tagsHTML}

      <!-- Actions -->
      <div class="post-actions">
        <button class="pa-btn ${post.is_liked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
          <svg viewBox="0 0 24 24" fill="${post.is_liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          <span id="likes-${post.id}">${post.likes_count}</span>
        </button>
        <button class="pa-btn" onclick="openComments('${post.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <span>${post.comments_count}</span>
        </button>
        <div class="pa-spacer"></div>
        <button class="pa-btn ${post.is_saved ? 'saved' : ''}" onclick="toggleSave('${post.id}')">
          <svg viewBox="0 0 24 24" fill="${post.is_saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          ${post.is_saved ? 'Saved' : 'Save'}
        </button>
      </div>

    </article>
  `;
}

function renderFeed(filter = STATE.feed_filter) {
  const feed = document.getElementById('socialFeed');
  let posts  = STATE.posts;
  if (filter !== 'all') posts = posts.filter(p => p.type === filter);

  if (!posts.length) {
    feed.innerHTML = `<div class="empty-state"><div class="empty-icon">🌱</div><p>No posts yet. Be the first!</p></div>`;
    return;
  }

  feed.innerHTML = posts.map(buildPostCard).join('');
}

function toggleLike(postId) {
  const post = STATE.posts.find(p => p.id === postId);
  if (!post) return;
  post.is_liked = !post.is_liked;
  post.likes_count += post.is_liked ? 1 : -1;

  // Update DOM without full re-render
  const card = document.querySelector(`[data-post-id="${postId}"]`);
  if (card) {
    const btn = card.querySelector('.pa-btn');
    btn.classList.toggle('liked', post.is_liked);
    btn.querySelector('svg').setAttribute('fill', post.is_liked ? 'currentColor' : 'none');
    document.getElementById(`likes-${postId}`).textContent = post.likes_count;
  }
}
window.toggleLike = toggleLike;

function toggleSave(postId) {
  const post = STATE.posts.find(p => p.id === postId);
  if (!post) return;
  post.is_saved = !post.is_saved;
  const card = document.querySelector(`[data-post-id="${postId}"]`);
  if (card) {
    const btn = card.querySelectorAll('.pa-btn');
    const saveBtn = btn[btn.length - 1];
    saveBtn.classList.toggle('saved', post.is_saved);
    saveBtn.querySelector('svg').setAttribute('fill', post.is_saved ? 'currentColor' : 'none');
    saveBtn.childNodes[saveBtn.childNodes.length - 1].textContent = post.is_saved ? 'Saved' : 'Save';
  }
  toast(post.is_saved ? '🔖 Saved to collection' : 'Removed from saved');
}
window.toggleSave = toggleSave;

function toggleRecipe(postId) {
  const el = document.getElementById(`rd-${postId}`);
  if (el) el.classList.toggle('open');
}
window.toggleRecipe = toggleRecipe;

/* ─── Comments Drawer ────────────────────────────────────────────── */

function openComments(postId) {
  const post  = STATE.posts.find(p => p.id === postId);
  if (!post) return;
  STATE.active_post_id = postId;

  document.getElementById('drawerTitle').textContent = `Comments (${post.comments.length})`;
  renderComments(post);

  document.getElementById('drawerBg').style.display = 'flex';
}
window.openComments = openComments;

function renderComments(post) {
  const container = document.getElementById('drawerComments');
  if (!post.comments.length) {
    container.innerHTML = `<p style="color:var(--ink-muted);font-size:.85rem;padding:.5rem 0">No comments yet. Start the conversation!</p>`;
    return;
  }
  container.innerHTML = post.comments.map(c => {
    const u = MOCK_USERS.find(x => x.id === c.user_id) || { username:'someone', avatar_initial:'?', avatar_color:'#888' };
    return `
      <div class="dc-item">
        <div class="dc-avatar" style="background:${u.avatar_color}22;color:${u.avatar_color}">${u.avatar_initial}</div>
        <div class="dc-bubble">
          <div class="dc-uname">@${u.username} · <span style="font-weight:400;color:var(--ink-muted)">${c.created_at}</span></div>
          <div class="dc-text">${c.text}</div>
        </div>
      </div>
    `;
  }).join('');
}

function submitComment() {
  const input = document.getElementById('drawerInput');
  const text  = input.value.trim();
  if (!text) return;

  const post = STATE.posts.find(p => p.id === STATE.active_post_id);
  if (!post) return;

  const userName = STATE.profile.name || 'You';
  const newComment = {
    id: `c-${Date.now()}`,
    user_id: 'me',
    text,
    created_at: 'just now',
  };

  // Inject a virtual user entry for rendering
  if (!MOCK_USERS.find(u => u.id === 'me')) {
    MOCK_USERS.push({
      id: 'me', username: userName.toLowerCase().replace(/\s/g,'_'),
      avatar_initial: userName[0]?.toUpperCase() || 'M',
      avatar_color: '#d4a853', posts_count: 1,
    });
  }

  post.comments.push(newComment);
  post.comments_count++;
  input.value = '';

  document.getElementById('drawerTitle').textContent = `Comments (${post.comments.length})`;
  renderComments(post);

  // Scroll to bottom
  const dc = document.getElementById('drawerComments');
  dc.scrollTop = dc.scrollHeight;

  // Update count in card
  const card = document.querySelector(`[data-post-id="${STATE.active_post_id}"]`);
  if (card) {
    const btns = card.querySelectorAll('.pa-btn');
    if (btns[1]) {
      const span = btns[1].querySelector('span');
      if (span) span.textContent = post.comments_count;
    }
  }
}

/* ─── Composer / New Post ─────────────────────────────────────────── */

function initComposer() {
  // Type selector
  document.querySelectorAll('.ctype-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ctype-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.post_type = btn.dataset.type;
      document.getElementById('recipeExtra').style.display  = STATE.post_type === 'recipe'  ? 'flex' : 'none';
      document.getElementById('promoteExtra').style.display = STATE.post_type === 'promote' ? 'flex' : 'none';
    });
  });

  // Submit
  document.getElementById('composerSubmit').addEventListener('click', publishPost);
}

function publishPost() {
  const content = document.getElementById('composerInput').value.trim();
  if (!content) { toast('Write something first!', 'error'); return; }

  const userName   = STATE.profile.name || 'You';
  const imgUrl     = document.getElementById('composerImgInput').value.trim();
  const type       = STATE.post_type;

  // Compose the virtual post object (mirrors Supabase `posts` shape)
  const newPost = {
    id:         `p-${Date.now()}`,
    user_id:    'me',
    type,
    content,
    image_url:  imgUrl || null,
    image_gradient: POST_GRADIENTS[Math.floor(Math.random() * POST_GRADIENTS.length)],
    image_emoji:'🍽️',
    tags:       [],
    likes_count:  0,
    comments_count: 0,
    comments:   [],
    is_liked:   false,
    is_saved:   false,
    created_at: 'just now',
  };

  if (type === 'recipe') {
    newPost.recipe_title       = document.getElementById('recipeTitle').value.trim()        || 'My Recipe';
    newPost.recipe_ingredients = document.getElementById('recipeIngredients').value.trim().split('\n').filter(Boolean);
    newPost.recipe_steps       = document.getElementById('recipeSteps').value.trim().split('\n').filter(Boolean);
  }

  if (type === 'promote') {
    newPost.business_name = document.getElementById('promoBusiness').value.trim();
    newPost.business_desc = '';
    newPost.promo_code    = document.getElementById('promoCode').value.trim();
  }

  // Ensure virtual user exists
  if (!MOCK_USERS.find(u => u.id === 'me')) {
    MOCK_USERS.push({
      id: 'me', username: userName.toLowerCase().replace(/\s/g,'_'),
      avatar_initial: userName[0]?.toUpperCase() || 'M',
      avatar_color: '#d4a853', posts_count: 1,
    });
  }

  // Prepend to feed
  STATE.posts.unshift(newPost);

  // Clear composer
  document.getElementById('composerInput').value       = '';
  document.getElementById('composerImgInput').value    = '';
  document.getElementById('recipeTitle').value         = '';
  document.getElementById('recipeIngredients').value   = '';
  document.getElementById('recipeSteps').value         = '';
  document.getElementById('promoBusiness').value       = '';
  document.getElementById('promoCode').value           = '';

  toast('✓ Published!', 'ok');
  renderFeed(STATE.feed_filter);

  // Persist posts
  db.savePosts(STATE.posts);
}

/* ─── Community Sidebar Widgets ──────────────────────────────────── */

function renderSidebarWidgets() {
  const tc = document.getElementById('topContributors');
  const sorted = [...MOCK_USERS].sort((a,b) => b.posts_count - a.posts_count).slice(0, 5);
  tc.innerHTML = sorted.map(u => `
    <div class="tc-row">
      <div class="tc-avatar" style="background:${u.avatar_color}22;color:${u.avatar_color}">${u.avatar_initial}</div>
      <div class="tc-info">
        <div class="tc-name">@${u.username}</div>
        <div class="tc-posts">${u.posts_count} posts</div>
      </div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════════════
   §15  THEME TOGGLE
   ═══════════════════════════════════════════════════════════════════ */

function initTheme() {
  const saved = localStorage.getItem('mise2_theme');
  if (saved === 'light') applyTheme('light');
  else applyTheme('dark');

  document.getElementById('themeToggle').addEventListener('click', () => {
    applyTheme(STATE.dark_mode ? 'light' : 'dark');
  });
  document.getElementById('mobileThemeToggle')?.addEventListener('click', () => {
    applyTheme(STATE.dark_mode ? 'light' : 'dark');
  });
}

function applyTheme(mode) {
  STATE.dark_mode = mode === 'dark';
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('mise2_theme', mode);
  // Toggle sun/moon icons
  const moon = document.getElementById('themeIconMoon');
  const sun  = document.getElementById('themeIconSun');
  if (moon && sun) { moon.style.display = mode === 'dark' ? 'block' : 'none'; sun.style.display = mode === 'light' ? 'block' : 'none'; }
}

/* ═══════════════════════════════════════════════════════════════════
   §16  TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════════ */

function toast(msg, type = '', duration = 3200) {
  const wrap  = document.getElementById('toastWrap');
  const el    = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove());
  }, duration);
}

/* ═══════════════════════════════════════════════════════════════════
   §17  GLOBAL EVENT WIRING
   ═══════════════════════════════════════════════════════════════════ */

function initGlobalEvents() {
  // Sidebar & mobile nav
  document.querySelectorAll('.snav-item, .mnav-item').forEach(b => {
    b.addEventListener('click', () => switchView(b.dataset.view));
  });

  // Global unit toggle (plan view)
  document.querySelectorAll('[data-group="global"]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-group="global"]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      STATE.display_unit = b.dataset.unit;
      refreshAmounts();
    });
  });

  // Regen plan
  document.getElementById('regenBtn').addEventListener('click', () => {
    STATE.active_day = 0;
    if (STATE.plan && STATE.targets) {
      STATE.plan = generatePlan({
        targets:        STATE.targets,
        preferredFoods: STATE.preferred_foods,
        mealsPerDay:    STATE.profile.meals_per_day,
        prepDays:       STATE.profile.prep_days,
        dietTags:       STATE.profile.diet_tags,
      });
      renderPlan();
      toast('↺ Plan regenerated!');
    } else {
      switchView('onboarding');
    }
  });

  // Food library filter
  document.querySelectorAll('.lf-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.lf-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      STATE.lib_filter = b.dataset.filter;
      renderFoodLib(b.dataset.filter, document.getElementById('libSearch').value);
    });
  });

  // Food search
  let searchTimer;
  document.getElementById('libSearch').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => renderFoodLib(STATE.lib_filter, e.target.value), 200);
  });

  // Modal close
  document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('modalBg').style.display = 'none';
  });
  document.getElementById('modalBg').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
  });

  // Grocery
  document.getElementById('clearCheckedBtn').addEventListener('click', () => {
    STATE.grocery_checked = {};
    db.saveChecked({});
    renderGrocery();
    toast('Cleared checked items.');
  });
  document.getElementById('printBtn').addEventListener('click', () => window.print());

  // Feed filter
  document.querySelectorAll('.ff-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.ff-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      STATE.feed_filter = b.dataset.filter;
      renderFeed(b.dataset.filter);
    });
  });

  // Comment drawer
  document.getElementById('drawerSubmit').addEventListener('click', submitComment);
  document.getElementById('drawerInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); }
  });

  document.getElementById('drawerBg').addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      e.currentTarget.style.display = 'none';
      STATE.active_post_id = null;
    }
  });

  // ESC closes any overlay
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.getElementById('modalBg').style.display  = 'none';
      document.getElementById('drawerBg').style.display = 'none';
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════
   §18  RESTORE PERSISTED STATE
   ═══════════════════════════════════════════════════════════════════ */

async function restoreState() {
  const { data: profile } = await db.loadProfile();
  const { data: plan }    = await db.loadPlan();
  const savedPosts        = await db.loadPosts();
  STATE.grocery_checked   = await db.loadChecked();

  if (profile) {
    Object.assign(STATE.profile, profile);
    STATE.preferred_foods = profile.preferred_foods || [];
    STATE.custom_foods    = profile.custom_foods    || [];
    updateSidebarProfile();
  }

  if (plan) {
    STATE.plan    = plan;
    STATE.targets = profile?.weight_kg ? calcTargets(STATE.profile) : null;
    toast('Previous plan restored.', 'ok');
  }

  if (savedPosts) STATE.posts = savedPosts;
}

/* ═══════════════════════════════════════════════════════════════════
   §19  BOOT
   ═══════════════════════════════════════════════════════════════════ */

async function boot() {
  // Theme must be first to avoid flash
  initTheme();

  // Restore from localStorage
  await restoreState();

  // Initialize all modules
  initOnboarding();
  initComposer();
  initGlobalEvents();

  console.log(
    '%c🍽 MISE v2 — Ready\n%cState:', 
    'color:#d4a853;font-family:serif;font-size:1.1em;font-weight:bold',
    'color:#7a7368',
    STATE
  );
}

document.addEventListener('DOMContentLoaded', boot);
