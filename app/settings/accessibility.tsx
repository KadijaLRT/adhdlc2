import { SafeAreaView } from 'react-native-safe-area-context';
import AccessibilityScreen from '@/features/settings/AccessibilityScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function AccessibilityRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton /><AccessibilityScreen /></SafeAreaView>;
}
