import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';

export type MomentumActionType = 'opened_task' | 'started_session' | 'first_step' | 'showed_up';

export interface MomentumEntry {
  type: MomentumActionType;
  date: string;
}

export interface MomentumState {
  momentumLog: MomentumEntry[];
}

export interface MomentumSlice extends MomentumState {
  logMomentum: (type: MomentumActionType) => Promise<void>;
}

async function persist(state: MomentumState) {
  const repo = await getRepository();
  await repo.saveMomentumState(state);
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Deliberately counts things smaller than completion — opening a task,
 * starting a session, finishing just the first sub-step. ADHD momentum
 * often matters more than finishing; this exists so "I opened it but
 * didn't finish" still counts as something, not nothing.
 */
export const createMomentumSlice: StateCreator<MomentumSlice> = (set, get) => ({
  momentumLog: [],

  logMomentum: async (type) => {
    const next = [...(get().momentumLog || []), { type, date: today() }];
    set({ momentumLog: next });
    await persist({ momentumLog: next });
  },
});
