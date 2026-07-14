export interface MilestoneTier { threshold: number; label: string; }
export interface MilestoneDefinition {
  id: string; title: string; description: string;
  trackedEvent: 'task_completed' | 'stuck_flow_used' | 'body_doubling_session' | 'routine_completed';
  tiers: MilestoneTier[];
}

// Cumulative only. Nothing here can go down, reset, or "break." Tiers
// unlock permanently once reached.
export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  { id: 'tasks-completed', title: 'Getting Things Done', description: 'Tasks you have marked complete, ever.',
    trackedEvent: 'task_completed',
    tiers: [{ threshold: 1, label: 'First step' }, { threshold: 10, label: 'Building momentum' }, { threshold: 50, label: 'Steady hands' }, { threshold: 200, label: 'Quiet consistency' }] },
  { id: 'stuck-flow-used', title: 'Finding Your Way Through', description: 'Times you used the Stuck Flow to get unstuck.',
    trackedEvent: 'stuck_flow_used',
    tiers: [{ threshold: 1, label: 'First bypass' }, { threshold: 10, label: 'Knows the way out' }, { threshold: 30, label: 'Old friend of the process' }] },
  { id: 'body-doubling-sessions', title: 'Not Alone', description: 'Body doubling sessions started.',
    trackedEvent: 'body_doubling_session',
    tiers: [{ threshold: 1, label: 'First session' }, { threshold: 10, label: 'Regular co-worker' }, { threshold: 25, label: 'Community habit' }] },
  { id: 'routines-completed', title: 'Gentle Rhythm', description: 'Routine check-ins completed, cumulatively.',
    trackedEvent: 'routine_completed',
    tiers: [{ threshold: 1, label: 'First check-in' }, { threshold: 20, label: 'Finding a rhythm' }, { threshold: 100, label: 'Deeply woven in' }] },
  { id: 'critical-cleared', title: 'Handled It', description: "Days you cleared everything marked critical.",
    trackedEvent: 'critical_tasks_cleared_today',
    tiers: [{ threshold: 1, label: 'First clear day' }, { threshold: 10, label: 'Reliable under pressure' }, { threshold: 30, label: 'This is just how you operate now' }] },
];

export function getUnlockedTiers(d: MilestoneDefinition, count: number): MilestoneTier[] {
  return (d.tiers || []).filter((t) => count >= t.threshold);
}
export function getNextTier(d: MilestoneDefinition, count: number): MilestoneTier | null {
  return (d.tiers || []).filter((t) => count < t.threshold)[0] || null;
}
