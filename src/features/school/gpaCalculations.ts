import type { Course } from '@/store/slices/schoolSlice';

/**
 * Standard percentage → 4.0 scale conversion (the common US university
 * mapping). Courses without a logged grade yet just don't contribute —
 * this is never a guess or a zero standing in for "unknown."
 */
export function percentTo4Point(percent: number): number {
  if (percent >= 93) return 4.0;
  if (percent >= 90) return 3.7;
  if (percent >= 87) return 3.3;
  if (percent >= 83) return 3.0;
  if (percent >= 80) return 2.7;
  if (percent >= 77) return 2.3;
  if (percent >= 73) return 2.0;
  if (percent >= 70) return 1.7;
  if (percent >= 67) return 1.3;
  if (percent >= 63) return 1.0;
  if (percent >= 60) return 0.7;
  return 0.0;
}

/**
 * Credit-weighted GPA across every course that has both a logged grade
 * and a credit count. A course missing either is silently excluded
 * rather than treated as a 0 — an unentered grade isn't a failing one.
 * Returns null if there's nothing to compute from yet.
 */
export function calculateGPA(courses: Course[]): number | null {
  const eligible = (courses || []).filter(
    (c) => typeof c.currentGrade === 'number' && typeof c.credits === 'number' && c.credits > 0
  );
  if (!eligible.length) return null;

  const totalCredits = eligible.reduce((sum, c) => sum + (c.credits || 0), 0);
  const totalPoints = eligible.reduce((sum, c) => sum + percentTo4Point(c.currentGrade as number) * (c.credits || 0), 0);
  if (totalCredits === 0) return null;

  return Math.round((totalPoints / totalCredits) * 100) / 100;
}
