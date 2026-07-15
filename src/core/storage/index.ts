import type { TaskRepository } from './types';
import { sqliteRepository } from './sqliteRepository';

export type { TaskRepository } from './types';

// Metro picks index.web.ts for the web bundle automatically (platform
// extension resolution), so this file is only ever reached on iOS and
// Android, where expo-sqlite's native module is safe to import directly.
export async function getRepository(): Promise<TaskRepository> {
  return sqliteRepository;
}
