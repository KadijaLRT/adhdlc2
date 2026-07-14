import { SafeAreaView } from 'react-native-safe-area-context';
import MealsHub from '@/features/mealsHub/MealsHub';

export default function MealsRoute() {
  return <SafeAreaView className="flex-1 bg-slate-950"><MealsHub /></SafeAreaView>;
}
