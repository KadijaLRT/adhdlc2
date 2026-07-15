import { SafeAreaView } from 'react-native-safe-area-context';
import GroceryScreen from '@/features/nutrition/GroceryScreen';

export default function GroceriesRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><GroceryScreen /></SafeAreaView>;
}
