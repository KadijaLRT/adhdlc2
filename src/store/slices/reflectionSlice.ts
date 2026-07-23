import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import { createWriteGuard } from '@/core/storage/writeGuard';

export interface ReflectionEntry {
  date: string;
  note: string;
}

export interface ReflectionState {
  reflections: ReflectionEntry[];
}

export interface ReflectionSlice extends ReflectionState {
  saveReflectionForToday: (note: string) => Promise<void>;
}

const persist = createWriteGuard(async (state: ReflectionState) => {
  const repo = await getRepository();
  await repo.saveReflectionState(state);
});

export const createReflectionSlice: StateCreator<ReflectionSlice> = (set, get) => ({
  reflections: [],

  saveReflectionForToday: async (note) => {
    const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
    const existing = get().reflections || [];
    const already = existing.some((r) => r.date === today);
    const next = already
      ? existing.map((r) => (r.date === today ? { date: today, note } : r))
      : [...existing, { date: today, note }];
    set({ reflections: next });
    await persist({ reflections: next });
  },
});
