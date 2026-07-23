import type { FitnessPreferences } from '@/store/slices/nutritionFitnessSlice';

/**
 * Maps everything already collected in fitness preferences to a
 * sensible starter program — a gentle suggestion, never a lock-in;
 * anyone can switch programs (or stop entirely) from the Programs
 * screen at any time.
 *
 * Previously this only ever looked at the reduced `primaryGoal` field
 * (itself derived from `exerciseGoals`) and could only land on 3 of
 * the 7 programs. Reading the underlying signals directly — the full
 * `exerciseGoals` list, `weightGoalDirections`, and `activityLevel` —
 * lets every program actually get recommended when it fits, e.g.
 * "build muscle" now reaches Muscle Building instead of falling back
 * to the generic Beginner Strength, and "mostly sitting all day"
 * reaches Desk Worker Relief even without an explicit exercise goal.
 *
 * Order matters: an explicit, specific goal always outranks a broader
 * inference like activity level, and flexibility/cardio (the least
 * ambiguous goals) are checked first.
 */
export function recommendProgramId(preferences: FitnessPreferences | null): string {
  const goals = preferences?.exerciseGoals || [];
  const weightGoals = preferences?.weightGoalDirections || [];
  const activityLevel = preferences?.activityLevel;

  if (goals.includes('flexibility')) return 'mobility';
  if (goals.includes('cardio')) return 'endurance';
  if (goals.includes('lose_fat') || weightGoals.includes('lose')) return 'fat-loss';
  if (goals.includes('build_muscle') || goals.includes('get_stronger') || goals.includes('glutes_curves')) return 'muscle-building';
  if (activityLevel === 'mostly_sitting') return 'desk-worker-relief';

  // 'general_health', no goals set, or nothing distinctive: the
  // broadest, lowest-barrier starting point of the seven programs.
  return 'beginner-strength';
}
