import type { Task, Routine, RoutineStreak, EnergyLevel } from '@/store/index';
import { suggestNextTask } from '@/features/tasks/suggestNextTask';

export interface PlanItem {
  id: string;
  label: string;
  kind: 'task' | 'routine' | 'focus';
}

/**
 * Deterministic aggregation across what already exists (tasks, routines)
 * into one ordered "today's plan" — no new AI call, no new data model.
 * Same reasoning as "Start Somewhere" in Workout: the value is in
 * assembling an existing decision, not adding a new one.
 */
export function buildTodaysPlan(
  tasks: Task[],
  routines: Routine[],
  streaks: RoutineStreak[],
  energyLevel: EnergyLevel
): PlanItem[] {
  const today = new Date().toISOString().split('T')[0];
  const plan: PlanItem[] = [];

  const pendingRoutines = (routines || []).filter((r) => {
    const streak = (streaks || []).find((s) => s.routineId === r.id);
    return streak?.lastCompletedDate !== today;
  });

  for (const routine of pendingRoutines.slice(0, 2)) {
    plan.push({ id: routine.id, label: `${routine.emoji} ${routine.title}`, kind: 'routine' });
  }

  const nextTask = suggestNextTask(tasks, energyLevel);
  if (nextTask) {
    plan.push({ id: nextTask.id, label: nextTask.title, kind: 'task' });
  }

  if (energyLevel !== 'low') {
    plan.push({ id: 'focus-block', label: 'A focus session, whenever fits', kind: 'focus' });
  }

  return plan;
}
