export interface StretchStep {
  text: string;
  holdSeconds: number;
}

export type RecoveryRoutineCategory = 'stretch' | 'foam_rolling';

export interface StretchRoutine {
  id: string;
  title: string;
  durationMinutes: number;
  steps: StretchStep[];
  category: RecoveryRoutineCategory;
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
//
// Foam rolling routines live in this same array (tagged `category:
// 'foam_rolling'`) rather than a separate one — they're structurally
// identical (a sequence of timed holds walked through one at a time),
// so they share the exact same guided-timer runner and completion
// tracking as the stretches instead of needing a parallel component.
export const STRETCH_ROUTINES: StretchRoutine[] = [
  {
    id: 'lower-body', title: 'Lower Body Reset', durationMinutes: 5, category: 'stretch', steps: [
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
    id: 'desk-break', title: 'Desk Break Loosener', durationMinutes: 3, category: 'stretch', steps: [
      { text: 'Neck tilts side to side (5 each way)', holdSeconds: 20 },
      { text: 'Shoulder rolls (10 slow reps)', holdSeconds: 20 },
      { text: 'Seated spinal twist — Right side', holdSeconds: 20 },
      { text: 'Seated spinal twist — Left side', holdSeconds: 20 },
      { text: 'Wrist and finger stretches', holdSeconds: 20 },
    ],
  },
  {
    id: 'full-body', title: 'Full Body Cooldown', durationMinutes: 6, category: 'stretch', steps: [
      { text: 'Standing forward fold', holdSeconds: 30 },
      { text: "Child's pose", holdSeconds: 30 },
      { text: 'Cross-body shoulder stretch — Right arm', holdSeconds: 20 },
      { text: 'Cross-body shoulder stretch — Left arm', holdSeconds: 20 },
      { text: 'Standing quad stretch — Right leg', holdSeconds: 20 },
      { text: 'Standing quad stretch — Left leg', holdSeconds: 20 },
      { text: 'Deep breathing (5 slow breaths)', holdSeconds: 30 },
    ],
  },
  {
    id: 'foam-roll-lower', title: 'Foam Roll — Lower Body', durationMinutes: 6, category: 'foam_rolling', steps: [
      { text: 'Quads — Right leg', holdSeconds: 40 },
      { text: 'Quads — Left leg', holdSeconds: 40 },
      { text: 'IT band (outer thigh) — Right leg', holdSeconds: 30 },
      { text: 'IT band (outer thigh) — Left leg', holdSeconds: 30 },
      { text: 'Hamstrings — Right leg', holdSeconds: 40 },
      { text: 'Hamstrings — Left leg', holdSeconds: 40 },
      { text: 'Calves — Right leg', holdSeconds: 30 },
      { text: 'Calves — Left leg', holdSeconds: 30 },
    ],
  },
  {
    id: 'foam-roll-upper', title: 'Foam Roll — Upper Back & Shoulders', durationMinutes: 4, category: 'foam_rolling', steps: [
      { text: 'Upper back (roll slowly between shoulder blades)', holdSeconds: 45 },
      { text: 'Lats — Right side', holdSeconds: 30 },
      { text: 'Lats — Left side', holdSeconds: 30 },
      { text: 'Glutes — Right side', holdSeconds: 30 },
      { text: 'Glutes — Left side', holdSeconds: 30 },
    ],
  },
];

// Lower-effort than a guided routine on purpose — these are things to
// go do, not something the app walks you through step by step. No
// timer, no completion tracking beyond what's already logged elsewhere
// (a walk isn't a metric to hit). Framed honestly: real physiological
// benefit for the movement-based ones, clearly-labeled "some people
// find it helps" for the ones where the evidence is genuinely mixed,
// never oversold as guaranteed recovery.
export interface ActiveRecoveryActivity {
  id: string;
  emoji: string;
  title: string;
  blurb: string;
  minutes: number;
}

export const ACTIVE_RECOVERY_ACTIVITIES: ActiveRecoveryActivity[] = [
  { id: 'easy-walk', emoji: '🚶', title: 'Easy walk', blurb: 'A relaxed, conversational-pace 15–20 minutes. Gets blood flowing to sore muscles without adding more fatigue.', minutes: 20 },
  { id: 'light-cardio', emoji: '🚴', title: 'Light cardio', blurb: 'Bike, swim, or row at an easy, low effort. The goal is circulation, not another training stimulus.', minutes: 15 },
  { id: 'gentle-mobility-flow', emoji: '🧘', title: 'Gentle mobility flow', blurb: 'Slow bodyweight movement through a full range of motion — think easy yoga flow, not intensity.', minutes: 10 },
  { id: 'contrast-shower', emoji: '🚿', title: 'Contrast shower', blurb: '30 seconds warm, 30 seconds cool, a few rounds. Low-risk and easy to do at home — anecdotal, not guaranteed.', minutes: 5 },
  { id: 'epsom-bath', emoji: '🛁', title: 'Warm soak', blurb: "Some people find a warm bath (with or without Epsom salt) helps them relax after a hard session. Evidence is mixed, but it's low-risk if you enjoy it.", minutes: 15 },
];

export const RECOVERY_TIPS = {
  hydration: 'Water needs go up on workout days. A simple check: pale yellow urine is a reasonable sign you\'re hydrated enough.',
  sleep: 'Muscle repair happens mostly during sleep. Consistent sleep timing matters more than total hours alone.',
  soreness: 'Soreness 24-48 hours after a new or harder workout is normal and usually fades on its own. Sharp pain, swelling, or soreness lasting more than 4-5 days is worth checking with a doctor rather than pushing through.',
  restDays: 'Rest days aren\'t a pause in progress, they\'re part of it. Muscles rebuild stronger during rest, not during the workout itself.',
};
