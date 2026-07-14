import { create } from 'zustand';
import type { EnergyLevel } from './index';

interface OnboardingState {
  biggestHurdle: string;
  energyBaseline: EnergyLevel;
  stressThreshold: EnergyLevel;
  setBiggestHurdle: (value: string) => void;
  setEnergyBaseline: (value: EnergyLevel) => void;
  setStressThreshold: (value: EnergyLevel) => void;
  reset: () => void;
}

// Transient draft state for the onboarding flow only — not persisted
// through the repository, since it's discarded once onboarding finishes.
export const useOnboardingStore = create<OnboardingState>()((set) => ({
  biggestHurdle: '',
  energyBaseline: 'medium',
  stressThreshold: 'medium',
  setBiggestHurdle: (biggestHurdle) => set({ biggestHurdle }),
  setEnergyBaseline: (energyBaseline) => set({ energyBaseline }),
  setStressThreshold: (stressThreshold) => set({ stressThreshold }),
  reset: () => set({ biggestHurdle: '', energyBaseline: 'medium', stressThreshold: 'medium' }),
}));
