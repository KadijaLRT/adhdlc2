import type { CycleLogEntry } from '@/store/slices/types';

/**
 * Groups consecutive menstrual-flagged dates into distinct periods and
 * returns each period's first date. A date starts a new period if the
 * day before it wasn't also logged as menstrual — this is what turns a
 * pile of daily flow records into "this many periods happened," rather
 * than counting every single flow-day as its own cycle.
 */
export function getPeriodStartDates(cycleLogs: CycleLogEntry[]): string[] {
  const menstrualDates = (cycleLogs || [])
    .filter((l) => l.phase === 'menstrual')
    .map((l) => l.date)
    .sort();

  const starts: string[] = [];
  for (let i = 0; i < menstrualDates.length; i++) {
    const current = menstrualDates[i];
    if (!current) continue;
    const prev = menstrualDates[i - 1];
    if (!prev) {
      starts.push(current);
      continue;
    }
    const gapDays = (new Date(current).getTime() - new Date(prev).getTime()) / 86400000;
    if (gapDays > 1) starts.push(current);
  }
  return starts;
}

/** Average gap between period start dates, in days. Null if fewer than 2 periods logged. */
export function getAverageCycleLength(periodStarts: string[]): number | null {
  if (periodStarts.length < 2) return null;
  let totalDays = 0;
  let gaps = 0;
  for (let i = 1; i < periodStarts.length; i++) {
    const current = periodStarts[i];
    const prev = periodStarts[i - 1];
    if (!current || !prev) continue;
    totalDays += (new Date(current).getTime() - new Date(prev).getTime()) / 86400000;
    gaps += 1;
  }
  return gaps > 0 ? Math.round(totalDays / gaps) : null;
}

/** Predicted next period start date, or null if there's not enough history to estimate from. */
export function getPredictedNextPeriod(periodStarts: string[], averageCycleLength: number | null): string | null {
  if (!periodStarts.length || !averageCycleLength) return null;
  const lastStart = periodStarts[periodStarts.length - 1];
  if (!lastStart) return null;
  const predicted = new Date(lastStart);
  predicted.setDate(predicted.getDate() + averageCycleLength);
  return predicted.toISOString().split('T')[0] || null;
}
