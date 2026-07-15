import type { TaskRepository } from './types';
import { webRepository } from './webRepository';

export type { TaskRepository } from './types';

// Metro's platform-extension resolution (.web.ts) means this file, not
// index.ts, is what actually gets bundled for the web target. It never
// imports sqliteRepository, so expo-sqlite's native/wasm code is never
// part of the web module graph at all — not even behind a runtime
// check, which Metro would still statically resolve and fail on.
export async function getRepository(): Promise<TaskRepository> {
  return webRepository;
}
