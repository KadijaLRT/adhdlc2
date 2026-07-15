import { SafeAreaView } from 'react-native-safe-area-context';
import WorkoutsHome from '@/features/workout/WorkoutsHome';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function WorkoutsRoute() {
  return <SafeAreaView className="flex-1 bg-stone-50"><ScreenBackButton /><WorkoutsHome /></SafeAreaView>;
}
