import { SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from '@/features/home/HomeScreen';

export default function HomeRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><HomeScreen /></SafeAreaView>;
}
