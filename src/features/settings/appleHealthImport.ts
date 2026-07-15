/**
 * Parses an Apple Health export (export.xml, from the Health app's own
 * "Export All Health Data" feature — Settings → tap your profile icon →
 * Export All Health Data). This is a genuine, working import of real
 * Apple Health data. It is NOT live HealthKit API access — no browser
 * on any iOS version can call HealthKit directly — this parses the
 * file Apple itself lets a person manually export and hand to any app,
 * website included. Adapted from a working implementation confirmed to
 * handle real multi-hundred-MB export files by streaming in chunks
 * rather than holding the whole file in memory at once.
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

/**
 * Streams a browser File through the incremental extractor in chunks —
 * web only, since it uses File.stream(), a browser API. Handles
 * multi-byte UTF-8 characters split across chunk boundaries correctly
 * via TextDecoder's streaming mode.
 */
export async function parseAppleHealthFile(
  file: File,
  onProgress?: (fraction: number) => void
): Promise<AppleHealthImportResult> {
  if (typeof window === 'undefined') {
    throw new Error('Apple Health import is currently only available on web.');
  }

  const state = newHealthState();
  const reader = (file as any).stream().getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let bytesRead = 0;
  let sawAnyText = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      sawAnyText = true;
      bytesRead += value.byteLength;
      const text = decoder.decode(value, { stream: true });
      buffer = extractHealthRecordsFromChunk(buffer + text, state);
      if (onProgress) onProgress(Math.min(1, bytesRead / file.size));
    }
    const finalText = decoder.decode();
    if (finalText) extractHealthRecordsFromChunk(buffer + finalText, state);
  } finally {
    reader.releaseLock();
  }

  if (!sawAnyText) {
    throw new Error('No data received — please try again.');
  }
  return state;
}
