import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodName: string;
  servings: number;
  calories: number; // total for this entry (already multiplied by servings)
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyTargets {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export interface NutritionTrackingState {
  foodLog: FoodLogEntry[];
  dailyTargets: DailyTargets;
}

export interface NutritionTrackingSlice extends NutritionTrackingState {
  logFood: (entry: Omit<FoodLogEntry, 'id'>) => Promise<void>;
  removeFoodLogEntry: (id: string) => Promise<void>;
  setDailyTargets: (targets: Partial<DailyTargets>) => Promise<void>;
}

const DEFAULT_STATE: NutritionTrackingState = {
  foodLog: [],
  dailyTargets: { calories: null, protein: null, carbs: null, fat: null },
};

async function persist(state: NutritionTrackingState) {
  const repo = await getRepository();
  await repo.saveNutritionTrackingState(state);
}

function currentState(get: () => NutritionTrackingState): NutritionTrackingState {
  return {
    foodLog: get().foodLog || [],
    dailyTargets: get().dailyTargets || DEFAULT_STATE.dailyTargets,
  };
}

export const createNutritionTrackingSlice: StateCreator<NutritionTrackingSlice> = (set, get) => ({
  ...DEFAULT_STATE,

  logFood: async (entry) => {
    const next = [...(get().foodLog || []), { ...entry, id: `food-${Date.now()}` }];
    const nextState = { ...currentState(get), foodLog: next };
    set(nextState);
    await persist(nextState);
  },

  removeFoodLogEntry: async (id) => {
    const next = (get().foodLog || []).filter((f) => f.id !== id);
    const nextState = { ...currentState(get), foodLog: next };
    set(nextState);
    await persist(nextState);
  },

  // Targets are always something the person sets for themselves, never
  // a number Claude/the app calculates and pushes on them — this is
  // tracking infrastructure, not a diet prescription.
  setDailyTargets: async (targets) => {
    const nextState = { ...currentState(get), dailyTargets: { ...currentState(get).dailyTargets, ...targets } };
    set(nextState);
    await persist(nextState);
  },
});
