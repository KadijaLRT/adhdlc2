import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppStore, selectIsHydrated, selectProfile } from '@/store/index';

export default function Index() {
  const isHydrated = useAppStore(selectIsHydrated);
  const profile = useAppStore(selectProfile);

  if (!isHydrated) {
    return (
      <View className="flex-1 bg-stone-50 items-center justify-center">
        <ActivityIndicator color="#818cf8" />
      </View>
    );
  }

  return profile ? <Redirect href="/(tabs)/home" /> : <Redirect href="/onboarding/welcome" />;
}
