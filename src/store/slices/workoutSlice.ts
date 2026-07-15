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
  gymName: string;
  weekdayAssignment: (string | null)[]; // length 7, index=weekday (0=Sun), value=day letter or null for rest
}

export interface WorkoutSlice extends WorkoutState {
  logSet: (exerciseId: string, weight: number, reps: number) => Promise<{ isNewRecord: boolean }>;
  setAdhdFocusMode: (enabled: boolean) => Promise<void>;
  setGymName: (name: string) => Promise<void>;
  setWeekdayAssignment: (weekdayIndex: number, dayLetter: string | null) => Promise<void>;
}

const DEFAULT_STATE: WorkoutState = {
  setLogs: [],
  personalRecords: [],
  adhdFocusModeEnabled: true, // defaults on — reducing cognitive load during
                              // a workout is the safer default for this audience
  gymName: '',
  weekdayAssignment: [null, 'A', 'B', 'C', 'D', 'E', 'F'], // default: Sun rest, Mon–Sat A–F
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
    gymName: get().gymName || '',
    weekdayAssignment: get().weekdayAssignment || DEFAULT_STATE.weekdayAssignment,
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

  // Manual entry, not live location search — a real "tap to change,
  // pick from nearby gyms" experience needs device geolocation
  // permission and a places API wired at runtime, which this app
  // doesn't have configured. Flagging that honestly rather than faking
  // a location picker that doesn't actually search anything.
  setGymName: async (gymName) => {
    const nextState = { ...currentState(get), gymName };
    set(nextState);
    await persist(nextState);
  },

  // Lets someone reassign which weekday is rest and which day-letter
  // lands on which weekday — e.g. moving the rest day off Sunday, or
  // swapping which day is Day A vs Day B.
  setWeekdayAssignment: async (weekdayIndex, dayLetter) => {
    const current = get().weekdayAssignment || DEFAULT_STATE.weekdayAssignment;
    const next = [...current];
    next[weekdayIndex] = dayLetter;
    const nextState = { ...currentState(get), weekdayAssignment: next };
    set(nextState);
    await persist(nextState);
  },
});
