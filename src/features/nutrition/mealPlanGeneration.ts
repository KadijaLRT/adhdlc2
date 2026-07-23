import { z } from 'zod';
import { callGroqJSON } from '@/core/ai/simpleGroqCall';
import type { NutritionPreferences, FitnessPreferences } from '@/store/slices/nutritionFitnessSlice';

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

// Goal direction folds into plain-language guidance rather than a
// calorie number in the prompt — the model doesn't know actual serving
// sizes or the person's real intake, so a target number here would be
// a guess dressed up as precision. "Lean toward lighter, higher-protein
// meals" is honest about what this can actually steer.
const GOAL_GUIDANCE: Record<'lose' | 'gain' | 'maintain', string> = {
  lose: 'They want to lose weight — lean toward lighter, higher-protein, higher-volume meals (lots of vegetables) that are still filling, and go easy on calorie-dense additions like heavy creams, fried components, or large starch portions.',
  gain: 'They want to gain weight — lean toward higher-calorie, higher-protein meals with more starches, healthy fats, and larger portions than usual, without making meals harder to prepare.',
  maintain: "They want to maintain their current weight — keep meals balanced, nothing needs to skew lighter or heavier.",
};

/**
 * Generates a full 7-day breakfast/lunch/dinner plan tailored to
 * stated allergies/restrictions/loved-and-avoided foods, and — when
 * fitness preferences are set — nudged toward the person's actual
 * weight goal and activity level. This only ever changes which meals
 * get suggested, never a number pushed at the person (no calorie
 * targets are generated here); the Nutrition Diary's own suggested
 * targets are the one place this app estimates a number, and even
 * those are opt-in. Each meal includes its own ingredient list
 * specifically so the plan can feed straight into the grocery list the
 * same way a saved recipe does — "populate automatically" only works
 * if there's something structured to build a grocery list from, not
 * just a meal name.
 */
export async function generateWeeklyMealPlan(
  preferences: NutritionPreferences | null,
  fitnessPreferences?: FitnessPreferences | null
): Promise<WeeklyMealPlan | null> {
  const directions = fitnessPreferences?.weightGoalDirections || [];
  const goal: 'lose' | 'gain' | 'maintain' = directions.includes('lose') ? 'lose' : directions.includes('gain') ? 'gain' : 'maintain';
  const hasGoalSignal = directions.length > 0;

  const result = await callGroqJSON(
    'You are a nutritionist specializing in ADHD and executive dysfunction, writing a 7-day meal plan. ' +
    'Keep meals simple and low-effort. Never include a stated allergen. Prefer loved foods and avoid disliked ones when reasonable. ' +
    (hasGoalSignal ? GOAL_GUIDANCE[goal] + ' ' : '') +
    (fitnessPreferences?.activityLevel === 'very_active' || fitnessPreferences?.activityLevel === 'active'
      ? "They're fairly active, so meals can be a bit more substantial than for a sedentary person. "
      : '') +
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
