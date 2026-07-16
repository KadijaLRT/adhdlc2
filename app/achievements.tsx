import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AchievementsGrid from '@/features/gamification/AchievementsGrid';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function AchievementsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950"><ScreenBackButton />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <AchievementsGrid />
      </ScrollView>
    </SafeAreaView>
  );
}
