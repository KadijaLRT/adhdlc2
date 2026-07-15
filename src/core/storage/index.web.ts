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

/**
 * Writes a throwaway value and reads it back immediately to confirm
 * storage is actually functional on this device. Some iOS Safari
 * configurations (Private Browsing, certain "Advanced Tracking and
 * Fingerprinting Protection" settings) silently block persistent
 * localStorage writes for web content, including installed
 * home-screen apps — every write appears to succeed (no thrown error)
 * but nothing is actually retained between sessions. This turns that
 * silent failure into something the app can detect and tell the person
 * about, instead of them just losing data with no explanation.
 */
export async function testStoragePersistence(): Promise<boolean> {
  try {
    const testKey = 'adhd-life-coach:__storage_test__';
    const testValue = String(Date.now());
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(testKey, testValue);
    const readBack = window.localStorage.getItem(testKey);
    window.localStorage.removeItem(testKey);
    return readBack === testValue;
  } catch (error) {
    console.error('storage self-test failed', error);
    return false;
  }
}
