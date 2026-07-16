import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressScreen from '@/features/workout/ProgressScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function ProgressRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton /><ProgressScreen /></SafeAreaView>;
}
