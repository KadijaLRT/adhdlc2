import { SafeAreaView } from 'react-native-safe-area-context';
import WellnessHub from '@/features/wellnessHub/WellnessHub';

export default function WellnessRoute() {
  return <SafeAreaView className="flex-1 bg-slate-950"><WellnessHub /></SafeAreaView>;
}
