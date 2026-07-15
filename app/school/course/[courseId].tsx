import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import CourseDetailScreen from '@/features/school/CourseDetailScreen';

export default function CourseDetailRoute() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  return <SafeAreaView className="flex-1 bg-stone-50"><CourseDetailScreen courseId={courseId || ''} /></SafeAreaView>;
}
