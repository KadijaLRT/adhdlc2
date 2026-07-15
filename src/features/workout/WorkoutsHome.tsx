import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import {
  useAppStore, selectActiveProgramId, selectFitnessPreferences, selectFitnessCardDismissed,
  selectGyms, selectActiveGymId, selectSetLogs, selectWeekdayAssignment,
} from '@/store/index';
import { PROGRAMS } from '@/content/programs';
import { getCurrentProgramWeek, getSessionsThisWeek } from './buildProgramSession';
import { buildWeeklySplit, getAvailableDayLetters, type WeeklySplitDay } from './buildWeeklySplit';
import { getWeightProgressLabel } from './weightProgress';
import { pickStartSomewhereExercise } from './pickStartSomewhere';
import { WORKOUT_EXERCISES } from '@/content/exercises';
import PersonalizeFitnessCard from './PersonalizeFitnessCard';
import { Heading, Subheading } from '@/shared/components/Heading';

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

// This is the Workouts tab's landing page. It opens directly on the
// day-of-week split (auto-assigning a program on first visit if none
// is active yet) rather than requiring a program pick first. Programs,
// Progress, and Recovery are all reachable from here as sub-screens;
// none of them compete for their own bottom tab slot.
export default function WorkoutsHome() {
  const router = useRouter();
  const activeProgramId = useAppStore(selectActiveProgramId);
  const fitnessPreferences = useAppStore(selectFitnessPreferences);
  const fitnessCardDismissed = useAppStore(selectFitnessCardDismissed);
  const gyms = useAppStore(selectGyms);
  const activeGymId = useAppStore(selectActiveGymId);
  const weekdayAssignment = useAppStore(selectWeekdayAssignment);
  const setWeekdayAssignment = useAppStore((s) => s.setWeekdayAssignment);
  const sessionsCompletedInProgram = useAppStore((s) => s.sessionsCompletedInProgram);
  const autoAssignDefaultProgram = useAppStore((s) => s.autoAssignDefaultProgram);

  const [editingDays, setEditingDays] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasCheckedAutoAssign, setHasCheckedAutoAssign] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const cardOffsets = useRef<Record<number, number>>({});
  const stripOffsetY = useRef(0);

  // Runs once on mount. autoAssignDefaultProgram itself is a no-op if a
  // program is already active or was deliberately stopped and then
  // never restarted, since it only ever assigns when activeProgramId is
  // null at call time — see programSlice.ts.
  useEffect(() => {
    if (hasCheckedAutoAssign) return;
    setHasCheckedAutoAssign(true);
    autoAssignDefaultProgram(fitnessPreferences);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeProgram = PROGRAMS.find((p) => p.id === activeProgramId) || null;
  const activeGym = gyms.find((g) => g.id === activeGymId) || null;

  const weeklySplit = useMemo(
    () => (activeProgram ? buildWeeklySplit(activeProgram, fitnessPreferences, weekdayAssignment, activeGym?.equipment) : []),
    [activeProgram, fitnessPreferences, weekdayAssignment, activeGym]
  );
  const availableLetters = activeProgram ? getAvailableDayLetters(activeProgram) : [];

  // getDay() is already Sunday-indexed (0=Sun...6=Sat), matching the array directly.
  useEffect(() => {
    const todayIndex = Math.min(new Date().getDay(), Math.max(weeklySplit.length - 1, 0));
    setActiveIndex(todayIndex);
  }, [weeklySplit.length]);

  const handleCycleDay = (weekdayIndex: number, current: string | null) => {
    const options: (string | null)[] = [null, ...availableLetters];
    const currentPos = options.indexOf(current);
    const next = options[(currentPos + 1) % options.length] ?? null;
    setWeekdayAssignment(weekdayIndex, next);
  };

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

  const handleStartSomewhere = () => {
    const picked = pickStartSomewhereExercise(fitnessPreferences);
    if (picked) router?.push?.(`/workout/session/${picked.id}`);
  };

  const currentWeek = activeProgram ? getCurrentProgramWeek(activeProgram, sessionsCompletedInProgram) : 0;
  const sessionsThisWeek = activeProgram ? getSessionsThisWeek(activeProgram, sessionsCompletedInProgram) : 0;

  return (
    <ScrollView ref={scrollRef} className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Workout</Heading>
        <Text className="text-slate-500 text-sm mb-4">Do as much or as little as feels right today.</Text>

        {!fitnessCardDismissed && <PersonalizeFitnessCard />}

        <Pressable onPress={handleStartSomewhere} className="bg-indigo-600 rounded-2xl py-4 mb-3 items-center active:bg-indigo-500">
          <Text className="text-white font-semibold text-base">Don't overthink it — Start Somewhere</Text>
        </Pressable>

        <View className="flex-row gap-2 mb-4">
          <Pressable onPress={() => router?.push?.('/fitness/programs')} className="flex-1 bg-white rounded-xl py-3 items-center">
            <Text className="text-slate-700 text-sm">🏋️ Programs</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/fitness/recovery')} className="flex-1 bg-white rounded-xl py-3 items-center">
            <Text className="text-slate-700 text-sm">🧘 Recovery</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/fitness/progress')} className="flex-1 bg-white rounded-xl py-3 items-center">
            <Text className="text-slate-700 text-sm">📈 Progress</Text>
          </Pressable>
        </View>

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

        <Pressable onPress={() => router?.push?.('/fitness/exercises')} className="py-3 items-center">
          <Text className="text-indigo-600 text-sm font-medium">Browse all exercises by muscle group →</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
