import { Platform } from 'react-native';
import type { TaskRepository } from './types';
import { webRepository } from './webRepository';

export type { TaskRepository } from './types';

let cachedRepository: TaskRepository | null = null;

async function resolveRepository(): Promise<TaskRepository> {
  if (Platform.OS === 'web') return webRepository;
  // Dynamically imported so the native SQLite module never lands in the
  // web bundle.
  const { sqliteRepository } = await import('./sqliteRepository');
  return sqliteRepository;
}

export async function getRepository(): Promise<TaskRepository> {
  if (cachedRepository) return cachedRepository;
  cachedRepository = await resolveRepository();
  return cachedRepository;
}
