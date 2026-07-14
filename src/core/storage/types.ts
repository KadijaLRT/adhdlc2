import type {
  Task, RoutineStreak, MilestoneProgress, EnergyLogEntry,
  CycleLogEntry, StressLogEntry, WellnessPreferences, UserProfile,
} from '@/store/index';

// Single storage contract. Every domain slice reads/writes through this,
// never through SQLite or AsyncStorage directly, so adding a new domain
// never means touching sqliteRepository.ts or webRepository.ts logic,
// only adding one get/save pair to this interface and both impls.
export interface TaskRepository {
  getTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;
  getStreaks(): Promise<RoutineStreak[]>;
  saveStreaks(streaks: RoutineStreak[]): Promise<void>;
  getMilestones(): Promise<MilestoneProgress[]>;
  saveMilestones(milestones: MilestoneProgress[]): Promise<void>;
  getEnergyLogs(): Promise<EnergyLogEntry[]>;
  saveEnergyLogs(logs: EnergyLogEntry[]): Promise<void>;
  getCycleLogs(): Promise<CycleLogEntry[]>;
  saveCycleLogs(logs: CycleLogEntry[]): Promise<void>;
  getStressLogs(): Promise<StressLogEntry[]>;
  saveStressLogs(logs: StressLogEntry[]): Promise<void>;
  getWellnessPreferences(): Promise<WellnessPreferences | null>;
  saveWellnessPreferences(prefs: WellnessPreferences): Promise<void>;
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
}
