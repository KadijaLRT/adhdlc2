/**
 * Shared vocabulary for the app's voice: calm confidence over
 * motivational energy, per the product's tone guidelines. New copy
 * anywhere in the app should draw from here rather than reinventing
 * productivity-app language case by case.
 */
export const COPY = {
  done: 'Done',
  paused: 'Paused', // instead of "failed"
  skipped: 'Skipped', // instead of "missed"
  waiting: 'Waiting', // instead of "overdue"
  nudge: 'Nudge', // instead of "reminder"
  insights: 'Insights', // instead of "statistics"
  momentum: 'Momentum', // instead of "productivity"
  intentions: 'Intentions', // instead of "goals"
  reset: 'Reset', // instead of "emergency"
  focusSprint: 'Focus Sprint', // instead of "Focus Mode"
  coachName: 'Aviva',
} as const;

export const TONE_EXAMPLES = {
  taskComplete: 'Nice work.',
  goalAchieved: 'You did it.',
  startFocus: 'Ready to focus?',
  genericError: "Something didn't work. Let's try that again.",
  showedUp: 'You kept showing up today.',
  smallStep: 'Small steps count.',
  notLinear: "Progress isn't linear.",
} as const;
