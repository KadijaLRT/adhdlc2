import { SafeAreaView } from 'react-native-safe-area-context';
import SemesterCalendar from '@/features/school/SemesterCalendar';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function SemesterRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><ScreenBackButton /><SemesterCalendar /></SafeAreaView>;
}
