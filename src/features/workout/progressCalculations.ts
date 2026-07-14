import type { SetLogEntry, PersonalRecord } from '@/store/slices/workoutSlice';

function dateOnly(iso: string): string {
  return (iso || '').split('T')[0];
}

/**
 * Consecutive-day streak based on any logged set, ending today or
 * yesterday (so it doesn't zero out the instant midnight passes before
 * the person opens the app). This is a read/display value only — it
 * never blocks or resets anything, unlike the routine streaks, which
 * have their own explicit freeze mechanic; this one simply reports.
 */
export function calculateWorkoutStreak(setLogs: SetLogEntry[]): number {
  const uniqueDays = Array.from(new Set((setLogs || []).map((l) => dateOnly(l.date)))).sort().reverse();
  if (!uniqueDays.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let cursor = new Date(today);

  for (const day of uniqueDays) {
    const cursorStr = cursor.toISOString().split('T')[0];
    if (day === cursorStr) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (streak === 0) {
      // Allow the streak to still "count" if the most recent session
      // was yesterday, not just today.
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (day === yesterday.toISOString().split('T')[0]) {
        streak += 1;
        cursor = new Date(yesterday);
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return streak;
}

export function calculateTotalWorkouts(setLogs: SetLogEntry[]): number {
  return Array.from(new Set((setLogs || []).map((l) => dateOnly(l.date)))).length;
}

export function calculateTotalVolume(setLogs: SetLogEntry[]): number {
  return (setLogs || []).reduce((sum, l) => sum + (l.weight || 0) * (l.reps || 0), 0);
}

// Rough estimate only — there is no real session-duration tracking yet,
// so this uses a flat per-set time assumption. Clearly labeled as an
// estimate in the UI, never presented as a precise measurement.
export function calculateEstimatedMinutes(setLogs: SetLogEntry[]): number {
  const MINUTES_PER_SET = 2;
  return Math.round((setLogs || []).length * MINUTES_PER_SET);
}

export interface WeeklyVolumePoint {
  weekLabel: string;
  volume: number;
}

export function calculateWeeklyVolume(setLogs: SetLogEntry[], weeks = 6): WeeklyVolumePoint[] {
  const now = new Date();
  const points: WeeklyVolumePoint[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const volume = (setLogs || [])
      .filter((l) => {
        const d = new Date(l.date);
        return d >= weekStart && d < weekEnd;
      })
      .reduce((sum, l) => sum + (l.weight || 0) * (l.reps || 0), 0);

    points.push({ weekLabel: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`, volume });
  }
  return points;
}

export function getTopRecords(records: PersonalRecord[], limit = 10): PersonalRecord[] {
  return [...(records || [])]
    .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
    .slice(0, limit);
}
