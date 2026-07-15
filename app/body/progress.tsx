import { SafeAreaView } from 'react-native-safe-area-context';
import BodyProgressScreen from '@/features/bodyProgress/BodyProgressScreen';

export default function BodyProgressRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><BodyProgressScreen /></SafeAreaView>;
}
