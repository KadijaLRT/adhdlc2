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
const PRIORITIES = [
  { id: 'get_stronger', label: 'Get stronger', emoji: '💪' },
  { id: 'feel_better', label: 'Feel better day to day', emoji: '🌸' },
  { id: 'school', label: 'School or learning', emoji: '📚' },
  { id: 'career', label: 'Career and work', emoji: '💼' },
  { id: 'habits', label: 'Build better habits', emoji: '✅' },
];

export default function SupportScreen() {
  const router = useRouter();
  const supportMethods = useOnboardingStore((s) => s.supportMethods);
  const priorities = useOnboardingStore((s) => s.priorities);
  const toggleInList = useOnboardingStore((s) => s.toggleInList);

  const selectedModules = useOnboardingStore((s) => s.selectedModules);

  const handleContinue = () => {
    // Branching: only visit Body if Fitness was selected, only visit
    // Food if Nutrition was selected. Nobody answers a question about a
    // feature they didn't ask to use.
    if (selectedModules.includes('fitness')) {
      router?.push?.('/onboarding/body');
    } else if (selectedModules.includes('nutrition')) {
      router?.push?.('/onboarding/food');
    } else {
      router?.push?.('/onboarding/final');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <OnboardingProgressBar step={4} total={7} />
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="w-full max-w-md self-center">
          <OnboardingStepHeader step={4} total={7} />
          <Text className="text-slate-100 text-2xl font-semibold mb-2">How do you support yourself?</Text>
          <Text className="text-slate-400 text-sm mb-6">Whatever works for you counts. No judgment here.</Text>

          <View className="flex-row flex-wrap gap-2 mb-8">
            {(SUPPORT_METHODS || []).map((item) => {
              const isActive = supportMethods.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleInList('supportMethods', item.id)}
                  className={isActive ? 'bg-emerald-400/10 border-2 border-emerald-400 rounded-xl p-4 w-[47%]' : 'bg-slate-900 border-2 border-transparent rounded-xl p-4 w-[47%]'}
                >
                  <Text className="text-lg mb-1">{item.emoji}</Text>
                  <Text className={isActive ? 'text-emerald-300 text-sm font-medium' : 'text-slate-300 text-sm font-medium'}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-slate-100 text-lg font-semibold mb-1">What matters most to you right now?</Text>
          <Text className="text-slate-400 text-sm mb-4">Pick as many as you want.</Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {(PRIORITIES || []).map((item) => {
              const isActive = priorities.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleInList('priorities', item.id)}
                  className={isActive ? 'bg-emerald-400/10 border-2 border-emerald-400 rounded-full py-3 px-4' : 'bg-slate-900 border-2 border-transparent rounded-full py-3 px-4'}
                >
                  <Text className={isActive ? 'text-emerald-300 text-sm' : 'text-slate-300 text-sm'}>{item.emoji} {item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={handleContinue} className="bg-emerald-500 rounded-full py-4 active:bg-emerald-400">
            <Text className="text-slate-950 text-lg text-center font-semibold">Continue →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
