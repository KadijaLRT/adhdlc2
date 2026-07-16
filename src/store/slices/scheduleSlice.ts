import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';

export interface ScheduleItem {
  id: string;
  label: string;
  refId?: string; // optional link back to a Task or Routine id
  refKind?: 'task' | 'routine' | 'freeform';
  date?: string; // YYYY-MM-DD — items saved before this existed are treated as today's
  time: string; // "HH:MM", 24hr
  isDone: boolean;
}

export interface ScheduleState {
  scheduleItems: ScheduleItem[];
  runningBehindMinutes: number;
}

export interface ScheduleSlice extends ScheduleState {
  addScheduleItem: (item: Omit<ScheduleItem, 'isDone'>) => Promise<void>;
  removeScheduleItem: (id: string) => Promise<void>;
  toggleScheduleItemDone: (id: string) => Promise<void>;
  shiftRemainingSchedule: (minutes: number) => Promise<void>;
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = (time || '00:00').split(':').map(Number);
  const total = (h || 0) * 60 + (m || 0) + minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  const newH = Math.floor(wrapped / 60);
  const newM = wrapped % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

async function persist(state: ScheduleState) {
  const repo = await getRepository();
  await repo.saveScheduleState(state);
}

function currentState(get: () => ScheduleState): ScheduleState {
  return {
    scheduleItems: get().scheduleItems || [],
    runningBehindMinutes: get().runningBehindMinutes || 0,
  };
}

export const createScheduleSlice: StateCreator<ScheduleSlice> = (set, get) => ({
  scheduleItems: [],
  runningBehindMinutes: 0,

  addScheduleItem: async (item) => {
    const next = [...(get().scheduleItems || []), { ...item, isDone: false }]
      .sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.time.localeCompare(b.time));
    const nextState = { ...currentState(get), scheduleItems: next };
    set(nextState);
    await persist(nextState);
  },

  removeScheduleItem: async (id) => {
    const nextState = { ...currentState(get), scheduleItems: (get().scheduleItems || []).filter((i) => i.id !== id) };
    set(nextState);
    await persist(nextState);
  },

  toggleScheduleItemDone: async (id) => {
    const next = (get().scheduleItems || []).map((i) => (i.id === id ? { ...i, isDone: !i.isDone } : i));
    const nextState = { ...currentState(get), scheduleItems: next };
    set(nextState);
    await persist(nextState);
  },

  // "I'm running behind": shifts every not-yet-done item later by the
  // given number of minutes. Completed items are never touched, so
  // marking things done and then running behind never re-schedules
  // something already finished.
  shiftRemainingSchedule: async (minutes) => {
    const next = (get().scheduleItems || []).map((i) =>
      i.isDone ? i : { ...i, time: addMinutesToTime(i.time, minutes) }
    ).sort((a, b) => a.time.localeCompare(b.time));
    const nextState = { scheduleItems: next, runningBehindMinutes: (get().runningBehindMinutes || 0) + minutes };
    set(nextState);
    await persist(nextState);
  },
});
