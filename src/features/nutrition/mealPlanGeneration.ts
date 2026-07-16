import { z } from 'zod';
import { callGroqJSON } from '@/core/ai/simpleGroqCall';
import type { NutritionPreferences } from '@/store/slices/nutritionFitnessSlice';

export const PLAN_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type PlanDay = (typeof PLAN_DAYS)[number];
export const PLAN_MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;
export type PlanMealType = (typeof PLAN_MEAL_TYPES)[number];

export interface PlanMeal {
  name: string;
  ingredients: string[];
}

export type DayPlan = Partial<Record<PlanMealType, PlanMeal>>;

export interface WeeklyMealPlan {
  days: Partial<Record<PlanDay, DayPlan>>;
  tips: string[];
  generatedAt: string;
}

const MealSchema = z.object({ name: z.string(), ingredients: z.array(z.string()).min(1) });
const DayPlanSchema = z.object({
  breakfast: MealSchema.optional(),
  lunch: MealSchema.optional(),
  dinner: MealSchema.optional(),
});
const MealPlanSchema = z.object({
  days: z.object({
    monday: DayPlanSchema, tuesday: DayPlanSchema, wednesday: DayPlanSchema, thursday: DayPlanSchema,
    friday: DayPlanSchema, saturday: DayPlanSchema, sunday: DayPlanSchema,
  }),
  tips: z.array(z.string()).optional(),
});

/**
 * Generates a full 7-day breakfast/lunch/dinner plan tailored to
 * stated allergies/restrictions/loved-and-avoided foods. Each meal
 * includes its own ingredient list specifically so the plan can feed
 * straight into the grocery list the same way a saved recipe does —
 * "populate automatically" only works if there's something structured
 * to build a grocery list from, not just a meal name.
 */
export async function generateWeeklyMealPlan(preferences: NutritionPreferences | null): Promise<WeeklyMealPlan | null> {
  const result = await callGroqJSON(
    'You are a nutritionist specializing in ADHD and executive dysfunction, writing a 7-day meal plan. ' +
    'Keep meals simple and low-effort. Never include a stated allergen. Prefer loved foods and avoid disliked ones when reasonable. ' +
    'Every meal needs a short, practical grocery ingredient list.',
    {
      allergies: preferences?.allergies || [],
      dietaryRestrictions: preferences?.dietaryRestrictions || [],
      foodsLoved: preferences?.foodsLoved || [],
      foodsAvoided: preferences?.foodsAvoided || [],
    },
    MealPlanSchema
  );
  if (!result) return null;

  return { days: result.days, tips: result.tips || [], generatedAt: new Date().toISOString() };
}
