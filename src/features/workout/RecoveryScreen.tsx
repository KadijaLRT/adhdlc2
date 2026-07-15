import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useAppStore, selectSetLogs } from '@/store/index';
import { calculateWorkoutStreak } from './progressCalculations';
import { STRETCH_ROUTINES, RECOVERY_TIPS } from '@/content/recoveryContent';
import { Heading, Subheading } from '@/shared/components/Heading';

export default function RecoveryScreen() {
  const setLogs = useAppStore(selectSetLogs);
  const streak = calculateWorkoutStreak(setLogs);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // A gentle nudge, never a rule — offered only past a few consecutive
  // days, and phrased as a suggestion, not an instruction.
  const suggestRestDay = streak >= 4;

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Recovery</Heading>
        <Text className="text-slate-500 text-sm mb-6">
          Staying consistent matters more than any single hard session.
        </Text>

        {suggestRestDay && (
          <View className="bg-emerald-400/10 border-2 border-emerald-400 rounded-2xl p-4 mb-6">
            <Text className="text-emerald-700 text-sm">
              You've shown up {streak} days in a row. A rest day today is a completely valid choice, not a step backward.
            </Text>
          </View>
        )}

        <Subheading className="mb-3">Stretch routines</Subheading>
        <View className="gap-2 mb-6">
          {(STRETCH_ROUTINES || []).map((routine) => {
            const isExpanded = expandedId === routine.id;
            return (
              <Pressable
                key={routine.id}
                onPress={() => setExpandedId(isExpanded ? null : routine.id)}
                className="bg-white rounded-2xl p-4"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-900 font-medium">{routine.title}</Text>
                  <Text className="text-slate-500 text-xs">{routine.durationMinutes} min</Text>
                </View>
                {isExpanded && (
                  <View className="mt-3 gap-1">
                    {(routine.steps || []).map((step, index) => (
                      <Text key={index} className="text-slate-500 text-sm">• {step}</Text>
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <Subheading className="mb-3">Good to know</Subheading>
        <View className="gap-2">
          <View className="bg-white rounded-xl p-4">
            <Text className="text-slate-700 text-xs font-medium mb-1">💧 Hydration</Text>
            <Text className="text-slate-500 text-sm">{RECOVERY_TIPS.hydration}</Text>
          </View>
          <View className="bg-white rounded-xl p-4">
            <Text className="text-slate-700 text-xs font-medium mb-1">😴 Sleep</Text>
            <Text className="text-slate-500 text-sm">{RECOVERY_TIPS.sleep}</Text>
          </View>
          <View className="bg-white rounded-xl p-4">
            <Text className="text-slate-700 text-xs font-medium mb-1">🩹 Soreness</Text>
            <Text className="text-slate-500 text-sm">{RECOVERY_TIPS.soreness}</Text>
          </View>
          <View className="bg-white rounded-xl p-4">
            <Text className="text-slate-700 text-xs font-medium mb-1">🛌 Rest days</Text>
            <Text className="text-slate-500 text-sm">{RECOVERY_TIPS.restDays}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
