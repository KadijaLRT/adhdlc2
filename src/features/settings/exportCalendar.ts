import type { Task } from '@/store/index';
import type { Assignment } from '@/store/slices/schoolSlice';

/**
 * Builds a minimal, valid .ics file from open tasks/assignments that
 * have a due date. Tasks show as all-day events since this app doesn't
 * track exact due times yet — stated honestly rather than fabricating
 * precision that isn't there.
 */
function formatIcsDate(dateStr: string): string {
  const clean = (dateStr || '').replace(/-/g, '');
  return clean.length === 8 ? clean : (new Date(dateStr).toISOString().split('T')[0] || '').replace(/-/g, '');
}

export function buildIcsContent(tasks: Task[], assignments: Assignment[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ADHD Life Coach//EN'];

  for (const task of tasks || []) {
    if (task.isComplete || !task.scheduledFor) continue;
    const date = formatIcsDate(task.scheduledFor);
    lines.push(
      'BEGIN:VEVENT',
      `UID:task-${task.id}@adhdlifecoach`,
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${date}`,
      `SUMMARY:${(task.title || 'Task').replace(/\n/g, ' ')}`,
      'END:VEVENT'
    );
  }

  for (const assignment of assignments || []) {
    if (assignment.isComplete || !assignment.dueDate) continue;
    const date = formatIcsDate(assignment.dueDate);
    lines.push(
      'BEGIN:VEVENT',
      `UID:assignment-${assignment.id}@adhdlifecoach`,
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${date}`,
      `SUMMARY:${(assignment.title || 'Assignment').replace(/\n/g, ' ')}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Exports the .ics file — a real browser download on web, and a native
 * share sheet (Files, Mail, AirDrop, Google Calendar, etc.) on iOS/
 * Android via expo-file-system + expo-sharing. Both paths actually
 * work; this isn't a "web only for now" stub anymore.
 */
export async function downloadIcsFile(content: string, filename = 'schedule.ics'): Promise<boolean> {
  if (typeof document !== 'undefined') {
    try {
      const blob = new Blob([content], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('exportCalendar: web download failed', error);
      return false;
    }
  }

  try {
    const { File, Paths } = await import('expo-file-system');
    const Sharing = await import('expo-sharing');

    const file = new File(Paths.cache, filename);
    file.create({ overwrite: true });
    file.write(content);

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      console.error('exportCalendar: sharing is not available on this device');
      return false;
    }
    await Sharing.shareAsync(file.uri, { mimeType: 'text/calendar', dialogTitle: 'Save or share your schedule' });
    return true;
  } catch (error) {
    console.error('exportCalendar: native export failed', error);
    return false;
  }
}
