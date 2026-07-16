import { useLocalSearchParams } from 'expo-router';
import BodyCheckinScreen from '@/features/workout/BodyCheckinScreen';

export default function BodyCheckinRoute() {
  const { exerciseIds, programId, dayTitle } = useLocalSearchParams<{
    exerciseIds?: string; programId?: string; dayTitle?: string;
  }>();
  const idsArray = (exerciseIds || '').split(',').filter(Boolean);
  return <BodyCheckinScreen exerciseIds={idsArray} programId={programId || undefined} dayTitle={dayTitle || undefined} />;
}
