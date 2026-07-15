import { SafeAreaView } from 'react-native-safe-area-context';
import ScheduleScreen from '@/features/schedule/ScheduleScreen';

export default function ScheduleRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><ScheduleScreen /></SafeAreaView>;
}
