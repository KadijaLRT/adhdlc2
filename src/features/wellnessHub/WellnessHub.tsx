import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, type EnergyLevel } from '@/store/index';
import { Heading } from '@/shared/components/Heading';

const MOOD_OPTIONS: { level: EnergyLevel; emoji: string; label: string }[] = [
  { level: 'high', emoji: '😀', label: 'Good' },
  { level: 'medium', emoji: '😐', label: 'Okay' },
  { level: 'low', emoji: '😔', label: 'Struggling' },
];

/**
 * Mood-first, per the document — one tap, then the rest of the hub
 * (workout, coach, energy tracking) is reachable from here rather than
 * competing as separate tabs.
 */
export default function WellnessHub() {
  const router = useRouter();
  const energyLevel = useAppStore((s) => s.energyLevel);
  const logEnergyForToday = useAppStore((s) => s.logEnergyForToday);

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Wellness</Heading>
        <Text className="text-slate-400 text-sm mb-6">How do you feel right now?</Text>

        <View className="flex-row gap-2 mb-6">
          {(MOOD_OPTIONS || []).map((option) => {
            const isActive = energyLevel === option.level;
            return (
              <Pressable
                key={option.level}
                onPress={() => logEnergyForToday(option.level)}
                className={isActive ? 'flex-1 bg-indigo-600/20 border-2 border-indigo-400 rounded-2xl py-4 items-center' : 'flex-1 bg-white border-2 border-transparent rounded-2xl py-4 items-center'}
              >
                <Text className="text-2xl mb-1">{option.emoji}</Text>
                <Text className={isActive ? 'text-indigo-200 text-xs' : 'text-slate-700 text-xs'}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View className="gap-3">
          <Pressable onPress={() => router?.push?.('/fitness/workouts')} className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-900 text-sm">💪 Workout</Text>
            <Text className="text-slate-500 text-xs">→</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/coach')} className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-900 text-sm">💬 Chat with Aviva</Text>
            <Text className="text-slate-500 text-xs">→</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/settings/cycle-tracking')} className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-900 text-sm">🌙 Cycle tracking</Text>
            <Text className="text-slate-500 text-xs">→</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/wellness/meals')} className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-900 text-sm">🩸 Blood type meal lens</Text>
            <Text className="text-slate-500 text-xs">optional →</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/wellness/strains')} className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-900 text-sm">🌿 Strain explorer</Text>
            <Text className="text-slate-500 text-xs">optional →</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
