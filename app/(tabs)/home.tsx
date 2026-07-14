import { SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from '@/features/home/HomeScreen';

export default function HomeRoute() {
  return <SafeAreaView className="flex-1 bg-slate-950"><HomeScreen /></SafeAreaView>;
}
