import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { WeeklyMealPlan, PlanDay, PlanMealType } from '@/features/nutrition/mealPlanGeneration';

export interface GroceryState {
  pantryItems: string[];
  checkedIngredients: string[];
  mealPlan: WeeklyMealPlan | null;
  mealPlanChecked: string[]; // keys like "monday_breakfast"
}

export interface GrocerySlice extends GroceryState {
  addPantryItem: (item: string) => Promise<void>;
  removePantryItem: (item: string) => Promise<void>;
  toggleCheckedIngredient: (ingredient: string) => Promise<void>;
  clearCheckedIngredients: () => Promise<void>;
  setMealPlan: (plan: WeeklyMealPlan) => Promise<void>;
  toggleMealPlanChecked: (day: PlanDay, mealType: PlanMealType) => Promise<void>;
  clearMealPlan: () => Promise<void>;
}

const DEFAULT_STATE: GroceryState = {
  pantryItems: [],
  checkedIngredients: [],
  mealPlan: null,
  mealPlanChecked: [],
};

async function persist(state: GroceryState) {
  const repo = await getRepository();
  await repo.saveGroceryState(state);
}

function currentState(get: () => GroceryState): GroceryState {
  return {
    pantryItems: get().pantryItems || [],
    checkedIngredients: get().checkedIngredients || [],
    mealPlan: get().mealPlan || null,
    mealPlanChecked: get().mealPlanChecked || [],
  };
}

export const createGrocerySlice: StateCreator<GrocerySlice> = (set, get) => ({
  ...DEFAULT_STATE,

  addPantryItem: async (item) => {
    const clean = (item || '').toLowerCase().trim();
    if (!clean) return;
    const current = get().pantryItems || [];
    if (current.includes(clean)) return;
    const nextState = { ...currentState(get), pantryItems: [...current, clean] };
    set(nextState);
    await persist(nextState);
  },

  removePantryItem: async (item) => {
    const nextState = { ...currentState(get), pantryItems: (get().pantryItems || []).filter((p) => p !== item) };
    set(nextState);
    await persist(nextState);
  },

  toggleCheckedIngredient: async (ingredient) => {
    const current = get().checkedIngredients || [];
    const next = current.includes(ingredient) ? current.filter((i) => i !== ingredient) : [...current, ingredient];
    const nextState = { ...currentState(get), checkedIngredients: next };
    set(nextState);
    await persist(nextState);
  },

  clearCheckedIngredients: async () => {
    const nextState = { ...currentState(get), checkedIngredients: [] };
    set(nextState);
    await persist(nextState);
  },

  setMealPlan: async (plan) => {
    const nextState = { ...currentState(get), mealPlan: plan, mealPlanChecked: [] };
    set(nextState);
    await persist(nextState);
  },

  // Marking a planned meal done both tracks it as "logged" for that
  // slot and — since its ingredients already merged into the grocery
  // list the moment the plan was generated — doesn't need to touch the
  // grocery list itself; this is purely "did I eat this," not "do I
  // still need to buy this."
  toggleMealPlanChecked: async (day, mealType) => {
    const key = `${day}_${mealType}`;
    const current = get().mealPlanChecked || [];
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    const nextState = { ...currentState(get), mealPlanChecked: next };
    set(nextState);
    await persist(nextState);
  },

  clearMealPlan: async () => {
    const nextState = { ...currentState(get), mealPlan: null, mealPlanChecked: [] };
    set(nextState);
    await persist(nextState);
  },
});
