import { SafeAreaView } from 'react-native-safe-area-context';
import WellnessHub from '@/features/wellnessHub/WellnessHub';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function WellnessRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton toHome /><WellnessHub /></SafeAreaView>;
}
