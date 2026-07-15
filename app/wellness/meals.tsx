import { SafeAreaView } from 'react-native-safe-area-context';
import MealPlanner from '@/features/wellness/MealPlanner';
export default function MealsScreen() {
  return <SafeAreaView className="flex-1 bg-stone-50"><MealPlanner /></SafeAreaView>;
}
