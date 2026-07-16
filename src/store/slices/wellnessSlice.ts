import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { WellnessPreferences, CannabisSessionEntry } from './types';

export interface WellnessSlice {
  wellnessPreferences: WellnessPreferences;
  setWellnessPreferences: (prefs: Partial<WellnessPreferences>) => Promise<void>;
  logWeedSession: (entry: Omit<CannabisSessionEntry, 'id'>) => Promise<void>;
}

// Both modules off by default; neither ever overrides core scheduling
// or nutrition logic.
export const createWellnessSlice: StateCreator<WellnessSlice> = (set, get) => ({
  wellnessPreferences: { bloodTypeEnabled: false, bloodType: null, cannabisModuleEnabled: false, weedLog: [] },

  setWellnessPreferences: async (prefs) => {
    const next = { ...(get().wellnessPreferences || {}), ...prefs } as WellnessPreferences;
    set({ wellnessPreferences: next });
    const repo = await getRepository();
    await repo.saveWellnessPreferences(next);
  },

  logWeedSession: async (entry) => {
    const current = get().wellnessPreferences || { bloodTypeEnabled: false, bloodType: null, cannabisModuleEnabled: false };
    const weedLog = [...(current.weedLog || []), { ...entry, id: `weed-${Date.now()}` }];
    const next = { ...current, weedLog };
    set({ wellnessPreferences: next });
    const repo = await getRepository();
    await repo.saveWellnessPreferences(next);
  },
});
