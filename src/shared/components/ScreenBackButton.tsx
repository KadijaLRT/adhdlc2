import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Consistent back affordance for every non-Home screen. Uses
 * router.back() where there's real navigation history; for the four
 * tab screens (Today/Meals/Wellness/Profile), which aren't reached via
 * a push and so don't have a natural "back," this instead links home.
 */
export function ScreenBackButton({ toHome = false, dark = false }: { toHome?: boolean; dark?: boolean }) {
  const router = useRouter();
  const handlePress = () => {
    if (toHome) {
      router?.push?.('/(tabs)/home');
    } else {
      router?.back?.();
    }
  };
  return (
    <View className="px-5 pt-safe pb-1">
      <Pressable onPress={handlePress} accessibilityRole="button" accessibilityLabel={toHome ? 'Go to Home' : 'Go back'} className="py-2 flex-row items-center gap-1">
        <Text className={dark ? 'text-slate-400 text-sm' : 'text-slate-500 text-sm'}>{toHome ? '🏠 Home' : '← Back'}</Text>
      </Pressable>
    </View>
  );
}
