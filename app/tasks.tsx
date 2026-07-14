import { SafeAreaView } from 'react-native-safe-area-context';
import TasksScreen from '@/features/tasks/TasksScreen';

export default function TasksRoute() {
  return <SafeAreaView className="flex-1 bg-slate-950"><TasksScreen /></SafeAreaView>;
}
