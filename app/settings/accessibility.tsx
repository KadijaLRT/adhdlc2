import { SafeAreaView } from 'react-native-safe-area-context';
import AccessibilityScreen from '@/features/settings/AccessibilityScreen';

export default function AccessibilityRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><AccessibilityScreen /></SafeAreaView>;
}
