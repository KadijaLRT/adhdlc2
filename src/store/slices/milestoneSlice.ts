import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { MilestoneEvent, MilestoneProgress } from './types';

export interface MilestoneSlice {
  milestones: MilestoneProgress[];
  incrementMilestone: (event: MilestoneEvent) => Promise<void>;
}

export const createMilestoneSlice: StateCreator<MilestoneSlice> = (set, get) => ({
  milestones: [],

  incrementMilestone: async (event) => {
    const existing = (get().milestones || []).find((m) => m.trackedEvent === event);
    const next = existing
      ? (get().milestones || []).map((m) => (m.trackedEvent === event ? { ...m, count: m.count + 1 } : m))
      : [...(get().milestones || []), { trackedEvent: event, count: 1 }];
    set({ milestones: next });
    const repo = await getRepository();
    await repo.saveMilestones(next);
  },
});
