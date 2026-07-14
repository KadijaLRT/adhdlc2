import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';

export interface GroceryState {
  pantryItems: string[];
  checkedIngredients: string[];
}

export interface GrocerySlice extends GroceryState {
  addPantryItem: (item: string) => Promise<void>;
  removePantryItem: (item: string) => Promise<void>;
  toggleCheckedIngredient: (ingredient: string) => Promise<void>;
  clearCheckedIngredients: () => Promise<void>;
}

const DEFAULT_STATE: GroceryState = {
  pantryItems: [],
  checkedIngredients: [],
};

async function persist(state: GroceryState) {
  const repo = await getRepository();
  await repo.saveGroceryState(state);
}

function currentState(get: () => GroceryState): GroceryState {
  return {
    pantryItems: get().pantryItems || [],
    checkedIngredients: get().checkedIngredients || [],
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
});
