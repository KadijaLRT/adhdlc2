import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore, selectAdhdFocusModeEnabled, selectSetLogs } from '@/store/index';
import { WORKOUT_EXERCISES } from '@/content/exercises';
import { Heading } from '@/shared/components/Heading';

interface SetRow {
  weight: string;
  reps: string;
  done: boolean;
}

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Shows every exercise for the day at once — expandable cards, each
 * with its own set rows — rather than a strict one-exercise-at-a-time
 * wizard. Sets can be added or removed per exercise for this session
 * only; it never changes the exercise's default set count going
 * forward, just what you're doing today.
 */
export default function WorkoutDaySession({
  exerciseIds, programId, dayTitle, sessionStartedAt, reducedGroups, energyLightened,
}: {
  exerciseIds: string[]; programId?: string; dayTitle?: string;
  sessionStartedAt?: string; reducedGroups?: string[]; energyLightened?: boolean;
}) {
  const router = useRouter();
  const logSet = useAppStore((s) => s.logSet);
  const recordProgramSession = useAppStore((s) => s.recordProgramSession);
  const adhdFocusModeEnabled = useAppStore(selectAdhdFocusModeEnabled);
  const setAdhdFocusMode = useAppStore((s) => s.setAdhdFocusMode);
  const setLogs = useAppStore(selectSetLogs);

  const [expandedId, setExpandedId] = useState<string | null>(exerciseIds[0] || null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordBanner, setRecordBanner] = useState<string | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [sessionRecorded, setSessionRecorded] = useState(false);

  const startedAtMs = useMemo(() => (sessionStartedAt ? new Date(sessionStartedAt).getTime() : Date.now()), [sessionStartedAt]);

  // Per-exercise set rows, seeded from each exercise's default set
  // count and (if flagged) lightened by one — but freely add/remove
  // from there for just this session.
  const [rowsByExercise, setRowsByExercise] = useState<Record<string, SetRow[]>>(() => {
    const initial: Record<string, SetRow[]> = {};
    for (const id of exerciseIds) {
      const exercise = WORKOUT_EXERCISES?.[id];
      if (!exercise) continue;
      const isReduced = energyLightened || (reducedGroups?.length && reducedGroups.includes(exercise.group));
      const setCount = isReduced ? Math.max(2, exercise.sets - 1) : exercise.sets;
      initial[id] = Array.from({ length: setCount }, () => ({ weight: '', reps: String(exercise.repsMin || 10), done: false }));
    }
    return initial;
  });

  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds(Math.max(0, Math.round((Date.now() - startedAtMs) / 1000))), 1000);
    return () => clearInterval(interval);
  }, [startedAtMs]);

  const totalSets = useMemo(() => Object.values(rowsByExercise).reduce((sum, rows) => sum + rows.length, 0), [rowsByExercise]);
  const doneSets = useMemo(() => Object.values(rowsByExercise).reduce((sum, rows) => sum + rows.filter((r) => r.done).length, 0), [rowsByExercise]);
  const allDone = totalSets > 0 && doneSets === totalSets;

  const handleAddSet = (exerciseId: string) => {
    const exercise = WORKOUT_EXERCISES?.[exerciseId];
    setRowsByExercise((prev) => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), { weight: '', reps: String(exercise?.repsMin || 10), done: false }],
    }));
  };

  const handleRemoveSet = (exerciseId: string) => {
    setRowsByExercise((prev) => {
      const rows = prev[exerciseId] || [];
      if (rows.length <= 1) return prev; // never go below one set for an exercise that's still in the session
      return { ...prev, [exerciseId]: rows.slice(0, -1) };
    });
  };

  const updateRow = (exerciseId: string, index: number, updates: Partial<SetRow>) => {
    setRowsByExercise((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] || []).map((row, i) => (i === index ? { ...row, ...updates } : row)),
    }));
  };

  const handleCompleteSet = async (exerciseId: string, index: number) => {
    const row = rowsByExercise[exerciseId]?.[index];
    if (!row || row.done) return;
    const { isNewRecord } = await logSet(exerciseId, Number(row.weight) || 0, Number(row.reps) || 0);
    updateRow(exerciseId, index, { done: true });
    if (isNewRecord) {
      setRecordBanner(`🏆 New personal record — ${WORKOUT_EXERCISES?.[exerciseId]?.name || 'nice lift'}`);
      setTimeout(() => setRecordBanner(null), 3000);
    }
  };

  const handleFinish = async () => {
    if (programId && !sessionRecorded) {
      setSessionRecorded(true);
      await recordProgramSession();
    }
    router?.replace?.('/(tabs)/workout');
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950">
      <View className="w-full max-w-md self-center px-5 pt-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <Pressable onPress={() => router?.back?.()} className="flex-row items-center mb-2 self-start py-1 -ml-1 pr-2">
          <Text className="text-slate-500 text-sm">‹ Back</Text>
        </Pressable>
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-2">
            <Text className="text-slate-900 dark:text-slate-100 text-base font-bold">{dayTitle || "Today's workout"}</Text>
            <Text className="text-slate-500 text-xs mt-0.5">{exerciseIds.length} exercise{exerciseIds.length === 1 ? '' : 's'}</Text>
          </View>
          <Text className="text-emerald-600 dark:text-emerald-400 text-xl font-bold">{formatElapsed(elapsedSeconds)}</Text>
        </View>
        <View className="flex-row items-center gap-2 mt-2">
          <View className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <View className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalSets > 0 ? (doneSets / totalSets) * 100 : 0}%` }} />
          </View>
          <Text className="text-slate-500 text-xs font-medium">{doneSets}/{totalSets} sets</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="w-full max-w-md self-center">
          {recordBanner && (
            <View className="bg-amber-400/10 border border-amber-400 rounded-xl p-3 mb-4">
              <Text className="text-amber-600 dark:text-amber-400 text-center text-sm font-medium">{recordBanner}</Text>
            </View>
          )}

          {exerciseIds.map((exerciseId) => {
            const exercise = WORKOUT_EXERCISES?.[exerciseId];
            if (!exercise) return null;
            const rows = rowsByExercise[exerciseId] || [];
            const exerciseDone = rows.length > 0 && rows.every((r) => r.done);
            const isExpanded = expandedId === exerciseId;
            const isReducedThisExercise = !!(energyLightened || (reducedGroups?.length && reducedGroups.includes(exercise.group)));

            return (
              <View key={exerciseId} className="bg-white dark:bg-slate-900 rounded-2xl mb-3 overflow-hidden">
                <Pressable onPress={() => setExpandedId(isExpanded ? null : exerciseId)} className="p-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2 flex-1 pr-2">
                    <View className={exerciseDone ? 'w-6 h-6 rounded-full bg-emerald-500 items-center justify-center' : 'w-6 h-6 rounded-full border-2 border-stone-300 dark:border-slate-700 items-center justify-center'}>
                      {exerciseDone && <Text className="text-white text-xs">✓</Text>}
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 dark:text-slate-100 text-sm font-semibold">{exercise.icon} {exercise.name}</Text>
                      <Text className="text-slate-500 text-xs">{exercise.muscle} · {rows.length} set{rows.length === 1 ? '' : 's'}{isReducedThisExercise ? ' · lightened' : ''}</Text>
                    </View>
                  </View>
                  <Text className="text-slate-400 text-xs">{isExpanded ? '▲' : '▼'}</Text>
                </Pressable>

                {isExpanded && (
                  <View className="px-4 pb-4">
                    {!adhdFocusModeEnabled && <Text className="text-slate-500 text-xs mb-3">{exercise.cues}</Text>}

                    <View className="flex-row items-center px-1 mb-1">
                      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wide w-8">Set</Text>
                      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wide flex-1 text-center">Weight</Text>
                      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wide flex-1 text-center">Reps</Text>
                      <View className="w-9" />
                    </View>

                    {rows.map((row, index) => (
                      <View key={index} className="flex-row items-center gap-2 mb-2">
                        <Text className="text-slate-500 text-sm w-8 text-center">{index + 1}</Text>
                        <TextInput
                          value={row.weight}
                          onChangeText={(v) => updateRow(exerciseId, index, { weight: v })}
                          placeholder="0"
                          placeholderTextColor="#64748b"
                          keyboardType="numeric"
                          editable={!row.done}
                          className={row.done ? 'flex-1 bg-stone-100 dark:bg-slate-800 text-slate-400 text-center rounded-lg py-2' : 'flex-1 bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center rounded-lg py-2'}
                        />
                        <TextInput
                          value={row.reps}
                          onChangeText={(v) => updateRow(exerciseId, index, { reps: v })}
                          keyboardType="numeric"
                          editable={!row.done}
                          className={row.done ? 'flex-1 bg-stone-100 dark:bg-slate-800 text-slate-400 text-center rounded-lg py-2' : 'flex-1 bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center rounded-lg py-2'}
                        />
                        <Pressable onPress={() => handleCompleteSet(exerciseId, index)} className="w-9 items-center">
                          <View className={row.done ? 'w-7 h-7 rounded-full bg-emerald-500 items-center justify-center' : 'w-7 h-7 rounded-full border-2 border-emerald-500 items-center justify-center'}>
                            {row.done && <Text className="text-white text-xs">✓</Text>}
                          </View>
                        </Pressable>
                      </View>
                    ))}

                    <View className="flex-row gap-2 mt-2">
                      <Pressable onPress={() => handleAddSet(exerciseId)} className="flex-1 border border-dashed border-stone-300 dark:border-slate-700 rounded-lg py-2 items-center">
                        <Text className="text-slate-500 text-xs">+ Add set</Text>
                      </Pressable>
                      <Pressable onPress={() => handleRemoveSet(exerciseId)} disabled={rows.length <= 1} className={rows.length <= 1 ? 'flex-1 border border-stone-200 dark:border-slate-800 rounded-lg py-2 items-center opacity-40' : 'flex-1 border border-dashed border-stone-300 dark:border-slate-700 rounded-lg py-2 items-center'}>
                        <Text className="text-slate-500 text-xs">− Remove set</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          <Pressable
            onPress={() => setAdhdFocusMode(!adhdFocusModeEnabled)}
            className="py-2 mb-4"
          >
            <Text className="text-slate-600 text-center text-xs">{adhdFocusModeEnabled ? 'Show exercise cues' : 'Simplify (hide cues)'}</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowFinishConfirm(true)}
            className={allDone ? 'bg-emerald-500 rounded-2xl py-4 items-center active:bg-emerald-400' : 'bg-indigo-600 rounded-2xl py-4 items-center active:bg-indigo-500'}
          >
            <Text className="text-white font-semibold text-base">{allDone ? 'Finish workout ✓' : 'Finish workout'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {showFinishConfirm && (
        <View className="absolute inset-0 bg-black/70 items-center justify-center px-6">
          <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm">
            <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold mb-2">
              {allDone ? 'You showed up. That counts.' : 'Finish early?'}
            </Text>
            <Text className="text-slate-500 text-sm leading-5 mb-5">
              {formatElapsed(elapsedSeconds)} · {doneSets}/{totalSets} sets logged
              {!allDone ? ' — anything not marked done just won\'t count toward this session.' : ''}
            </Text>
            <View className="flex-row gap-3">
              <Pressable onPress={() => setShowFinishConfirm(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl py-3 items-center">
                <Text className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Keep going</Text>
              </Pressable>
              <Pressable onPress={handleFinish} className="flex-1 bg-emerald-500 rounded-xl py-3 items-center">
                <Text className="text-white text-sm font-semibold">Done ✓</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
