export type EnergyLevel = 'low' | 'medium' | 'high';
export type ThemeMode = 'dark' | 'dim';
export type BodyDoublingRoom = 'eat' | 'work' | 'gym' | null;
export type BloodType = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
export type TaskPriority = 'critical' | 'important' | 'nice';
export type TaskCategory = 'home' | 'work' | 'school' | 'health' | 'errands' | 'adhd' | 'general';

export interface SubStep { id: string; title: string; isComplete: boolean; }
export interface Task {
  id: string; title: string; notes?: string; isComplete: boolean;
  estimatedMinutes?: number; realMinutes?: number; energyRequired: EnergyLevel;
  createdAt: string; scheduledFor?: string; subSteps: SubStep[];
  priority?: TaskPriority; category?: TaskCategory;
}
export interface RoutineStreak {
  routineId: string; count: number; lastCompletedDate: string | null;
  freezesAvailable: number; isFrozen: boolean;
}
export type MilestoneEvent = 'task_completed' | 'stuck_flow_used' | 'body_doubling_session' | 'routine_completed' | 'focus_session_completed' | 'critical_tasks_cleared_today';
export interface MilestoneProgress { trackedEvent: MilestoneEvent; count: number; }
export interface EnergyLogEntry { date: string; energyLevel: EnergyLevel; note?: string; }
export interface StressLogEntry { date: string; stressLevel: EnergyLevel; }
export interface CycleLogEntry {
  date: string; phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unspecified'; note?: string;
}
export interface WellnessPreferences {
  bloodTypeEnabled: boolean; bloodType: BloodType | null; cannabisModuleEnabled: boolean;
}
export type ReminderStyle = 'consequence' | 'loud' | 'gentle';
export type CoachingStyle = 'gentle' | 'funny' | 'reality_check' | 'friend' | 'scientific';
export type AgeBracket = 'middle_school' | 'high_school' | 'college' | 'adult' | 'midlife_adult' | 'senior';

export interface UserProfile {
  timezone: string; energyBaseline: EnergyLevel; stressThreshold: EnergyLevel;
  biggestHurdle: string; onboardingCompletedAt: string;
  displayName?: string; ageBracket?: AgeBracket;
  selectedModules?: string[];
  adhdSymptoms?: string[]; brainTypes?: string[];
  supportMethods?: string[]; priorities?: string[];
  reminderStyle?: ReminderStyle; coachingStyle?: CoachingStyle;
  sleepStruggles?: string[];
  wantsMedicationReminders?: boolean;
  emotionalRegulationHelpers?: string[];
}

export interface Routine {
  id: string;
  title: string;
  emoji: string;
  createdAt: string;
}
