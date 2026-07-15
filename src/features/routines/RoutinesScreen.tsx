import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { useAppStore, selectRoutines, selectStreaks } from '@/store/index';
import { Heading } from '@/shared/components/Heading';

const EMOJI_OPTIONS = ['🧘', '💊', '🍽️', '🛏️', '📚', '🚿'];

export default function RoutinesScreen() {
  const routines = useAppStore(selectRoutines);
  const streaks = useAppStore(selectStreaks);
  const addRoutine = useAppStore((s) => s.addRoutine);
  const removeRoutine = useAppStore((s) => s.removeRoutine);
  const recordRoutineCompletion = useAppStore((s) => s.recordRoutineCompletion);
  const useStreakFreeze = useAppStore((s) => s.useStreakFreeze);

  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState(EMOJI_OPTIONS[0]);

  const handleAdd = async () => {
    if (!newTitle?.trim()) return;
    await addRoutine({ id: `routine-${Date.now()}`, title: newTitle.trim(), emoji: newEmoji, createdAt: new Date().toISOString() });
    setNewTitle('');
  };

  const today = new Date().toISOString().split('T')[0];

  const handleComplete = async (routineTitle: string, routineId: string) => {
    const { isRecovery } = await recordRoutineCompletion(routineId);
    if (isRecovery) {
      setRecoveryMessage(`Nice recovery on ${routineTitle}. Coming back matters more than never missing.`);
      setTimeout(() => setRecoveryMessage(null), 4000);
    }
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Routines</Heading>
        <Text className="text-slate-400 text-sm mb-6">Missing a day never breaks anything. It just waits for you.</Text>

        {recoveryMessage && (
          <View className="bg-emerald-400/10 border-2 border-emerald-400 rounded-2xl p-4 mb-4">
            <Text className="text-emerald-300 text-sm font-medium">🎉 {recoveryMessage}</Text>
          </View>
        )}

        <View className="bg-slate-900 rounded-2xl p-4 mb-6">
          <Text className="text-slate-300 text-sm font-medium mb-2">New routine</Text>
          <View className="flex-row gap-2 mb-3">
            {(EMOJI_OPTIONS || []).map((emoji) => (
              <Pressable key={emoji} onPress={() => setNewEmoji(emoji)} className={newEmoji === emoji ? 'bg-indigo-600/30 rounded-lg p-2' : 'p-2'}>
                <Text className="text-lg">{emoji}</Text>
              </Pressable>
            ))}
          </View>
          <View className="flex-row gap-2">
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Morning meds, evening wind-down..."
              placeholderTextColor="#64748b"
              onSubmitEditing={handleAdd}
              className="flex-1 bg-slate-800 text-slate-100 rounded-xl px-4 py-3"
            />
            <Pressable onPress={handleAdd} className="bg-indigo-600 rounded-xl px-5 justify-center active:bg-indigo-500">
              <Text className="text-white font-semibold">Add</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-3">
          {(routines || []).length === 0 && <Text className="text-slate-500 text-center mt-6">No routines yet. Add one above.</Text>}
          {(routines || []).map((routine) => {
            const streak = (streaks || []).find((s) => s.routineId === routine.id);
            const doneToday = streak?.lastCompletedDate === today;
            return (
              <View key={routine.id} className="bg-slate-900 rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-slate-100 font-medium">{routine.emoji} {routine.title}</Text>
                  <Pressable onPress={() => removeRoutine(routine.id)}>
                    <Text className="text-slate-600 text-xs">Remove</Text>
                  </Pressable>
                </View>
                <Text className="text-slate-400 text-xs mb-3">
                  {streak?.count || 0} completions{streak?.isFrozen ? ' · frozen today' : ''}
                  {streak ? ` · ${streak.freezesAvailable} freeze${streak.freezesAvailable === 1 ? '' : 's'} left` : ''}
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => handleComplete(routine.title, routine.id)}
                    disabled={doneToday}
                    className={doneToday ? 'flex-1 bg-emerald-500/20 rounded-full py-3 items-center' : 'flex-1 bg-emerald-500 rounded-full py-3 items-center active:bg-emerald-400'}
                  >
                    <Text className={doneToday ? 'text-emerald-300 font-semibold' : 'text-slate-950 font-semibold'}>
                      {doneToday ? 'Done today ✓' : 'Mark done today'}
                    </Text>
                  </Pressable>
                  {!doneToday && (streak?.freezesAvailable || 0) > 0 && (
                    <Pressable onPress={() => useStreakFreeze(routine.id)} className="border-2 border-slate-700 rounded-full py-3 px-4 items-center">
                      <Text className="text-slate-300 text-xs font-medium">Freeze</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
