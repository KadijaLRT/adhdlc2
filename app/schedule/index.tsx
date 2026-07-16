import { SafeAreaView } from 'react-native-safe-area-context';
import ScheduleScreen from '@/features/schedule/ScheduleScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function ScheduleRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton /><ScheduleScreen /></SafeAreaView>;
}
