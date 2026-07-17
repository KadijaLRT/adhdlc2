export interface RoutineTemplateStep {
  text: string;
  durationMinutes?: number;
}

export interface RoutineTemplate {
  id: string;
  title: string;
  emoji: string;
  steps: RoutineTemplateStep[];
}

// Ported from the old app's default checklists, now with optional
// per-step durations so the guided runner can count down each one
// instead of just waiting for a tap.
export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: 'morning', title: 'Morning Routine', emoji: '☀️',
    steps: [
      { text: 'Wake up + hydrate', durationMinutes: 5 },
      { text: 'Medications / supplements', durationMinutes: 2 },
      { text: 'Eat breakfast', durationMinutes: 15 },
      { text: 'Get dressed', durationMinutes: 10 },
      { text: 'Brush teeth', durationMinutes: 3 },
      { text: 'Pack bag' },
    ],
  },
  {
    id: 'evening', title: 'Evening Wind Down', emoji: '🌙',
    steps: [
      { text: 'Prep for tomorrow', durationMinutes: 10 },
      { text: 'Tidy main space', durationMinutes: 10 },
      { text: 'Skincare', durationMinutes: 5 },
      { text: 'Phone on charger' },
      { text: 'Set morning alarm' },
    ],
  },
  {
    id: 'errands', title: 'Errands Run', emoji: '🛍️',
    steps: [
      { text: 'Wallet / ID' },
      { text: 'Phone + charger' },
      { text: 'Shopping list' },
      { text: 'Reusable bags' },
    ],
  },
  {
    // A fixed one-hour reset, pick a starting point and go around —
    // every step has a real duration so the guided runner can count
    // the whole hour down segment by segment.
    id: 'one-hour-reset', title: '1-Hour Reset', emoji: '⏱️',
    steps: [
      { text: 'Eat a nourishing breakfast', durationMinutes: 25 },
      { text: 'Take a cold shower', durationMinutes: 15 },
      { text: 'Write to-do list', durationMinutes: 5 },
      { text: 'Drink water', durationMinutes: 5 },
      { text: 'Stretch', durationMinutes: 5 },
      { text: 'Make the bed', durationMinutes: 5 },
    ],
  },
];
