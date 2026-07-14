import type { Task, EnergyLevel, TaskPriority } from '@/store/index';

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  critical: 3,
  important: 2,
  nice: 1,
};

const ENERGY_RANK: Record<EnergyLevel, number> = { low: 0, medium: 1, high: 2 };

/**
 * Picks exactly one task to surface as "what should I do next," so the
 * person never has to make that decision themselves. Priority matters
 * most; a task requiring more energy than the person currently has is
 * deprioritized but never excluded outright, since sometimes the
 * high-effort thing is still the right one to tackle. Deterministic
 * given the same inputs — no randomness, so re-opening the app doesn't
 * shuffle the recommendation for no reason.
 */
export function suggestNextTask(tasks: Task[], currentEnergyLevel: EnergyLevel): Task | null {
  const incomplete = (tasks || []).filter((t) => !t?.isComplete);
  if (!incomplete.length) return null;

  const scored = incomplete.map((task) => {
    const priorityScore = PRIORITY_WEIGHT[task.priority || 'nice'];
    const energyMismatch = Math.abs(ENERGY_RANK[task.energyRequired || 'medium'] - ENERGY_RANK[currentEnergyLevel]);
    const energyPenalty = energyMismatch * 0.5;
    return { task, score: priorityScore - energyPenalty };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.task || null;
}
