import type { StateCreator } from 'zustand';
import { getRepository, testStoragePersistence } from '@/core/storage';
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
import type { SettingsSlice } from './settingsSlice';
import type { ReflectionSlice } from './reflectionSlice';
import type { ScheduleSlice } from './scheduleSlice';
import type { SchoolSlice } from './schoolSlice';
import type { BodyProgressSlice } from './bodyProgressSlice';
import type { MomentumSlice } from './momentumSlice';
import type { NutritionFitnessSlice } from './nutritionFitnessSlice';
import type { WorkoutSlice } from './workoutSlice';
import type { ProgramSlice } from './programSlice';
import type { GrocerySlice } from './grocerySlice';

export interface HydrationSlice {
  isHydrated: boolean;
  storageWorking: boolean;
  hydrate: () => Promise<void>;
}

type FullState = TaskSlice & StreakSlice & MilestoneSlice & EnergySlice &
  StressSlice & CycleSlice & WellnessSlice & ProfileSlice & HydrationSlice & RoutineSlice & RpgSlice & SettingsSlice & ReflectionSlice & ScheduleSlice & SchoolSlice & BodyProgressSlice & MomentumSlice &
  NutritionFitnessSlice & WorkoutSlice & ProgramSlice & GrocerySlice;

// The only place that reads every domain's storage at once. Adding a new
// slice means adding one line here and one line in the destructure below,
// never touching any other slice file.
export const createHydrationSlice: StateCreator<FullState, [], [], HydrationSlice> = (set) => ({
  isHydrated: false,
  storageWorking: true,

  hydrate: async () => {
    const storageWorking = await testStoragePersistence();
    if (!storageWorking) {
      console.error('hydrationSlice: storage self-test failed — data will not persist between sessions on this device');
    }
    try {
      const repo = await getRepository();
      const [
        tasks, streaks, milestones, energyLogs, cycleLogs, stressLogs,
        wellnessPreferences, profile, routines, rpgState, settingsState, reflectionState,
        nutritionFitnessState, workoutState, programState, groceryState, scheduleState, schoolState, bodyProgressState, momentumState,
      ] = await Promise.all([
          repo.getTasks(), repo.getStreaks(), repo.getMilestones(),
          repo.getEnergyLogs(), repo.getCycleLogs(), repo.getStressLogs(),
          repo.getWellnessPreferences(), repo.getProfile(), repo.getRoutines(), repo.getRpgState(), repo.getSettingsState(), repo.getReflectionState(),
          repo.getNutritionFitnessState(), repo.getWorkoutState(), repo.getProgramState(), repo.getGroceryState(), repo.getScheduleState(), repo.getSchoolState(), repo.getBodyProgressState(), repo.getMomentumState(),
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
        textSize: settingsState?.textSize ?? state.textSize,
        reduceMotion: settingsState?.reduceMotion ?? state.reduceMotion,
        highContrast: settingsState?.highContrast ?? state.highContrast,
        dyslexiaFont: settingsState?.dyslexiaFont ?? state.dyslexiaFont,
        colorScheme: settingsState?.colorScheme ?? state.colorScheme,
        reflections: reflectionState?.reflections ?? state.reflections,
        scheduleItems: scheduleState?.scheduleItems ?? state.scheduleItems,
        runningBehindMinutes: scheduleState?.runningBehindMinutes ?? state.runningBehindMinutes,
        courses: schoolState?.courses ?? state.courses,
        assignments: schoolState?.assignments ?? state.assignments,
        weightLog: bodyProgressState?.weightLog ?? state.weightLog,
        measurementLog: bodyProgressState?.measurementLog ?? state.measurementLog,
        weightGoalLbs: bodyProgressState?.weightGoalLbs ?? state.weightGoalLbs,
        weightGoalDate: bodyProgressState?.weightGoalDate ?? state.weightGoalDate,
        momentumLog: momentumState?.momentumLog ?? state.momentumLog,

        savedRecipeIds: nutritionFitnessState?.savedRecipeIds ?? state.savedRecipeIds,
        completedExerciseLog: nutritionFitnessState?.completedExerciseLog ?? state.completedExerciseLog,
        nutritionPreferences: nutritionFitnessState?.nutritionPreferences ?? state.nutritionPreferences,
        nutritionCardDismissed: nutritionFitnessState?.nutritionCardDismissed ?? state.nutritionCardDismissed,
        fitnessPreferences: nutritionFitnessState?.fitnessPreferences ?? state.fitnessPreferences,
        fitnessCardDismissed: nutritionFitnessState?.fitnessCardDismissed ?? state.fitnessCardDismissed,

        setLogs: workoutState?.setLogs ?? state.setLogs,
        personalRecords: workoutState?.personalRecords ?? state.personalRecords,
        adhdFocusModeEnabled: workoutState?.adhdFocusModeEnabled ?? state.adhdFocusModeEnabled,
        gyms: workoutState?.gyms ?? state.gyms,
        activeGymId: workoutState?.activeGymId ?? state.activeGymId,
        weekdayAssignment: workoutState?.weekdayAssignment ?? state.weekdayAssignment,

        activeProgramId: programState?.activeProgramId ?? state.activeProgramId,
        programStartedAt: programState?.programStartedAt ?? state.programStartedAt,
        sessionsCompletedInProgram: programState?.sessionsCompletedInProgram ?? state.sessionsCompletedInProgram,

        pantryItems: groceryState?.pantryItems ?? state.pantryItems,
        checkedIngredients: groceryState?.checkedIngredients ?? state.checkedIngredients,

        isHydrated: true,
        storageWorking,
      }));
    } catch (error) {
      console.error('hydrationSlice: hydrate failed', error);
      set({ isHydrated: true, storageWorking });
    }
  },
});
