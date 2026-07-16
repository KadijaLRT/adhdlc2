export interface BodyPart {
  id: string;
  label: string;
  icon: string;
}

export const BODY_PARTS: BodyPart[] = [
  { id: 'lower_back', label: 'Lower Back', icon: '🦴' },
  { id: 'knees', label: 'Knees', icon: '🦵' },
  { id: 'hips', label: 'Hips', icon: '🍑' },
  { id: 'shoulders', label: 'Shoulders', icon: '💪' },
  { id: 'wrists', label: 'Wrists', icon: '🤜' },
  { id: 'neck', label: 'Neck', icon: '🦴' },
  { id: 'upper_back', label: 'Upper Back', icon: '🛡️' },
  { id: 'ankles', label: 'Ankles', icon: '🦶' },
  { id: 'hamstrings', label: 'Hamstrings', icon: '🦵' },
  { id: 'calves', label: 'Calves', icon: '🦶' },
];

// Maps a body part to the exercise muscle groups it affects — same
// mapping the old app used.
export const INJURY_GROUP_MAP: Record<string, string[]> = {
  lower_back: ['back', 'fullbody'],
  knees: ['quads', 'hamstrings', 'calves'],
  hips: ['glutes', 'quads', 'hamstrings'],
  shoulders: ['shoulders', 'chest', 'arms', 'back'],
  wrists: ['arms', 'chest', 'back'],
  neck: ['shoulders', 'back'],
  upper_back: ['back', 'shoulders'],
  ankles: ['calves', 'quads', 'hamstrings'],
  hamstrings: ['hamstrings'],
  calves: ['calves'],
};

export type PainSeverity = 1 | 2 | 3; // 1=mild, 2=noticeable, 3=a lot

export interface CheckinAdjustment {
  skipGroups: string[]; // severity 2-3 — exercises for these groups are left out entirely
  reduceGroups: string[]; // severity 1 — exercises for these groups keep going, with one fewer set
}

/**
 * Severity 2+ (noticeable/a lot) skips that muscle group's exercises
 * entirely for today. Severity 1 (mild) keeps them in, just with one
 * fewer set. A group only ever lands in one bucket — skip wins if any
 * flagged body part maps to it at severity 2+.
 */
export function computeCheckinAdjustment(severityByPart: Record<string, PainSeverity>): CheckinAdjustment {
  const skipGroups = new Set<string>();
  const reduceGroups = new Set<string>();

  for (const [partId, severity] of Object.entries(severityByPart || {})) {
    const groups = INJURY_GROUP_MAP[partId] || [];
    for (const group of groups) {
      if (severity >= 2) skipGroups.add(group);
      else reduceGroups.add(group);
    }
  }
  for (const group of skipGroups) reduceGroups.delete(group);

  return { skipGroups: Array.from(skipGroups), reduceGroups: Array.from(reduceGroups) };
}

/**
 * Removes exercises matching a skipped group from today's plan —
 * except it never lets the whole day come up empty. If every exercise
 * would be skipped (a lot of flagged areas on a small day), the
 * original unfiltered list is kept instead of leaving someone with
 * nothing to do.
 */
export function applySkipToExerciseIds(
  exerciseIds: string[],
  skipGroups: string[],
  exerciseGroupOf: (id: string) => string | undefined
): string[] {
  if (!skipGroups.length) return exerciseIds;
  const filtered = exerciseIds.filter((id) => !skipGroups.includes(exerciseGroupOf(id) || ''));
  return filtered.length > 0 ? filtered : exerciseIds;
}
