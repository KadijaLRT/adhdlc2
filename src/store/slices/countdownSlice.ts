import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import { createWriteGuard } from '@/core/storage/writeGuard';

export interface CountdownEvent {
  id: string;
  label: string;
  emoji: string;
  date: string; // YYYY-MM-DD — the next/original occurrence
  isRecurringYearly?: boolean; // birthdays, holidays, anniversaries — recalculates to the next occurrence once the date passes
}

export interface CountdownState {
  countdownEvents: CountdownEvent[];
}

export interface CountdownSlice extends CountdownState {
  addCountdownEvent: (event: CountdownEvent) => Promise<void>;
  removeCountdownEvent: (id: string) => Promise<void>;
}

const persist = createWriteGuard(async (state: CountdownState) => {
  const repo = await getRepository();
  await repo.saveCountdownState(state);
});

function currentState(get: () => CountdownState): CountdownState {
  return { countdownEvents: get().countdownEvents || [] };
}

export const createCountdownSlice: StateCreator<CountdownSlice> = (set, get) => ({
  countdownEvents: [],

  addCountdownEvent: async (event) => {
    const next = [...(get().countdownEvents || []), event];
    const nextState = { ...currentState(get), countdownEvents: next };
    set(nextState);
    await persist(nextState);
  },

  removeCountdownEvent: async (id) => {
    const next = (get().countdownEvents || []).filter((e) => e.id !== id);
    const nextState = { ...currentState(get), countdownEvents: next };
    set(nextState);
    await persist(nextState);
  },
});
