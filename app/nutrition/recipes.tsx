import { SafeAreaView } from 'react-native-safe-area-context';
import RecipeBrowser from '@/features/nutrition/RecipeBrowser';

export default function RecipesRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><RecipeBrowser /></SafeAreaView>;
}
