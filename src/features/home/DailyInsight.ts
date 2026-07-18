import type { EnergyLevel, StressLogEntry, RoutineStreak, Task, MomentumEntry } from '@/store/index';

/**
 * Rule-based, not AI-generated — a simple derived observation from data
 * already on the device, so this never costs a Groq call just to show a
 * one-line note on the home screen. Deliberately conservative: no
 * causal claims about *why* something is happening, only what the data
 * literally shows. This is Aviva "noticing," not diagnosing.
 */
export function getDailyInsight(
  energyLevel: EnergyLevel,
  stressLogs: StressLogEntry[],
  streaks: RoutineStreak[],
  tasks: Task[] = [],
  momentumLog: MomentumEntry[] = []
): string {
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  const todaysStress = (stressLogs || []).find((l) => l.date === today);

  if (todaysStress?.stressLevel === 'high') {
    return 'Stress looks high today. A lighter task list might feel better than pushing through.';
  }

  const repeatedTaskTitle = findRepeatedlyOpenedIncompleteTask(tasks, momentumLog);
  if (repeatedTaskTitle) {
    return `You've come back to "${repeatedTaskTitle}" a few times without finishing it. Worth noticing, not a problem to fix today necessarily.`;
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

/**
 * Looks for a task that's been opened (per momentum's opened_task
 * events, which now carry the task id) at least 3 times and is still
 * incomplete. Real detection over real logged data, not a guess.
 */
function findRepeatedlyOpenedIncompleteTask(tasks: Task[], momentumLog: MomentumEntry[]): string | null {
  const openCounts = new Map<string, number>();
  for (const entry of momentumLog || []) {
    if (entry.type !== 'opened_task' || !entry.refId) continue;
    openCounts.set(entry.refId, (openCounts.get(entry.refId) || 0) + 1);
  }

  let bestTaskId: string | null = null;
  let bestCount = 2; // require at least 3 opens before this counts as a pattern
  for (const [taskId, count] of openCounts.entries()) {
    const task = (tasks || []).find((t) => t.id === taskId);
    if (task && !task.isComplete && count > bestCount) {
      bestCount = count;
      bestTaskId = taskId;
    }
  }

  if (!bestTaskId) return null;
  return (tasks || []).find((t) => t.id === bestTaskId)?.title || null;
}
