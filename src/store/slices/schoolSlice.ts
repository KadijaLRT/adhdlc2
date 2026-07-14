import type { StateCreator } from 'zustand';
import { getRepository } from '@/core/storage';

export interface Course {
  id: string;
  name: string;
  emoji: string;
  currentGrade?: number; // 0-100
  gradeGoal?: number; // 0-100
  notes?: string;
}

export interface AssignmentSubStep {
  id: string;
  title: string;
  isComplete: boolean;
  suggestedDate?: string; // ISO date this step is spread onto
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueDate: string; // ISO date
  estimatedMinutes?: number;
  isComplete: boolean;
  subSteps: AssignmentSubStep[];
}

export interface SchoolState {
  courses: Course[];
  assignments: Assignment[];
}

export interface SchoolSlice extends SchoolState {
  addCourse: (course: Course) => Promise<void>;
  removeCourse: (id: string) => Promise<void>;
  addAssignment: (assignment: Assignment) => Promise<void>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  toggleAssignmentComplete: (id: string) => Promise<void>;
  toggleAssignmentSubStep: (assignmentId: string, subStepId: string) => Promise<void>;
  removeAssignment: (id: string) => Promise<void>;
}

async function persist(state: SchoolState) {
  const repo = await getRepository();
  await repo.saveSchoolState(state);
}

function currentState(get: () => SchoolState): SchoolState {
  return { courses: get().courses || [], assignments: get().assignments || [] };
}

export const createSchoolSlice: StateCreator<SchoolSlice> = (set, get) => ({
  courses: [],
  assignments: [],

  addCourse: async (course) => {
    const nextState = { ...currentState(get), courses: [...(get().courses || []), course] };
    set(nextState);
    await persist(nextState);
  },

  updateCourse: async (id, updates) => {
    const next = (get().courses || []).map((c) => (c.id === id ? { ...c, ...updates } : c));
    const nextState = { ...currentState(get), courses: next };
    set(nextState);
    await persist(nextState);
  },

  removeCourse: async (id) => {
    // Removing a course leaves its assignments in place (orphaned by
    // courseId) rather than silently deleting someone's work; the
    // screen filters them out of course views but they're not lost.
    const nextState = { ...currentState(get), courses: (get().courses || []).filter((c) => c.id !== id) };
    set(nextState);
    await persist(nextState);
  },

  addAssignment: async (assignment) => {
    const nextState = { ...currentState(get), assignments: [...(get().assignments || []), assignment] };
    set(nextState);
    await persist(nextState);
  },

  updateAssignment: async (id, updates) => {
    const next = (get().assignments || []).map((a) => (a.id === id ? { ...a, ...updates } : a));
    const nextState = { ...currentState(get), assignments: next };
    set(nextState);
    await persist(nextState);
  },

  toggleAssignmentComplete: async (id) => {
    const next = (get().assignments || []).map((a) => (a.id === id ? { ...a, isComplete: !a.isComplete } : a));
    const nextState = { ...currentState(get), assignments: next };
    set(nextState);
    await persist(nextState);
  },

  toggleAssignmentSubStep: async (assignmentId, subStepId) => {
    const next = (get().assignments || []).map((a) => {
      if (a.id !== assignmentId) return a;
      return { ...a, subSteps: (a.subSteps || []).map((s) => (s.id === subStepId ? { ...s, isComplete: !s.isComplete } : s)) };
    });
    const nextState = { ...currentState(get), assignments: next };
    set(nextState);
    await persist(nextState);
  },

  removeAssignment: async (id) => {
    const nextState = { ...currentState(get), assignments: (get().assignments || []).filter((a) => a.id !== id) };
    set(nextState);
    await persist(nextState);
  },
});
