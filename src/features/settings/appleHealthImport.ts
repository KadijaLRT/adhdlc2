/**
 * Parses an Apple Health export (export.xml, from the Health app's own
 * "Export All Health Data" feature — Settings → tap your profile icon →
 * Export All Health Data). This is a genuine, working import of real
 * Apple Health data. It is NOT live HealthKit API access — no browser
 * on any iOS version can call HealthKit directly — this parses the
 * file Apple itself lets a person manually export and hand to any app,
 * website included.
 *
 * Reads the file in manually-sliced chunks via FileReader rather than
 * the Streams API (File.stream()/ReadableStream). That's a deliberate
 * choice: Safari/WebKit — including installed iOS home-screen web
 * apps specifically — has a long history of unreliable ReadableStream
 * support, which was the actual cause of a hard crash on import.
 * FileReader has been universally supported for well over a decade and
 * doesn't have that problem.
 */

export interface AppleHealthImportResult {
  periodDates: Set<string>;
  ovulationDates: Set<string>;
  sleepByDate: Record<string, number>; // hours
  weightByDate: Record<string, number>; // lbs
}

function parseHealthDate(raw: string | undefined | null): string | null {
  return raw ? raw.slice(0, 10) : null;
}

function healthAttr(tag: string, name: string): string {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m?.[1] ?? '';
}

const HEALTH_TAG_RE = /<Record [^>]+\/?>/g;

/**
 * Processes one chunk of export.xml text, updating `state` in place.
 * Returns the leftover tail of the buffer (in case a <Record> tag got
 * split across a chunk boundary) so the caller prepends it to the next
 * chunk.
 */
export function extractHealthRecordsFromChunk(buffer: string, state: AppleHealthImportResult): string {
  HEALTH_TAG_RE.lastIndex = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = HEALTH_TAG_RE.exec(buffer)) !== null) {
    const tag = match[0];
    const type = healthAttr(tag, 'type');
    const value = healthAttr(tag, 'value');
    const start = healthAttr(tag, 'startDate');
    const date = parseHealthDate(start);
    lastIndex = HEALTH_TAG_RE.lastIndex;
    if (!date) continue;

    if (type === 'HKCategoryTypeIdentifierMenstrualFlow') {
      if (value && value !== 'HKCategoryValueMenstrualFlowNone') {
        state.periodDates.add(date);
      }
    } else if (type === 'HKCategoryTypeIdentifierOvulationTestResult') {
      if (value === 'HKCategoryValueOvulationTestResultPositive') {
        state.ovulationDates.add(date);
      }
    } else if (type === 'HKCategoryTypeIdentifierSleepAnalysis') {
      const isAsleep = value.includes('Asleep');
      if (isAsleep) {
        const endStr = healthAttr(tag, 'endDate');
        const s = new Date(start);
        const e = new Date(endStr);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e > s) {
          const hours = (e.getTime() - s.getTime()) / 3600000;
          state.sleepByDate[date] = (state.sleepByDate[date] ?? 0) + hours;
        }
      }
    } else if (type === 'HKQuantityTypeIdentifierBodyMass') {
      const val = parseFloat(value);
      const unit = healthAttr(tag, 'unit');
      if (val > 0 && !state.weightByDate[date]) {
        const lbs = unit.startsWith('kg') ? val * 2.20462 : val;
        state.weightByDate[date] = parseFloat(lbs.toFixed(1));
      }
    }
  }

  const leftover = buffer.slice(lastIndex);
  return leftover.length > 200_000 ? leftover.slice(-200_000) : leftover;
}

export function newHealthState(): AppleHealthImportResult {
  return { periodDates: new Set(), ovulationDates: new Set(), sleepByDate: {}, weightByDate: {} };
}

const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB per slice — small enough to stay well within memory limits per read
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB — a real safety ceiling, not an arbitrary block

/** Reads one Blob slice as text via FileReader, wrapped in a Promise. */
function readSliceAsText(slice: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error || new Error('Failed to read file chunk.'));
    reader.readAsText(slice);
  });
}

export async function parseAppleHealthFile(
  file: File,
  onProgress?: (fraction: number) => void
): Promise<AppleHealthImportResult> {
  if (typeof window === 'undefined') {
    throw new Error('Apple Health import is currently only available on web.');
  }
  if (file.size === 0) {
    throw new Error('That file is empty — please try exporting again.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("That export is larger than this can handle right now (500MB+). Try a device with more recent history, or contact support if this is your only option.");
  }

  const state = newHealthState();
  let buffer = '';
  let offset = 0;
  let sawAnyText = false;

  while (offset < file.size) {
    const slice = file.slice(offset, offset + CHUNK_SIZE);
    const text = await readSliceAsText(slice);
    if (text) sawAnyText = true;
    buffer = extractHealthRecordsFromChunk(buffer + text, state);
    offset += CHUNK_SIZE;
    if (onProgress) onProgress(Math.min(1, offset / file.size));
  }

  // Final pass on whatever's left in the buffer after the loop ends.
  if (buffer) extractHealthRecordsFromChunk(buffer, state);

  if (!sawAnyText) {
    throw new Error('No data received — please try again.');
  }
  return state;
}
