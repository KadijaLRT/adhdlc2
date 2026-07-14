import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { CycleLogEntry } from './types';

export interface CycleSlice {
  cycleTrackingEnabled: boolean;
  cycleLogs: CycleLogEntry[];
  setCycleTrackingEnabled: (enabled: boolean) => void;
  logCycleForToday: (phase: CycleLogEntry['phase'], note?: string) => Promise<void>;
}

function today(): string { return new Date().toISOString().split('T')[0]; }

// Opt-in, off by default. Never assumed or forced on any user.
export const createCycleSlice: StateCreator<CycleSlice> = (set, get) => ({
  cycleTrackingEnabled: false,
  cycleLogs: [],

  setCycleTrackingEnabled: (cycleTrackingEnabled) => set({ cycleTrackingEnabled }),

  logCycleForToday: async (phase, note) => {
    const t = today();
    const existing = get().cycleLogs || [];
    const already = existing.some((l) => l.date === t);
    const next = already
      ? existing.map((l) => (l.date === t ? { date: t, phase, note } : l))
      : [...existing, { date: t, phase, note }];
    set({ cycleLogs: next });
    const repo = await getRepository();
    await repo.saveCycleLogs(next);
  },
});
