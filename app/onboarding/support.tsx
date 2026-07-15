import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { OnboardingStepHeader, OnboardingProgressBar } from '@/features/onboarding/OnboardingStepHeader';

const SUPPORT_METHODS = [
  { id: 'medication', label: 'Medication', emoji: '💊' },
  { id: 'cannabis', label: 'Cannabis', emoji: '🌿' },
  { id: 'therapy', label: 'Therapy or coaching', emoji: '🧠' },
  { id: 'movement', label: 'Movement', emoji: '💪' },
  { id: 'routines', label: 'Routines & systems', emoji: '📋' },
  { id: 'figuring_out', label: 'Still figuring it out', emoji: '🤷' },
];

// These directly determine which optional modules get surfaced:
// "cannabis" pre-suggests the Strain Explorer, "movement" nudges toward
// Workout, "routines" nudges toward the Routines tab — via
// suggestedModules below, read by Home/Today after onboarding.

export default function SupportScreen() {
  const router = useRouter();
  const supportMethods = useOnboardingStore((s) => s.supportMethods);
  const toggleInList = useOnboardingStore((s) => s.toggleInList);

  const goToNextModuleScreen = useOnboardingStore((s) => s.goToNextModuleScreen);

  const handleContinue = () => goToNextModuleScreen(router);

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <OnboardingProgressBar step={4} total={7} />
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="w-full max-w-md self-center">
          <OnboardingStepHeader step={4} total={7} />
          <Text className="text-slate-900 text-2xl font-semibold mb-2">How do you support yourself?</Text>
          <Text className="text-slate-400 text-sm mb-6">Whatever works for you counts. No judgment here.</Text>

          <View className="flex-row flex-wrap gap-2 mb-8">
            {(SUPPORT_METHODS || []).map((item) => {
              const isActive = supportMethods.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleInList('supportMethods', item.id)}
                  className={isActive ? 'bg-emerald-400/10 border-2 border-emerald-400 rounded-xl p-4 w-[47%]' : 'bg-white border-2 border-transparent rounded-xl p-4 w-[47%]'}
                >
                  <Text className="text-lg mb-1">{item.emoji}</Text>
                  <Text className={isActive ? 'text-emerald-300 text-sm font-medium' : 'text-slate-700 text-sm font-medium'}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={handleContinue} className="bg-emerald-500 rounded-full py-4 active:bg-emerald-400">
            <Text className="text-white text-lg text-center font-semibold">Continue →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
