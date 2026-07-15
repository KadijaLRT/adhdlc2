import { SafeAreaView } from 'react-native-safe-area-context';
import CoachScreen from '@/features/coach/CoachScreen';

export default function CoachRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><CoachScreen /></SafeAreaView>;
}
