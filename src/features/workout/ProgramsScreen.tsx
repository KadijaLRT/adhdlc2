import { View, Text, Pressable, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, selectActiveProgramId, selectFitnessPreferences } from '@/store/index';
import { PROGRAMS } from '@/content/programs';
import { buildProgramSessionExerciseIds, getCurrentProgramWeek, getSessionsThisWeek } from './buildProgramSession';
import { Heading, Subheading } from '@/shared/components/Heading';

export default function ProgramsScreen() {
  const router = useRouter();
  const activeProgramId = useAppStore(selectActiveProgramId);
  const fitnessPreferences = useAppStore(selectFitnessPreferences);
  const sessionsCompletedInProgram = useAppStore((s) => s.sessionsCompletedInProgram);
  const startProgram = useAppStore((s) => s.startProgram);
  const stopProgram = useAppStore((s) => s.stopProgram);

  const activeProgram = PROGRAMS.find((p) => p.id === activeProgramId) || null;

  const handleContinue = () => {
    if (!activeProgram) return;
    const exerciseIds = buildProgramSessionExerciseIds(activeProgram, fitnessPreferences, sessionsCompletedInProgram);
    const [first, ...rest] = exerciseIds;
    if (first) {
      router?.push?.({
        pathname: `/workout/session/${first}`,
        params: { programId: activeProgram.id, queue: rest.join(',') },
      });
    }
  };

  const currentWeek = activeProgram ? getCurrentProgramWeek(activeProgram, sessionsCompletedInProgram) : 0;
  const sessionsThisWeek = activeProgram ? getSessionsThisWeek(activeProgram, sessionsCompletedInProgram) : 0;

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Programs</Heading>
        <Text className="text-slate-400 text-sm mb-6">
          Pick a plan once, then just show up. No re-deciding every session.
        </Text>

        {activeProgram && (
          <View className="bg-indigo-600/10 border-2 border-indigo-500 rounded-2xl p-4 mb-6">
            <Text className="text-indigo-200 text-xs uppercase tracking-wider mb-1">Active program</Text>
            <Subheading className="mb-1">{activeProgram.emoji} {activeProgram.title}</Subheading>
            <Text className="text-slate-400 text-xs mb-3">
              Week {currentWeek} of {activeProgram.durationWeeks} · {sessionsThisWeek} of {activeProgram.daysPerWeek} sessions this week
            </Text>
            <View className="flex-row gap-2">
              <Pressable onPress={handleContinue} className="flex-1 bg-indigo-600 rounded-full py-3 items-center active:bg-indigo-500">
                <Text className="text-white text-sm font-semibold">Continue today's session</Text>
              </Pressable>
              <Pressable onPress={stopProgram} className="py-3 px-3">
                <Text className="text-slate-500 text-xs">Stop</Text>
              </Pressable>
            </View>
          </View>
        )}

        <FlatList
          data={PROGRAMS.filter((p) => p.id !== activeProgramId)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item }) => (
            <View className="bg-slate-900 rounded-2xl p-4">
              <Text className="text-slate-100 font-medium mb-1">{item.emoji} {item.title}</Text>
              <Text className="text-slate-500 text-xs mb-2">{item.forWhom}</Text>
              <Text className="text-slate-500 text-xs mb-3">
                {item.daysPerWeek}x/week · {item.durationWeeks} weeks · {item.sessionExerciseCount} exercises per session
              </Text>
              <Pressable onPress={() => startProgram(item.id)} className="bg-slate-800 rounded-full py-2 items-center active:bg-slate-700">
                <Text className="text-slate-200 text-xs font-medium">Start this program</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}
