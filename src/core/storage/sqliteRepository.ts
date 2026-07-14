import * as SQLite from 'expo-sqlite';
import type { TaskRepository } from './types';

const DB_NAME = 'adhd_life_coach.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS key_value_store (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  dbInstance = db;
  return db;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM key_value_store WHERE key = ?', [key]
  );
  if (!row?.value) return fallback;
  try {
    return JSON.parse(row.value) ?? fallback;
  } catch (error) {
    console.error(`sqliteRepository: failed to parse "${key}"`, error);
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO key_value_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, JSON.stringify(value ?? null)]
  );
}

// One key per domain. Adding a new domain slice means adding one pair of
// lines here, never editing an existing one.
export const sqliteRepository: TaskRepository = {
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
