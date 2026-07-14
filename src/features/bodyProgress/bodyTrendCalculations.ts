import type { WeightEntry } from '@/store/slices/bodyProgressSlice';

/**
 * Emphasizes trend over any single day's number, on purpose — per the
 * document's "reduce discouragement from daily fluctuations" principle.
 * Weight naturally bounces day to day from water/food/timing; the
 * 7-day average and 30-day change are far more meaningful than today's
 * raw figure alone, so those are what the UI leads with.
 */
export function getSevenDayAverage(weightLog: WeightEntry[]): number | null {
  const sorted = [...(weightLog || [])].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, 7);
  if (!recent.length) return null;
  return recent.reduce((sum, e) => sum + e.weightLbs, 0) / recent.length;
}

export function getThirtyDayChange(weightLog: WeightEntry[]): number | null {
  const sorted = [...(weightLog || [])].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return null;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().split('T')[0];

  const oldEntry = sorted.find((e) => e.date >= cutoff) || sorted[0];
  const latestEntry = sorted[sorted.length - 1];
  return latestEntry.weightLbs - oldEntry.weightLbs;
}

export function getLatestWeight(weightLog: WeightEntry[]): number | null {
  const sorted = [...(weightLog || [])].sort((a, b) => b.date.localeCompare(a.date));
  return sorted[0]?.weightLbs ?? null;
}

export function projectGoalDate(weightLog: WeightEntry[], goalLbs: number | null): string | null {
  if (!goalLbs) return null;
  const change30 = getThirtyDayChange(weightLog);
  const latest = getLatestWeight(weightLog);
  if (change30 === null || latest === null || change30 === 0) return null;

  const remaining = goalLbs - latest;
  // Only project if moving in the direction of the goal.
  if ((remaining > 0 && change30 <= 0) || (remaining < 0 && change30 >= 0)) return null;

  const dailyRate = change30 / 30;
  const daysNeeded = Math.abs(remaining / dailyRate);
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + Math.round(daysNeeded));
  return projectedDate.toISOString().split('T')[0];
}
