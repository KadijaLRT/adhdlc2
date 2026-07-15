import { SafeAreaView } from 'react-native-safe-area-context';
import MealsHub from '@/features/mealsHub/MealsHub';

export default function MealsRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><MealsHub /></SafeAreaView>;
}
