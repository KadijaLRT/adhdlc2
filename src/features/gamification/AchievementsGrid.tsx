import { View, Text } from 'react-native';
import { useAppStore, selectMilestones } from '@/store/index';
import { MILESTONE_DEFINITIONS, getUnlockedTiers, getNextTier } from '@/content/milestoneDefinitions';

export default function AchievementsGrid() {
  const milestones = useAppStore(selectMilestones);
  return (
    <View className="w-full">
      <Subheading className="mb-4">Your Milestones</Subheading>
      <View className="flex-col md:flex-row flex-wrap gap-3">
        {(MILESTONE_DEFINITIONS || []).map((definition) => {
          const progress = (milestones || []).find((m) => m.trackedEvent === definition.trackedEvent);
          const count = progress?.count || 0;
          const unlocked = getUnlockedTiers(definition, count);
          const next = getNextTier(definition, count);
          const latest = unlocked[unlocked.length - 1] || null;
          return (
            <View key={definition.id} className="bg-slate-900 rounded-2xl p-5 w-full md:w-[48%]">
              <Text className="text-slate-100 text-base font-semibold mb-1">{definition.title}</Text>
              <Text className="text-slate-400 text-xs mb-3">{definition.description}</Text>
              <Text className="text-amber-300 text-2xl font-bold mb-1">{count}</Text>
              {latest ? <Text className="text-emerald-400 text-sm mb-1">{latest.label} unlocked</Text>
                      : <Text className="text-slate-500 text-sm mb-1">Just getting started</Text>}
              {next ? <Text className="text-slate-500 text-xs">Next: {next.label} at {next.threshold}</Text>
                    : <Text className="text-slate-500 text-xs">All tiers unlocked</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
}
