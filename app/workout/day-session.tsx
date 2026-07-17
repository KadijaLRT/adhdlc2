import { useLocalSearchParams } from 'expo-router';
import WorkoutDaySession from '@/features/workout/WorkoutDaySession';

export default function WorkoutDaySessionRoute() {
  const { exerciseIds, programId, dayTitle, sessionStartedAt, reducedGroups, energyLightened } = useLocalSearchParams<{
    exerciseIds?: string; programId?: string; dayTitle?: string;
    sessionStartedAt?: string; reducedGroups?: string; energyLightened?: string;
  }>();
  const idsArray = (exerciseIds || '').split(',').filter(Boolean);
  const reducedGroupsArray = (reducedGroups || '').split(',').filter(Boolean);
  return (
    <WorkoutDaySession
      exerciseIds={idsArray}
      programId={programId || undefined}
      dayTitle={dayTitle || undefined}
      sessionStartedAt={sessionStartedAt || undefined}
      reducedGroups={reducedGroupsArray}
      energyLightened={energyLightened === '1'}
    />
  );
}
