export interface RoutineTemplate {
  id: string;
  title: string;
  emoji: string;
  steps: string[];
}

// Ported from the old app's default checklists.
export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: 'morning', title: 'Morning Routine', emoji: '☀️',
    steps: ['Wake up + hydrate', 'Medications / supplements', 'Eat breakfast', 'Get dressed', 'Brush teeth', 'Pack bag'],
  },
  {
    id: 'evening', title: 'Evening Wind Down', emoji: '🌙',
    steps: ['Prep for tomorrow', 'Tidy main space', 'Skincare', 'Phone on charger', 'Set morning alarm'],
  },
  {
    id: 'errands', title: 'Errands Run', emoji: '🛍️',
    steps: ['Wallet / ID', 'Phone + charger', 'Shopping list', 'Reusable bags'],
  },
];
