import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { RoutineStreak } from './types';
import type { MilestoneSlice } from './milestoneSlice';
import type { RpgSlice } from './rpgSlice';

export interface StreakSlice {
  streaks: RoutineStreak[];
  recordRoutineCompletion: (routineId: string) => Promise<{ isRecovery: boolean }>;
  useStreakFreeze: (routineId: string) => Promise<void>;
}

async function persist(streaks: RoutineStreak[]) {
  const repo = await getRepository();
  await repo.saveStreaks(streaks || []);
}

function today(): string { return new Date().toISOString().split('T')[0]; }

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.round(Math.abs(a - b) / (1000 * 60 * 60 * 24));
}

// Forgiving system: a missed day never resets count to zero, it simply
// does not increment. Streaks degrade gracefully, never punitively.
// Coming back after a real gap is treated as its own moment worth
// celebrating, not just a routine completion like any other.
export const createStreakSlice: StateCreator<
  StreakSlice & MilestoneSlice & RpgSlice, [], [], StreakSlice
> = (set, get) => ({
  streaks: [],

  recordRoutineCompletion: async (routineId) => {
    const existing = (get().streaks || []).find((s) => s.routineId === routineId);
    const isRecovery = !!(existing?.lastCompletedDate && daysBetween(existing.lastCompletedDate, today()) >= 2);

    const next = existing
      ? (get().streaks || []).map((s) => s.routineId === routineId
          ? { ...s, count: s.count + 1, lastCompletedDate: today(), isFrozen: false } : s)
      : [...(get().streaks || []), { routineId, count: 1, lastCompletedDate: today(), freezesAvailable: 2, isFrozen: false }];
    set({ streaks: next });
    await persist(next);
    await get().incrementMilestone('routine_completed');
    await get().awardProgress('confidence', isRecovery ? 12 : 8, 4);
    return { isRecovery };
  },

  useStreakFreeze: async (routineId) => {
    const next = (get().streaks || []).map((s) =>
      s.routineId === routineId && s.freezesAvailable > 0
        ? { ...s, isFrozen: true, freezesAvailable: s.freezesAvailable - 1 } : s
    );
    set({ streaks: next });
    await persist(next);
  },
});
