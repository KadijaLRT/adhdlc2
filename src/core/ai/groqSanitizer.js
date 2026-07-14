/**
 * groqSanitizer.js — strict sanitization pipeline for any payload bound
 * for the Groq API. Plain JS by design: no build-step dependency needed
 * to import it from anywhere in the app.
 */
const MAX_PAYLOAD_LENGTH = 8000;

function stripControlCharacters(input) {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}
function collapseLineBreaks(input) {
  return input.replace(/[\r\n]+/g, ' ');
}
function stripFakeDelimiters(input) {
  return input.replace(/<\|.*?\|>/g, '').replace(/###\s*(system|assistant|user)\s*:?/gi, '');
}
function normalizeWhitespace(input) {
  return input.replace(/\s{2,}/g, ' ').trim();
}
function truncate(input) {
  return input.length <= MAX_PAYLOAD_LENGTH ? input : input.slice(0, MAX_PAYLOAD_LENGTH);
}

function sanitizeString(rawInput) {
  if (typeof rawInput !== 'string') return '';
  let output = rawInput;
  output = stripControlCharacters(output);
  output = collapseLineBreaks(output);
  output = stripFakeDelimiters(output);
  output = normalizeWhitespace(output);
  output = truncate(output);
  return output;
}

function sanitizePayload(payload) {
  if (typeof payload === 'string') return sanitizeString(payload);
  if (Array.isArray(payload)) return payload.map(sanitizePayload);
  if (payload && typeof payload === 'object') {
    const result = {};
    for (const key of Object.keys(payload)) result[key] = sanitizePayload(payload[key]);
    return result;
  }
  return payload;
}

module.exports = { sanitizeString, sanitizePayload, MAX_PAYLOAD_LENGTH };
