import { SafeAreaView } from 'react-native-safe-area-context';
import BodyProgressScreen from '@/features/bodyProgress/BodyProgressScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function BodyProgressRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><ScreenBackButton /><BodyProgressScreen /></SafeAreaView>;
}
