import { SafeAreaView } from 'react-native-safe-area-context';
import MealsHub from '@/features/mealsHub/MealsHub';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function MealsRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton toHome /><MealsHub /></SafeAreaView>;
}
