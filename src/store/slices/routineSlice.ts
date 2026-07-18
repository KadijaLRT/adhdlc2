import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { Routine } from './types';

export interface RoutineSlice {
  routines: Routine[];
  addRoutine: (routine: Routine) => Promise<void>;
  removeRoutine: (id: string) => Promise<void>;
  toggleRoutineStep: (routineId: string, stepId: string) => Promise<void>;
}

function today(): string {
  return (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
}

async function persist(routines: Routine[]) {
  const repo = await getRepository();
  await repo.saveRoutines(routines || []);
}

// A routine's identity (name, icon) lives here. Its progress
// (RoutineStreak, in streakSlice.ts) is kept separate — a routine can
// exist with zero completions, and deleting a routine doesn't touch its
// streak history.
export const createRoutineSlice: StateCreator<RoutineSlice> = (set, get) => ({
  routines: [],

  addRoutine: async (routine) => {
    const next = [...(get().routines || []), routine];
    set({ routines: next });
    await persist(next);
  },

  removeRoutine: async (id) => {
    const next = (get().routines || []).filter((r) => r.id !== id);
    set({ routines: next });
    await persist(next);
  },

  toggleRoutineStep: async (routineId, stepId) => {
    const t = today();
    const next = (get().routines || []).map((r) => {
      if (r.id !== routineId) return r;
      // A stored completion date from any day but today reads as
      // "nothing checked yet" — this is the implicit daily reset.
      const currentlyChecked = r.stepCompletionDate === t ? (r.completedStepIds || []) : [];
      const nextChecked = currentlyChecked.includes(stepId)
        ? currentlyChecked.filter((id) => id !== stepId)
        : [...currentlyChecked, stepId];
      return { ...r, stepCompletionDate: t, completedStepIds: nextChecked };
    });
    set({ routines: next });
    await persist(next);
  },
});
