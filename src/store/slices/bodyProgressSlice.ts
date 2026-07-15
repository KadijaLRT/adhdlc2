import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';

export interface WeightEntry {
  date: string;
  weightLbs: number;
}

export type MeasurementSite = 'chest' | 'waist' | 'hips' | 'arms' | 'thighs' | 'neck';

export interface MeasurementEntry {
  date: string;
  site: MeasurementSite;
  inches: number;
}

export interface BodyProgressState {
  weightLog: WeightEntry[];
  measurementLog: MeasurementEntry[];
  weightGoalLbs: number | null;
  weightGoalDate: string | null; // ISO date
}

export interface BodyProgressSlice extends BodyProgressState {
  logWeight: (weightLbs: number) => Promise<void>;
  logMeasurement: (site: MeasurementSite, inches: number) => Promise<void>;
  setWeightGoal: (goalLbs: number | null, goalDate?: string | null) => Promise<void>;
}

async function persist(state: BodyProgressState) {
  const repo = await getRepository();
  await repo.saveBodyProgressState(state);
}

function currentState(get: () => BodyProgressState): BodyProgressState {
  return {
    weightLog: get().weightLog || [],
    measurementLog: get().measurementLog || [],
    weightGoalLbs: get().weightGoalLbs ?? null,
    weightGoalDate: get().weightGoalDate ?? null,
  };
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export const createBodyProgressSlice: StateCreator<BodyProgressSlice> = (set, get) => ({
  weightLog: [],
  measurementLog: [],
  weightGoalLbs: null,

  logWeight: async (weightLbs) => {
    const t = today();
    const existing = get().weightLog || [];
    const already = existing.some((w) => w.date === t);
    const next = already
      ? existing.map((w) => (w.date === t ? { date: t, weightLbs } : w))
      : [...existing, { date: t, weightLbs }];
    const nextState = { ...currentState(get), weightLog: next };
    set(nextState);
    await persist(nextState);
  },

  logMeasurement: async (site, inches) => {
    const t = today();
    const existing = get().measurementLog || [];
    const already = existing.some((m) => m.date === t && m.site === site);
    const next = already
      ? existing.map((m) => (m.date === t && m.site === site ? { date: t, site, inches } : m))
      : [...existing, { date: t, site, inches }];
    const nextState = { ...currentState(get), measurementLog: next };
    set(nextState);
    await persist(nextState);
  },

  setWeightGoal: async (weightGoalLbs, goalDate) => {
    const nextState = { ...currentState(get), weightGoalLbs, weightGoalDate: goalDate ?? currentState(get).weightGoalDate };
    set(nextState);
    await persist(nextState);
  },
});
