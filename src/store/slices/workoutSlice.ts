import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';

export interface SetLogEntry {
  exerciseId: string;
  weight: number;
  reps: number;
  date: string;
}

export interface PersonalRecord {
  exerciseId: string;
  bestWeight: number;
  bestReps: number;
  achievedAt: string;
}

export interface WorkoutState {
  setLogs: SetLogEntry[];
  personalRecords: PersonalRecord[];
  adhdFocusModeEnabled: boolean;
}

export interface WorkoutSlice extends WorkoutState {
  logSet: (exerciseId: string, weight: number, reps: number) => Promise<{ isNewRecord: boolean }>;
  setAdhdFocusMode: (enabled: boolean) => Promise<void>;
}

const DEFAULT_STATE: WorkoutState = {
  setLogs: [],
  personalRecords: [],
  adhdFocusModeEnabled: true, // defaults on — reducing cognitive load during
                              // a workout is the safer default for this audience
};

async function persist(state: WorkoutState) {
  const repo = await getRepository();
  await repo.saveWorkoutState(state);
}

function currentState(get: () => WorkoutState): WorkoutState {
  return {
    setLogs: get().setLogs || [],
    personalRecords: get().personalRecords || [],
    adhdFocusModeEnabled: get().adhdFocusModeEnabled ?? true,
  };
}

// A "record" only ever moves up, and there is no display anywhere of a
// "regression" from a prior best — this system celebrates, never shames.
export const createWorkoutSlice: StateCreator<WorkoutSlice> = (set, get) => ({
  ...DEFAULT_STATE,

  logSet: async (exerciseId, weight, reps) => {
    const nextLogs = [...(get().setLogs || []), { exerciseId, weight, reps, date: new Date().toISOString() }];
    const existingRecord = (get().personalRecords || []).find((r) => r.exerciseId === exerciseId);

    let isNewRecord = false;
    let nextRecords = get().personalRecords || [];

    if (!existingRecord) {
      isNewRecord = weight > 0 || reps > 0;
      nextRecords = [...nextRecords, { exerciseId, bestWeight: weight, bestReps: reps, achievedAt: new Date().toISOString() }];
    } else if (weight > existingRecord.bestWeight || (weight === existingRecord.bestWeight && reps > existingRecord.bestReps)) {
      isNewRecord = true;
      nextRecords = nextRecords.map((r) =>
        r.exerciseId === exerciseId
          ? { exerciseId, bestWeight: Math.max(weight, r.bestWeight), bestReps: reps > existingRecord.bestReps ? reps : r.bestReps, achievedAt: new Date().toISOString() }
          : r
      );
    }

    const nextState = { ...currentState(get), setLogs: nextLogs, personalRecords: nextRecords };
    set(nextState);
    await persist(nextState);
    return { isNewRecord };
  },

  setAdhdFocusMode: async (adhdFocusModeEnabled) => {
    const nextState = { ...currentState(get), adhdFocusModeEnabled };
    set(nextState);
    await persist(nextState);
  },
});
