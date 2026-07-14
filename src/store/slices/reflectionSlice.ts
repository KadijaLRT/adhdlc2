import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';

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

async function persist(state: ReflectionState) {
  const repo = await getRepository();
  await repo.saveReflectionState(state);
}

export const createReflectionSlice: StateCreator<ReflectionSlice> = (set, get) => ({
  reflections: [],

  saveReflectionForToday: async (note) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = get().reflections || [];
    const already = existing.some((r) => r.date === today);
    const next = already
      ? existing.map((r) => (r.date === today ? { date: today, note } : r))
      : [...existing, { date: today, note }];
    set({ reflections: next });
    await persist({ reflections: next });
  },
});
