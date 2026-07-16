import { WORKOUT_EXERCISES } from '@/content/exercises';
import type { FitnessPreferences } from '@/store/slices/nutritionFitnessSlice';

/**
 * "Start Somewhere": removes the decision of what to do entirely.
 * Filters by available equipment if the person has set that
 * preference, otherwise considers everything. A light goal-based bias
 * (not a hard filter) nudges toward relevant muscle groups without
 * ever producing an empty result.
 */
export function pickStartSomewhereExercise(preferences: FitnessPreferences | null): { id: string } | null {
  const entries = Object.entries(WORKOUT_EXERCISES || {});
  if (!entries.length) return null;

  const equipment = preferences?.equipment;
  const filtered = equipment?.length
    ? entries.filter(([, ex]) => (ex.eq || []).some((e) => equipment.includes(e)))
    : entries;

  const pool = filtered.length ? filtered : entries; // never leave the person with nothing
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return picked ? { id: picked[0] } : null;
}
