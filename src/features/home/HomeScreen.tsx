import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Heading } from '@/shared/components/Heading';
import {
  useAppStore,
  selectTasks,
  selectEnergyLevel,
  selectStressLogs,
  selectStreaks,
  selectRoutines,
  selectProfile,
} from '@/store/index';
import ExecutiveFunctionRings from './ExecutiveFunctionRings';
import DayRhythmCard from '@/features/energy/DayRhythmCard';
import WeeklyChallengeCard from '@/features/gamification/WeeklyChallengeCard';
import { getDailyInsight } from './DailyInsight';
import { buildTodaysPlan, type PlanItem } from './buildTodaysPlan';
import ReflectionCard from './ReflectionCard';

function StreakBadge() {
  const streaks = useAppStore(selectStreaks);
  const longest = Math.max(0, ...(streaks || []).map((s) => s.count || 0));
  if (longest < 2) return null;
  return <Text className="text-emerald-400 text-xs font-medium">🔥 {longest}-day streak on one routine</Text>;
}

export default function HomeScreen() {
  const router = useRouter();
  const profile = useAppStore(selectProfile);
  const tasks = useAppStore(selectTasks);
  const energyLevel = useAppStore(selectEnergyLevel);
  const stressLogs = useAppStore(selectStressLogs);
  const streaks = useAppStore(selectStreaks);
  const routines = useAppStore(selectRoutines);

  const [planStarted, setPlanStarted] = useState(false);
  const [todaysPlan, setTodaysPlan] = useState<PlanItem[]>([]);

  const insight = getDailyInsight(energyLevel, stressLogs, streaks);
  const [modeOverride, setModeOverride] = useState<'auto' | 'planning' | 'reflection'>('auto');
  const timeBasedIsEvening = new Date().getHours() >= 20;
  const isEvening = modeOverride === 'auto' ? timeBasedIsEvening : modeOverride === 'reflection';
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const handleStartMyDay = () => {
    setTodaysPlan(buildTodaysPlan(tasks, routines, streaks, energyLevel));
    setPlanStarted(true);
  };

  const handlePlanItemPress = (item: PlanItem) => {
    if (item.kind === 'task') router?.push?.(`/task/${item.id}`);
    else if (item.kind === 'routine') router?.push?.('/routines');
    else if (item.kind === 'focus') router?.push?.('/focus-picker');
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View className="w-full max-w-md self-center gap-4">
        <Pressable onPress={() => router?.push?.('/overwhelmed')} className="bg-amber-400/10 border-2 border-amber-400 rounded-2xl py-3 items-center">
          <Text className="text-amber-300 text-sm font-medium">I'm overwhelmed right now</Text>
        </Pressable>

        <View>
          <Heading>Good day 👋</Heading>
          <Text className="text-slate-400 text-sm">{todayLabel}</Text>
          <StreakBadge />
        </View>

        {isEvening ? (
          <ReflectionCard />
        ) : (
          <View className="bg-slate-900 rounded-2xl p-4">
            <Text className="text-indigo-300 text-xs uppercase tracking-wider mb-1">Coach</Text>
            <Text className="text-slate-200 text-sm">{insight}</Text>
          </View>
        )}

        <Pressable
          onPress={() => setModeOverride(isEvening ? 'planning' : 'reflection')}
          className="py-1"
        >
          <Text className="text-slate-600 text-center text-xs">
            {isEvening ? 'Switch to day view' : 'Switch to evening check-in'}
          </Text>
        </Pressable>

        {!isEvening && (!planStarted ? (
          <Pressable onPress={handleStartMyDay} className="bg-indigo-600 rounded-2xl py-4 items-center active:bg-indigo-500">
            <Text className="text-white font-semibold text-base">Start My Day</Text>
          </Pressable>
        ) : (
          <View className="bg-slate-900 rounded-2xl p-4">
            <Text className="text-slate-100 text-sm font-semibold mb-3">Today's plan</Text>
            {todaysPlan.length === 0 ? (
              <Text className="text-slate-500 text-sm">Nothing urgent — a genuinely open day.</Text>
            ) : (
              <View className="gap-2">
                {todaysPlan.map((item, index) => (
                  <Pressable key={item.id} onPress={() => handlePlanItemPress(item)} className="flex-row items-center gap-3 bg-slate-800 rounded-xl p-3">
                    <Text className="text-slate-500 text-xs w-4">{index + 1}</Text>
                    <Text className="text-slate-200 text-sm flex-1">{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ))}

        <ExecutiveFunctionRings />
        <DayRhythmCard />
        <WeeklyChallengeCard />

        <Pressable onPress={() => router?.push?.('/tasks')} className="py-2">
          <Text className="text-indigo-400 text-center text-sm font-medium">See all tasks →</Text>
        </Pressable>

        <View className="flex-row flex-wrap gap-2">
          <Pressable onPress={() => router?.push?.('/nutrition/recipes')} className="flex-1 bg-slate-900 rounded-xl py-3 items-center min-w-[45%]">
            <Text className="text-slate-300 text-sm">🍎 Recipes</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/fitness/workouts')} className="flex-1 bg-slate-900 rounded-xl py-3 items-center min-w-[45%]">
            <Text className="text-slate-300 text-sm">💪 Workout</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/routines')} className="flex-1 bg-slate-900 rounded-xl py-3 items-center min-w-[45%]">
            <Text className="text-slate-300 text-sm">🔁 Routines</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/nutrition/groceries')} className="flex-1 bg-slate-900 rounded-xl py-3 items-center min-w-[45%]">
            <Text className="text-slate-300 text-sm">🛒 Groceries</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
