import { useLocalSearchParams } from 'expo-router';
import StretchRunner from '@/features/workout/StretchRunner';

export default function StretchRunRoute() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  return <StretchRunner routineId={routineId || ''} />;
}
