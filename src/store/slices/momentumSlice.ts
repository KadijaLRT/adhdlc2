import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import { createWriteGuard } from '@/core/storage/writeGuard';

export type MomentumActionType = 'opened_task' | 'started_session' | 'first_step' | 'showed_up';

export interface MomentumEntry {
  type: MomentumActionType;
  date: string;
  refId?: string; // optional id of the task/routine/session this refers to
}

export interface MomentumState {
  momentumLog: MomentumEntry[];
}

export interface MomentumSlice extends MomentumState {
  logMomentum: (type: MomentumActionType, refId?: string) => Promise<void>;
}

const persist = createWriteGuard(async (state: MomentumState) => {
  const repo = await getRepository();
  await repo.saveMomentumState(state);
});

function today(): string {
  return (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
}

/**
 * Deliberately counts things smaller than completion — opening a task,
 * starting a session, finishing just the first sub-step. ADHD momentum
 * often matters more than finishing; this exists so "I opened it but
 * didn't finish" still counts as something, not nothing.
 */
export const createMomentumSlice: StateCreator<MomentumSlice> = (set, get) => ({
  momentumLog: [],

  logMomentum: async (type, refId) => {
    const next = [...(get().momentumLog || []), { type, date: today(), refId }];
    set({ momentumLog: next });
    await persist({ momentumLog: next });
  },
});
