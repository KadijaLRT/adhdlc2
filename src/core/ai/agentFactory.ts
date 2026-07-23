import { z } from 'zod';
// @ts-ignore - plain JS by design
import { sanitizeString, sanitizePayload } from './groqSanitizer';
import { callGroqCompletion } from './groqProxyClient';

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
        const raw = await callGroqCompletion(
          [
            { role: 'system', content: fullSystemPrompt },
            { role: 'user', content: userPrompt },
          ],
          0.5
        );
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
