import type { ActivityLevel, FitnessPreferences } from '@/store/slices/nutritionFitnessSlice';
import type { DailyTargets } from '@/store/slices/nutritionTrackingSlice';

/**
 * A per-pound-of-bodyweight estimate rather than a Mifflin-St Jeor/BMR
 * calculation — the app doesn't collect height or age anywhere, and
 * asking for them just to unlock this would be more onboarding friction
 * than the feature is worth. This is the same "calories per lb by
 * activity level" heuristic most fitness apps use as a starting point,
 * not a clinical calculation. It's presented in the UI as a suggestion
 * to accept or adjust, never a number silently pushed onto the person —
 * `dailyTargets` in nutritionTrackingSlice stays exactly what they've
 * chosen; this only supplies an initial value to choose.
 */
const MAINTENANCE_CAL_PER_LB: Record<ActivityLevel, number> = {
  mostly_sitting: 13,
  somewhat_active: 15,
  active: 17,
  very_active: 19,
};

// A 20% deficit and 12% surplus are both within the commonly recommended
// range (deficits much past ~25% risk excessive muscle loss and low
// energy; surpluses much past ~15% mostly add fat rather than muscle).
const LOSE_MULTIPLIER = 0.8;
const GAIN_MULTIPLIER = 1.12;

// Absolute floor regardless of bodyweight math — going below this on a
// deficit is a level of restriction this app has no business
// recommending without a professional involved.
const MIN_CALORIES = 1200;

export interface EstimatedTargets extends DailyTargets {
  /** Which goal direction the estimate is built around, so the UI can
   *  label the suggestion honestly ("for weight loss" vs "to maintain"). */
  basedOnGoal: 'lose' | 'gain' | 'maintain';
}

/**
 * Returns null when there isn't enough information to produce a
 * reasonable estimate (no logged weight yet) — callers should fall back
 * to the plain manual-entry flow rather than guessing at a number.
 */
export function estimateDailyTargets(
  currentWeightLbs: number | null | undefined,
  preferences: FitnessPreferences | null
): EstimatedTargets | null {
  if (!currentWeightLbs || currentWeightLbs <= 0) return null;

  const activityLevel = preferences?.activityLevel || 'somewhat_active';
  const directions = preferences?.weightGoalDirections || [];
  // If someone (unusually) picked both lose and gain, treat the intent
  // to lose as the more actionable/likely-current one rather than
  // averaging two opposite calorie adjustments into a meaningless number.
  const basedOnGoal: EstimatedTargets['basedOnGoal'] = directions.includes('lose')
    ? 'lose'
    : directions.includes('gain')
      ? 'gain'
      : 'maintain';

  const maintenance = currentWeightLbs * MAINTENANCE_CAL_PER_LB[activityLevel];
  const goalMultiplier = basedOnGoal === 'lose' ? LOSE_MULTIPLIER : basedOnGoal === 'gain' ? GAIN_MULTIPLIER : 1;
  const calories = Math.max(MIN_CALORIES, Math.round((maintenance * goalMultiplier) / 10) * 10);

  // Protein stays high (~1g/lb) across all three goals — preserving
  // muscle matters whether the calorie target is a deficit, surplus, or
  // maintenance, and ADHD-friendly nutrition guidance favors "enough
  // protein" as the one macro worth being precise about over
  // micromanaging the rest.
  const protein = Math.round(currentWeightLbs);
  const proteinCalories = protein * 4;

  // Fat at 25% of total calories is a reasonable default across goals;
  // carbs take whatever's left. Both floored at a sane minimum so an
  // unusually low calorie target with a very high bodyweight-based
  // protein number can't compute a negative carb value.
  const fatCalories = calories * 0.25;
  const fat = Math.round(fatCalories / 9);
  const remainingCalories = Math.max(0, calories - proteinCalories - fatCalories);
  const carbs = Math.round(remainingCalories / 4);

  return { calories, protein, carbs, fat, basedOnGoal };
}
