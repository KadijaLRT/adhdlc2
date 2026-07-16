import type { SetLogEntry } from '@/store/slices/workoutSlice';

/**
 * Compares the most recent logged weight for an exercise against the
 * one before it (from a different day) and returns a short "↑ Xlbs"
 * style label, or null if there's nothing to compare yet. Only ever
 * shows increases — a weight decrease between sessions is common and
 * normal (fatigue, form focus, etc.) and isn't flagged as a regression,
 * matching the app's non-punitive approach to progress elsewhere.
 */
export function getWeightProgressLabel(exerciseId: string, setLogs: SetLogEntry[]): string | null {
  const logsForExercise = (setLogs || [])
    .filter((l) => l.exerciseId === exerciseId && l.weight > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (logsForExercise.length < 2) return null;

  // Group by day so multiple sets in one session don't count as separate data points.
  const byDay = new Map<string, number>();
  for (const log of logsForExercise) {
    const day = log.date.split('T')[0] || log.date;
    byDay.set(day, Math.max(byDay.get(day) || 0, log.weight));
  }

  const days = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b));
  if (days.length < 2) return null;

  const latest = days[days.length - 1];
  const previous = days[days.length - 2];
  if (!latest || !previous) return null;

  const diff = latest[1] - previous[1];
  if (diff <= 0) return null;

  return `↑ ${diff}lbs`;
}
