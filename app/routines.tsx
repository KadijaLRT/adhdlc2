import { SafeAreaView } from 'react-native-safe-area-context';
import RoutinesScreen from '@/features/routines/RoutinesScreen';

export default function RoutinesRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><RoutinesScreen /></SafeAreaView>;
}
