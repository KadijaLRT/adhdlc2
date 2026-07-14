import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';

export interface ProgramProgressState {
  activeProgramId: string | null;
  programStartedAt: string | null;
  sessionsCompletedInProgram: number;
}

export interface ProgramSlice extends ProgramProgressState {
  startProgram: (programId: string) => Promise<void>;
  stopProgram: () => Promise<void>;
  recordProgramSession: () => Promise<void>;
}

const DEFAULT_STATE: ProgramProgressState = {
  activeProgramId: null,
  programStartedAt: null,
  sessionsCompletedInProgram: 0,
};

async function persist(state: ProgramProgressState) {
  const repo = await getRepository();
  await repo.saveProgramState(state);
}

// Actual exercise history (sets, reps, streak, records) still lives
// entirely in workoutSlice. This slice only tracks *which* program is
// active and how many sessions into it the person is — that's the
// minimum needed to compute a current week, without duplicating any
// data that already exists elsewhere.
export const createProgramSlice: StateCreator<ProgramSlice> = (set, get) => ({
  ...DEFAULT_STATE,

  startProgram: async (programId) => {
    const nextState = { activeProgramId: programId, programStartedAt: new Date().toISOString(), sessionsCompletedInProgram: 0 };
    set(nextState);
    await persist(nextState);
  },

  stopProgram: async () => {
    const nextState = { activeProgramId: null, programStartedAt: null, sessionsCompletedInProgram: 0 };
    set(nextState);
    await persist(nextState);
  },

  recordProgramSession: async () => {
    const nextState = {
      activeProgramId: get().activeProgramId,
      programStartedAt: get().programStartedAt,
      sessionsCompletedInProgram: (get().sessionsCompletedInProgram || 0) + 1,
    };
    set(nextState);
    await persist(nextState);
  },
});
