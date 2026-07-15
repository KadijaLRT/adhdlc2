import { SafeAreaView } from 'react-native-safe-area-context';
import ProgramsScreen from '@/features/workout/ProgramsScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function ProgramsRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><ScreenBackButton /><ProgramsScreen /></SafeAreaView>;
}
