import { SafeAreaView } from 'react-native-safe-area-context';
import RecoveryScreen from '@/features/workout/RecoveryScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function RecoveryRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><ScreenBackButton /><RecoveryScreen /></SafeAreaView>;
}
