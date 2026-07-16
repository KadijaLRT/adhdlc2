import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import WorkbookCard from '@/features/toolkit/WorkbookCard';
import { ScreenBackButton } from '@/shared/components/ScreenBackButton';

export default function WorkbookRoute() {
  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950">
      <ScreenBackButton />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="w-full max-w-md self-center">
          <WorkbookCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
