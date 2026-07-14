import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AchievementsGrid from '@/features/gamification/AchievementsGrid';

export default function AchievementsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <AchievementsGrid />
      </ScrollView>
    </SafeAreaView>
  );
}
