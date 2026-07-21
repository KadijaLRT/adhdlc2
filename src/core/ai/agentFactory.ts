import OpenAI from 'openai';
import { z } from 'zod';
// @ts-ignore - plain JS by design
import { sanitizeString, sanitizePayload } from './groqSanitizer';

const AI_BASE_URL = process.env.EXPO_PUBLIC_AI_BASE_URL || 'https://api.groq.com/openai/v1';
const AI_MODEL = process.env.EXPO_PUBLIC_AI_MODEL || 'llama-3.3-70b-versatile';
const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY;

const client = new OpenAI({
  apiKey: AI_API_KEY || 'missing-key',
  baseURL: AI_BASE_URL,
  dangerouslyAllowBrowser: true,
});

export const AgentResponseSchema = z.object({
  message: z.string(),
  reasoning: z.string(),
  suggestedNextStep: z.string().optional(),
});
export type AgentResponse = z.infer<typeof AgentResponseSchema>;

export interface AgentConfig {
  id: string;
  label: string;
  systemPrompt: string;
}

export interface AgentContext {
  energyLevel: 'low' | 'medium' | 'high';
  isOverwhelmed: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  recentReflection?: string; // the person's own most recent evening check-in note, so Aviva can actually reference it instead of it sitting unread
}

/**
 * One factory backs every agent persona, so adding a 10th agent later
 * means one config entry, not one new file. Every agent shares the same
 * sanitization and schema-validation guarantees as AvivaBrain.
 */
export function createAgent(config: AgentConfig) {
  return {
    id: config.id,
    label: config.label,
    async ask(userMessage: string, context: AgentContext): Promise<AgentResponse | null> {
      const cleanMessage = sanitizeString(userMessage);
      if (!cleanMessage) return null;
      const cleanContext = sanitizePayload(context) as AgentContext;

      const fullSystemPrompt = `${config.systemPrompt}
Never use guilt, urgency, or shaming language. Keep responses short and concrete.
If a recent reflection note is provided, you may reference it naturally if it's relevant to what the person is asking — but never quote it back verbatim or make it the focus unless they bring it up themselves.
Respond with ONLY valid JSON, no markdown fences:
{"message": string, "reasoning": string, "suggestedNextStep": string}`;

      const userPrompt = `User message: "${cleanMessage}"
Energy: ${cleanContext.energyLevel}
Overwhelmed: ${cleanContext.isOverwhelmed}
Time of day: ${cleanContext.timeOfDay}${cleanContext.recentReflection ? `\nTheir most recent evening reflection: "${cleanContext.recentReflection}"` : ''}`;

      try {
        const response = await client.chat.completions.create({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: fullSystemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.5,
          response_format: { type: 'json_object' },
        });
        const raw = response?.choices?.[0]?.message?.content || '';
        if (!raw) return null;
        const validated = AgentResponseSchema.safeParse(JSON.parse(raw));
        if (!validated.success) {
          console.error(`agent[${config.id}]: schema validation failed`, validated.error.flatten());
          return null;
        }
        return validated.data;
      } catch (error) {
        console.error(`agent[${config.id}]: request failed`, error);
        return null;
      }
    },
  };
}
