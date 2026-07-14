import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import AssignmentDetailScreen from '@/features/school/AssignmentDetailScreen';

export default function AssignmentDetailRoute() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  return <SafeAreaView className="flex-1 bg-slate-950"><AssignmentDetailScreen assignmentId={assignmentId || ''} /></SafeAreaView>;
}
