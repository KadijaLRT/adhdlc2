import { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore, selectAdhdFocusModeEnabled } from '@/store/index';
import { WORKOUT_EXERCISES } from '@/content/exercises';
import { Heading } from '@/shared/components/Heading';

const REST_COACHING_LINES = [
  'Take a drink.', 'A few deep breaths.', 'Shake it out.', 'Almost there.',
];

export default function WorkoutSession({ exerciseId, programId, queue }: { exerciseId: string; programId?: string; queue?: string[] }) {
  const router = useRouter();
  const exercise = WORKOUT_EXERCISES?.[exerciseId];
  const logSet = useAppStore((s) => s.logSet);
  const adhdFocusModeEnabled = useAppStore(selectAdhdFocusModeEnabled);
  const setAdhdFocusMode = useAppStore((s) => s.setAdhdFocusMode);
  const recordProgramSession = useAppStore((s) => s.recordProgramSession);
  const [programSessionRecorded, setProgramSessionRecorded] = useState(false);

  const totalSets = exercise?.sets || 3;
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState(String(exercise?.repsMin || 10));
  const [phase, setPhase] = useState<'set' | 'resting' | 'done'>('set');
  const [restSecondsLeft, setRestSecondsLeft] = useState(exercise?.rest || 60);
  const [recordBanner, setRecordBanner] = useState<string | null>(null);

  const hasMoreInQueue = (queue || []).length > 0;

  useEffect(() => {
    if (phase === 'done' && programId && !hasMoreInQueue && !programSessionRecorded) {
      setProgramSessionRecorded(true);
      recordProgramSession();
    }
  }, [phase, programId, hasMoreInQueue, programSessionRecorded, recordProgramSession]);

  useEffect(() => {
    if (phase !== 'resting') return;
    if (restSecondsLeft <= 0) {
      setPhase(currentSet >= totalSets ? 'done' : 'set');
      if (currentSet < totalSets) setCurrentSet((s) => s + 1);
      return;
    }
    const interval = setInterval(() => setRestSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [phase, restSecondsLeft, currentSet, totalSets]);

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center px-8">
        <Text className="text-slate-500 text-center">Couldn&apos;t find that exercise.</Text>
        <Pressable onPress={() => router?.back?.()} className="mt-4">
          <Text className="text-indigo-400">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleCompleteSet = async () => {
    const { isNewRecord } = await logSet(exerciseId, Number(weight) || 0, Number(reps) || 0);
    if (isNewRecord) {
      setRecordBanner('🎉 New record for this exercise');
      setTimeout(() => setRecordBanner(null), 3000);
    }
    setRestSecondsLeft(exercise.rest || 60);
    setPhase('resting');
  };

  const coachingLine = REST_COACHING_LINES[restSecondsLeft % REST_COACHING_LINES.length];

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <View className="flex-1 w-full max-w-md self-center px-6 pt-safe pb-safe">
        {!adhdFocusModeEnabled && (
          <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2">
            {exercise.muscle}
          </Text>
        )}

        {recordBanner && (
          <View className="bg-amber-400/10 border border-amber-400 rounded-xl p-3 mb-4">
            <Text className="text-amber-700 text-center text-sm font-medium">{recordBanner}</Text>
          </View>
        )}

        {phase === 'set' && (
          <View className="flex-1 justify-center">
            <Heading className="text-center mb-1">{exercise.name}</Heading>
            <Text className="text-slate-500 text-center mb-8">Set {currentSet} of {totalSets}</Text>

            {!adhdFocusModeEnabled && (
              <Text className="text-slate-500 text-xs text-center mb-8">{exercise.cues}</Text>
            )}

            <View className="flex-row gap-3 mb-8">
              <View className="flex-1">
                <Text className="text-slate-500 text-xs mb-1 text-center">Weight</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                  className="bg-white text-slate-900 text-center text-xl rounded-xl py-3"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-500 text-xs mb-1 text-center">Reps</Text>
                <TextInput
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="numeric"
                  className="bg-white text-slate-900 text-center text-xl rounded-xl py-3"
                />
              </View>
            </View>

            <Pressable onPress={handleCompleteSet} className="bg-indigo-600 rounded-full py-4 active:bg-indigo-500">
              <Text className="text-white text-center font-semibold text-lg">Complete set</Text>
            </Pressable>
          </View>
        )}

        {phase === 'resting' && (
          <View className="flex-1 justify-center items-center">
            <Text className="text-slate-500 text-sm uppercase tracking-wider mb-4">Resting</Text>
            <Text className="text-slate-50 text-6xl font-bold mb-4">{restSecondsLeft}</Text>
            <Text className="text-slate-700 mb-10">{coachingLine}</Text>
            {!adhdFocusModeEnabled && (
              <Text className="text-slate-500 text-xs text-center">
                Next: set {currentSet < totalSets ? currentSet + 1 : currentSet} of {totalSets}
              </Text>
            )}
            <Pressable onPress={() => { setRestSecondsLeft(0); }} className="mt-6 py-2">
              <Text className="text-slate-500 text-sm">Skip rest</Text>
            </Pressable>
          </View>
        )}

        {phase === 'done' && (
          <View className="flex-1 justify-center items-center">
            <Heading className="text-center mb-2">Nice work.</Heading>
            <Text className="text-slate-500 text-center mb-10">All {totalSets} sets logged for {exercise.name}.</Text>

            {hasMoreInQueue ? (
              <Pressable
                onPress={() => {
                  const [next, ...rest] = queue || [];
                  router?.replace?.({
                    pathname: `/workout/session/${next}`,
                    params: { programId: programId || '', queue: rest.join(',') },
                  });
                }}
                className="bg-indigo-600 rounded-full py-4 px-10 active:bg-indigo-500"
              >
                <Text className="text-white font-semibold">Next exercise ({(queue || []).length} left)</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => router?.replace?.('/fitness/programs')} className="bg-emerald-500 rounded-full py-4 px-10 active:bg-emerald-400">
                <Text className="text-white font-semibold">{programId ? "Finish today's session" : 'Done'}</Text>
              </Pressable>
            )}
          </View>
        )}

        {phase === 'set' && (
          <Pressable
            onPress={() => setAdhdFocusMode(!adhdFocusModeEnabled)}
            className="py-3"
          >
            <Text className="text-slate-600 text-center text-xs">
              {adhdFocusModeEnabled ? 'Show more detail' : 'Simplify'}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
