import { SafeAreaView } from 'react-native-safe-area-context';
import RoutinesScreen from '@/features/routines/RoutinesScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function RoutinesRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton /><RoutinesScreen /></SafeAreaView>;
}
