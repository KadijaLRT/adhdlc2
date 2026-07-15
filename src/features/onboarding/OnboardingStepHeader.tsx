import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export function OnboardingStepHeader({ step, total }: { step: number; total: number }) {
  const router = useRouter();
  return (
    <View className="flex-row items-center justify-between mb-6">
      <Pressable onPress={() => router?.back?.()}>
        <Text className="text-slate-400 text-sm">← Back</Text>
      </Pressable>
      <Text className="text-slate-500 text-sm">Step {step} of {total}</Text>
    </View>
  );
}

export function OnboardingBackOnlyHeader() {
  const router = useRouter();
  return (
    <View className="flex-row items-center mb-6">
      <Pressable onPress={() => router?.back?.()}>
        <Text className="text-slate-400 text-sm">← Back</Text>
      </Pressable>
    </View>
  );
}

export function OnboardingProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View className="h-1 bg-slate-800">
      <View className="h-1 bg-emerald-500" style={{ width: `${(step / total) * 100}%` }} />
    </View>
  );
}
