import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TaskRepository } from './types';

// On web, AsyncStorage is backed by localStorage, the most mature and
// well-tested persistence path in browsers. Keeps SQLite/WASM complexity
// off the web bundle entirely.
const NS = 'adhd-life-coach';

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(`${NS}:${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) ?? fallback;
  } catch (error) {
    console.error(`webRepository: failed to read "${key}"`, error);
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(`${NS}:${key}`, JSON.stringify(value ?? null));
  } catch (error) {
    console.error(`webRepository: failed to write "${key}"`, error);
  }
}

export const webRepository: TaskRepository = {
  getTasks: () => readJson('tasks', []),
  saveTasks: (v) => writeJson('tasks', v || []),
  getStreaks: () => readJson('streaks', []),
  saveStreaks: (v) => writeJson('streaks', v || []),
  getMilestones: () => readJson('milestones', []),
  saveMilestones: (v) => writeJson('milestones', v || []),
  getEnergyLogs: () => readJson('energyLogs', []),
  saveEnergyLogs: (v) => writeJson('energyLogs', v || []),
  getCycleLogs: () => readJson('cycleLogs', []),
  saveCycleLogs: (v) => writeJson('cycleLogs', v || []),
  getStressLogs: () => readJson('stressLogs', []),
  saveStressLogs: (v) => writeJson('stressLogs', v || []),
  getWellnessPreferences: () => readJson('wellnessPreferences', null),
  saveWellnessPreferences: (v) => writeJson('wellnessPreferences', v),
  getProfile: () => readJson('profile', null),
  saveProfile: (v) => writeJson('profile', v),
};
