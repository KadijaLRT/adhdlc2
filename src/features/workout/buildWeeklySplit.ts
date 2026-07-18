import { WORKOUT_EXERCISES } from '@/content/exercises';
import type { ProgramDefinition } from '@/content/programs';
import type { FitnessPreferences } from '@/store/slices/nutritionFitnessSlice';

// Full calendar week, Sunday first. The 6 lettered training days
// (A–F) land on Monday–Saturday; Sunday is always a rest day with no
// scheduled workout, matching a standard 6-day split.
export const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
export const DAY_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export interface WeeklySplitDay {
  dayLetter: string | null; // null on the rest day
  weekdayLabel: string;
  title: string;
  muscleGroups: string[];
  exerciseIds: string[];
  estimatedMinutes: number;
  isRestDay: boolean;
}

export interface DayLetterContent {
  exerciseIds: string[];
  muscleGroups: string[];
  title: string;
  estimatedMinutes: number;
}

/**
 * Computes what each lettered day (A, B, C...) actually contains —
 * independent of which weekday it's assigned to. Shared by
 * buildWeeklySplit (which places these onto the calendar) and the
 * schedule picker (which needs to show every option's real content,
 * not just its letter, so a person can choose based on what a day
 * actually is rather than guessing from "Day C").
 */
export function buildDayLetterContent(
  program: ProgramDefinition,
  preferences: FitnessPreferences | null,
  gymEquipment?: string[] | null
): Map<string, DayLetterContent> {
  const entries = Object.entries(WORKOUT_EXERCISES || {});
  const equipment = gymEquipment && gymEquipment.length > 0 ? gymEquipment : preferences?.equipment;

  const matchesGroup = ([, ex]: [string, any]) =>
    (program.targetGroups || []).includes('all') || (program.targetGroups || []).includes(ex.group);
  const matchesEquipment = ([, ex]: [string, any]) =>
    !equipment?.length || (ex.eq || []).some((e: string) => equipment.includes(e));

  let filtered = entries.filter((e) => matchesGroup(e) && matchesEquipment(e));
  if (!filtered.length) filtered = entries.filter(matchesGroup);
  if (!filtered.length) filtered = entries;

  const perDay = Math.max(1, program.sessionExerciseCount || 4);
  const trainingDayCount = Math.min(DAY_LETTERS.length, Math.max(1, Math.ceil(filtered.length / perDay)));

  const lettersToContent = new Map<string, DayLetterContent>();
  for (let i = 0; i < trainingDayCount; i++) {
    const chunk = filtered.slice(i * perDay, i * perDay + perDay);
    if (!chunk.length) break;
    const groupCounts = new Map<string, number>();
    for (const [, ex] of chunk) groupCounts.set(ex.group, (groupCounts.get(ex.group) || 0) + 1);
    const muscleGroups = Array.from(groupCounts.keys());
    const dominantGroup = [...groupCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'Full Body';
    const dayLetter = DAY_LETTERS[i];
    if (!dayLetter) continue;
    lettersToContent.set(dayLetter, {
      exerciseIds: chunk.map(([id]) => id),
      muscleGroups,
      title: `${capitalize(dominantGroup)} ${dayLetter}`,
      estimatedMinutes: chunk.length * 10,
    });
  }
  return lettersToContent;
}

/**
 * Splits the program's matched exercise pool into up to 6 fixed days
 * (Day A–F), one per weekday Mon–Sat. Unlike the multi-week rotation
 * used elsewhere in Programs, this is a fixed weekly split — Day A is
 * always the same exercises until the person edits it, matching a
 * traditional gym split structure (Lower Body A, Upper Body A, etc).
 */
export function buildWeeklySplit(
  program: ProgramDefinition,
  preferences: FitnessPreferences | null,
  customAssignment?: (string | null)[],
  gymEquipment?: string[] | null
): WeeklySplitDay[] {
  const lettersToContent = buildDayLetterContent(program, preferences, gymEquipment);
  const trainingDayCount = lettersToContent.size;

  // Default assignment: Sunday rest, Monday–Saturday get A–F in order.
  const defaultAssignment: (string | null)[] = [null, ...DAY_LETTERS.slice(0, trainingDayCount)];
  while (defaultAssignment.length < 7) defaultAssignment.push(null);
  const assignment = customAssignment && customAssignment.length === 7 ? customAssignment : defaultAssignment;

  const days: WeeklySplitDay[] = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    const letter = assignment[weekday];
    const weekdayLabel = WEEKDAY_LABELS[weekday] || '';
    if (!letter || !lettersToContent.has(letter)) {
      days.push({
        dayLetter: null,
        weekdayLabel,
        title: 'Rest Day',
        muscleGroups: [],
        exerciseIds: [],
        estimatedMinutes: 0,
        isRestDay: true,
      });
    } else {
      const content = lettersToContent.get(letter)!;
      days.push({
        dayLetter: letter,
        weekdayLabel,
        title: content.title,
        muscleGroups: content.muscleGroups,
        exerciseIds: content.exerciseIds,
        estimatedMinutes: content.estimatedMinutes,
        isRestDay: false,
      });
    }
  }

  return days;
}

export function getAvailableDayLetters(program: ProgramDefinition): string[] {
  const entries = Object.entries(WORKOUT_EXERCISES || {});
  const matchesGroup = ([, ex]: [string, any]) =>
    (program.targetGroups || []).includes('all') || (program.targetGroups || []).includes(ex.group);
  const filtered = entries.filter(matchesGroup);
  const perDay = Math.max(1, program.sessionExerciseCount || 4);
  const trainingDayCount = Math.min(DAY_LETTERS.length, Math.max(1, Math.ceil(filtered.length / perDay)));
  return DAY_LETTERS.slice(0, trainingDayCount);
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
