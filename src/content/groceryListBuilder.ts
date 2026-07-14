import { GROCERY_CATEGORIES } from './groceryCategories';

export interface GroceryListItem {
  ingredient: string;
  category: string;
}

/**
 * Groups a flat ingredient list (usually pulled from one or more
 * recipes' `g` field) under the same category headers used elsewhere,
 * so a meal plan can become a shoppable, organized list in one step.
 */
export function buildGroceryList(ingredients: string[]): GroceryListItem[] {
  const seen = new Set<string>();
  const result: GroceryListItem[] = [];

  for (const raw of ingredients || []) {
    const ingredient = (raw || '').toLowerCase().trim();
    if (!ingredient || seen.has(ingredient)) continue;
    seen.add(ingredient);

    let category = 'Other';
    for (const [categoryLabel, keywords] of Object.entries(GROCERY_CATEGORIES || {})) {
      if ((keywords || []).some((kw) => ingredient.includes(kw))) {
        category = categoryLabel;
        break;
      }
    }
    result.push({ ingredient, category });
  }

  return result.sort((a, b) => a.category.localeCompare(b.category));
}

export interface MergedGroceryItem {
  ingredient: string;
  category: string;
  usedFor: string[];
}

/**
 * Aggregates ingredients across multiple recipes into one shopping list:
 * same ingredient mentioned in several recipes becomes one line with a
 * "used for" list, rather than duplicate entries. Anything already in
 * the pantry is excluded entirely, since the whole point of a pantry
 * list is not re-buying what's already owned.
 */
export function buildMergedGroceryList(
  recipes: { n: string; g: string[] }[],
  pantryItems: string[]
): MergedGroceryItem[] {
  const pantrySet = new Set((pantryItems || []).map((p) => p.toLowerCase().trim()));
  const merged = new Map<string, MergedGroceryItem>();

  for (const recipe of recipes || []) {
    for (const rawIngredient of recipe.g || []) {
      const ingredient = (rawIngredient || '').toLowerCase().trim();
      if (!ingredient || pantrySet.has(ingredient)) continue;

      const existing = merged.get(ingredient);
      if (existing) {
        if (!existing.usedFor.includes(recipe.n)) existing.usedFor.push(recipe.n);
      } else {
        let category = 'Other';
        for (const [categoryLabel, keywords] of Object.entries(GROCERY_CATEGORIES || {})) {
          if ((keywords as string[]).some((kw) => ingredient.includes(kw))) {
            category = categoryLabel;
            break;
          }
        }
        merged.set(ingredient, { ingredient, category, usedFor: [recipe.n] });
      }
    }
  }

  return Array.from(merged.values()).sort((a, b) => a.category.localeCompare(b.category));
}
