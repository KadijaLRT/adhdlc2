import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CycleTracking from '@/features/energy/CycleTracking';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function CycleTrackingSettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton />
      <View className="flex-1 p-4 w-full max-w-md self-center">
        <CycleTracking />
      </View>
    </SafeAreaView>
  );
}
