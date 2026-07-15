import { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import {
  useAppStore, selectActiveProgramId, selectFitnessPreferences,
  selectGymName, selectSetLogs, selectWeekdayAssignment,
} from '@/store/index';
import { PROGRAMS } from '@/content/programs';
import { buildProgramSessionExerciseIds, getCurrentProgramWeek, getSessionsThisWeek } from './buildProgramSession';
import { buildWeeklySplit, getAvailableDayLetters, type WeeklySplitDay } from './buildWeeklySplit';
import { getWeightProgressLabel } from './weightProgress';
import { WORKOUT_EXERCISES } from '@/content/exercises';
import { Heading, Subheading } from '@/shared/components/Heading';

function GymSelectorCard() {
  const gymName = useAppStore(selectGymName);
  const setGymName = useAppStore((s) => s.setGymName);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(gymName);

  const handleSave = () => {
    setGymName(draft.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <View className="bg-white border-2 border-indigo-500 rounded-2xl p-4 mb-4 flex-row gap-2">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Gym name..."
          placeholderTextColor="#64748b"
          onSubmitEditing={handleSave}
          autoFocus
          className="flex-1 bg-stone-100 text-slate-900 rounded-xl px-3 py-2"
        />
        <Pressable onPress={handleSave} className="bg-indigo-600 rounded-xl px-4 justify-center">
          <Text className="text-white text-sm font-semibold">Save</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable onPress={() => { setDraft(gymName); setEditing(true); }} className="bg-purple-400/10 border-2 border-purple-400 rounded-2xl p-4 mb-4 flex-row items-center justify-between">
      <View>
        <Text className="text-purple-300 font-semibold">{gymName || 'No gym set'}</Text>
        <Text className="text-slate-500 text-xs">Tap to change</Text>
      </View>
      <Text className="text-slate-500 text-xs">📍 typed manually — no live location search yet</Text>
    </Pressable>
  );
}

function DayStrip({
  days, selectedIndex, onSelect, editing, onCycleDay,
}: {
  days: WeeklySplitDay[]; selectedIndex: number; onSelect: (i: number) => void;
  editing: boolean; onCycleDay: (weekdayIndex: number, current: string | null) => void;
}) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={days}
      keyExtractor={(d) => d.weekdayLabel}
      contentContainerStyle={{ gap: 8, marginBottom: 16 }}
      renderItem={({ item, index }) => {
        const isActive = index === selectedIndex;
        return (
          <Pressable
            onPress={() => (editing ? onCycleDay(index, item.dayLetter) : onSelect(index))}
            className={isActive ? 'bg-indigo-600/20 border-2 border-indigo-400 rounded-2xl p-3 items-center w-20' : editing ? 'bg-amber-400/10 border-2 border-amber-400 rounded-2xl p-3 items-center w-20' : 'bg-white border-2 border-transparent rounded-2xl p-3 items-center w-20'}
          >
            <Text className={isActive ? 'text-indigo-300 text-xs font-bold' : 'text-slate-400 text-xs font-bold'}>{item.weekdayLabel}</Text>
            <Text className={isActive ? 'text-indigo-200 text-sm font-semibold mt-1' : 'text-slate-700 text-sm mt-1'}>
              {item.isRestDay ? 'Rest' : `Day ${item.dayLetter}`}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

function DayCard({ day, onStart }: { day: WeeklySplitDay; onStart: () => void }) {
  const router = useRouter();
  const setLogs = useAppStore(selectSetLogs);

  if (day.isRestDay) {
    return (
      <View className="bg-white rounded-2xl p-6 mb-6 items-center">
        <Text className="text-2xl mb-2">😌</Text>
        <Text className="text-slate-900 text-lg font-semibold mb-1">Rest day</Text>
        <Text className="text-slate-500 text-sm text-center">Recovery is part of the program, not a break from it.</Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4 mb-6">
      <View className="bg-indigo-600/20 self-start rounded-full px-3 py-1 mb-2">
        <Text className="text-indigo-300 text-xs font-bold">DAY {day.dayLetter}</Text>
      </View>
      <Text className="text-slate-900 text-xl font-bold mb-1">{day.title}</Text>
      <Text className="text-slate-500 text-xs mb-1 capitalize">{day.muscleGroups.join(' & ')}</Text>
      <Text className="text-slate-500 text-xs mb-4">~{day.estimatedMinutes} min (estimate) · {day.exerciseIds.length} exercises</Text>

      <View className="gap-2 mb-4">
        {day.exerciseIds.map((id) => {
          const exercise = WORKOUT_EXERCISES?.[id];
          const progressLabel = getWeightProgressLabel(id, setLogs);
          return (
            <View key={id} className="flex-row items-center justify-between py-1">
              <Text className="text-slate-800 text-sm flex-1">{exercise?.icon} {exercise?.name || id}</Text>
              {progressLabel && <Text className="text-emerald-400 text-xs font-semibold">{progressLabel}</Text>}
            </View>
          );
        })}
      </View>

      <View className="flex-row gap-2 mb-3">
        <Pressable onPress={() => router?.push?.('/body/progress')} className="flex-1 border-2 border-stone-300 rounded-xl py-3 items-center">
          <Text className="text-slate-700 text-xs">🩺 Body Check-in</Text>
        </Pressable>
        <Pressable onPress={() => router?.push?.('/fitness/recovery')} className="flex-1 border-2 border-stone-300 rounded-xl py-3 items-center">
          <Text className="text-slate-700 text-xs">🧘 Warm-Up</Text>
        </Pressable>
      </View>

      <Pressable onPress={onStart} className="bg-indigo-600 rounded-2xl py-4 items-center active:bg-indigo-500">
        <Text className="text-white font-semibold">▶ Start Day {day.dayLetter}</Text>
      </Pressable>
    </View>
  );
}

export default function ProgramsScreen() {
  const router = useRouter();
  const activeProgramId = useAppStore(selectActiveProgramId);
  const fitnessPreferences = useAppStore(selectFitnessPreferences);
  const sessionsCompletedInProgram = useAppStore((s) => s.sessionsCompletedInProgram);
  const startProgram = useAppStore((s) => s.startProgram);
  const stopProgram = useAppStore((s) => s.stopProgram);
  const weekdayAssignment = useAppStore(selectWeekdayAssignment);
  const setWeekdayAssignment = useAppStore((s) => s.setWeekdayAssignment);
  const [editingDays, setEditingDays] = useState(false);

  const activeProgram = PROGRAMS.find((p) => p.id === activeProgramId) || null;

  const weeklySplit = useMemo(
    () => (activeProgram ? buildWeeklySplit(activeProgram, fitnessPreferences, weekdayAssignment) : []),
    [activeProgram, fitnessPreferences, weekdayAssignment]
  );
  const availableLetters = activeProgram ? getAvailableDayLetters(activeProgram) : [];

  // getDay() is already Sunday-indexed (0=Sun...6=Sat), matching the
  // array directly — no adjustment needed, unlike the earlier buggy
  // Monday-first math this replaces.
  const todayIndex = Math.min(new Date().getDay(), Math.max(weeklySplit.length - 1, 0));
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);

  // Tapping a day while editing cycles it through Rest → A → B → ... →
  // the last available letter → back to Rest. Persisted immediately so
  // the change sticks without a separate "save" step.
  const handleCycleDay = (weekdayIndex: number, current: string | null) => {
    const options: (string | null)[] = [null, ...availableLetters];
    const currentPos = options.indexOf(current);
    const next = options[(currentPos + 1) % options.length];
    setWeekdayAssignment(weekdayIndex, next);
  };

  const handleStartDay = (day: WeeklySplitDay) => {
    const [first, ...rest] = day.exerciseIds;
    if (!first) return;
    router?.push?.({
      pathname: `/workout/session/${first}`,
      params: { programId: activeProgram?.id || '', queue: rest.join(',') },
    });
  };

  const currentWeek = activeProgram ? getCurrentProgramWeek(activeProgram, sessionsCompletedInProgram) : 0;
  const sessionsThisWeek = activeProgram ? getSessionsThisWeek(activeProgram, sessionsCompletedInProgram) : 0;
  const selectedDay = weeklySplit[selectedDayIndex] || null;

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Programs</Heading>
        <Text className="text-slate-400 text-sm mb-4">
          Pick a plan once, then just show up. No re-deciding every session.
        </Text>

        <GymSelectorCard />

        {activeProgram && (
          <>
            <View className="flex-row items-center justify-between mb-3">
              <Subheading>{activeProgram.emoji} {activeProgram.title}</Subheading>
              <View className="flex-row gap-3">
                <Pressable onPress={() => setEditingDays(!editingDays)}>
                  <Text className={editingDays ? 'text-amber-600 text-xs font-semibold' : 'text-indigo-600 text-xs font-semibold'}>
                    {editingDays ? 'Done editing' : 'Edit days'}
                  </Text>
                </Pressable>
                <Pressable onPress={stopProgram}>
                  <Text className="text-slate-500 text-xs">Stop</Text>
                </Pressable>
              </View>
            </View>
            <Text className="text-slate-500 text-xs mb-4">
              Week {currentWeek} of {activeProgram.durationWeeks} · {sessionsThisWeek} of {activeProgram.daysPerWeek} sessions this week
            </Text>

            {editingDays && (
              <View className="bg-amber-400/10 border border-amber-400 rounded-xl p-3 mb-3">
                <Text className="text-amber-700 text-xs">Tap a day to cycle it through Rest and your available training days.</Text>
              </View>
            )}

            {weeklySplit.length > 0 && (
              <>
                <DayStrip
                  days={weeklySplit}
                  selectedIndex={selectedDayIndex}
                  onSelect={setSelectedDayIndex}
                  editing={editingDays}
                  onCycleDay={handleCycleDay}
                />
                {!editingDays && selectedDay && <DayCard day={selectedDay} onStart={() => handleStartDay(selectedDay)} />}
              </>
            )}
          </>
        )}

        <Text className="text-slate-900 text-lg font-semibold mb-3">{activeProgram ? 'Switch program' : 'Choose a program'}</Text>
        <FlatList
          data={PROGRAMS.filter((p) => p.id !== activeProgramId)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-4">
              <Text className="text-slate-900 font-medium mb-1">{item.emoji} {item.title}</Text>
              <Text className="text-slate-500 text-xs mb-2">{item.forWhom}</Text>
              <Text className="text-slate-500 text-xs mb-3">
                {item.daysPerWeek}x/week · {item.durationWeeks} weeks · {item.sessionExerciseCount} exercises per session
              </Text>
              <Pressable onPress={() => startProgram(item.id)} className="bg-stone-100 rounded-full py-2 items-center active:bg-slate-700">
                <Text className="text-slate-800 text-xs font-medium">Start this program</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}
