import { useLocalSearchParams } from 'expo-router';
import RoutineRunner from '@/features/routines/RoutineRunner';

export default function RoutineRunRoute() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  return <RoutineRunner routineId={routineId || ''} />;
}
