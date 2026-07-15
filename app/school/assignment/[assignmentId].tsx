import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import AssignmentDetailScreen from '@/features/school/AssignmentDetailScreen';

export default function AssignmentDetailRoute() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  return <SafeAreaView className="flex-1 bg-stone-50"><AssignmentDetailScreen assignmentId={assignmentId || ''} /></SafeAreaView>;
}
