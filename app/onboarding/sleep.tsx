import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { OnboardingBackOnlyHeader } from '@/features/onboarding/OnboardingStepHeader';

const SLEEP_STRUGGLES = [
  { id: 'falling_asleep', label: 'Falling asleep', emoji: '🌙' },
  { id: 'staying_asleep', label: 'Staying asleep', emoji: '🌛' },
  { id: 'waking_up', label: 'Waking up', emoji: '⏰' },
  { id: 'bedtime_routine', label: 'Bedtime routine', emoji: '🛏️' },
];

export default function SleepScreen() {
  const router = useRouter();
  const sleepStruggles = useOnboardingStore((s) => s.sleepStruggles);
  const toggleInList = useOnboardingStore((s) => s.toggleInList);
  const goToNextModuleScreen = useOnboardingStore((s) => s.goToNextModuleScreen);

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="w-full max-w-md self-center">
          <OnboardingBackOnlyHeader />
          <Text className="text-slate-100 text-2xl font-semibold mb-2">What do you struggle with?</Text>
          <Text className="text-slate-400 text-sm mb-6">Pick whatever's true. Shapes your wind-down and Evening check-in.</Text>

          <View className="gap-2 mb-8">
            {(SLEEP_STRUGGLES || []).map((item) => {
              const isActive = sleepStruggles.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleInList('sleepStruggles', item.id)}
                  className={isActive ? 'bg-emerald-400/10 border-2 border-emerald-400 rounded-xl p-4' : 'bg-slate-900 border-2 border-transparent rounded-xl p-4'}
                >
                  <Text className={isActive ? 'text-emerald-300 font-medium' : 'text-slate-100 font-medium'}>{item.emoji} {item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={() => goToNextModuleScreen(router)} className="bg-emerald-500 rounded-full py-4 active:bg-emerald-400">
            <Text className="text-white text-lg text-center font-semibold">Continue →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
