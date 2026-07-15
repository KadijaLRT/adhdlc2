import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function WelcomeScreen() {
  const router = useRouter();
  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router?.push?.('/onboarding/calibration');
  };
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-1 w-full max-w-md self-center px-6 pt-safe pb-safe justify-center">
        <Text accessibilityRole="header" className="text-slate-100 text-3xl font-semibold mb-3">
          Hi, I'm your coach 👋
        </Text>
        <Text className="text-slate-400 text-lg leading-7 mb-2">
          About 2 minutes to set up. No wrong answers. You can change anything later.
        </Text>
        <Text className="text-slate-500 text-sm mb-10">
          The more you share, the more personalized everything gets. But you can skip anything.
        </Text>
        <Pressable onPress={handleContinue} accessibilityRole="button" accessibilityLabel="Continue"
          className="bg-indigo-600 rounded-full py-4 active:bg-indigo-500">
          <Text className="text-white text-lg text-center font-semibold">Let's begin</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
