import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import AssignmentDetailScreen from '@/features/school/AssignmentDetailScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function AssignmentDetailRoute() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton /><AssignmentDetailScreen assignmentId={assignmentId || ''} /></SafeAreaView>;
}
