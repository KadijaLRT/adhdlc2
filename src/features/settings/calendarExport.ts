import type { Assignment } from '@/store/slices/schoolSlice';

/**
 * Generates a standard .ics file from School assignments that have a
 * due date. Scoped honestly: general Tasks in this app don't currently
 * have a due-date field (only School assignments do), so this exports
 * assignments only, not "all tasks" broadly — the in-app copy says so.
 */
export function buildIcsContent(assignments: Assignment[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ADHD Life Coach//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const assignment of assignments || []) {
    if (!assignment.dueDate) continue;
    const dateStr = (assignment.dueDate || '').replace(/-/g, '');
    if (!/^\d{8}$/.test(dateStr)) continue; // skip malformed dates rather than emit a broken event

    lines.push(
      'BEGIN:VEVENT',
      `UID:${assignment.id}@adhd-life-coach`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:${escapeIcsText(assignment.title)}`,
      assignment.isComplete ? 'STATUS:COMPLETED' : 'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function escapeIcsText(text: string): string {
  return (text || '').replace(/[,;\\]/g, (match) => `\\${match}`);
}
