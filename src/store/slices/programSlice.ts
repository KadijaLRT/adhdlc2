import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { FitnessPreferences } from './nutritionFitnessSlice';

export interface ProgramProgressState {
  activeProgramId: string | null;
  programStartedAt: string | null;
  sessionsCompletedInProgram: number;
}

export interface ProgramSlice extends ProgramProgressState {
  startProgram: (programId: string) => Promise<void>;
  stopProgram: () => Promise<void>;
  recordProgramSession: () => Promise<void>;
  autoAssignDefaultProgram: (preferences: FitnessPreferences | null) => Promise<void>;
}

// Maps a stated primary goal to a sensible starter program. This is a
// gentle default, never a lock-in — anyone can switch programs (or stop
// entirely) from the workouts landing page at any time. 'strength' and
// unset/'general' both land on Beginner Strength since it's the
// broadest, lowest-barrier starting point of the seven programs.
function pickDefaultProgramId(preferences: FitnessPreferences | null): string {
  const goal = preferences?.primaryGoal;
  if (goal === 'endurance') return 'endurance';
  if (goal === 'mobility') return 'mobility';
  return 'beginner-strength';
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

  // Only ever assigns when nothing is active — this never overrides a
  // program the person picked or stopped on purpose. Called once from
  // the workouts landing page on mount.
  autoAssignDefaultProgram: async (preferences) => {
    if (get().activeProgramId) return;
    const programId = pickDefaultProgramId(preferences);
    const nextState = { activeProgramId: programId, programStartedAt: new Date().toISOString(), sessionsCompletedInProgram: 0 };
    set(nextState);
    await persist(nextState);
  },
});
