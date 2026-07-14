import type { StateCreator } from 'zustand';
import type { ThemeMode, EnergyLevel, BodyDoublingRoom } from './types';

export interface UiSlice {
  theme: ThemeMode;
  energyLevel: EnergyLevel;
  isOverwhelmed: boolean;
  bodyDoublingRoom: BodyDoublingRoom;
  setTheme: (theme: ThemeMode) => void;
  setEnergyLevel: (level: EnergyLevel) => void;
  setOverwhelmed: (value: boolean) => void;
  setBodyDoublingRoom: (room: BodyDoublingRoom) => void;
}

// Pure UI/session state. Nothing here persists through the repository;
// it's re-derived or re-entered each session.
export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  theme: 'dark',
  energyLevel: 'medium',
  isOverwhelmed: false,
  bodyDoublingRoom: null,
  setTheme: (theme) => set({ theme }),
  setEnergyLevel: (energyLevel) => set({ energyLevel }),
  setOverwhelmed: (isOverwhelmed) => set({ isOverwhelmed }),
  setBodyDoublingRoom: (bodyDoublingRoom) => set({ bodyDoublingRoom }),
});
