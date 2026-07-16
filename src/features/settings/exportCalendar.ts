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
 * Triggers a browser download of the .ics file. Web-only for now — a
 * native download would need expo-file-system + expo-sharing wired in,
 * which isn't set up in this app yet. On native platforms this
 * currently does nothing but log, rather than silently pretending to work.
 */
export function downloadIcsFile(content: string, filename = 'schedule.ics'): boolean {
  if (typeof document === 'undefined') {
    console.error('exportCalendar: .ics download is currently web-only');
    return false;
  }
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
    console.error('exportCalendar: download failed', error);
    return false;
  }
}
