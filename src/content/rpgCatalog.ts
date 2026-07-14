export type SkillId = 'focus' | 'organization' | 'sleep' | 'nutrition' | 'exercise' | 'confidence';

export const SKILLS: { id: SkillId; label: string; emoji: string }[] = [
  { id: 'focus', label: 'Focus', emoji: '🎯' },
  { id: 'organization', label: 'Organization', emoji: '🗂️' },
  { id: 'sleep', label: 'Sleep', emoji: '😴' },
  { id: 'nutrition', label: 'Nutrition', emoji: '🍎' },
  { id: 'exercise', label: 'Exercise', emoji: '🏃' },
  { id: 'confidence', label: 'Confidence', emoji: '💪' },
];

export interface UnlockableItem {
  id: string; label: string; emoji: string; cost: number;
  category: 'theme' | 'pet' | 'music' | 'avatar';
}

// Deliberately small so the shop never becomes a wall of choices.
export const UNLOCKABLES: UnlockableItem[] = [
  { id: 'theme-emerald', label: 'Emerald Theme', emoji: '🟢', cost: 50, category: 'theme' },
  { id: 'theme-amber', label: 'Amber Theme', emoji: '🟠', cost: 50, category: 'theme' },
  { id: 'pet-cat', label: 'Study Cat', emoji: '🐱', cost: 100, category: 'pet' },
  { id: 'pet-owl', label: 'Focus Owl', emoji: '🦉', cost: 100, category: 'pet' },
  { id: 'music-rain', label: 'Rain Sounds', emoji: '🌧️', cost: 30, category: 'music' },
  { id: 'music-lofi', label: 'Lo-fi Loop', emoji: '🎧', cost: 30, category: 'music' },
  { id: 'avatar-hat', label: 'Cozy Hat', emoji: '🎩', cost: 75, category: 'avatar' },
];

// Level is purely derived from total XP, never stored separately, so it
// can never drift out of sync or be "lost."
export function xpToLevel(totalXp: number): number {
  return Math.max(1, Math.floor(Math.sqrt((totalXp || 0) / 20)) + 1);
}
export function xpForNextLevel(currentLevel: number): number {
  return (currentLevel * currentLevel) * 20;
}
