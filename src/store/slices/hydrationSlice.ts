import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { TaskSlice } from './taskSlice';
import type { StreakSlice } from './streakSlice';
import type { MilestoneSlice } from './milestoneSlice';
import type { EnergySlice } from './energySlice';
import type { StressSlice } from './stressSlice';
import type { CycleSlice } from './cycleSlice';
import type { WellnessSlice } from './wellnessSlice';
import type { ProfileSlice } from './profileSlice';
import type { RoutineSlice } from './routineSlice';
import type { RpgSlice } from './rpgSlice';
import type { NutritionFitnessSlice } from './nutritionFitnessSlice';
import type { WorkoutSlice } from './workoutSlice';
import type { ProgramSlice } from './programSlice';
import type { GrocerySlice } from './grocerySlice';

export interface HydrationSlice {
  isHydrated: boolean;
  hydrate: () => Promise<void>;
}

type FullState = TaskSlice & StreakSlice & MilestoneSlice & EnergySlice &
  StressSlice & CycleSlice & WellnessSlice & ProfileSlice & HydrationSlice & RoutineSlice & RpgSlice &
  NutritionFitnessSlice & WorkoutSlice & ProgramSlice & GrocerySlice;

// The only place that reads every domain's storage at once. Adding a new
// slice means adding one line here and one line in the destructure below,
// never touching any other slice file.
export const createHydrationSlice: StateCreator<FullState, [], [], HydrationSlice> = (set) => ({
  isHydrated: false,

  hydrate: async () => {
    try {
      const repo = await getRepository();
      const [
        tasks, streaks, milestones, energyLogs, cycleLogs, stressLogs,
        wellnessPreferences, profile, routines, rpgState,
        nutritionFitnessState, workoutState, programState, groceryState,
      ] = await Promise.all([
          repo.getTasks(), repo.getStreaks(), repo.getMilestones(),
          repo.getEnergyLogs(), repo.getCycleLogs(), repo.getStressLogs(),
          repo.getWellnessPreferences(), repo.getProfile(), repo.getRoutines(), repo.getRpgState(),
          repo.getNutritionFitnessState(), repo.getWorkoutState(), repo.getProgramState(), repo.getGroceryState(),
        ]);
      set((state) => ({
        ...state,
        tasks: tasks || [],
        streaks: streaks || [],
        milestones: milestones || [],
        energyLogs: energyLogs || [],
        cycleLogs: cycleLogs || [],
        stressLogs: stressLogs || [],
        wellnessPreferences: wellnessPreferences || state.wellnessPreferences,
        profile: profile || null,
        routines: routines || [],
        totalXp: rpgState?.totalXp ?? state.totalXp,
        coins: rpgState?.coins ?? state.coins,
        skillXp: rpgState?.skillXp ?? state.skillXp,
        ownedUnlockables: rpgState?.ownedUnlockables ?? state.ownedUnlockables,

        savedRecipeIds: nutritionFitnessState?.savedRecipeIds ?? state.savedRecipeIds,
        completedExerciseLog: nutritionFitnessState?.completedExerciseLog ?? state.completedExerciseLog,
        nutritionPreferences: nutritionFitnessState?.nutritionPreferences ?? state.nutritionPreferences,
        nutritionCardDismissed: nutritionFitnessState?.nutritionCardDismissed ?? state.nutritionCardDismissed,
        fitnessPreferences: nutritionFitnessState?.fitnessPreferences ?? state.fitnessPreferences,
        fitnessCardDismissed: nutritionFitnessState?.fitnessCardDismissed ?? state.fitnessCardDismissed,

        setLogs: workoutState?.setLogs ?? state.setLogs,
        personalRecords: workoutState?.personalRecords ?? state.personalRecords,
        adhdFocusModeEnabled: workoutState?.adhdFocusModeEnabled ?? state.adhdFocusModeEnabled,

        activeProgramId: programState?.activeProgramId ?? state.activeProgramId,
        programStartedAt: programState?.programStartedAt ?? state.programStartedAt,
        sessionsCompletedInProgram: programState?.sessionsCompletedInProgram ?? state.sessionsCompletedInProgram,

        pantryItems: groceryState?.pantryItems ?? state.pantryItems,
        checkedIngredients: groceryState?.checkedIngredients ?? state.checkedIngredients,

        isHydrated: true,
      }));
    } catch (error) {
      console.error('hydrationSlice: hydrate failed', error);
      set({ isHydrated: true });
    }
  },
});
