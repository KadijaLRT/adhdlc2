export interface FoodItem {
  id: string;
  name: string;
  servingLabel: string; // e.g. "1 cup", "100g", "1 medium"
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  category?: 'whole' | 'fastfood'; // optional — only used to power the "Fast Food" quick filter in the diary
  chain?: string; // optional — restaurant/chain name, for fast food items only
}

// A small, curated set of common whole foods — not a live nutrition
// database (no API for that is wired into this app). Covers common
// breakfast/lunch/dinner/snack basics; anything else gets logged as a
// custom food with hand-entered macros.
const WHOLE_FOODS: FoodItem[] = [
  { id: 'egg', name: 'Egg, large', servingLabel: '1 egg', calories: 70, protein: 6, carbs: 0, fat: 5 },
  { id: 'chicken-breast', name: 'Chicken breast, grilled', servingLabel: '100g', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { id: 'ground-beef', name: 'Ground beef, 85/15', servingLabel: '100g', calories: 215, protein: 26, carbs: 0, fat: 12 },
  { id: 'salmon', name: 'Salmon, cooked', servingLabel: '100g', calories: 206, protein: 22, carbs: 0, fat: 13 },
  { id: 'white-rice', name: 'White rice, cooked', servingLabel: '1 cup', calories: 205, protein: 4, carbs: 45, fat: 0 },
  { id: 'brown-rice', name: 'Brown rice, cooked', servingLabel: '1 cup', calories: 216, protein: 5, carbs: 45, fat: 2 },
  { id: 'oatmeal', name: 'Oatmeal, plain', servingLabel: '1 cup cooked', calories: 166, protein: 6, carbs: 28, fat: 3 },
  { id: 'greek-yogurt', name: 'Greek yogurt, plain', servingLabel: '1 cup', calories: 150, protein: 25, carbs: 9, fat: 4 },
  { id: 'banana', name: 'Banana', servingLabel: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { id: 'apple', name: 'Apple', servingLabel: '1 medium', calories: 95, protein: 0, carbs: 25, fat: 0 },
  { id: 'avocado', name: 'Avocado', servingLabel: '1/2 fruit', calories: 120, protein: 1, carbs: 6, fat: 11 },
  { id: 'almonds', name: 'Almonds', servingLabel: '1 oz (23 nuts)', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { id: 'peanut-butter', name: 'Peanut butter', servingLabel: '2 tbsp', calories: 190, protein: 8, carbs: 7, fat: 16 },
  { id: 'whole-wheat-bread', name: 'Whole wheat bread', servingLabel: '1 slice', calories: 80, protein: 4, carbs: 14, fat: 1 },
  { id: 'broccoli', name: 'Broccoli, steamed', servingLabel: '1 cup', calories: 55, protein: 4, carbs: 11, fat: 0 },
  { id: 'sweet-potato', name: 'Sweet potato, baked', servingLabel: '1 medium', calories: 112, protein: 2, carbs: 26, fat: 0 },
  { id: 'broccoli-spinach', name: 'Spinach, raw', servingLabel: '2 cups', calories: 14, protein: 2, carbs: 2, fat: 0 },
  { id: 'milk', name: 'Milk, 2%', servingLabel: '1 cup', calories: 122, protein: 8, carbs: 12, fat: 5 },
  { id: 'cheddar', name: 'Cheddar cheese', servingLabel: '1 oz', calories: 115, protein: 7, carbs: 1, fat: 9 },
  { id: 'protein-shake', name: 'Whey protein shake', servingLabel: '1 scoop + water', calories: 120, protein: 24, carbs: 3, fat: 1 },
  { id: 'black-beans', name: 'Black beans, cooked', servingLabel: '1 cup', calories: 227, protein: 15, carbs: 41, fat: 1 },
  { id: 'pasta', name: 'Pasta, cooked', servingLabel: '1 cup', calories: 220, protein: 8, carbs: 43, fat: 1 },
  { id: 'olive-oil', name: 'Olive oil', servingLabel: '1 tbsp', calories: 119, protein: 0, carbs: 0, fat: 14 },
  { id: 'shrimp', name: 'Shrimp, cooked', servingLabel: '100g', calories: 99, protein: 24, carbs: 0, fat: 0 },
  { id: 'quinoa', name: 'Quinoa, cooked', servingLabel: '1 cup', calories: 222, protein: 8, carbs: 39, fat: 4 },
  { id: 'orange', name: 'Orange', servingLabel: '1 medium', calories: 62, protein: 1, carbs: 15, fat: 0 },
  { id: 'coffee-black', name: 'Coffee, black', servingLabel: '1 cup', calories: 2, protein: 0, carbs: 0, fat: 0 },
  { id: 'protein-bar', name: 'Protein bar', servingLabel: '1 bar', calories: 200, protein: 20, carbs: 22, fat: 7 },
];

// Common fast food / restaurant items — figures are drawn from each
// chain's own published nutrition facts (or well-corroborated third
// party nutrition trackers where a chain doesn't publish a page for
// that exact item) as of mid-2026. Chains change recipes and portions
// over time, so treat these as good estimates rather than a live feed
// — same spirit as the whole-foods list above. Deliberately kept to
// items with clean, cross-checked macro math rather than guessing at
// ones that couldn't be verified.
const FAST_FOOD: FoodItem[] = [
  { id: 'mcd-big-mac', name: "Big Mac", chain: "McDonald's", servingLabel: '1 sandwich', calories: 563, protein: 26, carbs: 44, fat: 33, category: 'fastfood' },
  { id: 'mcd-quarter-pounder-cheese', name: 'Quarter Pounder with Cheese', chain: "McDonald's", servingLabel: '1 sandwich', calories: 540, protein: 31, carbs: 42, fat: 28, category: 'fastfood' },
  { id: 'mcd-mcnuggets-10', name: 'Chicken McNuggets, 10 piece', chain: "McDonald's", servingLabel: '10 piece', calories: 440, protein: 24, carbs: 26, fat: 27, category: 'fastfood' },
  { id: 'mcd-fries-medium', name: 'French Fries, medium', chain: "McDonald's", servingLabel: '1 medium', calories: 340, protein: 4, carbs: 44, fat: 16, category: 'fastfood' },
  { id: 'mcd-egg-mcmuffin', name: 'Egg McMuffin', chain: "McDonald's", servingLabel: '1 sandwich', calories: 300, protein: 17, carbs: 30, fat: 12, category: 'fastfood' },
  { id: 'cfa-chicken-sandwich', name: 'Chicken Sandwich', chain: 'Chick-fil-A', servingLabel: '1 sandwich', calories: 420, protein: 29, carbs: 41, fat: 18, category: 'fastfood' },
  { id: 'cfa-waffle-fries-medium', name: 'Waffle Potato Fries, medium', chain: 'Chick-fil-A', servingLabel: '1 medium', calories: 420, protein: 5, carbs: 45, fat: 24, category: 'fastfood' },
  { id: 'wendys-baconator', name: 'Baconator', chain: "Wendy's", servingLabel: '1 sandwich', calories: 920, protein: 57, carbs: 38, fat: 60, category: 'fastfood' },
  { id: 'wendys-daves-single', name: "Dave's Single", chain: "Wendy's", servingLabel: '1 sandwich', calories: 590, protein: 30, carbs: 46, fat: 34, category: 'fastfood' },
  { id: 'bk-whopper', name: 'Whopper', chain: 'Burger King', servingLabel: '1 sandwich', calories: 678, protein: 31, carbs: 54, fat: 37, category: 'fastfood' },
  { id: 'sbux-grande-latte', name: 'Caffè Latte, grande (2% milk)', chain: 'Starbucks', servingLabel: '1 grande (16 oz)', calories: 190, protein: 13, carbs: 19, fat: 7, category: 'fastfood' },
  { id: 'sbux-bacon-gouda', name: 'Bacon, Gouda & Egg Sandwich', chain: 'Starbucks', servingLabel: '1 sandwich', calories: 370, protein: 19, carbs: 34, fat: 18, category: 'fastfood' },
  { id: 'subway-6in-turkey', name: '6" Turkey Breast sandwich', chain: 'Subway', servingLabel: '6 inch', calories: 320, protein: 19, carbs: 46, fat: 7, category: 'fastfood' },
  { id: 'chipotle-chicken-bowl', name: 'Chicken Burrito Bowl (chicken, rice, beans, cheese)', chain: 'Chipotle', servingLabel: '1 bowl', calories: 630, protein: 50, carbs: 63, fat: 21, category: 'fastfood' },
  { id: 'fiveguys-little-cheeseburger', name: 'Little Cheeseburger', chain: 'Five Guys', servingLabel: '1 burger', calories: 550, protein: 27, carbs: 40, fat: 32, category: 'fastfood' },
  { id: 'innout-double-double', name: 'Double-Double, with spread', chain: 'In-N-Out', servingLabel: '1 burger', calories: 610, protein: 34, carbs: 42, fat: 34, category: 'fastfood' },
  { id: 'innout-fries', name: 'French Fries', chain: 'In-N-Out', servingLabel: '1 order', calories: 360, protein: 6, carbs: 49, fat: 15, category: 'fastfood' },
  { id: 'dunkin-glazed-donut', name: 'Glazed Donut', chain: "Dunkin'", servingLabel: '1 donut', calories: 260, protein: 3, carbs: 31, fat: 14, category: 'fastfood' },
  { id: 'tacobell-crunchy-taco', name: 'Crunchy Taco', chain: 'Taco Bell', servingLabel: '1 taco', calories: 170, protein: 8, carbs: 13, fat: 9, category: 'fastfood' },
  { id: 'tacobell-bean-burrito', name: 'Bean Burrito', chain: 'Taco Bell', servingLabel: '1 burrito', calories: 350, protein: 13, carbs: 54, fat: 9, category: 'fastfood' },
  { id: 'tacobell-crunchwrap-supreme', name: 'Crunchwrap Supreme', chain: 'Taco Bell', servingLabel: '1 wrap', calories: 530, protein: 16, carbs: 71, fat: 21, category: 'fastfood' },
  { id: 'dominos-pepperoni-slice', name: 'Pepperoni Pizza, large hand tossed', chain: "Domino's", servingLabel: '1 slice (1/8 pizza)', calories: 280, protein: 11, carbs: 32, fat: 11, category: 'fastfood' },
  { id: 'pandaexpress-orange-chicken', name: 'Orange Chicken', chain: 'Panda Express', servingLabel: '1 serving (5.7 oz)', calories: 370, protein: 19, carbs: 38, fat: 17, category: 'fastfood' },
  { id: 'kfc-original-breast', name: 'Original Recipe Chicken Breast', chain: 'KFC', servingLabel: '1 piece', calories: 390, protein: 39, carbs: 11, fat: 21, category: 'fastfood' },
];

export const FOOD_DATABASE: FoodItem[] = [...WHOLE_FOODS, ...FAST_FOOD];

/** Restaurant/chain names present in the fast food set, for a quick-browse chip row — lets someone find "Chick-fil-A" without knowing an exact item name to type. */
export const FAST_FOOD_CHAINS: string[] = Array.from(new Set(FAST_FOOD.map((f) => f.chain).filter((c): c is string => !!c)));

export function searchFoodDatabase(query: string): FoodItem[] {
  const q = (query || '').toLowerCase().trim();
  if (!q) return FOOD_DATABASE;
  // Typing the literal phrase "fast food" browses the whole fast food
  // set rather than requiring an exact item or chain name.
  if (q === 'fast food' || q === 'fastfood') return FAST_FOOD;
  return FOOD_DATABASE.filter((f) => f.name.toLowerCase().includes(q) || (f.chain || '').toLowerCase().includes(q));
}

/** Parses a "42g" style macro string (from Recipe) into a number of grams. */
export function parseGramString(value: string | undefined): number {
  if (!value) return 0;
  const match = value.match(/(\d+(\.\d+)?)/);
  const captured = match?.[1];
  return captured ? parseFloat(captured) : 0;
}
