export interface StretchStep {
  text: string;
  holdSeconds: number;
}

export interface StretchRoutine {
  id: string;
  title: string;
  durationMinutes: number;
  steps: StretchStep[];
}

// Deliberately generic, low-risk stretches — nothing here is specific
// to an injury or medical condition. If soreness is sharp, localized,
// or lasts more than a few days, that's outside what general stretching
// guidance should address, and the UI says so directly.
//
// "Each leg/side/arm" stretches are split into two separate timed
// steps (Right then Left) rather than one step covering both sides,
// so the guided timer actually walks through each side individually
// instead of one countdown silently meaning "do this twice."
export const STRETCH_ROUTINES: StretchRoutine[] = [
  {
    id: 'lower-body', title: 'Lower Body Reset', durationMinutes: 5, steps: [
      { text: 'Standing quad stretch — Right leg', holdSeconds: 30 },
      { text: 'Standing quad stretch — Left leg', holdSeconds: 30 },
      { text: 'Seated forward fold', holdSeconds: 30 },
      { text: 'Figure-4 glute stretch — Right side', holdSeconds: 30 },
      { text: 'Figure-4 glute stretch — Left side', holdSeconds: 30 },
      { text: 'Standing calf stretch against a wall — Right leg', holdSeconds: 30 },
      { text: 'Standing calf stretch against a wall — Left leg', holdSeconds: 30 },
    ],
  },
  {
    id: 'desk-break', title: 'Desk Break Loosener', durationMinutes: 3, steps: [
      { text: 'Neck tilts side to side (5 each way)', holdSeconds: 20 },
      { text: 'Shoulder rolls (10 slow reps)', holdSeconds: 20 },
      { text: 'Seated spinal twist — Right side', holdSeconds: 20 },
      { text: 'Seated spinal twist — Left side', holdSeconds: 20 },
      { text: 'Wrist and finger stretches', holdSeconds: 20 },
    ],
  },
  {
    id: 'full-body', title: 'Full Body Cooldown', durationMinutes: 6, steps: [
      { text: 'Standing forward fold', holdSeconds: 30 },
      { text: "Child's pose", holdSeconds: 30 },
      { text: 'Cross-body shoulder stretch — Right arm', holdSeconds: 20 },
      { text: 'Cross-body shoulder stretch — Left arm', holdSeconds: 20 },
      { text: 'Standing quad stretch — Right leg', holdSeconds: 20 },
      { text: 'Standing quad stretch — Left leg', holdSeconds: 20 },
      { text: 'Deep breathing (5 slow breaths)', holdSeconds: 30 },
    ],
  },
];

export const RECOVERY_TIPS = {
  hydration: 'Water needs go up on workout days. A simple check: pale yellow urine is a reasonable sign you\'re hydrated enough.',
  sleep: 'Muscle repair happens mostly during sleep. Consistent sleep timing matters more than total hours alone.',
  soreness: 'Soreness 24-48 hours after a new or harder workout is normal and usually fades on its own. Sharp pain, swelling, or soreness lasting more than 4-5 days is worth checking with a doctor rather than pushing through.',
  restDays: 'Rest days aren\'t a pause in progress, they\'re part of it. Muscles rebuild stronger during rest, not during the workout itself.',
};
