import OpenAI from 'openai';
import { z } from 'zod';
// @ts-ignore - plain JS by design, see file header.
import { sanitizeString, sanitizePayload } from './groqSanitizer';

const AI_BASE_URL = process.env.EXPO_PUBLIC_AI_BASE_URL || 'https://api.groq.com/openai/v1';
const AI_MODEL = process.env.EXPO_PUBLIC_AI_MODEL || 'llama-3.3-70b-versatile';
const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY;

export interface AvivaContext {
  currentEnergyLevel: 'low' | 'medium' | 'high';
  isOverwhelmed: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

const SubStepSchema = z.object({
  id: z.string(), title: z.string(), estimatedMinutes: z.number().nonnegative(),
});
const TaskDecompositionSchema = z.object({
  originalTask: z.string(),
  subSteps: z.array(SubStepSchema),
  estimatedRealMinutes: z.number().nonnegative(),
  estimatedIdealMinutes: z.number().nonnegative(),
  reasoning: z.string(),
  suggestedEnergyLevel: z.enum(['low', 'medium', 'high']),
});
export type TaskDecomposition = z.infer<typeof TaskDecompositionSchema>;

const BrainDumpItemSchema = z.object({
  id: z.string(), text: z.string(),
  category: z.enum(['task', 'appointment', 'errand', 'phone_call', 'reminder', 'bill']),
  suggestedEnergyLevel: z.enum(['low', 'medium', 'high']),
  suggestedTiming: z.enum(['morning', 'afternoon', 'evening', 'no_preference']),
});
const BrainDumpResultSchema = z.object({
  items: z.array(BrainDumpItemSchema), reasoning: z.string(),
});
export type BrainDumpResult = z.infer<typeof BrainDumpResultSchema>;

/**
 * Wraps all calls to the Groq API used by "Aviva." Every method sanitizes
 * inputs before they leave the device and validates responses against a
 * strict Zod schema before returning, so callers never guess at shape.
 */
export class AvivaBrain {
  private client: OpenAI;

  constructor() {
    if (!AI_API_KEY) {
      console.error('AvivaBrain: EXPO_PUBLIC_AI_API_KEY is not set. Check your .env file.');
    }
    this.client = new OpenAI({
      apiKey: AI_API_KEY || 'missing-key',
      baseURL: AI_BASE_URL,
      dangerouslyAllowBrowser: true,
    });
  }

  async decomposeTask(taskTitle: string, context: AvivaContext): Promise<TaskDecomposition | null> {
    const cleanTitle = sanitizeString(taskTitle);
    if (!cleanTitle) return null;
    const cleanContext = sanitizePayload(context) as AvivaContext;

    const systemPrompt = `You are Aviva, a compassionate executive-function assistant for people with ADHD.
Break the user's task into small, concrete, low-friction sub-steps.
Never use guilt, urgency, or shaming language.
Always explain your reasoning briefly and concretely.
Respond with ONLY valid JSON matching this exact shape, no markdown fences:
{"originalTask": string, "subSteps": [{"id": string, "title": string, "estimatedMinutes": number}], "estimatedRealMinutes": number, "estimatedIdealMinutes": number, "reasoning": string, "suggestedEnergyLevel": "low"|"medium"|"high"}`;

    const userPrompt = `Task: "${cleanTitle}"
Energy level: ${cleanContext.currentEnergyLevel}
Overwhelmed: ${cleanContext.isOverwhelmed}
Time of day: ${cleanContext.timeOfDay}`;

    try {
      const response = await this.client.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      });
      const raw = response?.choices?.[0]?.message?.content || '';
      if (!raw) return null;
      const validated = TaskDecompositionSchema.safeParse(JSON.parse(raw));
      if (!validated.success) {
        console.error('AvivaBrain: decomposeTask schema validation failed', validated.error.flatten());
        return null;
      }
      return validated.data;
    } catch (error) {
      console.error('AvivaBrain: decomposeTask failed', error);
      return null;
    }
  }

  async parseBrainDump(rawText: string, context: AvivaContext): Promise<BrainDumpResult | null> {
    const cleanText = sanitizeString(rawText);
    if (!cleanText) return null;
    const cleanContext = sanitizePayload(context) as AvivaContext;

    const systemPrompt = `You are Aviva, a compassionate executive-function assistant.
The user will paste unstructured, chaotic thoughts. Break them into distinct,
concrete items. Never add urgency or guilt language. Explain your reasoning briefly.
Respond with ONLY valid JSON, no markdown fences:
{"items": [{"id": string, "text": string, "category": "task"|"appointment"|"errand"|"phone_call"|"reminder"|"bill", "suggestedEnergyLevel": "low"|"medium"|"high", "suggestedTiming": "morning"|"afternoon"|"evening"|"no_preference"}], "reasoning": string}`;

    const userPrompt = `Brain dump: "${cleanText}"
Energy level: ${cleanContext.currentEnergyLevel}
Overwhelmed: ${cleanContext.isOverwhelmed}
Time of day: ${cleanContext.timeOfDay}`;

    try {
      const response = await this.client.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      });
      const raw = response?.choices?.[0]?.message?.content || '';
      if (!raw) return null;
      const validated = BrainDumpResultSchema.safeParse(JSON.parse(raw));
      if (!validated.success) {
        console.error('AvivaBrain: brain dump schema validation failed', validated.error.flatten());
        return null;
      }
      return validated.data;
    } catch (error) {
      console.error('AvivaBrain: parseBrainDump failed', error);
      return null;
    }
  }
}

export const avivaBrain = new AvivaBrain();
