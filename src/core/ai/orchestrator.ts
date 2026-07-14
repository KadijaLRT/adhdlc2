import { getAgentById } from './agents';
import type { AgentContext, AgentResponse } from './agentFactory';

// Lightweight keyword routing, not a real classifier — good enough for
// a sensible default, and the person can always override by picking an
// agent directly in the Coach screen.
const KEYWORD_MAP: Record<string, string> = {
  food: 'nutrition-coach', eat: 'nutrition-coach', meal: 'nutrition-coach',
  workout: 'workout-coach', exercise: 'workout-coach', move: 'workout-coach',
  sad: 'emotional-support', anxious: 'emotional-support', overwhelmed: 'emotional-support',
  homework: 'school-coach', study: 'school-coach', assignment: 'school-coach',
  routine: 'routine-builder', habit: 'habit-analyzer',
  week: 'weekly-review', plan: 'task-planner', task: 'task-planner',
};

export function pickAgentForMessage(message: string): string {
  const lower = (message || '').toLowerCase();
  for (const [keyword, agentId] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return agentId;
  }
  return 'coach';
}

export async function askOrchestrator(
  message: string,
  context: AgentContext,
  forcedAgentId?: string
): Promise<{ agentLabel: string; response: AgentResponse | null }> {
  const agentId = forcedAgentId || pickAgentForMessage(message);
  const agent = getAgentById(agentId);
  const response = await agent.ask(message, context);
  return { agentLabel: agent.label, response };
}
