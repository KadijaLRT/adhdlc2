import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';

export interface NutritionPreferences {
  allergies: string[];
  dietaryRestrictions: string[];
}

export interface FitnessPreferences {
  equipment: string[];
  primaryGoal: 'strength' | 'endurance' | 'mobility' | 'general' | null;
}

export interface NutritionFitnessState {
  savedRecipeIds: string[];
  completedExerciseLog: { exerciseId: string; date: string }[];
  nutritionPreferences: NutritionPreferences | null;
  nutritionCardDismissed: boolean;
  fitnessPreferences: FitnessPreferences | null;
  fitnessCardDismissed: boolean;
}

export interface NutritionFitnessSlice extends NutritionFitnessState {
  toggleSavedRecipe: (recipeId: string) => Promise<void>;
  logExerciseCompletion: (exerciseId: string) => Promise<void>;
  setNutritionPreferences: (prefs: NutritionPreferences) => Promise<void>;
  dismissNutritionCard: () => Promise<void>;
  setFitnessPreferences: (prefs: FitnessPreferences) => Promise<void>;
  dismissFitnessCard: () => Promise<void>;
}

const DEFAULT_STATE: NutritionFitnessState = {
  savedRecipeIds: [],
  completedExerciseLog: [],
  nutritionPreferences: null,
  nutritionCardDismissed: false,
  fitnessPreferences: null,
  fitnessCardDismissed: false,
};

async function persist(state: NutritionFitnessState) {
  const repo = await getRepository();
  await repo.saveNutritionFitnessState(state);
}

function currentState(get: () => NutritionFitnessState): NutritionFitnessState {
  return {
    savedRecipeIds: get().savedRecipeIds || [],
    completedExerciseLog: get().completedExerciseLog || [],
    nutritionPreferences: get().nutritionPreferences || null,
    nutritionCardDismissed: get().nutritionCardDismissed || false,
    fitnessPreferences: get().fitnessPreferences || null,
    fitnessCardDismissed: get().fitnessCardDismissed || false,
  };
}

// The personalization card only ever appears once per screen (tracked by
// its own dismissed flag) — answering it or skipping it are both
// permanent, low-friction, one-time decisions, never re-prompted.
export const createNutritionFitnessSlice: StateCreator<NutritionFitnessSlice> = (set, get) => ({
  ...DEFAULT_STATE,

  toggleSavedRecipe: async (recipeId) => {
    const current = get().savedRecipeIds || [];
    const next = current.includes(recipeId) ? current.filter((id) => id !== recipeId) : [...current, recipeId];
    const nextState = { ...currentState(get), savedRecipeIds: next };
    set(nextState);
    await persist(nextState);
  },

  logExerciseCompletion: async (exerciseId) => {
    const nextLog = [...(get().completedExerciseLog || []), { exerciseId, date: new Date().toISOString() }];
    const nextState = { ...currentState(get), completedExerciseLog: nextLog };
    set(nextState);
    await persist(nextState);
  },

  setNutritionPreferences: async (prefs) => {
    const nextState = { ...currentState(get), nutritionPreferences: prefs, nutritionCardDismissed: true };
    set(nextState);
    await persist(nextState);
  },

  dismissNutritionCard: async () => {
    const nextState = { ...currentState(get), nutritionCardDismissed: true };
    set(nextState);
    await persist(nextState);
  },

  setFitnessPreferences: async (prefs) => {
    const nextState = { ...currentState(get), fitnessPreferences: prefs, fitnessCardDismissed: true };
    set(nextState);
    await persist(nextState);
  },

  dismissFitnessCard: async () => {
    const nextState = { ...currentState(get), fitnessCardDismissed: true };
    set(nextState);
    await persist(nextState);
  },
});
