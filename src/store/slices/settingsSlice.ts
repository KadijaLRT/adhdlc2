import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';

export type TextSize = 'small' | 'medium' | 'large';

export interface SettingsState {
  textSize: TextSize;
  reduceMotion: boolean;
  highContrast: boolean;
  dyslexiaFont: boolean;
}

export interface SettingsSlice extends SettingsState {
  setTextSize: (size: TextSize) => Promise<void>;
  setReduceMotion: (enabled: boolean) => Promise<void>;
  setHighContrast: (enabled: boolean) => Promise<void>;
  setDyslexiaFont: (enabled: boolean) => Promise<void>;
}

const DEFAULT_STATE: SettingsState = {
  textSize: 'medium',
  reduceMotion: false,
  highContrast: false,
  dyslexiaFont: false,
};

async function persist(state: SettingsState) {
  const repo = await getRepository();
  await repo.saveSettingsState(state);
}

function currentState(get: () => SettingsState): SettingsState {
  return {
    textSize: get().textSize || 'medium',
    reduceMotion: get().reduceMotion ?? false,
    highContrast: get().highContrast ?? false,
    dyslexiaFont: get().dyslexiaFont ?? false,
  };
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set, get) => ({
  ...DEFAULT_STATE,

  setTextSize: async (textSize) => {
    const nextState = { ...currentState(get), textSize };
    set(nextState);
    await persist(nextState);
  },
  setReduceMotion: async (reduceMotion) => {
    const nextState = { ...currentState(get), reduceMotion };
    set(nextState);
    await persist(nextState);
  },
  setHighContrast: async (highContrast) => {
    const nextState = { ...currentState(get), highContrast };
    set(nextState);
    await persist(nextState);
  },
  setDyslexiaFont: async (dyslexiaFont) => {
    const nextState = { ...currentState(get), dyslexiaFont };
    set(nextState);
    await persist(nextState);
  },
});
