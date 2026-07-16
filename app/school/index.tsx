import { SafeAreaView } from 'react-native-safe-area-context';
import SchoolScreen from '@/features/school/SchoolScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function SchoolRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton /><SchoolScreen /></SafeAreaView>;
}
