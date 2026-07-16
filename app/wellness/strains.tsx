import { SafeAreaView } from 'react-native-safe-area-context';
import StrainMatcher from '@/features/wellness/StrainMatcher';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';
export default function StrainsScreen() {
  return <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton /><StrainMatcher /></SafeAreaView>;
}
