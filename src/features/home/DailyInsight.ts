import type { EnergyLevel, StressLogEntry, RoutineStreak } from '@/store/index';

/**
 * Rule-based, not AI-generated — a simple derived observation from data
 * already on the device, so this never costs a Groq call just to show a
 * one-line note on the home screen. Deliberately conservative: no causal
 * claims about why something is happening, only what the data shows.
 */
export function getDailyInsight(
  energyLevel: EnergyLevel,
  stressLogs: StressLogEntry[],
  streaks: RoutineStreak[]
): string {
  const today = new Date().toISOString().split('T')[0];
  const todaysStress = (stressLogs || []).find((l) => l.date === today);

  if (todaysStress?.stressLevel === 'high') {
    return 'Stress looks high today. A lighter task list might feel better than pushing through.';
  }
  if (energyLevel === 'low') {
    return "Energy's low today — that's information, not a problem to fix. One small thing is enough.";
  }
  const longestStreak = Math.max(0, ...(streaks || []).map((s) => s.count || 0));
  if (longestStreak >= 7) {
    return `You've shown up consistently for a while now — ${longestStreak} check-ins on one routine alone.`;
  }
  return 'Today looks manageable. Start with whatever feels smallest.';
}
