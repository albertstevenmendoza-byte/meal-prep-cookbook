/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  COMEMOS — script.js                                            ║
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
  'linear-gradient(135deg, #1a0a04 0%, #4a2010 50%, #2a1008 100%)',  // dark mahogany
  'linear-gradient(135deg, #2a0804 0%, #c04820 50%, #601008 100%)',  // chili red
  'linear-gradient(135deg, #1a0e04 0%, #c07020 50%, #604008 100%)',  // marigold
  'linear-gradient(135deg, #1a0a08 0%, #8a2808 50%, #401008 100%)',  // deep clay
  'linear-gradient(135deg, #081408 0%, #3a7a20 50%, #1a4008 100%)',  // verde
  'linear-gradient(135deg, #180818 0%, #8a2868 50%, #401028 100%)',  // tamarind
  'linear-gradient(135deg, #1a0804 0%, #e06020 50%, #801808 100%)',  // sunset orange
  'linear-gradient(135deg, #100808 0%, #504020 50%, #281808 100%)',  // dark mole
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
    promo_code: 'COMEMOS20',
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
  async saveProfile(p)  { localStorage.setItem('comemos_profile', JSON.stringify(p)); return { data:p }; },
  async loadProfile()   { const r = localStorage.getItem('comemos_profile'); return { data: r ? JSON.parse(r) : null }; },
  async savePlan(plan)  { localStorage.setItem('comemos_plan', JSON.stringify(plan)); return { data:plan }; },
  async loadPlan()      { const r = localStorage.getItem('comemos_plan'); return { data: r ? JSON.parse(r) : null }; },
  async saveChecked(st) { localStorage.setItem('comemos_checked', JSON.stringify(st)); return { data:st }; },
  async loadChecked()   { const r = localStorage.getItem('comemos_checked'); return r ? JSON.parse(r) : {}; },
  async savePosts(ps)   { localStorage.setItem('comemos_posts', JSON.stringify(ps)); return { data:ps }; },
  async loadPosts()     { const r = localStorage.getItem('comemos_posts'); return r ? JSON.parse(r) : null; },
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
  if (id === 'plan') { STATE.plan ? renderPlan() : renderPlanEmptyState(); }
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
  const { name, goal, avatar_url } = STATE.profile;
  const initial = name ? name[0].toUpperCase() : '?';

  // Sidebar avatar: show photo or initial
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const sidebarInitEl = document.getElementById('sidebarAvatarInitial');
  if (sidebarAvatar) {
    if (avatar_url) {
      sidebarInitEl && (sidebarInitEl.style.display = 'none');
      let img = sidebarAvatar.querySelector('img');
      if (!img) { img = document.createElement('img'); sidebarAvatar.appendChild(img); }
      img.src = avatar_url;
      img.alt = name || 'Avatar';
    } else {
      sidebarInitEl && (sidebarInitEl.style.display = '');
      sidebarInitEl && (sidebarInitEl.textContent = initial);
      const img = sidebarAvatar.querySelector('img');
      if (img) img.remove();
    }
  }

  document.getElementById('sidebarUsername').textContent  = STATE.profile.username ? '@' + STATE.profile.username : (name || 'Set up profile');
  document.getElementById('sidebarGoal').textContent      = goal || '—';

  // Composer avatar
  const composerAvatar = document.getElementById('composerAvatar');
  if (composerAvatar) {
    if (avatar_url) {
      composerAvatar.innerHTML = `<img src="${avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" alt="avatar" />`;
    } else {
      composerAvatar.textContent = initial;
    }
  }
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

function renderPlanEmptyState() {
  // Show a friendly prompt when the user lands on Plan before generating
  document.getElementById('planHeading').textContent = 'Your Week';
  document.getElementById('planSub').textContent     = 'Generate a plan to see it here.';
  document.getElementById('mCal').textContent  = '—';
  document.getElementById('mPro').innerHTML   = '—';
  document.getElementById('mCarb').innerHTML  = '—';
  document.getElementById('mFat').innerHTML   = '—';
  document.getElementById('mPrep').textContent = '—';
  document.getElementById('dayStrip').innerHTML  = '';
  document.getElementById('mealsArea').innerHTML = `
    <div class="plan-empty-state">
      <div class="plan-empty-icon">🗓️</div>
      <div class="plan-empty-title">No plan yet</div>
      <p class="plan-empty-sub">Head to Setup, pick your foods and goals, then tap <em>Generate My Meal Plan</em>.</p>
      <button class="btn-gold" onclick="switchView('onboarding')" style="margin-top:.5rem">Go to Setup →</button>
    </div>
  `;
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

  // Image URL toggle — show/hide the URL field on button click
  const imgToggle = document.getElementById('composerImgToggle');
  const imgInput  = document.getElementById('composerImgInput');
  if (imgToggle && imgInput) {
    imgToggle.addEventListener('click', () => {
      const isOpen = imgInput.style.display !== 'none';
      imgInput.style.display = isOpen ? 'none' : 'block';
      imgToggle.classList.toggle('active', !isOpen);
      if (!isOpen) { imgInput.focus(); imgInput.select(); }
    });
  }

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
  const saved = localStorage.getItem('comemos_theme');
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
  localStorage.setItem('comemos_theme', mode);
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
    '%c🍽 COMEMOS — Ready\n%cState:', 
    'color:#d4a853;font-family:serif;font-size:1.1em;font-weight:bold',
    'color:#7a7368',
    STATE
  );
}

// Boot is called once from the unified initialiser below (see end of file)

/* ═══════════════════════════════════════════════════════════════════
   §20  FEED ALGORITHM ENGINE
   ---------------------------------------------------------------
   Simulates ML-driven personalization using micro-behavior signals.
   Supabase future: `feed_events` table + Edge Function for scoring.
   ═══════════════════════════════════════════════════════════════════ */

const AFFINITY = {
  categories: { post: 0, recipe: 0, promote: 0, ad: 0 },
  tags: {},
  totalPauseSeconds: 0,
  lastRescoreAt: 0,
};

/** Score a single post based on accumulated affinity. */
function scorePost(post) {
  let score = 1;
  score += (AFFINITY.categories[post.type] || 0) * 1.8;
  (post.tags || []).forEach(t => { score += (AFFINITY.tags[t] || 0) * 2.2; });
  score += Math.log10(Math.max(1, post.likes_count || 0)) * 0.6;
  if (post.is_liked) score *= 0.4;
  if (post.is_ad)    score *= (ALGO_PREFS.showAds ? 0.35 : 0);
  // Muted keyword filter
  const content = (post.content || '').toLowerCase();
  if (ALGO_PREFS.mutedKeywords.some(kw => content.includes(kw.toLowerCase()))) score = -99;
  // Preferred content boost
  if (ALGO_PREFS.preferredTypes.includes(post.type)) score *= 1.5;
  return Math.max(0, score);
}

/** Re-sort feed posts by affinity score and re-render. */
function reScoreFeed() {
  const now = Date.now();
  if (now - AFFINITY.lastRescoreAt < 8000) return; // debounce
  AFFINITY.lastRescoreAt = now;

  STATE.posts = [...STATE.posts].map(p => ({ ...p, _score: scorePost(p) }))
    .sort((a, b) => b._score - a._score);

  // Inject native ads at fixed positions
  const withAds = injectNativeAds(STATE.posts);
  renderFeedCards(withAds, STATE.feed_filter);

  // Update sidebar score breakdown
  renderFeedScoreBreakdown();

  // Show notice if meaningful personalization exists
  const totalAffinity = Object.values(AFFINITY.categories).reduce((a, b) => a + b, 0)
                      + Object.values(AFFINITY.tags).reduce((a, b) => a + b, 0);
  if (totalAffinity > 3) {
    const notice = document.getElementById('feedRefreshNotice');
    if (notice) notice.style.display = 'flex';
  }
}

function renderFeedScoreBreakdown() {
  const el = document.getElementById('feedScoreBreakdown');
  if (!el) return;
  const cats = Object.entries(AFFINITY.categories).filter(([,v]) => v > 0).sort((a, b) => b[1] - a[1]);
  if (!cats.length) { el.innerHTML = '<p style="font-size:.8rem;color:var(--ink-muted)">Engage with posts to personalize your feed.</p>'; return; }
  const maxVal = Math.max(...cats.map(([,v]) => v), 1);
  el.innerHTML = cats.map(([cat, val]) => `
    <div class="fsb-row">
      <span class="fsb-label">${cat}</span>
      <div class="fsb-bar-wrap"><div class="fsb-bar" style="width:${Math.round(val/maxVal*100)}%"></div></div>
      <span class="fsb-val">${val.toFixed(1)}</span>
    </div>
  `).join('');
}

/** Apply "For You" / "Following" / "Trending" mode to posts. */
function applyFeedMode(posts, mode) {
  if (mode === 'foryou') {
    return [...posts].map(p => ({ ...p, _score: scorePost(p) })).sort((a, b) => b._score - a._score);
  }
  if (mode === 'trending') {
    return [...posts].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
  }
  // "following" — simulate with subset
  const followedIds = ['u1','u2','u3'];
  return posts.filter(p => followedIds.includes(p.user_id));
}

window.dismissFeedNotice = function() {
  const n = document.getElementById('feedRefreshNotice');
  if (n) n.style.display = 'none';
};

/* ═══════════════════════════════════════════════════════════════════
   §21  MICRO-BEHAVIOR OBSERVER (IntersectionObserver)
   ---------------------------------------------------------------
   Tracks how long users view each post. "Pauses" (>2s) boost
   category/tag affinity. Triggers feed re-score after 30s of pauses.
   ═══════════════════════════════════════════════════════════════════ */

const viewStartTimes = {};
let   feedObserver = null;

function recordMicroBehavior(postId, viewMs) {
  const post = STATE.posts.find(p => p.id === postId);
  if (!post || viewMs < 500) return;

  const earnedCoins = viewMs > 5000 ? 2 : viewMs > 2000 ? 1 : 0;
  if (earnedCoins > 0) {
    STATE.wallet.coins += earnedCoins;
    updateCoinDisplay();
  }

  if (viewMs < 2000) return; // not a meaningful pause

  const weight = viewMs > 8000 ? 3 : viewMs > 4000 ? 1.5 : 0.6;
  AFFINITY.categories[post.type] = (AFFINITY.categories[post.type] || 0) + weight;
  (post.tags || []).forEach(tag => {
    AFFINITY.tags[tag] = (AFFINITY.tags[tag] || 0) + weight * 0.8;
  });

  AFFINITY.totalPauseSeconds += viewMs / 1000;

  // Re-score every 25 seconds of meaningful engagement
  if (AFFINITY.totalPauseSeconds >= 25) {
    AFFINITY.totalPauseSeconds = 0;
    reScoreFeed();
  }

  // Transparency mode: update score display on card
  if (ALGO_PREFS.transparencyMode) {
    const el = document.querySelector(`[data-post-id="${postId}"] .post-relevance-score`);
    if (el) el.textContent = `↑ Relevance: ${scorePost(post).toFixed(1)}`;
  }
}

function observeFeedPosts() {
  if (feedObserver) feedObserver.disconnect();

  feedObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const postId = entry.target.dataset?.postId;
      if (!postId) return;
      if (entry.isIntersecting) {
        viewStartTimes[postId] = Date.now();
      } else {
        if (viewStartTimes[postId]) {
          recordMicroBehavior(postId, Date.now() - viewStartTimes[postId]);
          delete viewStartTimes[postId];
        }
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.post-card[data-post-id]').forEach(el => feedObserver.observe(el));
}

/* ═══════════════════════════════════════════════════════════════════
   §22  PRIVATE MESSAGING SYSTEM
   Supabase tables: `conversations`, `messages`, `conversation_members`
   ═══════════════════════════════════════════════════════════════════ */

const CONVERSATIONS = [
  {
    id: 'conv-1', type: 'direct', name: null, participants: ['me','u1'], unread_count: 2,
    last_msg: { sender_id: 'u1', content: 'Just tried your overnight oats recipe!', ts: '5m ago' },
    messages: [
      { id: 'msg-1', sender_id: 'u1', content: 'Hey! Loved your last post 🔥', type: 'text', ts: '1h ago' },
      { id: 'msg-2', sender_id: 'me',  content: 'Thank you so much! It took all Sunday 😅', type: 'text', ts: '58m ago' },
      { id: 'msg-3', sender_id: 'u1', content: 'Worth it. Do you batch the sauce separately?', type: 'text', ts: '55m ago' },
      { id: 'msg-4', sender_id: 'me',  content: 'Yes! Always. Keeps everything fresh longer.', type: 'text', ts: '52m ago' },
      { id: 'msg-5', sender_id: 'u1', content: 'Just tried your overnight oats recipe!', type: 'text', ts: '5m ago' },
    ],
  },
  {
    id: 'conv-2', type: 'group', name: 'Sunday Prep Crew 🥗', participants: ['me','u2','u3','u4'], unread_count: 5,
    last_msg: { sender_id: 'u3', content: 'Who\'s prepping this weekend?', ts: '12m ago' },
    messages: [
      { id: 'mg-1', sender_id: 'u2', content: 'Big batch of quinoa going in the oven now 🌾', type: 'text', ts: '2h ago' },
      { id: 'mg-2', sender_id: 'u4', content: 'Yes!! My lentil curry too', type: 'text', ts: '1h ago' },
      { id: 'mg-3', sender_id: 'u3', content: 'Check this recipe out', type: 'post_share', post_id: 'p3', ts: '40m ago' },
      { id: 'mg-4', sender_id: 'me',  content: 'Omg saving that immediately 🙌', type: 'text', ts: '35m ago' },
      { id: 'mg-5', sender_id: 'u3', content: 'Who\'s prepping this weekend?', type: 'text', ts: '12m ago' },
    ],
  },
  {
    id: 'conv-3', type: 'direct', name: null, participants: ['me','u6'], unread_count: 0,
    last_msg: { sender_id: 'me', content: 'Sounds amazing, I\'ll try it next week!', ts: '1d ago' },
    messages: [
      { id: 'mc-1', sender_id: 'u6', content: 'Want my smoky veggie medley recipe PDF?', type: 'text', ts: '2d ago' },
      { id: 'mc-2', sender_id: 'me',  content: 'Sounds amazing, I\'ll try it next week!', type: 'text', ts: '1d ago' },
    ],
  },
];

let activeConvId = null;

function renderConvList(filter = '') {
  const list = document.getElementById('convList');
  if (!list) return;
  const convs = filter ? CONVERSATIONS.filter(c => {
    const name = getConvDisplayName(c);
    return name.toLowerCase().includes(filter.toLowerCase());
  }) : CONVERSATIONS;

  list.innerHTML = convs.map(c => {
    const u = getConvOtherUser(c);
    const name = getConvDisplayName(c);
    return `
      <div class="conv-item ${c.id === activeConvId ? 'active' : ''}" onclick="openThread('${c.id}')">
        <div class="conv-avatar" style="background:${u.avatar_color}22;color:${u.avatar_color};border:1.5px solid ${u.avatar_color}44">${c.type === 'group' ? '👥' : u.avatar_initial}</div>
        <div class="conv-info">
          <div class="conv-name">${name}</div>
          <div class="conv-preview">${c.last_msg?.content?.substring(0, 40) || ''}…</div>
        </div>
        <div class="conv-meta">
          <span class="conv-time">${c.last_msg?.ts || ''}</span>
          ${c.unread_count > 0 ? `<span class="conv-unread">${c.unread_count}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function getConvDisplayName(conv) {
  if (conv.name) return conv.name;
  const u = getConvOtherUser(conv);
  return `@${u.username}`;
}

function getConvOtherUser(conv) {
  const otherId = conv.participants.find(id => id !== 'me') || conv.participants[0];
  return MOCK_USERS.find(u => u.id === otherId) || { username: 'unknown', avatar_initial: '?', avatar_color: '#888' };
}

function openThread(convId) {
  activeConvId = convId;
  const conv = CONVERSATIONS.find(c => c.id === convId);
  if (!conv) return;

  // Mark as read
  conv.unread_count = 0;
  renderConvList();

  // Update message badge count
  const total = CONVERSATIONS.reduce((s, c) => s + c.unread_count, 0);
  const badge = document.getElementById('msgBadge');
  if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'inline' : 'none'; }

  const panel = document.getElementById('threadPanel');
  if (!panel) return;

  const otherUser  = getConvOtherUser(conv);
  const headerName = conv.name || `@${otherUser.username}`;

  panel.innerHTML = `
    <div class="thread-header">
      <div class="conv-avatar" style="width:34px;height:34px;background:${otherUser.avatar_color}22;color:${otherUser.avatar_color};font-size:.85rem">${conv.type === 'group' ? '👥' : otherUser.avatar_initial}</div>
      <div class="thread-header-info">
        <div class="thread-header-name">${headerName}</div>
        <div class="thread-header-sub">${conv.type === 'group' ? conv.participants.length + ' members' : 'Direct message'}</div>
      </div>
    </div>
    <div class="thread-messages" id="threadMessages"></div>
    <div class="thread-compose">
      <input type="text" id="threadInput" placeholder="Message ${headerName}…" />
      <button class="btn-gold" id="threadSendBtn" style="padding:.6rem 1.1rem;font-size:.85rem">Send</button>
    </div>
  `;

  renderMessages(conv);

  document.getElementById('threadInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendThreadMessage(convId);
  });
  document.getElementById('threadSendBtn').addEventListener('click', () => sendThreadMessage(convId));

  // Mobile: show thread panel
  panel.classList.add('mobile-open');
}
window.openThread = openThread;

function renderMessages(conv) {
  const container = document.getElementById('threadMessages');
  if (!container) return;
  container.innerHTML = conv.messages.map(msg => {
    const isMe = msg.sender_id === 'me';
    const u = isMe
      ? { avatar_initial: STATE.profile.name?.[0]?.toUpperCase() || 'M', avatar_color: '#d4a853' }
      : (MOCK_USERS.find(x => x.id === msg.sender_id) || { avatar_initial: '?', avatar_color: '#888' });

    if (msg.type === 'post_share') {
      const sharedPost = STATE.posts.find(p => p.id === msg.post_id);
      const sharedContent = sharedPost ? sharedPost.content?.substring(0, 60) + '…' : 'Shared post';
      return `
        <div class="msg-row ${isMe ? 'me' : 'them'}">
          <div class="msg-avatar" style="background:${u.avatar_color}22;color:${u.avatar_color}">${u.avatar_initial}</div>
          <div class="msg-post-share">
            <div class="mps-type">📸 Shared Post</div>
            <div class="mps-title">${sharedContent}</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="msg-row ${isMe ? 'me' : 'them'}">
        ${!isMe ? `<div class="msg-avatar" style="background:${u.avatar_color}22;color:${u.avatar_color}">${u.avatar_initial}</div>` : ''}
        <div class="msg-bubble">${msg.content}</div>
        ${isMe ? `<div class="msg-avatar" style="background:${u.avatar_color}22;color:${u.avatar_color}">${u.avatar_initial}</div>` : ''}
      </div>
    `;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

function sendThreadMessage(convId) {
  const input = document.getElementById('threadInput');
  const text = input?.value.trim();
  if (!text) return;

  const conv = CONVERSATIONS.find(c => c.id === convId);
  if (!conv) return;

  conv.messages.push({ id: `m-${Date.now()}`, sender_id: 'me', content: text, type: 'text', ts: 'just now' });
  conv.last_msg = { sender_id: 'me', content: text, ts: 'just now' };
  if (input) input.value = '';

  renderMessages(conv);
  renderConvList();
}

function sharePostToDM(postId) {
  const bg = document.getElementById('dmShareBg');
  const convs = document.getElementById('dmShareConvs');
  if (!bg || !convs) return;

  convs.innerHTML = CONVERSATIONS.map(c => {
    const u = getConvOtherUser(c);
    return `
      <div class="dm-share-conv" onclick="sendPostToDM('${postId}','${c.id}')">
        <div class="conv-avatar" style="width:34px;height:34px;background:${u.avatar_color}22;color:${u.avatar_color};font-size:.85rem">${c.type === 'group' ? '👥' : u.avatar_initial}</div>
        <span style="font-weight:600;font-size:.88rem">${getConvDisplayName(c)}</span>
      </div>
    `;
  }).join('');

  bg.style.display = 'flex';
}
window.sharePostToDM = sharePostToDM;

function sendPostToDM(postId, convId) {
  const conv = CONVERSATIONS.find(c => c.id === convId);
  if (!conv) return;
  conv.messages.push({ id: `ms-${Date.now()}`, sender_id: 'me', content: '', type: 'post_share', post_id: postId, ts: 'just now' });
  conv.last_msg = { sender_id: 'me', content: 'Shared a post', ts: 'just now' };
  document.getElementById('dmShareBg').style.display = 'none';
  toast('✓ Post shared to messages', 'ok');
}
window.sendPostToDM = sendPostToDM;

/* ═══════════════════════════════════════════════════════════════════
   §23  NATIVE ADVERTISING ENGINE
   ---------------------------------------------------------------
   Ads are styled identically to organic posts but carry a small
   "Sponsored" label. Users can opt out via algo controls.
   Supabase table: `ad_impressions` { id, ad_id, user_id, ts, action }
   ═══════════════════════════════════════════════════════════════════ */

const NATIVE_ADS = [
  {
    id: 'ad-1', is_ad: true, type: 'ad', user_id: 'ad-brand-1',
    advertiser: 'MealKitPro', ad_avatar_initial: 'M', ad_avatar_color: '#5a8a6a',
    content: 'Stop spending your whole Sunday cooking. MealKitPro delivers pre-portioned, macro-labeled ingredients to your door every Friday. Ready in under 20 minutes — with full macro tracking included.',
    image_gradient: 'linear-gradient(135deg, #1a0e04 0%, #c07020 100%)',
    image_emoji: '🥡', tags: ['#sponsored','#mealkits'],
    cta_text: 'Get 30% Off First Box', cta_url: '#',
    why_factors: [{ label: 'You engage with meal prep content', pct: 90 }, { label: 'Location: meal kit delivery area', pct: 70 }, { label: 'Interest: high-protein', pct: 60 }],
    likes_count: 0, comments_count: 0, is_liked: false, is_saved: false, created_at: 'Sponsored', comments: [],
  },
  {
    id: 'ad-2', is_ad: true, type: 'ad', user_id: 'ad-brand-2',
    advertiser: 'MacroScale Pro', ad_avatar_initial: 'S', ad_avatar_color: '#d4a853',
    content: 'The only kitchen scale built for serious meal preppers. Wi-Fi connected, syncs directly to your nutrition app, and tracks 47 macronutrients automatically. Zero manual entry.',
    image_gradient: 'linear-gradient(135deg, #2a0804 0%, #c04820 100%)',
    image_emoji: '⚖️', tags: ['#sponsored','#kitchentools'],
    cta_text: 'Shop MacroScale Pro', cta_url: '#',
    why_factors: [{ label: 'You track macros and calories', pct: 95 }, { label: 'Interest: fitness equipment', pct: 55 }],
    likes_count: 0, comments_count: 0, is_liked: false, is_saved: false, created_at: 'Sponsored', comments: [],
  },
];

let adInjectionIndex = 0;

/** Inject native ads at regular intervals in the post list. */
function injectNativeAds(posts) {
  if (!ALGO_PREFS.showAds) return posts;
  const result = [...posts];
  const adStep = 4; // every 4 organic posts
  let insertAt = adStep;
  let adIdx = 0;

  while (insertAt < result.length && adIdx < NATIVE_ADS.length) {
    result.splice(insertAt, 0, NATIVE_ADS[adIdx]);
    insertAt += adStep + 1;
    adIdx++;
  }
  return result;
}

function buildAdCard(ad) {
  const badgeSvg = `<span class="ad-label">Sponsored</span>`;
  return `
    <article class="post-card native-ad" data-post-id="${ad.id}">
      <div class="post-header">
        <div class="post-avatar" style="background:#88882222;color:#888;font-size:.85rem">${ad.ad_avatar_initial}</div>
        <div class="post-meta">
          <span class="post-username">${ad.advertiser}</span>
          <span class="post-time">${ad.created_at}</span>
        </div>
        ${badgeSvg}
        <button class="pa-btn" style="margin-left:.25rem" onclick="showWhyShown('${ad.id}')" title="Why am I seeing this?">ℹ️</button>
      </div>
      <div class="post-img-placeholder" style="background:${ad.image_gradient}">${ad.image_emoji}</div>
      <div class="post-content">${ad.content}</div>
      <div class="post-tags">${(ad.tags||[]).map(t => `<span class="ptag ptag-gold">${t}</span>`).join('')}</div>
      <div class="ad-cta-strip">
        <span style="font-size:.78rem;color:var(--ink-muted)">Paid partnership</span>
        <button class="ad-cta-btn" onclick="toast('Opening ${ad.advertiser}… (simulated)');">${ad.cta_text}</button>
      </div>
    </article>
  `;
}

/* ═══════════════════════════════════════════════════════════════════
   §24  TIPPING & VIRTUAL ECONOMY
   Supabase tables: `wallets`, `transactions`, `gift_events`
   ═══════════════════════════════════════════════════════════════════ */

// Merge wallet into STATE
STATE.wallet = { coins: 150, lifetime_earned: 0, gifts_sent: 0 };

const GIFT_ITEMS = [
  { id: 'coffee',  emoji: '☕', name: 'Coffee',  cost: 10,  msg: 'Sent a coffee!' },
  { id: 'star',    emoji: '⭐', name: 'Star',    cost: 50,  msg: 'Sent a star!' },
  { id: 'trophy',  emoji: '🏆', name: 'Trophy',  cost: 100, msg: 'Sent a trophy!' },
  { id: 'diamond', emoji: '💎', name: 'Diamond', cost: 250, msg: 'Sent a diamond!' },
];

let giftTargetUserId = null;

function openGiftModal(userId, userName) {
  giftTargetUserId = userId;
  document.getElementById('giftRecipientName').textContent = userName || 'this creator';
  document.getElementById('giftCoinBalance').textContent = STATE.wallet.coins;

  const opts = document.getElementById('giftOptions');
  opts.innerHTML = GIFT_ITEMS.map(g => `
    <div class="gift-item ${STATE.wallet.coins < g.cost ? 'opacity-half' : ''}" onclick="sendGift('${g.id}')">
      <span class="gift-emoji">${g.emoji}</span>
      <span class="gift-name">${g.name}</span>
      <span class="gift-cost">🪙 ${g.cost}</span>
    </div>
  `).join('');

  document.getElementById('giftModalBg').style.display = 'flex';
}
window.openGiftModal = openGiftModal;

window.closeGiftModal = function() { document.getElementById('giftModalBg').style.display = 'none'; };

function sendGift(giftId) {
  const gift = GIFT_ITEMS.find(g => g.id === giftId);
  if (!gift) return;
  if (STATE.wallet.coins < gift.cost) { toast('Not enough coins! Upgrade for more.', 'error'); return; }
  STATE.wallet.coins -= gift.cost;
  STATE.wallet.gifts_sent++;
  updateCoinDisplay();
  document.getElementById('giftCoinBalance').textContent = STATE.wallet.coins;
  document.getElementById('giftModalBg').style.display = 'none';
  toast(`${gift.emoji} ${gift.msg} (${gift.cost} coins)`, 'ok');
}
window.sendGift = sendGift;

function updateCoinDisplay() {
  const els = document.querySelectorAll('#sidebarCoinCount, #mobileCoinCount, #giftCoinBalance');
  els.forEach(el => { if (el) el.textContent = STATE.wallet.coins; });
}

/* ═══════════════════════════════════════════════════════════════════
   §25  SOCIAL COMMERCE
   Supabase tables: `products`, `cart_items`, `orders`, `storefronts`
   ═══════════════════════════════════════════════════════════════════ */

const PRODUCTS = [
  { id: 'pr-1', seller_id: 'u1', name: 'Meal Prep Container Set (7-pack)', desc: 'BPA-free, microwave-safe, divided compartments. Stackable.', price: 34.99, emoji: '🥡', gradient: 'linear-gradient(135deg,#1a0a04,#4a2010)', category: 'containers', rating: 4.8, sales: 234 },
  { id: 'pr-2', seller_id: 'u5', name: 'Weekly Macro Tracker Journal', desc: '52-week planner with macro targets, habit tracking, and weekly reflections.', price: 18.99, emoji: '📔', gradient: 'linear-gradient(135deg,#1a0e04,#c07020)', category: 'tools', rating: 4.7, sales: 156 },
  { id: 'pr-3', seller_id: 'u3', name: 'Protein Power Bundle', desc: '3 lbs whey isolate + shaker + measuring spoons. Best-seller.', price: 59.99, emoji: '💪', gradient: 'linear-gradient(135deg,#2a0804,#c04820)', category: 'supplements', rating: 4.9, sales: 891 },
  { id: 'pr-4', seller_id: 'u6', name: 'Chef\'s Spice Blending Kit', desc: '12 hand-blended spice mixes designed for meal prep. No fillers.', price: 27.50, emoji: '🌶️', gradient: 'linear-gradient(135deg,#180818,#8a2868)', category: 'pantry', rating: 4.6, sales: 412 },
  { id: 'pr-5', seller_id: 'u8', name: '7-Day Meal Kit Box', desc: 'Fresh, chef-prepped ingredients for 7 macro-matched dinners. Free delivery.', price: 89.00, emoji: '📦', gradient: 'linear-gradient(135deg,#1a0804,#e06020)', category: 'meal-kits', rating: 4.5, sales: 1203 },
  { id: 'pr-6', seller_id: 'u2', name: 'Portion Control Plate Set', desc: 'Color-coded sections for protein, carbs, fats, and veg.', price: 22.00, emoji: '🍽️', gradient: 'linear-gradient(135deg,#100808,#504020)', category: 'containers', rating: 4.4, sales: 88 },
];

const CART = { items: {} }; // { product_id: { product, qty } }

let shopFilter = 'all';

function renderProducts(filter = 'all') {
  shopFilter = filter;
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const prods = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  grid.innerHTML = prods.map(p => {
    const inCart = !!CART.items[p.id];
    return `
      <div class="product-card" onclick="openProductModal('${p.id}')">
        <div class="product-image" style="background:${p.gradient}">
          ${p.emoji}
          <span class="product-seller-badge">by @${(MOCK_USERS.find(u => u.id === p.seller_id)||{}).username||'seller'}</span>
        </div>
        <div class="product-body">
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.desc}</div>
          <div class="product-footer">
            <span class="product-price">$${p.price.toFixed(2)}</span>
            <div>
              <div class="product-rating">⭐ ${p.rating} (${p.sales})</div>
              <button class="product-add ${inCart ? 'in-cart' : ''}" onclick="event.stopPropagation();addToCart('${p.id}')">
                ${inCart ? '✓ Added' : '+ Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function addToCart(productId) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;
  if (CART.items[productId]) {
    CART.items[productId].qty++;
  } else {
    CART.items[productId] = { product: prod, qty: 1 };
  }
  renderCart();
  renderProducts(shopFilter);
  toast(`${prod.emoji} Added to cart`, 'ok');

  // Update nav badge
  const badge = document.getElementById('cartNavBadge');
  const total = Object.values(CART.items).reduce((s, x) => s + x.qty, 0);
  if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'inline' : 'none'; }
}
window.addToCart = addToCart;

function removeFromCart(productId) {
  delete CART.items[productId];
  renderCart();
  renderProducts(shopFilter);
  const badge = document.getElementById('cartNavBadge');
  const total = Object.values(CART.items).reduce((s, x) => s + x.qty, 0);
  if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'inline' : 'none'; }
}
window.removeFromCart = removeFromCart;

function renderCart() {
  const itemsEl  = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  const countEl  = document.getElementById('cartCount');
  if (!itemsEl) return;

  const items = Object.values(CART.items);
  if (countEl) countEl.textContent = `(${items.length})`;

  if (!items.length) {
    itemsEl.innerHTML = '<div class="cart-empty-msg">Your cart is empty</div>';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  const subtotal = items.reduce((s, x) => s + x.product.price * x.qty, 0);
  const fee      = subtotal * 0.05;
  const total    = subtotal + fee;

  itemsEl.innerHTML = items.map(({ product: p, qty }) => `
    <div class="cart-item">
      <span class="cart-item-emoji">${p.emoji}</span>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-price">$${(p.price * qty).toFixed(2)} × ${qty}</div>
      </div>
      <button class="cart-item-rm" onclick="removeFromCart('${p.id}')">✕</button>
    </div>
  `).join('');

  if (footerEl) {
    footerEl.style.display = 'block';
    const totalEl = document.getElementById('cartTotal');
    const feeEl   = document.getElementById('cartFee');
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    if (feeEl)   feeEl.textContent   = `$${fee.toFixed(2)}`;
  }
}

function openProductModal(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  const seller = MOCK_USERS.find(u => u.id === p.seller_id) || {};
  const bg = document.getElementById('productModalBg');
  const el = document.getElementById('productModalContent');
  if (!bg || !el) return;

  el.innerHTML = `
    <button class="modal-x" onclick="document.getElementById('productModalBg').style.display='none'">×</button>
    <div style="height:150px;border-radius:var(--r-md);margin-bottom:1.25rem;display:flex;align-items:center;justify-content:center;font-size:3.5rem;background:${p.gradient}">${p.emoji}</div>
    <h3 style="font-family:var(--font-display);font-size:1.35rem;margin-bottom:.35rem">${p.name}</h3>
    <p style="font-size:.84rem;color:var(--ink-muted);margin-bottom:.85rem">Sold by <strong>@${seller.username||'seller'}</strong> · ⭐ ${p.rating} · ${p.sales} sold</p>
    <p style="font-size:.9rem;margin-bottom:1.25rem">${p.desc}</p>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem">
      <span style="font-family:var(--font-display);font-size:2rem;color:var(--gold)">$${p.price.toFixed(2)}</span>
      <button class="btn-gold" style="font-size:.95rem" onclick="addToCart('${p.id}');document.getElementById('productModalBg').style.display='none'">Add to Cart</button>
    </div>
  `;
  bg.style.display = 'flex';
}
window.openProductModal = openProductModal;

/* ═══════════════════════════════════════════════════════════════════
   §26  CREATOR STUDIO
   Revenue: ad revenue share (70% to creator) + tips.
   B2B: anonymized aggregate data for brand partners.
   ═══════════════════════════════════════════════════════════════════ */

const CREATOR_DATA = {
  tier: 'Free',
  total_views: 28_740, followers: 4_821, engagement_rate: 8.4,
  ad_revenue:   87.40,   tip_revenue: 40.00,
  revenue_share: 0.70,
  payout_threshold: 50.00,
  chart_data: [
    { day: 'Mon', views: 320, engagement: 42 },
    { day: 'Tue', views: 510, engagement: 71 },
    { day: 'Wed', views: 290, engagement: 38 },
    { day: 'Thu', views: 780, engagement: 104 },
    { day: 'Fri', views: 1240, engagement: 167 },
    { day: 'Sat', views: 2100, engagement: 283 },
    { day: 'Sun', views: 1890, engagement: 256 },
  ],
};

function renderCreatorDashboard() {
  const cd = CREATOR_DATA;
  const totalEarned = (cd.ad_revenue + cd.tip_revenue) * cd.revenue_share;

  // Tier badge
  const tierBadge = document.getElementById('creatorTierBadge');
  if (tierBadge) tierBadge.textContent = `${cd.tier} Tier`;

  // Stats row
  const statsRow = document.getElementById('creatorStatsRow');
  if (statsRow) {
    const stats = [
      { label: 'Total Earnings',   val: `$${totalEarned.toFixed(2)}`, delta: '+$12.40 this week', gold: true },
      { label: 'Followers',        val: cd.followers.toLocaleString(), delta: '+127 this month' },
      { label: 'Engagement Rate',  val: `${cd.engagement_rate}%`, delta: '↑ 0.8% vs last month' },
      { label: 'Total Views',      val: cd.total_views.toLocaleString(), delta: '+2,840 this week' },
    ];
    statsRow.innerHTML = stats.map(s => `
      <div class="creator-stat-card">
        <div class="creator-stat-label">${s.label}</div>
        <div class="creator-stat-val ${s.gold ? 'gold' : ''}">${s.val}</div>
        <div class="creator-stat-delta">${s.delta}</div>
      </div>
    `).join('');
  }

  // Engagement chart
  renderEngagementChart();

  // Revenue breakdown
  const revEl = document.getElementById('revenueBreakdown');
  if (revEl) {
    revEl.innerHTML = `
      <div class="rev-row"><span class="rev-row-label">Ad revenue (70% share)</span><span class="rev-row-val positive">$${(cd.ad_revenue * cd.revenue_share).toFixed(2)}</span></div>
      <div class="rev-row"><span class="rev-row-label">Ad revenue (platform 30%)</span><span class="rev-row-val" style="color:var(--ink-muted)">$${(cd.ad_revenue * 0.3).toFixed(2)}</span></div>
      <div class="rev-row"><span class="rev-row-label">Tips received</span><span class="rev-row-val positive">$${cd.tip_revenue.toFixed(2)}</span></div>
      <div class="rev-row" style="border-top:2px solid var(--border);margin-top:.25rem;padding-top:.65rem"><span style="font-weight:700">Total payout</span><span class="rev-row-val positive" style="font-size:1.2rem">$${totalEarned.toFixed(2)}</span></div>
    `;
    const noticeEl = document.getElementById('payoutNotice');
    if (noticeEl) {
      if (totalEarned >= cd.payout_threshold) {
        noticeEl.innerHTML = '✓ Payout ready! Next transfer: Monday';
        noticeEl.style.display = 'block';
      } else {
        noticeEl.innerHTML = `Need $${(cd.payout_threshold - totalEarned).toFixed(2)} more to reach payout threshold`;
        noticeEl.style.display = 'block';
      }
    }
  }

  // Top posts table
  const tpEl = document.getElementById('topPostsTable');
  if (tpEl) {
    const topPosts = STATE.posts.filter(p => !p.is_ad).sort((a, b) => (b.likes_count||0) - (a.likes_count||0)).slice(0, 5);
    tpEl.innerHTML = topPosts.map((p, i) => {
      const u = MOCK_USERS.find(x => x.id === p.user_id);
      return `
        <div class="top-posts-row">
          <span class="tp-rank">${i + 1}</span>
          <div class="tp-info"><div class="tp-title">${p.content?.substring(0, 50)}…</div><div class="tp-type">${p.type} · @${u?.username||'unknown'}</div></div>
          <div class="tp-stats"><span>❤️ <strong>${p.likes_count}</strong></span><span>💬 <strong>${p.comments_count}</strong></span></div>
        </div>
      `;
    }).join('');
  }

  // Audience insights
  const audiEl = document.getElementById('audienceGrid');
  if (audiEl) {
    audiEl.innerHTML = `
      <div class="audience-metric">
        <div class="audience-metric-label">Top location</div>
        <div class="audience-metric-val">🇺🇸 US</div>
        <div class="audience-metric-sub">68% of audience</div>
      </div>
      <div class="audience-metric">
        <div class="audience-metric-label">Peak posting time</div>
        <div class="audience-metric-val">6–8pm</div>
        <div class="audience-metric-sub">Fri–Sun highest</div>
      </div>
      <div class="audience-metric" style="grid-column:1/-1">
        <div class="audience-metric-label">Age distribution</div>
        ${[['18–24',22],['25–34',41],['35–44',26],['45+',11]].map(([lbl, pct]) => `
          <div class="audience-bar-row"><span>${lbl}</span><div class="aud-bar-wrap"><div class="aud-bar" style="width:${pct*2}%"></div></div><span>${pct}%</span></div>
        `).join('')}
      </div>
    `;
  }

  // B2B grid
  const b2bEl = document.getElementById('b2bGrid');
  if (b2bEl) {
    const metrics = [
      { label: 'Avg. View Duration',   val: '38s',  sub: '+12% MoM' },
      { label: 'Share Rate',           val: '6.2%', sub: 'Industry avg: 2.1%' },
      { label: 'Save Rate',            val: '11.4%',sub: 'High intent signal' },
      { label: 'Brand Mention Reach',  val: '18.2K',sub: 'Organic amplification' },
      { label: 'Category Dominance',   val: '#mealprep', sub: 'Top tag in your niche' },
      { label: 'Estimated CPM',        val: '$4.80', sub: 'Available for sponsorship' },
    ];
    b2bEl.innerHTML = metrics.map(m => `
      <div class="b2b-metric">
        <div class="b2b-metric-label">${m.label}</div>
        <div class="b2b-metric-val">${m.val}</div>
        <div class="b2b-metric-sub">${m.sub}</div>
      </div>
    `).join('');
  }
}

function renderEngagementChart() {
  const chartEl = document.getElementById('engagementChart');
  if (!chartEl) return;
  const maxViews = Math.max(...CREATOR_DATA.chart_data.map(d => d.views));
  chartEl.innerHTML = CREATOR_DATA.chart_data.map(d => `
    <div class="chart-col">
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height:${Math.round(d.views / maxViews * 100)}%"></div>
      </div>
      <span class="chart-label">${d.day}</span>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════════════
   §27  ALGORITHM TRANSPARENCY & CONTROL
   ═══════════════════════════════════════════════════════════════════ */

const ALGO_PREFS = {
  mutedKeywords:  [],
  preferredTypes: [],
  transparencyMode: false,
  showAds: true,
};

const CONTENT_INTERESTS = [
  { id: 'recipe', label: '📋 Recipes', type: 'recipe' },
  { id: 'post',   label: '📸 Meals',   type: 'post' },
  { id: 'hprot',  label: '💪 Protein', tag: '#highprotein' },
  { id: 'plant',  label: '🌱 Plant',   tag: '#plantbased' },
  { id: 'prep',   label: '📦 Prep',    tag: '#mealprep' },
  { id: 'budget', label: '💰 Budget',  tag: '#budgetmeal' },
];

function openAlgoPanel() {
  renderAlgoPanel();
  document.getElementById('algoPanel').classList.add('open');
  document.getElementById('algoPanelBackdrop').style.display = 'block';
}
function closeAlgoPanel() {
  document.getElementById('algoPanel').classList.remove('open');
  document.getElementById('algoPanelBackdrop').style.display = 'none';
}

function renderAlgoPanel() {
  const grid = document.getElementById('algoInterestGrid');
  if (grid) {
    grid.innerHTML = CONTENT_INTERESTS.map(item => `
      <div class="algo-interest-item ${ALGO_PREFS.preferredTypes.includes(item.id) ? 'on' : ''}"
           onclick="toggleAlgoInterest('${item.id}')">
        ${item.label}
      </div>
    `).join('');
  }

  const chips = document.getElementById('algoMutedChips');
  if (chips) {
    chips.innerHTML = ALGO_PREFS.mutedKeywords.map(kw => `
      <div class="algo-muted-chip">${kw}<button onclick="removeMutedKeyword('${kw}')">✕</button></div>
    `).join('');
  }

  const transTog = document.getElementById('algoTransparencyToggle');
  if (transTog) transTog.checked = ALGO_PREFS.transparencyMode;

  const adTog = document.getElementById('nativeAdToggle');
  if (adTog) adTog.checked = ALGO_PREFS.showAds;
}

window.toggleAlgoInterest = function(id) {
  const idx = ALGO_PREFS.preferredTypes.indexOf(id);
  if (idx > -1) ALGO_PREFS.preferredTypes.splice(idx, 1);
  else ALGO_PREFS.preferredTypes.push(id);
  renderAlgoPanel();
  reScoreFeed();
};

window.removeMutedKeyword = function(kw) {
  ALGO_PREFS.mutedKeywords = ALGO_PREFS.mutedKeywords.filter(x => x !== kw);
  renderAlgoPanel();
  reScoreFeed();
};

function addMutedKeyword() {
  const input = document.getElementById('muteInput');
  const kw = input?.value.trim();
  if (!kw || ALGO_PREFS.mutedKeywords.includes(kw)) return;
  ALGO_PREFS.mutedKeywords.push(kw);
  if (input) input.value = '';
  renderAlgoPanel();
  reScoreFeed();
  toast(`🔇 Muted: "${kw}"`);
}

function resetFeed() {
  Object.keys(AFFINITY.categories).forEach(k => { AFFINITY.categories[k] = 0; });
  AFFINITY.tags = {};
  AFFINITY.totalPauseSeconds = 0;
  ALGO_PREFS.preferredTypes = [];
  ALGO_PREFS.mutedKeywords  = [];
  closeAlgoPanel();
  STATE.posts = [...MOCK_POSTS];
  renderFeed(STATE.feed_filter);
  renderAlgoPanel();
  renderFeedScoreBreakdown();
  const notice = document.getElementById('feedRefreshNotice');
  if (notice) notice.style.display = 'none';
  toast('🔄 Feed reset! Starting fresh.');
}

// "Why am I seeing this?" modal
let whyPostId = null;

window.showWhyShown = function(postId) {
  whyPostId = postId;
  const post = [...STATE.posts, ...NATIVE_ADS].find(p => p.id === postId);
  if (!post) return;

  const bg   = document.getElementById('whyModalBg');
  const body = document.getElementById('whyModalBody');
  if (!bg || !body) return;

  const isAd = post.is_ad;
  const factors = isAd ? (post.why_factors || []) : [
    { label: `Category: ${post.type} content`, pct: Math.min(100, (AFFINITY.categories[post.type]||0) * 20 + 40) },
    { label: `Engagement: ${post.likes_count} likes`, pct: Math.min(100, Math.log10(Math.max(1, post.likes_count||0)) * 30 + 30) },
    ...(post.tags||[]).slice(0,2).map(t => ({ label: `Your interest in ${t}`, pct: Math.min(100, (AFFINITY.tags[t]||0) * 15 + 20) })),
  ];

  body.innerHTML = `
    <p style="font-size:.84rem;color:var(--ink-muted);margin-bottom:1rem">${isAd ? 'This is a paid advertisement.' : 'Comemos ranked this post based on these factors:'}</p>
    ${factors.map(f => `
      <div class="why-factor">
        <span class="why-factor-icon">📊</span>
        <span style="flex:1;font-size:.84rem">${f.label}</span>
        <div class="why-factor-bar-wrap"><div class="why-factor-bar" style="width:${f.pct}%"></div></div>
      </div>
    `).join('')}
  `;

  bg.style.display = 'flex';
};

document.getElementById('whyNotInterested')?.addEventListener('click', () => {
  if (!whyPostId) return;
  const post = STATE.posts.find(p => p.id === whyPostId);
  if (post) {
    AFFINITY.categories[post.type] = Math.max(0, (AFFINITY.categories[post.type]||0) - 1.5);
    (post.tags||[]).forEach(t => { AFFINITY.tags[t] = Math.max(0, (AFFINITY.tags[t]||0) - 1); });
  }
  document.getElementById('whyModalBg').style.display = 'none';
  reScoreFeed();
  toast('👎 Noted — you\'ll see less like this.');
});

document.getElementById('whyMoreLikeThis')?.addEventListener('click', () => {
  if (!whyPostId) return;
  const post = STATE.posts.find(p => p.id === whyPostId);
  if (post) {
    AFFINITY.categories[post.type] = (AFFINITY.categories[post.type]||0) + 2;
    (post.tags||[]).forEach(t => { AFFINITY.tags[t] = (AFFINITY.tags[t]||0) + 1.5; });
  }
  document.getElementById('whyModalBg').style.display = 'none';
  reScoreFeed();
  toast('👍 Got it — showing more like this!');
});

/* ═══════════════════════════════════════════════════════════════════
   §28  SUBSCRIPTION & PREMIUM FEATURES
   ═══════════════════════════════════════════════════════════════════ */

const SUBSCRIPTION_TIERS = [
  {
    id: 'free', name: 'Free', price: 0, desc: 'Get started, no commitment.',
    features: ['Community feed access','5 DMs per day','Basic meal planner','Standard ads in feed','100 coins welcome bonus'],
    cta: 'Current Plan', current: true,
  },
  {
    id: 'pro', name: 'Comemos Pro', price: 8.99, desc: 'The full experience, no ads.',
    features: ['Everything in Free','Ad-free feed','Unlimited DMs & group chats','Advanced food analytics','500 coins / month','Pro badge on profile','Priority feed ranking'],
    cta: 'Upgrade to Pro', featured: true,
  },
  {
    id: 'creator', name: 'Creator', price: 19.99, desc: 'For builders, chefs, and coaches.',
    features: ['Everything in Pro','70% ad revenue share','Live streaming','Native storefront','B2B analytics export','Brand sponsorship marketplace','2,000 coins / month','Verified creator badge'],
    cta: 'Become a Creator',
  },
];

let currentSubscription = 'free';

window.openSubModal = function() {
  const el = document.getElementById('subTiers');
  if (el) {
    el.innerHTML = SUBSCRIPTION_TIERS.map(tier => `
      <div class="sub-tier ${tier.featured ? 'featured' : ''} ${tier.id === currentSubscription ? 'current' : ''}">
        <div class="sub-tier-name">${tier.name} ${tier.featured ? '⭐' : ''}</div>
        <div class="sub-price">${tier.price === 0 ? 'Free' : `$${tier.price.toFixed(2)}`}<small>${tier.price > 0 ? '/mo' : ''}</small></div>
        <div class="sub-desc">${tier.desc}</div>
        <ul class="sub-features">${tier.features.map(f => `<li>${f}</li>`).join('')}</ul>
        <button class="btn-gold sub-cta" ${tier.id === currentSubscription ? 'disabled style="opacity:.5"' : ''} onclick="subscribeTier('${tier.id}')">
          ${tier.id === currentSubscription ? 'Current Plan' : tier.cta}
        </button>
      </div>
    `).join('');
  }
  document.getElementById('subModalBg').style.display = 'flex';
};

window.subscribeTier = function(tierId) {
  if (tierId === 'free') return;
  const tier = SUBSCRIPTION_TIERS.find(t => t.id === tierId);
  if (!tier) return;
  currentSubscription = tierId;
  const tierBadge = document.getElementById('creatorTierBadge');
  if (tierBadge) tierBadge.textContent = `${tier.name} Tier`;
  // Grant coins on upgrade
  if (tierId === 'pro')     STATE.wallet.coins += 500;
  if (tierId === 'creator') STATE.wallet.coins += 2000;
  updateCoinDisplay();
  document.getElementById('subModalBg').style.display = 'none';
  toast(`🌟 Welcome to ${tier.name}! Your perks are now active.`, 'ok');
};

/* ═══════════════════════════════════════════════════════════════════
   §29  LO-FI QUICK CREATE
   ---------------------------------------------------------------
   Pre-built templates for fast, authentic sharing.
   ═══════════════════════════════════════════════════════════════════ */

const QUICK_TEMPLATES = [
  { emoji: '📦', label: 'Just Prepped', text: 'Sunday prep done! Here\'s what I made this week 💪' },
  { emoji: '💪', label: 'Protein Check', text: 'Hitting my protein goals today — here\'s the stack 🍗' },
  { emoji: '🌱', label: 'Plant Power', text: 'Going full plant-based this week. Here\'s my haul 🥗' },
  { emoji: '⏱️', label: 'Quick Meal', text: 'Under 15 minutes and still hitting macros — here\'s how 🔥' },
  { emoji: '💰', label: 'Budget Prep', text: 'This week\'s prep cost me under $40. Here\'s the breakdown 👇' },
  { emoji: '📊', label: 'Macro Flex', text: 'Weekly macros on point! Protein / Carbs / Fat breakdown below 📈' },
];

function renderQuickCreateStrip() {
  const strip = document.getElementById('quickCreateStrip');
  if (!strip) return;
  strip.innerHTML = QUICK_TEMPLATES.map((t, i) => `
    <div class="qc-template" onclick="useQuickTemplate(${i})">
      <span class="qc-emoji">${t.emoji}</span>
      <span class="qc-label">${t.label}</span>
    </div>
  `).join('');
}

window.useQuickTemplate = function(idx) {
  const tmpl = QUICK_TEMPLATES[idx];
  if (!tmpl) return;
  const input = document.getElementById('composerInput');
  if (input) {
    input.value = tmpl.text;
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   §30  MULTI-FORMAT: LIVE STREAMS
   ═══════════════════════════════════════════════════════════════════ */

const LIVE_STREAMS = [
  { id: 'live-1', user_id: 'u6', title: 'Meal prep with me — 3 hours of batch cooking', gradient: 'linear-gradient(135deg,#1a3a20,#3a7a4a)', emoji: '🥦', viewers: 234 },
  { id: 'live-2', user_id: 'u3', title: 'Q&A: How I hit 200g protein every day', gradient: 'linear-gradient(135deg,#180818,#8a2868)', emoji: '💪', viewers: 891 },
];

function renderLiveNowStrip() {
  const strip = document.getElementById('liveNowStrip');
  if (!strip || !LIVE_STREAMS.length) return;
  strip.innerHTML = `<div style="font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--terra);display:flex;align-items:center;gap:.4rem;flex-shrink:0">
    <span class="live-dot" style="background:var(--terra)"></span> Live Now
  </div>` + LIVE_STREAMS.map(s => {
    const u = MOCK_USERS.find(x => x.id === s.user_id) || {};
    return `
      <div class="live-card" onclick="toast('Joining live stream… (requires Creator tier)', 'error')">
        <div class="live-preview" style="background:${s.gradient}">${s.emoji}</div>
        <div class="live-badge"><span class="live-dot"></span>LIVE</div>
        <div class="live-info">
          <div class="live-streamer">@${u.username}</div>
          <div class="live-viewers">👁 ${s.viewers.toLocaleString()}</div>
        </div>
      </div>
    `;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════════════
   §31  UPDATED FEED RENDERER (with ads + micro-behavior hooks)
   ---------------------------------------------------------------
   Replaces the basic renderFeed from §14 with the full version.
   ═══════════════════════════════════════════════════════════════════ */

/** Render the feed, injecting ads and applying mode/filter. */
function renderFeed(filter = STATE.feed_filter, mode = STATE.feed_mode || 'foryou') {
  STATE.feed_filter = filter;
  STATE.feed_mode   = mode;

  let posts = applyFeedMode([...STATE.posts], mode);
  if (filter !== 'all') posts = posts.filter(p => p.type === filter);
  const withAds = injectNativeAds(posts);
  renderFeedCards(withAds, filter);
}

function renderFeedCards(posts, filter) {
  const feed = document.getElementById('socialFeed');
  if (!feed) return;

  if (!posts.length) {
    feed.innerHTML = '<div class="empty-state"><div class="empty-icon">🌱</div><p>No posts yet. Be the first!</p></div>';
    return;
  }

  feed.innerHTML = posts.map(p => p.is_ad ? buildAdCard(p) : buildPostCard(p)).join('');

  // Start micro-behavior observation
  setTimeout(observeFeedPosts, 100);
}

/** Extended post card with gift, share-to-DM, why-shown, and score display. */
function buildPostCard(post) {
  const user = MOCK_USERS.find(u => u.id === post.user_id) || { username: 'unknown', avatar_initial: '?', avatar_color: '#888' };
  const badgeMap = { post: 'badge-post', recipe: 'badge-recipe', promote: 'badge-promote' };
  const labelMap = { post: 'Meal Post', recipe: 'Recipe', promote: '🔖 Promoted' };

  let imageHTML = '';
  if (post.image_url) {
    imageHTML = `<img src="${post.image_url}" alt="Food photo" class="post-image" loading="lazy" onerror="this.style.display='none'" />`;
  } else if (post.image_gradient) {
    imageHTML = `<div class="post-img-placeholder" style="background:${post.image_gradient}">${post.image_emoji||'🍽️'}</div>`;
  }

  let recipeHTML = '';
  if (post.type === 'recipe') {
    recipeHTML = `<div class="recipe-details" id="rd-${post.id}"><button class="recipe-toggle" onclick="toggleRecipe('${post.id}')">📋 View Full Recipe<span class="rtgl-icon"> ▾</span></button><div class="recipe-body"><div class="recipe-section-title">Ingredients</div><ul class="recipe-list">${(post.recipe_ingredients||[]).map(i=>`<li>${i}</li>`).join('')}</ul><div class="recipe-section-title">Method</div><ol class="recipe-list">${(post.recipe_steps||[]).map((s,n)=>`<li>${n+1}. ${s}</li>`).join('')}</ol></div></div>`;
  }

  let promoteHTML = '';
  if (post.type === 'promote' && post.business_name) {
    promoteHTML = `<div class="promote-biz"><div><div class="promote-biz-name">${post.business_name}</div><div class="promote-biz-desc">${post.business_desc||''}</div></div>${post.promo_code?`<div class="promo-code">${post.promo_code}</div>`:''}</div>`;
  }

  const tagsHTML = (post.tags||[]).length ? `<div class="post-tags">${post.tags.map(t=>`<span class="ptag ${post.type==='promote'?'ptag-gold':''}">${t}</span>`).join('')}</div>` : '';

  const scoreHTML = ALGO_PREFS.transparencyMode
    ? `<div class="post-relevance-score">Relevance: ${scorePost(post).toFixed(1)}</div>` : '';

  const recipientName = user.username;

  return `
    <article class="post-card ${post.type}" data-post-id="${post.id}">
      <div class="post-header">
        <div class="post-avatar" style="background:${user.avatar_color}22;color:${user.avatar_color};border-color:${user.avatar_color}44">${user.avatar_initial}</div>
        <div class="post-meta"><span class="post-username">@${user.username}</span><span class="post-time">${post.created_at}</span></div>
        <span class="post-type-badge ${badgeMap[post.type]||''}">${labelMap[post.type]||post.type}</span>
      </div>
      ${imageHTML}
      ${scoreHTML}
      <div class="post-content">${post.type==='recipe'?`<strong>${post.recipe_title}</strong>`:''}${post.content}</div>
      ${recipeHTML}${promoteHTML}${tagsHTML}
      <div class="post-actions">
        <button class="pa-btn ${post.is_liked?'liked':''}" onclick="toggleLike('${post.id}')">
          <svg viewBox="0 0 24 24" fill="${post.is_liked?'currentColor':'none'}" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          <span id="likes-${post.id}">${post.likes_count}</span>
        </button>
        <button class="pa-btn" onclick="openComments('${post.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <span>${post.comments_count}</span>
        </button>
        <button class="pa-btn" onclick="openGiftModal('${post.user_id}','${recipientName}')" title="Send gift">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><rect x="3" y="8" width="18" height="14" rx="2"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M12 8H7.5a2.5 2.5 0 010-5C11 3 12 8 12 8z"/><path d="M12 8h4.5a2.5 2.5 0 000-5C13 3 12 8 12 8z"/></svg>
          Gift
        </button>
        <button class="pa-btn" onclick="sharePostToDM('${post.id}')" title="Share to DM">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Send
        </button>
        <div class="pa-spacer"></div>
        <button class="pa-btn ${post.is_saved?'saved':''}" onclick="toggleSave('${post.id}')">
          <svg viewBox="0 0 24 24" fill="${post.is_saved?'currentColor':'none'}" stroke="currentColor" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          ${post.is_saved?'Saved':'Save'}
        </button>
        <div class="pa-more-menu">
          <button class="pa-btn" onclick="toggleMoreMenu('${post.id}')">⋯</button>
          <div class="pa-more-dropdown" id="more-${post.id}">
            <div class="pa-dropdown-item" onclick="showWhyShown('${post.id}');closeMoreMenus()">ℹ️ Why am I seeing this?</div>
            <div class="pa-dropdown-item" onclick="notInterested('${post.id}')">👎 Not interested</div>
            <div class="pa-dropdown-item" onclick="moreLikeThis('${post.id}')">👍 More like this</div>
          </div>
        </div>
      </div>
    </article>
  `;
}

window.toggleMoreMenu = function(postId) {
  const menu = document.getElementById(`more-${postId}`);
  if (!menu) return;
  const wasOpen = menu.classList.contains('open');
  closeMoreMenus();
  if (!wasOpen) menu.classList.add('open');
};

window.closeMoreMenus = function() {
  document.querySelectorAll('.pa-more-dropdown.open').forEach(m => m.classList.remove('open'));
};

window.notInterested = function(postId) {
  const post = STATE.posts.find(p => p.id === postId);
  if (post) {
    AFFINITY.categories[post.type] = Math.max(0, (AFFINITY.categories[post.type]||0) - 2);
    (post.tags||[]).forEach(t => { AFFINITY.tags[t] = Math.max(0, (AFFINITY.tags[t]||0) - 1.5); });
  }
  closeMoreMenus();
  reScoreFeed();
  toast('👎 Noted — less like this.');
};

window.moreLikeThis = function(postId) {
  const post = STATE.posts.find(p => p.id === postId);
  if (post) {
    AFFINITY.categories[post.type] = (AFFINITY.categories[post.type]||0) + 2.5;
    (post.tags||[]).forEach(t => { AFFINITY.tags[t] = (AFFINITY.tags[t]||0) + 2; });
  }
  closeMoreMenus();
  reScoreFeed();
  toast('👍 Showing more like this!');
};

/* ═══════════════════════════════════════════════════════════════════
   §32  NEW VIEW INITIALIZERS
   ═══════════════════════════════════════════════════════════════════ */

function initMessagesView() {
  renderConvList();

  document.getElementById('convSearch')?.addEventListener('input', e => {
    renderConvList(e.target.value);
  });

  document.getElementById('newConvBtn')?.addEventListener('click', () => {
    toast('Start a new conversation by going to a creator\'s post and tapping Send.');
  });
}

function initShopView() {
  const catRow = document.getElementById('shopCatRow');
  const categories = ['all', 'containers', 'tools', 'supplements', 'pantry', 'meal-kits'];
  if (catRow) {
    catRow.innerHTML = categories.map(c => `
      <button class="shop-cat-btn ${c === 'all' ? 'active' : ''}" data-cat="${c}" onclick="filterShop('${c}')">
        ${c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
      </button>
    `).join('');
  }
  renderProducts('all');
  renderCart();

  document.getElementById('cartClearBtn')?.addEventListener('click', () => {
    Object.keys(CART.items).forEach(k => delete CART.items[k]);
    renderCart();
    renderProducts(shopFilter);
    const badge = document.getElementById('cartNavBadge');
    if (badge) badge.style.display = 'none';
    toast('Cart cleared.');
  });

  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    toast('✓ Order placed! (Payment processing simulated)', 'ok');
    Object.keys(CART.items).forEach(k => delete CART.items[k]);
    renderCart();
    renderProducts(shopFilter);
    STATE.wallet.coins += 50; // earn coins on purchase
    updateCoinDisplay();
    toast('🪙 You earned 50 coins on your purchase!', 'ok');
  });

  document.getElementById('productModalBg')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
  });
}

window.filterShop = function(cat) {
  document.querySelectorAll('.shop-cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  renderProducts(cat);
};

function initAlgoControls() {
  document.getElementById('algoCtrlBtn')?.addEventListener('click', openAlgoPanel);
  document.getElementById('algoPanelClose')?.addEventListener('click', closeAlgoPanel);
  document.getElementById('algoPanelBackdrop')?.addEventListener('click', closeAlgoPanel);
  document.getElementById('muteAddBtn')?.addEventListener('click', addMutedKeyword);
  document.getElementById('muteInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') addMutedKeyword(); });
  document.getElementById('feedResetBtn')?.addEventListener('click', resetFeed);

  document.getElementById('algoTransparencyToggle')?.addEventListener('change', e => {
    ALGO_PREFS.transparencyMode = e.target.checked;
    const tog = document.getElementById('algoScoreToggle');
    if (tog) tog.style.display = e.target.checked ? 'block' : 'none';
    renderFeed(STATE.feed_filter, STATE.feed_mode);
  });

  document.getElementById('nativeAdToggle')?.addEventListener('change', e => {
    ALGO_PREFS.showAds = e.target.checked;
    renderFeed(STATE.feed_filter, STATE.feed_mode);
  });

  // Feed mode tabs
  document.querySelectorAll('.fmode-tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.fmode-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      STATE.feed_mode = t.dataset.mode;
      renderFeed(STATE.feed_filter, STATE.feed_mode);
    });
  });

  // Why / gift / DM share modal close events
  document.getElementById('whyModalClose')?.addEventListener('click', () => { document.getElementById('whyModalBg').style.display = 'none'; });
  document.getElementById('whyModalBg')?.addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.style.display = 'none'; });
  document.getElementById('giftModalClose')?.addEventListener('click', () => closeGiftModal());
  document.getElementById('subModalClose')?.addEventListener('click', () => { document.getElementById('subModalBg').style.display = 'none'; });
  document.getElementById('subModalBg')?.addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.style.display = 'none'; });
  document.getElementById('dmShareClose')?.addEventListener('click', () => { document.getElementById('dmShareBg').style.display = 'none'; });
  document.getElementById('dmShareBg')?.addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.style.display = 'none'; });

  // Close more menus on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.pa-more-menu')) closeMoreMenus();
  });
}

/* ═══════════════════════════════════════════════════════════════════
   §33  PATCHED BOOT (adds all new modules)
   ═══════════════════════════════════════════════════════════════════ */

// Patch the existing switchView to include new views
const _origSwitchView = switchView;
window.switchView = function(id) {
  _origSwitchView(id);
  if (id === 'plan' && !STATE.plan) { renderPlanEmptyState(); }
  if (id === 'account') { initAccountView(); }
  if (id === 'messages')  { renderConvList(); }
  if (id === 'creator')   { renderCreatorDashboard(); }
  if (id === 'shop')      { renderProducts(shopFilter); renderCart(); }
  if (id === 'community') { renderQuickCreateStrip(); renderLiveNowStrip(); renderSidebarWidgets(); }
};

/* ═══════════════════════════════════════════════════════════════════
   UNIFIED INITIALISER  (replaces duplicate function boot + 2nd listener)
   One DOMContentLoaded, called exactly once, no duplicate declarations.
   ═══════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════
   ACCOUNT VIEW
   ═══════════════════════════════════════════════════════════════════ */

function initAccountView() {
  // Populate fields from STATE.profile
  const p = STATE.profile;
  const el = id => document.getElementById(id);

  if (el('acctDisplayName')) el('acctDisplayName').value = p.name      || '';
  if (el('acctUsername'))    el('acctUsername').value    = p.username   || '';
  if (el('acctEmail'))       el('acctEmail').textContent = STATE._authEmail || '—';

  // Account avatar
  const acctAvatar  = el('accountAvatar');
  const acctInitial = el('accountAvatarInitial');
  const acctImg     = el('accountAvatarImg');
  if (acctAvatar && p.avatar_url) {
    acctInitial && (acctInitial.style.display = 'none');
    acctImg && (acctImg.src = p.avatar_url) && (acctImg.style.display = 'block');
  } else if (acctInitial) {
    acctInitial.textContent = (p.name || '?')[0].toUpperCase();
  }

  // Avatar file picker
  el('avatarFileInput')?.addEventListener('change', handleAvatarUpload);

  // Live username validation
  const usernameInput = el('acctUsername');
  const usernameHint  = el('usernameHint');
  if (usernameInput && usernameHint) {
    usernameInput.addEventListener('input', () => {
      const val = usernameInput.value.trim().toLowerCase();
      if (!val) { usernameHint.textContent = ''; usernameHint.className = 'auth-hint'; return; }
      if (/^[a-z0-9_]{3,24}$/.test(val)) {
        usernameHint.textContent = `@${val} looks good ✓`;
        usernameHint.className   = 'auth-hint ok';
      } else {
        usernameHint.textContent = '3–24 chars · lowercase, numbers, underscores only';
        usernameHint.className   = 'auth-hint error';
      }
    });
  }

  // Save button
  el('acctSaveBtn')?.addEventListener('click', handleAccountSave);

  // Sign out
  el('acctSignOutBtn')?.addEventListener('click', () => auth.signOut());
}

async function handleAvatarUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showAccountFeedback('Image must be under 5 MB.', 'error'); return;
  }

  // Show preview immediately
  const reader = new FileReader();
  reader.onload = ev => {
    const acctImg    = document.getElementById('accountAvatarImg');
    const acctInitEl = document.getElementById('accountAvatarInitial');
    const sidebarAv  = document.getElementById('sidebarAvatar');
    if (acctImg)    { acctImg.src = ev.target.result; acctImg.style.display = 'block'; }
    if (acctInitEl)   acctInitEl.style.display = 'none';
    if (sidebarAv) {
      let img = sidebarAv.querySelector('img');
      if (!img) { img = document.createElement('img'); sidebarAv.appendChild(img); }
      img.src = ev.target.result;
      img.alt = 'avatar';
      document.getElementById('sidebarAvatarInitial')?.style && (document.getElementById('sidebarAvatarInitial').style.display = 'none');
    }
    const composerAv = document.getElementById('composerAvatar');
    if (composerAv) composerAv.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" alt="avatar" />`;
  };
  reader.readAsDataURL(file);

  // Upload to Supabase
  const progress = document.getElementById('avatarUploadProgress');
  if (progress) progress.style.display = 'flex';

  const { url, error } = await db.uploadAvatar(file);

  if (progress) progress.style.display = 'none';

  if (error) {
    showAccountFeedback('Upload failed: ' + error, 'error');
  } else {
    STATE.profile.avatar_url = url;
    updateSidebarProfile();
    showAccountFeedback('Profile photo updated ✓', 'ok');
  }
}

async function handleAccountSave() {
  const name     = document.getElementById('acctDisplayName')?.value.trim() || '';
  const username = document.getElementById('acctUsername')?.value.trim().toLowerCase() || '';
  const newPass  = document.getElementById('acctNewPassword')?.value || '';
  const confPass = document.getElementById('acctConfirmPassword')?.value || '';

  // Validate username format
  if (username && !/^[a-z0-9_]{3,24}$/.test(username)) {
    showAccountFeedback('Username must be 3–24 chars: lowercase letters, numbers, underscores.', 'error');
    return;
  }

  // Validate passwords match
  if (newPass && newPass !== confPass) {
    showAccountFeedback('Passwords do not match.', 'error'); return;
  }
  if (newPass && newPass.length < 8) {
    showAccountFeedback('Password must be at least 8 characters.', 'error'); return;
  }

  const btn = document.getElementById('acctSaveBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  let errors = [];

  // Save name + username
  if (typeof db.updateProfileFields === 'function') {
    const { error } = await db.updateProfileFields({ name, username });
    if (error) errors.push(error);
    else {
      STATE.profile.name     = name;
      STATE.profile.username = username;
      updateSidebarProfile();
    }
  }

  // Change password if provided
  if (newPass && !errors.length) {
    const { error } = await db.changePassword(newPass);
    if (error) errors.push(error);
    else {
      document.getElementById('acctNewPassword').value    = '';
      document.getElementById('acctConfirmPassword').value = '';
    }
  }

  if (btn) { btn.disabled = false; btn.textContent = 'Save changes'; }

  if (errors.length) {
    showAccountFeedback(errors.join(' · '), 'error');
  } else {
    showAccountFeedback('Changes saved ✓', 'ok');
  }
}

function showAccountFeedback(msg, type) {
  const el = document.getElementById('acctFeedback');
  if (!el) return;
  el.textContent  = msg;
  el.className    = `account-feedback ${type}`;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

// comemos_boot is called by supabase-db.js AuthUI.onAuthChange after sign-in.
// It receives the Supabase user object so we can pre-fill the profile.
async function comemos_boot(sbUser) {

  // Merge Supabase user into STATE.profile if name is available
  if (sbUser?.user_metadata?.name) {
    STATE.profile.name = sbUser.user_metadata.name;
  }

  // ── Core sequence ─────────────────────────────────────────────
  initTheme();
  await restoreState();         // now loads from Supabase via the db layer
  initOnboarding();
  initComposer();
  initGlobalEvents();

  // ── Engagement Engine modules ─────────────────────────────────
  initMessagesView();
  initShopView();
  initAlgoControls();
  renderQuickCreateStrip();
  renderLiveNowStrip();

  // ── Auth UI ───────────────────────────────────────────────────
  if (typeof AuthUI !== 'undefined') AuthUI.init();

  // Load real posts from Supabase and merge with mock data fallback
  try {
    const livePosts = await db.loadPosts();
    if (livePosts && livePosts.length) {
      // Map Supabase rows to the shape the feed renderer expects
      STATE.posts = livePosts.map(p => ({
        ...p,
        is_liked:       false,
        is_saved:       false,
        comments:       [],
        created_at:     new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        image_emoji:    '🍽️',
        comments_count: p.comments_count || 0,
        likes_count:    p.likes_count    || 0,
      }));

      // Mark which posts this user has liked/saved
      const reactions = await db.loadUserReactions();
      STATE.posts.forEach(p => {
        p.is_liked = reactions.likes.includes(p.id);
        p.is_saved = reactions.saves.includes(p.id);
      });
    }
  } catch (e) {
    console.warn('Could not load live posts, using mock data:', e);
  }

  // Load wallet coins from Supabase
  try {
    const wallet = await db.loadWallet();
    if (wallet) {
      STATE.wallet.coins = wallet.coins;
      updateCoinDisplay();
    }
  } catch(e) {}

  // Store auth email for account view
  if (sbUser?.email) STATE._authEmail = sbUser.email;

  // Enable real-time subscriptions
  if (typeof enableRealtime === 'function') enableRealtime();

  console.log(
    '%c🍽  COMEMOS — Ready  |  Supabase connected',
    'color:#f0a840;font-family:serif;font-size:1.1em;font-weight:bold'
  );
}

// ── BOOT ─────────────────────────────────────────────────────────────
// The auth screen is visible by default (see index.html).
// AuthUI.hide() reveals the app after a session is confirmed.
// If supabase-db.js never loaded, we fall back to dev mode.
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AuthUI !== 'undefined') {
    // Supabase is available — AuthUI drives the show/hide cycle
    AuthUI.init();
  } else {
    // supabase-db.js missing or failed entirely — boot in dev mode
    const authModal = document.getElementById('authModal');
    if (authModal) {
      // Show a clear explanation and a bypass button
      const banner = document.createElement('div');
      banner.className = 'auth-banner auth-error';
      banner.style.margin = '0 0 .75rem';
      banner.textContent = '⚠️ Supabase not loaded. Running in offline dev mode.';
      const inner = authModal.querySelector('.auth-form-inner');
      if (inner) inner.prepend(banner);

      const bypassBtn = document.createElement('button');
      bypassBtn.className = 'auth-google-btn';
      bypassBtn.style.cssText = 'margin-top:.5rem;opacity:.7;font-size:.82rem';
      bypassBtn.textContent = '🔧 Enter app (dev mode)';
      bypassBtn.addEventListener('click', () => {
        authModal.style.display = 'none';
        ['mainContent','mobileHeader','mobileNav','sidebar'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = '';
        });
        comemos_boot(null);
      });
      if (inner) inner.appendChild(bypassBtn);
    }
  }
});

// ── SIGN OUT — wired globally so it works regardless of Supabase state ──
// Called from sidebar button, account view button, or any sign-out trigger.
window.handleSignOut = async function() {
  try {
    if (typeof auth !== 'undefined' && auth.signOut) {
      await auth.signOut();   // triggers onAuthChange → shows auth screen
    }
  } catch (e) {
    console.warn('Sign out error:', e);
  }
  // Fallback: clear storage and reload
  localStorage.removeItem('comemos_profile');
  localStorage.removeItem('comemos_plan');
  localStorage.removeItem('comemos_checked');
  localStorage.removeItem('comemos_posts');
  localStorage.removeItem('comemos_theme');
  // Re-show auth screen without a full reload
  const authModal = document.getElementById('authModal');
  if (authModal) authModal.style.display = 'flex';
  ['mainContent','mobileHeader','mobileNav','sidebar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
};
