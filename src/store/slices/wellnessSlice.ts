import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { WellnessPreferences } from './types';

export interface WellnessSlice {
  wellnessPreferences: WellnessPreferences;
  setWellnessPreferences: (prefs: Partial<WellnessPreferences>) => Promise<void>;
}

// Both modules off by default; neither ever overrides core scheduling
// or nutrition logic.
export const createWellnessSlice: StateCreator<WellnessSlice> = (set, get) => ({
  wellnessPreferences: { bloodTypeEnabled: false, bloodType: null, cannabisModuleEnabled: false },

  setWellnessPreferences: async (prefs) => {
    const next = { ...(get().wellnessPreferences || {}), ...prefs } as WellnessPreferences;
    set({ wellnessPreferences: next });
    const repo = await getRepository();
    await repo.saveWellnessPreferences(next);
  },
});
