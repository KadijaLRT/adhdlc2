import { SafeAreaView } from 'react-native-safe-area-context';
import MealPlanner from '@/features/wellness/MealPlanner';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';
export default function MealsScreen() {
  return <SafeAreaView className="flex-1 bg-stone-50"><ScreenBackButton /><MealPlanner /></SafeAreaView>;
}
