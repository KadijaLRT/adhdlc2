import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';
import type { Task } from './types';
import type { MilestoneSlice } from './milestoneSlice';
import type { RpgSlice } from './rpgSlice';

export interface TaskSlice {
  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  toggleSubStep: (taskId: string, subStepId: string) => Promise<void>;
}

async function persist(tasks: Task[]) {
  const repo = await getRepository();
  await repo.saveTasks(tasks || []);
}

// Depends on MilestoneSlice for the completion-count side effect. This
// is the one cross-slice dependency in the store; every other slice is
// fully self-contained.
export const createTaskSlice: StateCreator<
  TaskSlice & MilestoneSlice & RpgSlice, [], [], TaskSlice
> = (set, get) => ({
  tasks: [],

  addTask: async (task) => {
    const next = [...(get().tasks || []), task];
    set({ tasks: next });
    await persist(next);
  },

  updateTask: async (id, updates) => {
    const next = (get().tasks || []).map((t) => (t.id === id ? { ...t, ...updates } : t));
    set({ tasks: next });
    await persist(next);
  },

  removeTask: async (id) => {
    const next = (get().tasks || []).filter((t) => t.id !== id);
    set({ tasks: next });
    await persist(next);
  },

  toggleTaskComplete: async (id) => {
    const currentTasks = get().tasks || [];
    const task = currentTasks.find((t) => t.id === id);
    const willBeComplete = !task?.isComplete;

    const criticalBefore = currentTasks.filter((t) => t.priority === 'critical');
    const wasAllClearedBefore = criticalBefore.length > 0 && criticalBefore.every((t) => t.isComplete);

    const next = currentTasks.map((t) => (t.id === id ? { ...t, isComplete: willBeComplete } : t));
    set({ tasks: next });
    await persist(next);

    if (willBeComplete) {
      await get().incrementMilestone('task_completed');
      await get().awardProgress('organization', 10, 5);
    }

    // A "cleared the critical tasks" milestone fires only on the
    // transition into fully-cleared, never repeatedly for an already
    // cleared day, and never if there were no critical tasks to begin with.
    const criticalAfter = next.filter((t) => t.priority === 'critical');
    const isAllClearedAfter = criticalAfter.length > 0 && criticalAfter.every((t) => t.isComplete);
    if (isAllClearedAfter && !wasAllClearedBefore) {
      await get().incrementMilestone('critical_tasks_cleared_today');
    }
  },

  toggleSubStep: async (taskId, subStepId) => {
    const next = (get().tasks || []).map((t) => {
      if (t.id !== taskId) return t;
      return { ...t, subSteps: (t.subSteps || []).map((s) => (s.id === subStepId ? { ...s, isComplete: !s.isComplete } : s)) };
    });
    set({ tasks: next });
    await persist(next);
  },
});
