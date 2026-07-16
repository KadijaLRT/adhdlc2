import type { DateFormat } from '@/store/slices/settingsSlice';

/**
 * Formats a date consistently according to the person's stored
 * preference. Accepts either a "YYYY-MM-DD" string (how dates are
 * stored everywhere in this app) or a Date object. Defaults to
 * MM-DD-YYYY if no format is passed, matching the app-wide default.
 */
export function formatDate(input: string | Date, format: DateFormat = 'MM-DD-YYYY'): string {
  const date = typeof input === 'string' ? new Date(input.length <= 10 ? `${input}T00:00:00` : input) : input;
  if (isNaN(date.getTime())) return typeof input === 'string' ? input : '';

  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();

  switch (format) {
    case 'DD-MM-YYYY':
      return `${dd}-${mm}-${yyyy}`;
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    case 'MM-DD-YYYY':
    default:
      return `${mm}-${dd}-${yyyy}`;
  }
}
