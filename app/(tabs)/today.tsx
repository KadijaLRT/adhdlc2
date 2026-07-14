import { SafeAreaView } from 'react-native-safe-area-context';
import TodayHub from '@/features/today/TodayHub';

export default function TodayRoute() {
  return <SafeAreaView className="flex-1 bg-slate-950"><TodayHub /></SafeAreaView>;
}
