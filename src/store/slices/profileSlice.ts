import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { UserProfile } from './types';

export interface ProfileSlice {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => Promise<void>;
}

// The app never requires an account. This is always the real, immediate,
// fully-offline source of truth; cloud sync (core/supabase) is a
// best-effort, optional layer on top, never a dependency.
export const createProfileSlice: StateCreator<ProfileSlice> = (set) => ({
  profile: null,

  setProfile: async (profile) => {
    set({ profile });
    const repo = await getRepository();
    await repo.saveProfile(profile);
  },
});
