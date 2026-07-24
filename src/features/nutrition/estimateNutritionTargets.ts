import type { ActivityLevel, Gender, FitnessPreferences } from '@/store/slices/nutritionFitnessSlice';
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

// Small, deliberately modest adjustment: at the same bodyweight, average
// lean body mass (and therefore resting energy needs) tends to run
// slightly lower for women than men, which most simplified per-lb
// calculators account for with a small per-lb reduction. Left at 0 for
// non-binary/unset — there's no population-average heuristic that
// applies there, and guessing one would be worse than not adjusting.
const GENDER_CAL_PER_LB_ADJUSTMENT: Record<Exclude<Gender, null>, number> = {
  female: -1,
  male: 0,
  non_binary: 0,
};

// A modest protein bump for a self-reported athletic/muscular build —
// more existing lean mass to maintain — not applied for the other body
// type options since there's no comparable population-average signal
// for them one way or the other.
const ATHLETIC_BUILD_PROTEIN_BONUS_PER_LB = 0.15;

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

  const genderAdjustment = preferences?.gender ? GENDER_CAL_PER_LB_ADJUSTMENT[preferences.gender] : 0;
  const calPerLb = Math.max(1, MAINTENANCE_CAL_PER_LB[activityLevel] + genderAdjustment);
  const maintenance = currentWeightLbs * calPerLb;
  const goalMultiplier = basedOnGoal === 'lose' ? LOSE_MULTIPLIER : basedOnGoal === 'gain' ? GAIN_MULTIPLIER : 1;
  const calories = Math.max(MIN_CALORIES, Math.round((maintenance * goalMultiplier) / 10) * 10);

  // Protein stays high (~1g/lb) across all three goals — preserving
  // muscle matters whether the calorie target is a deficit, surplus, or
  // maintenance, and ADHD-friendly nutrition guidance favors "enough
  // protein" as the one macro worth being precise about over
  // micromanaging the rest. A self-reported athletic build gets a small
  // bump on top of that baseline.
  const proteinPerLb = 1 + (preferences?.bodyType === 'athletic_build' ? ATHLETIC_BUILD_PROTEIN_BONUS_PER_LB : 0);
  const protein = Math.round(currentWeightLbs * proteinPerLb);
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
