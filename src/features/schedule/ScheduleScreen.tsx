import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, selectScheduleItems, selectTasks, selectRoutines, selectStreaks, selectEnergyLevel } from '@/store/index';
import { suggestNextTask } from '@/features/tasks/suggestNextTask';
import { Heading } from '@/shared/components/Heading';

const SHIFT_OPTIONS = [15, 30, 60];

function currentTimeString(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const items = useAppStore(selectScheduleItems);
  const addScheduleItem = useAppStore((s) => s.addScheduleItem);
  const toggleScheduleItemDone = useAppStore((s) => s.toggleScheduleItemDone);
  const removeScheduleItem = useAppStore((s) => s.removeScheduleItem);
  const shiftRemainingSchedule = useAppStore((s) => s.shiftRemainingSchedule);
  const tasks = useAppStore(selectTasks);
  const routines = useAppStore(selectRoutines);
  const streaks = useAppStore(selectStreaks);
  const energyLevel = useAppStore(selectEnergyLevel);

  const [newLabel, setNewLabel] = useState('');
  const [newTime, setNewTime] = useState('');
  const [showBehindOptions, setShowBehindOptions] = useState(false);

  const now = currentTimeString();
  const nextUp = (items || []).find((i) => !i.isDone && i.time >= now) || (items || []).find((i) => !i.isDone);

  const handleAdd = () => {
    if (!newLabel.trim() || !newTime.trim()) return;
    addScheduleItem({ id: `sched-${Date.now()}`, label: newLabel.trim(), time: newTime.trim(), refKind: 'freeform' });
    setNewLabel('');
    setNewTime('');
  };

  // Pulls what already exists (the one suggested task, and routines not
  // yet done today) into the timeline at sensible default times, rather
  // than requiring everything to be typed in by hand. Deliberately
  // simple spacing (9am, 1pm, 6pm) rather than a real conflict-aware
  // scheduler — good enough to remove the blank-page problem without
  // pretending to be smarter than it is.
  const handlePopulateFromToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const existingRefIds = new Set((items || []).map((i) => i.refId).filter(Boolean));

    const suggested = suggestNextTask(tasks, energyLevel);
    if (suggested && !existingRefIds.has(suggested.id)) {
      addScheduleItem({ id: `sched-task-${suggested.id}`, label: suggested.title, refId: suggested.id, refKind: 'task', time: '09:00' });
    }

    const pendingRoutines = (routines || []).filter((r) => {
      const streak = (streaks || []).find((s) => s.routineId === r.id);
      return streak?.lastCompletedDate !== today && !existingRefIds.has(r.id);
    });
    pendingRoutines.slice(0, 2).forEach((routine, index) => {
      addScheduleItem({
        id: `sched-routine-${routine.id}`,
        label: `${routine.emoji} ${routine.title}`,
        refId: routine.id,
        refKind: 'routine',
        time: index === 0 ? '13:00' : '18:00',
      });
    });
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Schedule</Heading>
        <Text className="text-slate-500 text-sm mb-6">What's next, not just what's stored.</Text>

        {nextUp && (
          <Pressable onPress={() => router?.push?.('/schedule/right-now')} className="bg-indigo-600 rounded-2xl p-5 mb-4 active:bg-indigo-500">
            <Text className="text-indigo-100 text-xs uppercase tracking-wider mb-1">Next up · {nextUp.time}</Text>
            <Text className="text-white text-lg font-semibold">{nextUp.label}</Text>
          </Pressable>
        )}

        <Pressable onPress={() => setShowBehindOptions(!showBehindOptions)} className="border-2 border-amber-400 rounded-xl py-3 mb-2 items-center">
          <Text className="text-amber-700 text-sm font-medium dark:text-amber-400">I&apos;m running behind</Text>
        </Pressable>
        {showBehindOptions && (
          <View className="flex-row gap-2 mb-4">
            {(SHIFT_OPTIONS || []).map((mins) => (
              <Pressable
                key={mins}
                onPress={() => { shiftRemainingSchedule(mins); setShowBehindOptions(false); }}
                className="flex-1 bg-white rounded-xl py-2 items-center dark:bg-slate-900"
              >
                <Text className="text-slate-700 text-sm dark:text-slate-300">{mins} min</Text>
              </Pressable>
            ))}
          </View>
        )}

        {(items || []).length === 0 && (
          <Pressable onPress={handlePopulateFromToday} className="border-2 border-indigo-500 rounded-xl py-3 mb-4 items-center">
            <Text className="text-indigo-700 text-sm font-medium dark:text-indigo-300">Fill in today's tasks and routines</Text>
          </Pressable>
        )}

        <View className="bg-white rounded-2xl p-4 mb-4 dark:bg-slate-900">
          <Text className="text-slate-700 text-sm font-medium mb-2 dark:text-slate-300">Add to today</Text>
          <View className="flex-row gap-2">
            <TextInput
              value={newTime}
              onChangeText={setNewTime}
              placeholder="HH:MM"
              placeholderTextColor="#64748b"
              className="w-20 bg-stone-100 text-slate-900 rounded-xl px-3 py-2 text-center dark:text-slate-100 dark:bg-slate-800"
            />
            <TextInput
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder="What's happening..."
              placeholderTextColor="#64748b"
              onSubmitEditing={handleAdd}
              className="flex-1 bg-stone-100 text-slate-900 rounded-xl px-3 py-2 dark:text-slate-100 dark:bg-slate-800"
            />
            <Pressable onPress={handleAdd} className="bg-indigo-600 rounded-xl px-4 justify-center">
              <Text className="text-white font-semibold">Add</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-2">
          {(items || []).length === 0 && <Text className="text-slate-500 text-center mt-6">Nothing on today's timeline yet.</Text>}
          {(items || []).map((item) => (
            <Pressable key={item.id} onPress={() => toggleScheduleItemDone(item.id)} className="bg-white rounded-xl p-3 flex-row items-center gap-3 dark:bg-slate-900">
              <View className={item.isDone ? 'w-5 h-5 rounded-full bg-emerald-500 items-center justify-center' : 'w-5 h-5 rounded-full border-2 border-stone-300'}>
                {item.isDone && <Text className="text-white text-xs">✓</Text>}
              </View>
              <Text className="text-slate-500 text-xs w-12">{item.time}</Text>
              <Text className={item.isDone ? 'text-slate-500 line-through flex-1' : 'text-slate-900 flex-1'}>{item.label}</Text>
              <Pressable onPress={() => removeScheduleItem(item.id)}>
                <Text className="text-slate-700 text-xs dark:text-slate-300">✕</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
