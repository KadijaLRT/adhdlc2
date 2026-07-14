import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { Routine } from './types';

export interface RoutineSlice {
  routines: Routine[];
  addRoutine: (routine: Routine) => Promise<void>;
  removeRoutine: (id: string) => Promise<void>;
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
});
