import { SafeAreaView } from 'react-native-safe-area-context';
import SchoolScreen from '@/features/school/SchoolScreen';

export default function SchoolRoute() {
  return <SafeAreaView className="flex-1 bg-slate-950"><SchoolScreen /></SafeAreaView>;
}
