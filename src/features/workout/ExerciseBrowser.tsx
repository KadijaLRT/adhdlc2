import { useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, selectCompletedExerciseLog, selectFitnessPreferences, selectFitnessCardDismissed } from '@/store/index';
import PersonalizeFitnessCard from './PersonalizeFitnessCard';
import { pickStartSomewhereExercise } from './pickStartSomewhere';
import { WORKOUT_EXERCISES, type Exercise } from '@/content/exercises';

export default function ExerciseBrowser() {
  const router = useRouter();
  const completedLog = useAppStore(selectCompletedExerciseLog);
  const logExerciseCompletion = useAppStore((s) => s.logExerciseCompletion);
  const fitnessPreferences = useAppStore(selectFitnessPreferences);
  const fitnessCardDismissed = useAppStore(selectFitnessCardDismissed);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const entries = useMemo(() => Object.entries(WORKOUT_EXERCISES || {}), []);
  const groups = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(([, ex]) => set.add(ex.group));
    return Array.from(set);
  }, [entries]);

  const availableEquipment = fitnessPreferences?.equipment || null;

  const filteredByEquipment = availableEquipment
    ? entries.filter(([, ex]) => (ex.eq || []).some((e) => availableEquipment.includes(e)))
    : entries;

  const filtered = filteredByEquipment.filter(([, ex]) => !selectedGroup || ex.group === selectedGroup);

  const handleStartSomewhere = () => {
    const picked = pickStartSomewhereExercise(fitnessPreferences);
    if (picked) router?.push?.(`/workout/session/${picked.id}`);
  };

  return (
    <View className="flex-1">
      <View className="px-4 pt-4 w-full max-w-md self-center">
        <Text className="text-slate-100 text-2xl font-semibold mb-1">Workout</Text>
        <Text className="text-slate-400 text-sm mb-4">Pick a muscle group. Do as much or as little as feels right today.</Text>

        {!fitnessCardDismissed && <PersonalizeFitnessCard />}

        <Pressable onPress={handleStartSomewhere} className="bg-indigo-600 rounded-2xl py-4 mb-3 items-center active:bg-indigo-500">
          <Text className="text-white font-semibold text-base">Don't overthink it — Start Somewhere</Text>
        </Pressable>

        <View className="flex-row gap-2 mb-3">
          <Pressable onPress={() => router?.push?.('/fitness/programs')} className="flex-1 bg-slate-900 rounded-xl py-3 items-center">
            <Text className="text-slate-300 text-sm">🏋️ Programs</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/fitness/progress')} className="flex-1 bg-slate-900 rounded-xl py-3 items-center">
            <Text className="text-slate-300 text-sm">📈 Progress</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/fitness/recovery')} className="flex-1 bg-slate-900 rounded-xl py-3 items-center">
            <Text className="text-slate-300 text-sm">🧘 Recovery</Text>
          </Pressable>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['all', ...groups]}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 8, marginBottom: 12 }}
          renderItem={({ item }) => {
            const isActive = item === 'all' ? selectedGroup === null : selectedGroup === item;
            return (
              <Pressable
                onPress={() => setSelectedGroup(item === 'all' ? null : item)}
                className={isActive ? 'bg-indigo-600/20 border-2 border-indigo-400 rounded-full py-2 px-4' : 'bg-slate-900 border-2 border-transparent rounded-full py-2 px-4'}
              >
                <Text className={isActive ? 'text-indigo-200 text-xs capitalize' : 'text-slate-300 text-xs capitalize'}>{item}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={([id]) => id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40, width: '100%', maxWidth: 448, alignSelf: 'center' }}
        renderItem={({ item: [id, exercise] }) => {
          const completedCount = (completedLog || []).filter((l) => l.exerciseId === id).length;
          return <ExerciseCard exercise={exercise} exerciseId={id} completedCount={completedCount} onLogCompletion={() => logExerciseCompletion(id)} />;
        }}
        ListEmptyComponent={<Text className="text-slate-500 text-center mt-6">No exercises in this group yet.</Text>}
      />
    </View>
  );
}

function ExerciseCard({ exercise, exerciseId, completedCount, onLogCompletion }: { exercise: Exercise; exerciseId: string; completedCount: number; onLogCompletion: () => void }) {
  const router = useRouter();
  return (
    <View className="bg-slate-900 rounded-2xl p-4">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-slate-100 font-medium flex-1">{exercise?.icon} {exercise?.name}</Text>
        {completedCount > 0 && <Text className="text-emerald-400 text-xs">done {completedCount}×</Text>}
      </View>
      <Text className="text-slate-500 text-xs mb-2">{exercise?.muscle} · {exercise?.sets} sets · {exercise?.reps} reps · rest {exercise?.rest}s</Text>
      <Text className="text-slate-400 text-xs mb-3">{exercise?.cues}</Text>
      <Pressable onPress={() => router?.push?.(`/workout/session/${exerciseId}`)} className="bg-indigo-600 rounded-full py-2 items-center active:bg-indigo-500">
        <Text className="text-white text-xs font-semibold">Start guided session</Text>
      </Pressable>
    </View>
  );
}
