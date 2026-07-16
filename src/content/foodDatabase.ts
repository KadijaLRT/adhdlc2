export interface FoodItem {
  id: string;
  name: string;
  servingLabel: string; // e.g. "1 cup", "100g", "1 medium"
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

// A small, curated set of common foods — not a live nutrition database
// (no API for that is wired into this app). Covers common
// breakfast/lunch/dinner/snack basics; anything else gets logged as a
// custom food with hand-entered macros.
export const FOOD_DATABASE: FoodItem[] = [
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

export function searchFoodDatabase(query: string): FoodItem[] {
  const q = (query || '').toLowerCase().trim();
  if (!q) return FOOD_DATABASE;
  return FOOD_DATABASE.filter((f) => f.name.toLowerCase().includes(q));
}

/** Parses a "42g" style macro string (from Recipe) into a number of grams. */
export function parseGramString(value: string | undefined): number {
  if (!value) return 0;
  const match = value.match(/(\d+(\.\d+)?)/);
  const captured = match?.[1];
  return captured ? parseFloat(captured) : 0;
}
