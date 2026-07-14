import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CycleTracking from '@/features/energy/CycleTracking';

export default function CycleTrackingSettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-1 p-4 w-full max-w-md self-center">
        <CycleTracking />
      </View>
    </SafeAreaView>
  );
}
