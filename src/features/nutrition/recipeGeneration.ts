import { z } from 'zod';
import { callGroqJSON } from '@/core/ai/simpleGroqCall';
import type { Recipe } from '@/content/recipes';

const GeneratedRecipeSchema = z.object({
  name: z.string(),
  cuisine: z.string(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner']),
  protein: z.string(),
  carbs: z.string(),
  fat: z.string(),
  calories: z.number(),
  ingredients: z.array(z.string()).min(1),
  groceryKeywords: z.array(z.string()).min(1),
  prepTime: z.string(),
  cookTime: z.string(),
});

function slugify(text: string): string {
  return (text || 'recipe').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
}

/**
 * Generates one new recipe on demand when a search doesn't match
 * anything in the built-in database — e.g. someone searches "jollof
 * rice" and it isn't in RECIPES. Returns a Recipe in the exact same
 * shape as the built-in catalog so it can sit in the same list, be
 * saved, and feed the grocery list identically. Returns null on any
 * failure; the caller just doesn't show a result rather than crashing.
 */
export async function generateRecipeWithAI(query: string): Promise<Recipe | null> {
  const result = await callGroqJSON(
    'You are a recipe writer for an ADHD-friendly cooking app. Create one simple, realistic, ' +
    'home-cookable recipe matching the request. Keep ingredient lists short and practical.',
    { request: query },
    GeneratedRecipeSchema
  );
  if (!result) return null;

  return {
    id: `ai-${slugify(result.name)}-${Date.now()}`,
    n: result.name,
    c: (result.cuisine || 'american').toLowerCase(),
    t: result.mealType,
    pro: result.protein,
    carb: result.carbs,
    fat: result.fat,
    cal: result.calories,
    ing: result.ingredients,
    g: result.groceryKeywords,
    prep: result.prepTime,
    cook: result.cookTime,
  };
}
