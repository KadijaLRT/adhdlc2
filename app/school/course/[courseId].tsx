import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import CourseDetailScreen from '@/features/school/CourseDetailScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function CourseDetailRoute() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton /><CourseDetailScreen courseId={courseId || ''} /></SafeAreaView>;
}
