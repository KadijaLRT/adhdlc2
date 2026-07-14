import { View, Text, Pressable, ScrollView, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Heading, Subheading } from '@/shared/components/Heading';
import {
  useAppStore,
  selectProfile,
  selectStreaks,
  selectMilestones,
  selectTasks,
  selectSavedRecipeIds,
  selectSetLogs,
} from '@/store/index';
import { MILESTONE_DEFINITIONS, getUnlockedTiers } from '@/content/milestoneDefinitions';
import { SKILLS, UNLOCKABLES, xpToLevel, xpForNextLevel } from '@/content/rpgCatalog';
import { calculateWorkoutStreak, calculateTotalVolume } from '@/features/workout/progressCalculations';
import { selectTotalXp, selectCoins, selectSkillXp, selectOwnedUnlockables } from '@/store/index';
import { SKILLS, UNLOCKABLES, xpToLevel, xpForNextLevel } from '@/content/rpgCatalog';

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-slate-900 rounded-2xl p-4 flex-1 min-w-[45%]">
      <Text className="text-amber-300 text-xl font-bold mb-1">{value}</Text>
      <Text className="text-slate-400 text-xs">{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useAppStore(selectProfile);
  const totalXp = useAppStore((s) => s.totalXp);
  const coins = useAppStore((s) => s.coins);
  const skillXp = useAppStore((s) => s.skillXp);
  const ownedUnlockables = useAppStore((s) => s.ownedUnlockables);
  const purchaseUnlockable = useAppStore((s) => s.purchaseUnlockable);
  const streaks = useAppStore(selectStreaks);
  const milestones = useAppStore(selectMilestones);
  const tasks = useAppStore(selectTasks);
  const savedRecipeIds = useAppStore(selectSavedRecipeIds);
  const setLogs = useAppStore(selectSetLogs);
  const totalXp = useAppStore(selectTotalXp);
  const coins = useAppStore(selectCoins);
  const skillXp = useAppStore(selectSkillXp);
  const ownedUnlockables = useAppStore(selectOwnedUnlockables);
  const purchaseUnlockable = useAppStore((s) => s.purchaseUnlockable);

  const longestStreak = Math.max(0, ...(streaks || []).map((s) => s.count || 0));
  const tasksCompleted = (tasks || []).filter((t) => t.isComplete).length;
  const workoutStreak = calculateWorkoutStreak(setLogs);
  const totalVolume = calculateTotalVolume(setLogs);

  const level = xpToLevel(totalXp);
  const nextLevelXp = xpForNextLevel(level);
  const levelProgressPercent = Math.min((totalXp / nextLevelXp) * 100, 100);

  const unlockedMilestoneCount = (MILESTONE_DEFINITIONS || []).reduce((sum, def) => {
    const progress = (milestones || []).find((m) => m.trackedEvent === def.trackedEvent);
    return sum + getUnlockedTiers(def, progress?.count || 0).length;
  }, 0);

  const handleExportData = async () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      profile,
      tasks,
      streaks,
      milestones,
      setLogs,
    };
    try {
      await Share.share({
        message: JSON.stringify(exportPayload, null, 2),
        title: 'ADHD Life Coach data export',
      });
    } catch (error) {
      console.error('ProfileScreen: export failed', error);
    }
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">You</Heading>
        <Text className="text-slate-400 text-sm mb-4">
          {profile?.biggestHurdle ? `Working on: ${profile.biggestHurdle}` : 'Your progress, all in one place.'}
        </Text>

        <View className="bg-slate-900 rounded-2xl p-4 mb-6">
          <Text className="text-slate-100 text-base font-semibold mb-1">Level {level} · {coins} coins</Text>
          <View className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
            <View className="h-2 bg-amber-400 rounded-full" style={{ width: `${levelProgressPercent}%` }} />
          </View>
          <Text className="text-slate-500 text-xs">{totalXp} / {nextLevelXp} XP to level {level + 1}</Text>
        </View>

        <Subheading className="mb-3">Skills</Subheading>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {(SKILLS || []).map((skill) => (
            <View key={skill.id} className="bg-slate-900 rounded-xl p-3 w-[31%] items-center">
              <Text className="text-xl mb-1">{skill.emoji}</Text>
              <Text className="text-slate-300 text-xs text-center">{skill.label}</Text>
              <Text className="text-amber-300 text-sm font-semibold mt-1">{skillXp?.[skill.id] || 0}</Text>
            </View>
          ))}
        </View>

        <Subheading className="mb-3">Shop</Subheading>
        <View className="gap-2 mb-6">
          {(UNLOCKABLES || []).map((item) => {
            const owned = (ownedUnlockables || []).includes(item.id);
            return (
              <View key={item.id} className="bg-slate-900 rounded-xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-xl">{item.emoji}</Text>
                  <Text className="text-slate-100">{item.label}</Text>
                </View>
                {owned ? (
                  <Text className="text-emerald-400 text-sm font-medium">Owned</Text>
                ) : (
                  <Pressable
                    onPress={() => purchaseUnlockable(item.id, item.cost)}
                    disabled={coins < item.cost}
                    className={coins < item.cost ? 'bg-slate-800 rounded-full py-2 px-4' : 'bg-indigo-600 rounded-full py-2 px-4 active:bg-indigo-500'}
                  >
                    <Text className={coins < item.cost ? 'text-slate-600 text-xs' : 'text-white text-xs font-semibold'}>{item.cost} coins</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <Subheading className="mb-3">Your journey</Subheading>
        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatTile label="Tasks completed" value={String(tasksCompleted)} />
          <StatTile label="Longest routine streak" value={`${longestStreak} days`} />
          <StatTile label="Workout day streak" value={String(workoutStreak)} />
          <StatTile label="Volume lifted" value={`${totalVolume.toLocaleString()} lbs`} />
          <StatTile label="Saved recipes" value={String((savedRecipeIds || []).length)} />
          <StatTile label="Milestones unlocked" value={String(unlockedMilestoneCount)} />
        </View>

        <Subheading className="mb-3">Personalize</Subheading>
        <View className="gap-2 mb-6">
          <Pressable onPress={() => router?.push?.('/achievements')} className="bg-slate-900 rounded-xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-200 text-sm">🏆 Achievements</Text>
            <Text className="text-slate-600 text-xs">→</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/settings/cycle-tracking')} className="bg-slate-900 rounded-xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-200 text-sm">🌙 Cycle tracking</Text>
            <Text className="text-slate-600 text-xs">→</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/nutrition/recipes')} className="bg-slate-900 rounded-xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-200 text-sm">🍎 Nutrition preferences</Text>
            <Text className="text-slate-600 text-xs">→</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/fitness/workouts')} className="bg-slate-900 rounded-xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-200 text-sm">💪 Fitness preferences</Text>
            <Text className="text-slate-600 text-xs">→</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/body/progress')} className="bg-slate-900 rounded-xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-200 text-sm">📏 Weight & measurements</Text>
            <Text className="text-slate-600 text-xs">→</Text>
          </Pressable>
        </View>

        <Subheading className="mb-3">Shop</Subheading>
        <View className="gap-2 mb-6">
          {(UNLOCKABLES || []).map((item) => {
            const owned = (ownedUnlockables || []).includes(item.id);
            return (
              <View key={item.id} className="bg-slate-900 rounded-xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-xl">{item.emoji}</Text>
                  <Text className="text-slate-100">{item.label}</Text>
                </View>
                {owned ? (
                  <Text className="text-emerald-400 text-sm font-medium">Owned</Text>
                ) : (
                  <Pressable
                    onPress={() => purchaseUnlockable(item.id, item.cost)}
                    disabled={(coins || 0) < item.cost}
                    className={(coins || 0) < item.cost ? 'bg-slate-800 rounded-full py-2 px-4' : 'bg-indigo-600 rounded-full py-2 px-4 active:bg-indigo-500'}
                  >
                    <Text className={(coins || 0) < item.cost ? 'text-slate-600 text-xs' : 'text-white text-xs font-semibold'}>{item.cost} coins</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <Subheading className="mb-3">Your data</Subheading>
        <View className="gap-2">
          <Pressable onPress={handleExportData} className="bg-slate-900 rounded-xl p-4">
            <Text className="text-slate-200 text-sm mb-1">Export my data</Text>
            <Text className="text-slate-500 text-xs">Everything stays on your device. This shares a copy, nothing is uploaded automatically.</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
