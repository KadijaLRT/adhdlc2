import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAppStore, type EnergyLevel, type ReminderStyle, type CoachingStyle } from '@/store/index';
import { syncProfileIfSignedIn } from '@/core/supabase/client';
import { avivaBrain } from '@/core/ai/AvivaBrain';
import { OnboardingStepHeader, OnboardingProgressBar } from '@/features/onboarding/OnboardingStepHeader';

const REMINDER_STYLES: { id: ReminderStyle; label: string; blurb: string; emoji: string }[] = [
  { id: 'consequence', label: 'Consequence-based', blurb: '"Here\'s what happens if you skip this"', emoji: '⚡' },
  { id: 'loud', label: 'Loud and direct', blurb: 'hard to ignore', emoji: '🔔' },
  { id: 'gentle', label: 'Gentle', blurb: 'supportive, no pressure', emoji: '💚' },
];

const COACHING_STYLES: { id: CoachingStyle; label: string; emoji: string }[] = [
  { id: 'gentle', label: 'Gentle', emoji: '💚' },
  { id: 'funny', label: 'Funny', emoji: '😂' },
  { id: 'reality_check', label: 'Reality Check', emoji: '⚡' },
  { id: 'friend', label: 'Like a friend', emoji: '🤝' },
  { id: 'scientific', label: 'Scientific', emoji: '🧠' },
];

function parseList(text: string): string[] {
  return (text || '').split(',').map((s) => s.trim()).filter(Boolean);
}

export default function FinalScreen() {
  const router = useRouter();
  const o = useOnboardingStore();
  const setField = useOnboardingStore((s) => s.setField);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  const setEnergyLevel = useAppStore((s) => s.setEnergyLevel);
  const setProfile = useAppStore((s) => s.setProfile);
  const addTask = useAppStore((s) => s.addTask);
  const setNutritionPreferences = useAppStore((s) => s.setNutritionPreferences);
  const setFitnessPreferences = useAppStore((s) => s.setFitnessPreferences);
  const setWellnessPreferences = useAppStore((s) => s.setWellnessPreferences);
  const setCycleTrackingEnabled = useAppStore((s) => s.setCycleTrackingEnabled);
  const logWeight = useAppStore((s) => s.logWeight);

  const [finishing, setFinishing] = useState(false);

  const handleFinish = async () => {
    setFinishing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const timezone = Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || 'UTC';

    const profile = {
      timezone,
      energyBaseline: o.energyBaseline,
      stressThreshold: o.stressThreshold,
      biggestHurdle: o.biggestHurdle,
      onboardingCompletedAt: new Date().toISOString(),
      displayName: o.displayName || undefined,
      ageBracket: o.ageBracket || undefined,
      selectedModules: o.selectedModules,
      adhdSymptoms: o.adhdSymptoms,
      brainTypes: o.brainTypes,
      supportMethods: o.supportMethods,
      priorities: o.priorities,
      reminderStyle: o.reminderStyle || undefined,
      coachingStyle: o.coachingStyle || undefined,
    };

    // Every answer is committed to the system that actually uses it,
    // not just stored on the profile as inert data.
    setEnergyLevel(o.energyBaseline);
    await setProfile(profile);

    await setNutritionPreferences({
      allergies: parseList(o.allergies),
      dietaryRestrictions: [],
      foodsLoved: parseList(o.foodsLoved),
      foodsAvoided: parseList(o.foodsAvoided),
    });

    await setFitnessPreferences({
      equipment: ['bodyweight'],
      primaryGoal: o.exerciseGoals.includes('get_stronger') ? 'strength' : o.exerciseGoals.includes('flexibility') ? 'mobility' : o.exerciseGoals.includes('cardio') ? 'endurance' : 'general',
      gender: o.gender,
      weightGoalDirections: o.weightGoalDirections,
      bodyType: o.bodyType || undefined,
      activityLevel: o.activityLevel || undefined,
      exerciseGoals: o.exerciseGoals,
      focusAreas: o.focusAreas,
    });

    if (o.bloodType) {
      await setWellnessPreferences({ bloodTypeEnabled: true, bloodType: o.bloodType });
    }

    if (o.startingWeightLbs && Number(o.startingWeightLbs) > 0) {
      await logWeight(Number(o.startingWeightLbs));
    }

    if (o.cycleTrackingEnabled) {
      setCycleTrackingEnabled(true);
    }

    // First task, generated from the biggest hurdle they named,
    // exactly as before — the last step never removed this, just moved
    // where it lives in the flow.
    if (o.biggestHurdle?.trim()) {
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
      const decomposition = await avivaBrain.decomposeTask(o.biggestHurdle, {
        currentEnergyLevel: o.energyBaseline,
        isOverwhelmed: false,
        timeOfDay,
      });
      if (decomposition) {
        await addTask({
          id: `onboarding-${Date.now()}`,
          title: decomposition.originalTask || o.biggestHurdle,
          isComplete: false,
          energyRequired: decomposition.suggestedEnergyLevel,
          realMinutes: decomposition.estimatedRealMinutes,
          estimatedMinutes: decomposition.estimatedIdealMinutes,
          priority: 'important',
          category: 'general',
          createdAt: new Date().toISOString(),
          subSteps: (decomposition.subSteps || []).map((s) => ({ id: s.id, title: s.title, isComplete: false })),
        });
      } else {
        await addTask({
          id: `onboarding-${Date.now()}`,
          title: o.biggestHurdle,
          isComplete: false,
          energyRequired: o.energyBaseline,
          priority: 'important',
          category: 'general',
          createdAt: new Date().toISOString(),
          subSteps: [],
        });
      }
    }

    syncProfileIfSignedIn({
      timezone, energyBaseline: o.energyBaseline, stressThreshold: o.stressThreshold, biggestHurdle: o.biggestHurdle,
    });

    resetOnboarding();
    router?.replace?.('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <OnboardingProgressBar step={7} total={7} />
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="w-full max-w-md self-center">
          <OnboardingStepHeader step={7} total={7} />
          <Text className="text-slate-100 text-2xl font-semibold mb-2">Almost there 🎉</Text>
          <Text className="text-slate-400 text-sm mb-6">Two last things. These help your reminders feel right for how your brain works.</Text>

          <View className="bg-purple-400/10 border-2 border-purple-400 rounded-2xl p-4 mb-6">
            <Text className="text-purple-300 font-medium mb-1">🌸 Cycle & Wellness Tracking</Text>
            <Text className="text-slate-400 text-xs mb-3">Track how your cycle affects your mood, energy, and ADHD symptoms. Optional and off by default.</Text>
            <Pressable
              onPress={() => setField('cycleTrackingEnabled', !o.cycleTrackingEnabled)}
              className={o.cycleTrackingEnabled ? 'bg-purple-400/20 border-2 border-purple-400 rounded-xl py-2 items-center' : 'bg-slate-800 rounded-xl py-2 items-center'}
            >
              <Text className={o.cycleTrackingEnabled ? 'text-purple-200 font-medium' : 'text-slate-300 font-medium'}>
                {o.cycleTrackingEnabled ? 'Cycle tracking enabled ✓' : 'Enable cycle tracking'}
              </Text>
            </Pressable>
          </View>

          <Text className="text-slate-100 text-lg font-semibold mb-1">How should I coach you?</Text>
          <Text className="text-slate-400 text-sm mb-4">This shapes Aviva's tone in every conversation.</Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {COACHING_STYLES.map((style) => {
              const isActive = o.coachingStyle === style.id;
              return (
                <Pressable key={style.id} onPress={() => setField('coachingStyle', style.id)} className={isActive ? 'bg-emerald-400/10 border-2 border-emerald-400 rounded-full py-2 px-4' : 'bg-slate-900 border-2 border-transparent rounded-full py-2 px-4'}>
                  <Text className={isActive ? 'text-emerald-300 text-sm' : 'text-slate-300 text-sm'}>{style.emoji} {style.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-slate-100 text-lg font-semibold mb-1">How do reminders land best for you?</Text>
          <Text className="text-slate-400 text-sm mb-4">There's no right answer — pick what actually gets you moving.</Text>
          <View className="gap-2 mb-8">
            {REMINDER_STYLES.map((style) => {
              const isActive = o.reminderStyle === style.id;
              return (
                <Pressable key={style.id} onPress={() => setField('reminderStyle', style.id)} className={isActive ? 'bg-emerald-400/10 border-2 border-emerald-400 rounded-xl p-4' : 'bg-slate-900 border-2 border-transparent rounded-xl p-4'}>
                  <Text className={isActive ? 'text-emerald-300 font-medium' : 'text-slate-100 font-medium'}>{style.emoji} {style.label}</Text>
                  <Text className="text-slate-500 text-xs">{style.blurb}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={handleFinish} disabled={finishing} className="bg-emerald-500 rounded-full py-4 items-center active:bg-emerald-400">
            <Text className="text-slate-950 text-lg font-semibold">{finishing ? 'Setting things up...' : '✨ Start Using App →'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
