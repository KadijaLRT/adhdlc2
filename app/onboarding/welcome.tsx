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
          I&apos;m Aviva, your ADHD Life Coach.
        </Text>
        <Text className="text-slate-400 text-lg leading-7 mb-10">
          I don&apos;t judge. I just support. Let&apos;s take a minute to get to know each other.
        </Text>
        <Pressable onPress={handleContinue} accessibilityRole="button" accessibilityLabel="Continue to calibration"
          className="bg-indigo-600 rounded-full py-4 active:bg-indigo-500">
          <Text className="text-white text-lg text-center font-semibold">Let&apos;s begin</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
