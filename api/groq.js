/**
 * Vercel serverless function — the ONLY place the real Groq API key
 * ever lives. Every client-side Groq call (AvivaBrain, agentFactory,
 * simpleGroqCall) now hits this endpoint instead of instantiating the
 * OpenAI SDK directly with `dangerouslyAllowBrowser: true`.
 *
 * Why this exists: Expo inlines every EXPO_PUBLIC_* env var verbatim
 * into the web (and native) bundle at build time. A key referenced as
 * `process.env.EXPO_PUBLIC_AI_API_KEY` from client code is trivially
 * recoverable from the deployed bundle via view-source or a decompiled
 * app binary. `GROQ_API_KEY` here deliberately has no EXPO_PUBLIC_
 * prefix — Expo's bundler never touches it, and Vercel only exposes it
 * to this server-side function at request time.
 *
 * Plain CommonJS/Node handler (no @vercel/node types needed) so Vercel
 * picks it up as a Serverless Function purely from its location under
 * /api, independent of the static `expo export -p web` build output.
 */

const GROQ_BASE_URL = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Defensive caps — this endpoint is public (any client can call it), so
// it validates shape and size itself rather than trusting the caller's
// own sanitizer, even though every legitimate caller already sanitizes
// before it gets here.
const MAX_MESSAGES = 10;
const MAX_CONTENT_LENGTH = 8000;
const ALLOWED_ROLES = new Set(['system', 'user', 'assistant']);

function isValidMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return false;
  return messages.every(
    (m) =>
      m &&
      typeof m === 'object' &&
      ALLOWED_ROLES.has(m.role) &&
      typeof m.content === 'string' &&
      m.content.length > 0 &&
      m.content.length <= MAX_CONTENT_LENGTH
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!GROQ_API_KEY) {
    console.error('api/groq: GROQ_API_KEY is not set in the deployment environment.');
    res.status(500).json({ error: 'AI service is not configured.' });
    return;
  }

  const body = req.body || {};
  const { messages, temperature } = body;

  if (!isValidMessages(messages)) {
    res.status(400).json({ error: 'Invalid or missing messages payload.' });
    return;
  }

  const safeTemperature = typeof temperature === 'number' && temperature >= 0 && temperature <= 2 ? temperature : 0.5;

  try {
    const groqResponse = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: safeTemperature,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text().catch(() => '');
      console.error('api/groq: upstream Groq error', groqResponse.status, errText);
      res.status(502).json({ error: 'AI service is temporarily unavailable.' });
      return;
    }

    const data = await groqResponse.json();
    const content = data?.choices?.[0]?.message?.content || '';
    res.status(200).json({ content });
  } catch (error) {
    console.error('api/groq: request failed', error);
    res.status(502).json({ error: 'AI service is temporarily unavailable.' });
  }
};
