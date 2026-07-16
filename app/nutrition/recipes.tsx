import { SafeAreaView } from 'react-native-safe-area-context';
import RecipeBrowser from '@/features/nutrition/RecipeBrowser';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function RecipesRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton /><RecipeBrowser /></SafeAreaView>;
}
