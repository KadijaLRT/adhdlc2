export interface StretchRoutine {
  id: string;
  title: string;
  durationMinutes: number;
  steps: string[];
}

// Deliberately generic, low-risk stretches — nothing here is specific
// to an injury or medical condition. If soreness is sharp, localized,
// or lasts more than a few days, that's outside what general stretching
// guidance should address, and the UI says so directly.
export const STRETCH_ROUTINES: StretchRoutine[] = [
  { id: 'lower-body', title: 'Lower Body Reset', durationMinutes: 5, steps: [
    'Standing quad stretch, 30 sec each leg',
    'Seated forward fold, 30 sec',
    'Figure-4 glute stretch, 30 sec each side',
    'Standing calf stretch against a wall, 30 sec each leg',
  ] },
  { id: 'desk-break', title: 'Desk Break Loosener', durationMinutes: 3, steps: [
    'Neck tilts side to side, 5 each way',
    'Shoulder rolls, 10 slow reps',
    'Seated spinal twist, 20 sec each side',
    'Wrist and finger stretches, 20 sec',
  ] },
  { id: 'full-body', title: 'Full Body Cooldown', durationMinutes: 6, steps: [
    'Standing forward fold, 30 sec',
    "Child's pose, 30 sec",
    'Cross-body shoulder stretch, 20 sec each arm',
    'Standing quad stretch, 20 sec each leg',
    'Deep breathing, 5 slow breaths',
  ] },
];

export const RECOVERY_TIPS = {
  hydration: 'Water needs go up on workout days. A simple check: pale yellow urine is a reasonable sign you\'re hydrated enough.',
  sleep: 'Muscle repair happens mostly during sleep. Consistent sleep timing matters more than total hours alone.',
  soreness: 'Soreness 24-48 hours after a new or harder workout is normal and usually fades on its own. Sharp pain, swelling, or soreness lasting more than 4-5 days is worth checking with a doctor rather than pushing through.',
  restDays: 'Rest days aren\'t a pause in progress, they\'re part of it. Muscles rebuild stronger during rest, not during the workout itself.',
};
