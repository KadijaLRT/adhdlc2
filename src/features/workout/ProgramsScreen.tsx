import { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import {
  useAppStore, selectActiveProgramId, selectFitnessPreferences,
  selectGyms, selectActiveGymId, selectSetLogs, selectWeekdayAssignment,
} from '@/store/index';
import { PROGRAMS } from '@/content/programs';
import { getCurrentProgramWeek, getSessionsThisWeek } from './buildProgramSession';
import { buildWeeklySplit, getAvailableDayLetters, type WeeklySplitDay } from './buildWeeklySplit';
import { getWeightProgressLabel } from './weightProgress';
import { WORKOUT_EXERCISES } from '@/content/exercises';
import { Heading, Subheading } from '@/shared/components/Heading';

const EQUIPMENT_OPTIONS = ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'resistance_band'];

function GymSelectorCard() {
  const gyms = useAppStore(selectGyms);
  const activeGymId = useAppStore(selectActiveGymId);
  const addGym = useAppStore((s) => s.addGym);
  const updateGymEquipment = useAppStore((s) => s.updateGymEquipment);
  const removeGym = useAppStore((s) => s.removeGym);
  const setActiveGym = useAppStore((s) => s.setActiveGym);

  const [adding, setAdding] = useState(false);
  const [managingGymId, setManagingGymId] = useState<string | null>(null);
  const [newGymName, setNewGymName] = useState('');
  const [newGymEquipment, setNewGymEquipment] = useState<string[]>(['bodyweight']);

  const activeGym = gyms.find((g) => g.id === activeGymId) || null;
  const managingGym = gyms.find((g) => g.id === managingGymId) || null;

  const toggleEquipment = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((e) => e !== item) : [...list, item]);
  };

  const handleAddGym = async () => {
    if (!newGymName.trim()) return;
    await addGym(newGymName.trim(), newGymEquipment);
    setNewGymName('');
    setNewGymEquipment(['bodyweight']);
    setAdding(false);
  };

  if (adding) {
    return (
      <View className="bg-white border-2 border-indigo-500 rounded-2xl p-4 mb-4">
        <TextInput
          value={newGymName}
          onChangeText={setNewGymName}
          placeholder="Gym name..."
          placeholderTextColor="#64748b"
          autoFocus
          className="bg-stone-100 text-slate-900 rounded-xl px-3 py-2 mb-3"
        />
        <Text className="text-slate-700 text-xs font-medium mb-2">What equipment does this gym have?</Text>
        <View className="flex-row flex-wrap gap-2 mb-3">
          {EQUIPMENT_OPTIONS.map((eq) => {
            const isActive = newGymEquipment.includes(eq);
            return (
              <Pressable key={eq} onPress={() => toggleEquipment(newGymEquipment, setNewGymEquipment, eq)}
                className={isActive ? 'bg-emerald-100 border-2 border-emerald-500 rounded-full py-2 px-3' : 'bg-stone-100 border-2 border-transparent rounded-full py-2 px-3'}>
                <Text className={isActive ? 'text-emerald-700 text-xs capitalize' : 'text-slate-700 text-xs capitalize'}>{eq.replace('_', ' ')}</Text>
              </Pressable>
            );
          })}
        </View>
        <View className="flex-row gap-2">
          <Pressable onPress={handleAddGym} className="flex-1 bg-indigo-600 rounded-xl py-3 items-center">
            <Text className="text-white text-sm font-semibold">Save gym</Text>
          </Pressable>
          <Pressable onPress={() => setAdding(false)} className="py-3 px-4">
            <Text className="text-slate-500 text-sm">Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (managingGym) {
    return (
      <View className="bg-white border-2 border-indigo-500 rounded-2xl p-4 mb-4">
        <Text className="text-slate-900 font-semibold mb-3">{managingGym.name}</Text>
        <Text className="text-slate-700 text-xs font-medium mb-2">Equipment available here</Text>
        <View className="flex-row flex-wrap gap-2 mb-3">
          {EQUIPMENT_OPTIONS.map((eq) => {
            const isActive = managingGym.equipment.includes(eq);
            return (
              <Pressable key={eq}
                onPress={() => updateGymEquipment(managingGym.id, isActive ? managingGym.equipment.filter((e) => e !== eq) : [...managingGym.equipment, eq])}
                className={isActive ? 'bg-emerald-100 border-2 border-emerald-500 rounded-full py-2 px-3' : 'bg-stone-100 border-2 border-transparent rounded-full py-2 px-3'}>
                <Text className={isActive ? 'text-emerald-700 text-xs capitalize' : 'text-slate-700 text-xs capitalize'}>{eq.replace('_', ' ')}</Text>
              </Pressable>
            );
          })}
        </View>
        <View className="flex-row gap-2">
          <Pressable onPress={() => setManagingGymId(null)} className="flex-1 bg-indigo-600 rounded-xl py-3 items-center">
            <Text className="text-white text-sm font-semibold">Done</Text>
          </Pressable>
          <Pressable onPress={() => { removeGym(managingGym.id); setManagingGymId(null); }} className="py-3 px-4">
            <Text className="text-red-600 text-sm">Remove gym</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4">
      {gyms.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={gyms}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{ gap: 8, marginBottom: 8 }}
          renderItem={({ item }) => {
            const isActive = item.id === activeGymId;
            return (
              <Pressable onPress={() => setActiveGym(item.id)} onLongPress={() => setManagingGymId(item.id)}
                className={isActive ? 'bg-purple-100 border-2 border-purple-500 rounded-2xl py-3 px-4' : 'bg-white border-2 border-stone-200 rounded-2xl py-3 px-4'}>
                <Text className={isActive ? 'text-purple-700 font-semibold text-sm' : 'text-slate-700 text-sm'}>{item.name}</Text>
              </Pressable>
            );
          }}
        />
      )}
      <Pressable onPress={() => setAdding(true)} className="bg-purple-50 border-2 border-purple-400 rounded-2xl p-4 flex-row items-center justify-between">
        <View>
          <Text className="text-purple-700 font-semibold">{activeGym ? `Exercises tailored to ${activeGym.name}` : 'Add a gym'}</Text>
          <Text className="text-slate-500 text-xs">{gyms.length > 0 ? 'Tap a gym to switch, hold to edit equipment, or add another' : "Workouts adapt to that gym's actual equipment"}</Text>
        </View>
      </Pressable>
    </View>
  );
}

function DayStrip({
  days, activeIndex, editing, onCycleDay, onJumpTo,
}: {
  days: WeeklySplitDay[]; activeIndex: number;
  editing: boolean; onCycleDay: (weekdayIndex: number, current: string | null) => void;
  onJumpTo: (index: number) => void;
}) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={days}
      keyExtractor={(d) => d.weekdayLabel}
      contentContainerStyle={{ gap: 8, marginBottom: 16 }}
      renderItem={({ item, index }) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            onPress={() => (editing ? onCycleDay(index, item.dayLetter) : onJumpTo(index))}
            className={isActive ? 'bg-indigo-600/10 border-2 border-indigo-500 rounded-2xl p-3 items-center w-20' : editing ? 'bg-amber-50 border-2 border-amber-400 rounded-2xl p-3 items-center w-20' : 'bg-white border-2 border-transparent rounded-2xl p-3 items-center w-20'}
          >
            <Text className={isActive ? 'text-indigo-700 text-xs font-bold' : 'text-slate-500 text-xs font-bold'}>{item.weekdayLabel}</Text>
            <Text className={isActive ? 'text-indigo-700 text-sm font-semibold mt-1' : 'text-slate-700 text-sm mt-1'}>
              {item.isRestDay ? 'Rest' : `Day ${item.dayLetter}`}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

function DayCard({
  day, onStart, onLayout,
}: {
  day: WeeklySplitDay; onStart: () => void; onLayout: (y: number) => void;
}) {
  const router = useRouter();
  const setLogs = useAppStore(selectSetLogs);

  if (day.isRestDay) {
    return (
      <View
        onLayout={(e) => onLayout(e.nativeEvent.layout.y)}
        className="bg-white rounded-2xl p-6 mb-4 items-center"
      >
        <Text className="text-2xl mb-2">😌</Text>
        <Text className="text-slate-900 text-lg font-semibold mb-1">Rest day</Text>
        <Text className="text-slate-500 text-sm text-center">Recovery is part of the program, not a break from it.</Text>
      </View>
    );
  }

  return (
    <View
      onLayout={(e) => onLayout(e.nativeEvent.layout.y)}
      className="bg-white rounded-2xl p-4 mb-4"
    >
      <View className="bg-indigo-600/10 self-start rounded-full px-3 py-1 mb-2">
        <Text className="text-indigo-700 text-xs font-bold">DAY {day.dayLetter}</Text>
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
              {progressLabel && <Text className="text-emerald-700 text-xs font-semibold">{progressLabel}</Text>}
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
  const gyms = useAppStore(selectGyms);
  const activeGymId = useAppStore(selectActiveGymId);
  const sessionsCompletedInProgram = useAppStore((s) => s.sessionsCompletedInProgram);
  const startProgram = useAppStore((s) => s.startProgram);
  const stopProgram = useAppStore((s) => s.stopProgram);
  const weekdayAssignment = useAppStore(selectWeekdayAssignment);
  const setWeekdayAssignment = useAppStore((s) => s.setWeekdayAssignment);
  const [editingDays, setEditingDays] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef<ScrollView>(null);
  const cardOffsets = useRef<Record<number, number>>({});
  const stripOffsetY = useRef(0);

  const activeProgram = PROGRAMS.find((p) => p.id === activeProgramId) || null;

  const activeGym = gyms.find((g) => g.id === activeGymId) || null;
  const weeklySplit = useMemo(
    () => (activeProgram ? buildWeeklySplit(activeProgram, fitnessPreferences, weekdayAssignment, activeGym?.equipment) : []),
    [activeProgram, fitnessPreferences, weekdayAssignment, activeGym]
  );
  const availableLetters = activeProgram ? getAvailableDayLetters(activeProgram) : [];

  // getDay() is already Sunday-indexed (0=Sun...6=Sat), matching the array directly.
  useMemo(() => {
    const todayIndex = Math.min(new Date().getDay(), Math.max(weeklySplit.length - 1, 0));
    setActiveIndex(todayIndex);
  }, [weeklySplit.length]);

  const handleCycleDay = (weekdayIndex: number, current: string | null) => {
    const options: (string | null)[] = [null, ...availableLetters];
    const currentPos = options.indexOf(current);
    const next = options[(currentPos + 1) % options.length] ?? null;
    setWeekdayAssignment(weekdayIndex, next);
  };

  // Tapping a day in the strip scrolls the whole list down to that
  // day's card, rather than replacing the view with only that card —
  // every day stays reachable by normal scrolling, the strip is just a
  // shortcut, matching a familiar week-planner layout.
  const handleJumpTo = (index: number) => {
    setActiveIndex(index);
    const offset = cardOffsets.current[index];
    if (offset !== undefined) {
      scrollRef.current?.scrollTo({ y: stripOffsetY.current + offset - 12, animated: true });
    }
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

  return (
    <ScrollView ref={scrollRef} className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Programs</Heading>

        <GymSelectorCard />

        {/* Day strip is right after the title/gym card — opens in view
            without scrolling past anything else, per the requested
            layout. */}
        {activeProgram && weeklySplit.length > 0 && (
          <View onLayout={(e) => { stripOffsetY.current = e.nativeEvent.layout.y; }}>
            <View className="flex-row items-center justify-between mb-2">
              <Subheading>{activeProgram.emoji} {activeProgram.title}</Subheading>
              <View className="flex-row gap-3">
                <Pressable onPress={() => setEditingDays(!editingDays)}>
                  <Text className={editingDays ? 'text-amber-700 text-xs font-semibold' : 'text-indigo-600 text-xs font-semibold'}>
                    {editingDays ? 'Done editing' : 'Edit days'}
                  </Text>
                </Pressable>
                <Pressable onPress={stopProgram}>
                  <Text className="text-slate-500 text-xs">Stop</Text>
                </Pressable>
              </View>
            </View>
            <Text className="text-slate-500 text-xs mb-3">
              Week {currentWeek} of {activeProgram.durationWeeks} · {sessionsThisWeek} of {activeProgram.daysPerWeek} sessions this week
            </Text>

            {editingDays && (
              <View className="bg-amber-50 border border-amber-400 rounded-xl p-3 mb-3">
                <Text className="text-amber-800 text-xs">Tap a day to cycle it through Rest and your available training days.</Text>
              </View>
            )}

            <DayStrip
              days={weeklySplit}
              activeIndex={activeIndex}
              editing={editingDays}
              onCycleDay={handleCycleDay}
              onJumpTo={handleJumpTo}
            />

            {/* Every day's card, stacked and always scrollable — not
                just the selected one. The strip jumps you here, it
                doesn't hide the rest of the week. */}
            {!editingDays && weeklySplit.map((day, index) => (
              <DayCard
                key={day.weekdayLabel}
                day={day}
                onStart={() => handleStartDay(day)}
                onLayout={(y) => { cardOffsets.current[index] = y; }}
              />
            ))}
          </View>
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
              <Pressable onPress={() => startProgram(item.id)} className="bg-stone-100 rounded-full py-2 items-center active:bg-stone-200">
                <Text className="text-slate-800 text-xs font-medium">Start this program</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}
