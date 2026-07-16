import { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore, selectEnergyLevel } from '@/store/index';
import { WORKOUT_EXERCISES } from '@/content/exercises';
import { BODY_PARTS, computeCheckinAdjustment, applySkipToExerciseIds, type PainSeverity } from './bodyCheckin';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

const SEVERITY_OPTIONS: { value: PainSeverity; label: string }[] = [
  { value: 1, label: '🟡 A little' },
  { value: 2, label: '🟠 Noticeable' },
  { value: 3, label: '🔴 A lot' },
];

// Pre-workout pain/soreness check. Tapping a body part flags it; the
// day's exercises adjust around what's flagged — no judgment, just
// protection, matching the old app's copy and behavior exactly. This
// is intentionally separate from body measurements/Health import
// (that's /body/progress), which has nothing to do with today's
// workout.
export default function BodyCheckinScreen({
  exerciseIds, programId, dayTitle,
}: {
  exerciseIds: string[]; programId?: string; dayTitle?: string;
}) {
  const router = useRouter();
  const energyLevel = useAppStore(selectEnergyLevel);
  const isLowEnergyToday = energyLevel === 'low';
  const [severityByPart, setSeverityByPart] = useState<Record<string, PainSeverity>>({});
  const [notes, setNotes] = useState('');

  const flaggedParts = Object.keys(severityByPart);

  const togglePart = (id: string) => {
    setSeverityByPart((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 1 };
    });
  };

  const setSeverity = (id: string, value: PainSeverity) => {
    setSeverityByPart((prev) => ({ ...prev, [id]: value }));
  };

  const adjustment = useMemo(() => computeCheckinAdjustment(severityByPart), [severityByPart]);

  const handleContinue = () => {
    const adjustedIds = applySkipToExerciseIds(exerciseIds, adjustment.skipGroups, (id) => WORKOUT_EXERCISES?.[id]?.group);
    const [first, ...rest] = adjustedIds;
    if (!first) {
      router?.back?.();
      return;
    }
    const sessionTotalSets = adjustedIds.reduce((sum, id) => {
      const ex = WORKOUT_EXERCISES?.[id];
      const isReduced = isLowEnergyToday || adjustment.reduceGroups.includes(ex?.group || '');
      const setsForId = isReduced ? Math.max(2, (ex?.sets || 3) - 1) : (ex?.sets || 3);
      return sum + setsForId;
    }, 0);

    router?.replace?.({
      pathname: `/workout/session/${first}`,
      params: {
        programId: programId || '',
        queue: rest.join(','),
        sessionStartedAt: new Date().toISOString(),
        sessionTotalSets: String(sessionTotalSets),
        sessionDoneSets: '0',
        reducedGroups: adjustment.reduceGroups.join(','),
        energyLightened: isLowEnergyToday ? '1' : '',
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950">
      <ScreenBackButton />
      <View className="flex-1 w-full max-w-md self-center px-6">
        <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold mt-2">🩺 Body Check-In</Text>
        <Text className="text-slate-500 text-xs mb-4">{dayTitle ? `${dayTitle} · ` : ''}How does your body feel today?</Text>

        <Text className="text-slate-500 text-xs leading-5 mb-4">
          Tap anything that feels sore, tight, or off today. The workout adjusts around it, no judgment, just protection.
        </Text>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {BODY_PARTS.map((part) => {
              const isFlagged = !!severityByPart[part.id];
              return (
                <Pressable
                  key={part.id}
                  onPress={() => togglePart(part.id)}
                  className={isFlagged ? 'w-[48%] border-2 border-red-400 bg-red-400/10 rounded-xl p-3' : 'w-[48%] border-2 border-transparent bg-white dark:bg-slate-900 rounded-xl p-3'}
                >
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base">{part.icon}</Text>
                    <Text className={isFlagged ? 'text-red-500 text-sm font-semibold' : 'text-slate-500 text-sm font-semibold'}>{part.label}</Text>
                  </View>
                  {isFlagged && (
                    <View className="flex-row gap-1 mt-2">
                      {SEVERITY_OPTIONS.map((opt) => {
                        const selected = severityByPart[part.id] === opt.value;
                        return (
                          <Pressable
                            key={opt.value}
                            onPress={() => setSeverity(part.id, opt.value)}
                            className={selected ? 'flex-1 bg-red-400/20 border border-red-400 rounded-md py-1 items-center' : 'flex-1 border border-slate-300 dark:border-slate-700 rounded-md py-1 items-center'}
                          >
                            <Text className={selected ? 'text-red-500 text-[9px] font-bold' : 'text-slate-500 text-[9px] font-bold'}>{opt.label}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything else going on? (e.g. bad sleep, low energy, cramps, stress)"
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={3}
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-3 mb-4 text-sm"
            style={{ textAlignVertical: 'top' }}
          />

          {flaggedParts.length > 0 && (
            <View className="bg-red-400/10 border border-red-400/40 rounded-xl p-3 mb-4">
              <Text className="text-red-500 text-xs font-semibold mb-1">🛡️ Adjusting your workout:</Text>
              {flaggedParts.map((id) => {
                const part = BODY_PARTS.find((p) => p.id === id);
                const severity = severityByPart[id] || 1;
                return (
                  <Text key={id} className="text-slate-500 text-xs mb-0.5">
                    {part?.icon} {part?.label}: {severity >= 2 ? 'skipping exercises for that area' : 'lighter, one fewer set'}
                  </Text>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View className="pb-safe pt-2">
          {flaggedParts.length === 0 ? (
            <Text className="text-emerald-600 dark:text-emerald-400 text-xs mb-2">✅ Body feels good, going for the full workout</Text>
          ) : (
            <Text className="text-red-500 text-xs mb-2">
              🛡️ Workout adjusted for {flaggedParts.length} area{flaggedParts.length > 1 ? 's' : ''}
            </Text>
          )}
          <Pressable onPress={handleContinue} className="bg-emerald-500 rounded-full py-4 items-center active:bg-emerald-400">
            <Text className="text-white font-semibold">Continue to workout →</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
