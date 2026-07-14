import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { EnergyLevel, StressLogEntry } from './types';

export interface StressSlice {
  stressLogs: StressLogEntry[];
  logStressForToday: (level: EnergyLevel) => Promise<void>;
}

function today(): string { return new Date().toISOString().split('T')[0]; }

export const createStressSlice: StateCreator<StressSlice> = (set, get) => ({
  stressLogs: [],

  logStressForToday: async (level) => {
    const t = today();
    const existing = get().stressLogs || [];
    const already = existing.some((l) => l.date === t);
    const next = already
      ? existing.map((l) => (l.date === t ? { date: t, stressLevel: level } : l))
      : [...existing, { date: t, stressLevel: level }];
    set({ stressLogs: next });
    const repo = await getRepository();
    await repo.saveStressLogs(next);
  },
});
