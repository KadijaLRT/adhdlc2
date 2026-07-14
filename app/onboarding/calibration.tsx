import { View, Text, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function CalibrationScreen() {
  const router = useRouter();
  const biggestHurdle = useOnboardingStore((s) => s.biggestHurdle);
  const setBiggestHurdle = useOnboardingStore((s) => s.setBiggestHurdle);
  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router?.push?.('/onboarding/baseline');
  };
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-1 w-full max-w-md self-center px-6 pt-safe pb-safe justify-center">
        <Text accessibilityRole="header" className="text-slate-100 text-2xl font-semibold mb-3">
          What&apos;s the biggest hurdle today?
        </Text>
        <Text className="text-slate-400 text-base mb-6">No wrong answer. Just whatever comes to mind.</Text>
        <TextInput value={biggestHurdle} onChangeText={setBiggestHurdle} placeholder="Getting started on anything..."
          placeholderTextColor="#64748b" multiline accessibilityLabel="Describe your biggest hurdle today"
          className="bg-slate-900 text-slate-100 rounded-xl p-4 min-h-[100px] mb-8 text-lg" />
        <Pressable onPress={handleContinue} accessibilityRole="button" accessibilityLabel="Continue to baseline setup"
          className="bg-indigo-600 rounded-full py-4 active:bg-indigo-500">
          <Text className="text-white text-lg text-center font-semibold">Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
