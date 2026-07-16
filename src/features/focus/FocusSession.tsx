import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/index';
import { Heading } from '@/shared/components/Heading';

interface FocusSessionProps {
  taskTitle: string | null;
  durationMinutes: number;
}

type Phase = 'settling' | 'running' | 'ended';

export default function FocusSession({ taskTitle, durationMinutes }: FocusSessionProps) {
  const router = useRouter();
  const incrementMilestone = useAppStore((s) => s.incrementMilestone);
  const logMomentum = useAppStore((s) => s.logMomentum);
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const awardProgress = useAppStore((s) => s.awardProgress);
  const [phase, setPhase] = useState<Phase>('settling');
  const [secondsLeft, setSecondsLeft] = useState((durationMinutes || 5) * 60);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (phase !== 'settling') return;
    if (!reduceMotion) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    }
    const settleTimer = setTimeout(() => { setPhase('running'); logMomentum('started_session'); }, 6000);
    return () => clearTimeout(settleTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'running') return;
    if (secondsLeft <= 0) {
      setPhase('ended');
      return;
    }
    const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [phase, secondsLeft]);

  const handleStopEarly = () => setPhase('ended');

  const handleLogSession = async () => {
    await incrementMilestone('focus_session_completed');
    await awardProgress('focus', 15, 8);
    router?.replace?.('/focus-picker');
  };

  const handleSkipLogging = () => router?.replace?.('/focus-picker');

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-slate-950">
      <View className="flex-1 items-center justify-center px-8 pt-safe pb-safe">
        {phase === 'settling' && (
          <>
            <Animated.View style={{ transform: [{ scale: pulse }] }} className="w-32 h-32 rounded-full bg-indigo-600/20 border-2 border-indigo-500 mb-8" />
            <Text className="text-slate-900 text-xl text-center font-medium mb-2 dark:text-slate-100">Getting settled...</Text>
            <Text className="text-slate-500 text-center">{taskTitle || 'Just this, for now.'}</Text>
          </>
        )}

        {phase === 'running' && (
          <>
            <Text className="text-slate-500 text-sm uppercase tracking-wider mb-2">{taskTitle || 'Focus session'}</Text>
            <Text className="text-slate-50 text-6xl font-bold mb-10">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
            <Pressable onPress={handleStopEarly} className="py-3">
              <Text className="text-slate-500 text-center text-sm">I&apos;m stopping here, that&apos;s okay</Text>
            </Pressable>
          </>
        )}

        {phase === 'ended' && (
          <>
            <Heading className="text-center mb-2">That&apos;s time in.</Heading>
            <Text className="text-slate-500 text-center mb-10">Whatever you got done counts. No pressure either way.</Text>
            <Pressable onPress={handleLogSession} className="bg-indigo-600 rounded-full py-4 px-10 mb-3 active:bg-indigo-500">
              <Text className="text-white font-semibold">Log this session</Text>
            </Pressable>
            <Pressable onPress={handleSkipLogging} className="py-3">
              <Text className="text-slate-500 text-center text-sm">Just take me back</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
