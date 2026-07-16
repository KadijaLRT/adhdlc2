import { SafeAreaView } from 'react-native-safe-area-context';
import NutritionDiaryScreen from '@/features/nutrition/NutritionDiaryScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function NutritionDiaryRoute() {
  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950">
      <ScreenBackButton />
      <NutritionDiaryScreen />
    </SafeAreaView>
  );
}
