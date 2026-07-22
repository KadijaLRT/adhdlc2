export type WarmupCategory = 'lower_body' | 'upper_body' | 'core' | 'fullbody';
export type WarmupAnimationType = 'vertical' | 'quickVertical' | 'horizontal' | 'rotate' | 'twist' | 'pulse';

export interface WarmupStep {
  text: string;
  durationSeconds: number;
  emoji?: string; // shown large above the countdown, animated per `animation`
  animation?: WarmupAnimationType;
}

export interface WarmupRoutine {
  id: string;
  title: string;
  category: WarmupCategory;
  steps: WarmupStep[];
}

// Dynamic movement, not static stretching — the point of a warm-up is
// to raise heart rate and rehearse the day's movement patterns, not to
// hold a stretch. That's why this is a separate set of moves from
// STRETCH_ROUTINES (recoveryContent.ts) rather than reusing it.
//
// Each step carries an emoji + a movement "shape" (vertical,
// quickVertical, horizontal, rotate, twist, pulse) that
// WarmupMoveAnimation loops on screen — a lightweight stand-in for
// illustrated exercise art that needs no image assets and works
// identically on web and native.
export const WARMUP_ROUTINES: WarmupRoutine[] = [
  {
    id: 'warmup-lower', title: 'Lower Body Warm-Up', category: 'lower_body',
    steps: [
      { text: 'Bodyweight squats', durationSeconds: 30, emoji: '🏋️', animation: 'vertical' },
      { text: 'Walking lunges', durationSeconds: 30, emoji: '🚶', animation: 'horizontal' },
      { text: 'Leg swings — Right leg', durationSeconds: 20, emoji: '🦵', animation: 'horizontal' },
      { text: 'Leg swings — Left leg', durationSeconds: 20, emoji: '🦵', animation: 'horizontal' },
      { text: 'Glute bridges', durationSeconds: 30, emoji: '🍑', animation: 'vertical' },
      { text: 'Bodyweight calf raises', durationSeconds: 20, emoji: '🦶', animation: 'quickVertical' },
    ],
  },
  {
    id: 'warmup-upper', title: 'Upper Body Warm-Up', category: 'upper_body',
    steps: [
      { text: 'Arm circles, forward then back', durationSeconds: 20, emoji: '💪', animation: 'rotate' },
      { text: 'Band pull-aparts (or the same motion with no band)', durationSeconds: 30, emoji: '🙌', animation: 'horizontal' },
      { text: 'Shoulder rolls', durationSeconds: 20, emoji: '🤷', animation: 'rotate' },
      { text: 'Push-up to downward dog', durationSeconds: 30, emoji: '🧘', animation: 'vertical' },
      { text: 'Light rows or scapular squeezes', durationSeconds: 30, emoji: '🚣', animation: 'horizontal' },
    ],
  },
  {
    id: 'warmup-core', title: 'Core Warm-Up', category: 'core',
    steps: [
      { text: 'Cat-cow stretch', durationSeconds: 30, emoji: '🐱', animation: 'vertical' },
      { text: 'Dead bug, slow controlled reps', durationSeconds: 30, emoji: '🐞', animation: 'pulse' },
      { text: 'Bird dog, alternating sides', durationSeconds: 30, emoji: '🐦', animation: 'twist' },
      { text: 'Standing side bends', durationSeconds: 20, emoji: '🙆', animation: 'twist' },
    ],
  },
  {
    id: 'warmup-fullbody', title: 'Full Body Warm-Up', category: 'fullbody',
    steps: [
      { text: 'Jumping jacks', durationSeconds: 30, emoji: '🤸', animation: 'quickVertical' },
      { text: 'Bodyweight squats', durationSeconds: 30, emoji: '🏋️', animation: 'vertical' },
      { text: 'Arm circles', durationSeconds: 20, emoji: '💪', animation: 'rotate' },
      { text: 'Walking lunges', durationSeconds: 30, emoji: '🚶', animation: 'horizontal' },
      { text: 'High knees', durationSeconds: 20, emoji: '🏃', animation: 'quickVertical' },
    ],
  },
];

/**
 * Picks the warm-up category that actually matches what the day
 * trains — a lower-body-dominant day gets the lower-body warm-up, not
 * a generic one. Mixed upper+lower days get the full-body warm-up
 * rather than guessing which half matters more.
 */
export function warmupCategoryForGroups(muscleGroups: string[]): WarmupCategory {
  const lowerBodyGroups = new Set(['quads', 'hamstrings', 'glutes', 'calves']);
  const upperBodyGroups = new Set(['chest', 'back', 'shoulders', 'arms']);

  let lowerCount = 0, upperCount = 0, coreCount = 0, fullbodyCount = 0;
  for (const group of muscleGroups) {
    if (lowerBodyGroups.has(group)) lowerCount++;
    else if (upperBodyGroups.has(group)) upperCount++;
    else if (group === 'core') coreCount++;
    else if (group === 'fullbody') fullbodyCount++;
  }

  if (fullbodyCount > 0 || (lowerCount > 0 && upperCount > 0)) return 'fullbody';
  if (lowerCount > 0 && lowerCount >= upperCount && lowerCount >= coreCount) return 'lower_body';
  if (upperCount > 0 && upperCount >= coreCount) return 'upper_body';
  if (coreCount > 0) return 'core';
  return 'fullbody';
}

export function getWarmupForGroups(muscleGroups: string[]): WarmupRoutine {
  const category = warmupCategoryForGroups(muscleGroups);
  return WARMUP_ROUTINES.find((r) => r.category === category) || WARMUP_ROUTINES[WARMUP_ROUTINES.length - 1]!;
}
