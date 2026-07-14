import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressScreen from '@/features/workout/ProgressScreen';

export default function ProgressRoute() {
  return <SafeAreaView className="flex-1 bg-slate-950"><ProgressScreen /></SafeAreaView>;
}
