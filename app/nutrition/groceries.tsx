import { SafeAreaView } from 'react-native-safe-area-context';
import GroceryScreen from '@/features/nutrition/GroceryScreen';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function GroceriesRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton /><GroceryScreen /></SafeAreaView>;
}
