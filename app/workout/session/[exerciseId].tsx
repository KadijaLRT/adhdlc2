import { useLocalSearchParams } from 'expo-router';
import WorkoutSession from '@/features/workout/WorkoutSession';

export default function WorkoutSessionRoute() {
  const { exerciseId, programId, queue, sessionStartedAt, sessionTotalSets, sessionDoneSets, reducedGroups, energyLightened } = useLocalSearchParams<{
    exerciseId: string; programId?: string; queue?: string;
    sessionStartedAt?: string; sessionTotalSets?: string; sessionDoneSets?: string; reducedGroups?: string; energyLightened?: string;
  }>();
  const queueArray = (queue || '').split(',').filter(Boolean);
  const reducedGroupsArray = (reducedGroups || '').split(',').filter(Boolean);
  return (
    <WorkoutSession
      exerciseId={exerciseId || ''}
      programId={programId || undefined}
      queue={queueArray}
      sessionStartedAt={sessionStartedAt || undefined}
      sessionTotalSets={sessionTotalSets ? Number(sessionTotalSets) : undefined}
      sessionDoneSets={sessionDoneSets ? Number(sessionDoneSets) : undefined}
      reducedGroups={reducedGroupsArray}
      energyLightened={energyLightened === '1'}
    />
  );
}
