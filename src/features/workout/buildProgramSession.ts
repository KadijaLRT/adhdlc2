import { WORKOUT_EXERCISES } from '@/content/exercises';
import type { ProgramDefinition } from '@/content/programs';
import type { FitnessPreferences } from '@/store/slices/nutritionFitnessSlice';

/**
 * Which week (1-indexed) the person is on, based on sessions completed
 * so far and the program's declared days/week. Capped at the program's
 * stated duration so it never reports "week 12 of a 4-week program."
 */
export function getCurrentProgramWeek(program: ProgramDefinition, sessionsCompleted: number): number {
  const perWeek = program.daysPerWeek || 1;
  const rawWeek = Math.floor((sessionsCompleted || 0) / perWeek) + 1;
  return Math.min(rawWeek, program.durationWeeks || rawWeek);
}

export function getSessionsThisWeek(program: ProgramDefinition, sessionsCompleted: number): number {
  const perWeek = program.daysPerWeek || 1;
  return (sessionsCompleted || 0) % perWeek;
}

/**
 * Deterministic on purpose, same reasoning as before: predictability
 * beats variety for reducing decision fatigue. The only thing that
 * changes week to week is (a) which slice of the matched exercise pool
 * is used — rotating rather than repeating the identical set every
 * single session — and (b) a small, capped increase in exercises per
 * session as weeks progress, standing in for very gradual overload
 * without needing a full periodization model.
 */
export function buildProgramSessionExerciseIds(
  program: ProgramDefinition,
  preferences: FitnessPreferences | null,
  sessionsCompleted = 0
): string[] {
  const entries = Object.entries(WORKOUT_EXERCISES || {});
  const equipment = preferences?.equipment;

  const matchesGroup = ([, ex]: [string, any]) =>
    (program.targetGroups || []).includes('all') || (program.targetGroups || []).includes(ex.group);

  const matchesEquipment = ([, ex]: [string, any]) =>
    !equipment?.length || (ex.eq || []).some((e: string) => equipment.includes(e));

  let filtered = entries.filter((e) => matchesGroup(e) && matchesEquipment(e));
  if (!filtered.length) filtered = entries.filter(matchesGroup); // never end up empty just from equipment
  if (!filtered.length) filtered = entries;

  const currentWeek = getCurrentProgramWeek(program, sessionsCompleted);

  // Every 2 weeks, allow one more exercise in the session, capped at
  // the pool size and at a sensible ceiling so sessions never balloon.
  const weekBonus = Math.floor((currentWeek - 1) / 2);
  const targetCount = Math.min(program.sessionExerciseCount + weekBonus, filtered.length, program.sessionExerciseCount + 3);

  // Rotate the starting point through the pool by week, so week 2 isn't
  // an identical copy of week 1 even with the same target count.
  const offset = ((currentWeek - 1) * program.sessionExerciseCount) % filtered.length;
  const rotated = [...filtered.slice(offset), ...filtered.slice(0, offset)];

  return rotated.slice(0, targetCount).map(([id]) => id);
}
