import { SafeAreaView } from 'react-native-safe-area-context';
import ExerciseBrowser from '@/features/workout/ExerciseBrowser';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function BrowseExercisesRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><ScreenBackButton /><ExerciseBrowser /></SafeAreaView>;
}
