import { SafeAreaView } from 'react-native-safe-area-context';
import TasksScreen from '@/features/tasks/TasksScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function TasksRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><ScreenBackButton /><TasksScreen /></SafeAreaView>;
}
