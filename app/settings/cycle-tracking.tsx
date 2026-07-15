import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CycleTracking from '@/features/energy/CycleTracking';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function CycleTrackingSettingsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-stone-50"><ScreenBackButton />
      <View className="flex-1 p-4 w-full max-w-md self-center">
        <CycleTracking />
        <Pressable onPress={() => router?.push?.('/body/progress')} className="bg-white rounded-2xl p-4 mt-4">
          <Text className="text-slate-900 text-sm font-medium mb-1">🍎 Import from Apple Health</Text>
          <Text className="text-slate-500 text-xs">Import your period history from an Apple Health export — in Progress →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
