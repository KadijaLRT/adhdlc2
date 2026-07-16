export interface StuckPrompt { id: string; text: string; }

// Deliberately tiny, concrete, low-friction actions. No urgency, no
// "just" or "simply," no implied judgment about why the user is stuck.
export const STUCK_PROMPTS: StuckPrompt[] = [
  { id: 'water', text: 'Take a sip of water.' },
  { id: 'stretch', text: 'Stand up and stretch for ten seconds.' },
  { id: 'one-item', text: 'Put away one single item near you.' },
  { id: 'breath', text: 'Take three slow breaths.' },
  { id: 'open-task', text: 'Open the task and read only its title.' },
  { id: 'timer-2', text: 'Set a two minute timer and just start.' },
  { id: 'clear-space', text: 'Clear one small area of your desk or table.' },
  { id: 'stand-window', text: 'Stand near a window for a moment.' },
];

export function getRandomPrompt(excludeId?: string): StuckPrompt {
  const pool = excludeId ? STUCK_PROMPTS.filter((p) => p.id !== excludeId) : STUCK_PROMPTS;
  const fallback = STUCK_PROMPTS[0] || { id: 'water', text: 'Take a sip of water.' };
  return pool[Math.floor(Math.random() * pool.length)] || fallback;
}
