import { SafeAreaView } from 'react-native-safe-area-context';
import CoachScreen from '@/features/coach/CoachScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function CoachRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton /><CoachScreen /></SafeAreaView>;
}
