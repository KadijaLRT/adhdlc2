import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PomodoroTimer from '@/features/toolkit/PomodoroTimer';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function PomodoroRoute() {
  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950">
      <ScreenBackButton />
      <View className="flex-1 w-full max-w-md self-center p-5 justify-center">
        <PomodoroTimer />
      </View>
    </SafeAreaView>
  );
}
