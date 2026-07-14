import { SafeAreaView } from 'react-native-safe-area-context';
import GroceryScreen from '@/features/nutrition/GroceryScreen';

export default function GroceriesRoute() {
  return <SafeAreaView className="flex-1 bg-slate-950"><GroceryScreen /></SafeAreaView>;
}
