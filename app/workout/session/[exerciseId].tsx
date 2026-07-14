import { useLocalSearchParams } from 'expo-router';
import WorkoutSession from '@/features/workout/WorkoutSession';

export default function WorkoutSessionRoute() {
  const { exerciseId, programId, queue } = useLocalSearchParams<{ exerciseId: string; programId?: string; queue?: string }>();
  const queueArray = (queue || '').split(',').filter(Boolean);
  return <WorkoutSession exerciseId={exerciseId || ''} programId={programId || undefined} queue={queueArray} />;
}
