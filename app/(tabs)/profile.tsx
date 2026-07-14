import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileScreen from '@/features/profile/ProfileScreen';

export default function ProfileRoute() {
  return <SafeAreaView className="flex-1 bg-slate-950"><ProfileScreen /></SafeAreaView>;
}
