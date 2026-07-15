import { SafeAreaView } from 'react-native-safe-area-context';
import SemesterCalendar from '@/features/school/SemesterCalendar';

export default function SemesterRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><SemesterCalendar /></SafeAreaView>;
}
