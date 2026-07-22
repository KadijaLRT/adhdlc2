import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import WarmupMoveAnimation, { type WarmupAnimationType } from './WarmupMoveAnimation';

export interface TimedStep {
  text: string;
  durationSeconds: number;
  emoji?: string;
  animation?: WarmupAnimationType;
}

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

/**
 * A compact, embeddable step-by-step countdown — the same guided-timer
 * idea as the full-screen RoutineRunner, but sized to live inside a
 * card rather than take over the screen. Used for warm-ups and stretch
 * routines, both of which are one part of a bigger screen, not a
 * standalone destination.
 */
export default function InlineStepTimer({ steps, onFinish }: { steps: TimedStep[]; onFinish?: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(steps[0]?.durationSeconds || 0);
  const [isPaused, setIsPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[currentIndex];

  useEffect(() => {
    setSecondsLeft(steps[currentIndex]?.durationSeconds || 0);
    setIsPaused(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused || secondsLeft <= 0 || finished) return;
    intervalRef.current = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused, secondsLeft, finished]);

  const goNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= steps.length) {
      setFinished(true);
      onFinish?.();
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setFinished(false);
  };

  if (steps.length === 0) return null;

  if (finished) {
    return (
      <View className="items-center py-4">
        <Text className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-2">Done ✓</Text>
        <Pressable onPress={restart} className="py-1">
          <Text className="text-slate-500 text-xs">Go through it again</Text>
        </Pressable>
      </View>
    );
  }

  const totalSeconds = currentStep?.durationSeconds || 0;
  const progressPct = totalSeconds > 0 ? Math.min(100, ((totalSeconds - secondsLeft) / totalSeconds) * 100) : 0;

  return (
    <View>
      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1">Step {currentIndex + 1} of {steps.length}</Text>
      <Text className="text-slate-900 dark:text-slate-100 text-base font-semibold mb-3">{currentStep?.text}</Text>

      <View className="items-center mb-3">
        {currentStep?.emoji && (
          <WarmupMoveAnimation
            key={currentIndex}
            emoji={currentStep.emoji}
            animation={currentStep.animation}
            paused={isPaused}
          />
        )}
        <Text className="text-slate-900 dark:text-slate-100 text-4xl font-bold mb-2">{formatCountdown(secondsLeft)}</Text>
        <View className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-slate-800 overflow-hidden">
          <View className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPct}%` }} />
        </View>
      </View>

      <View className="flex-row gap-2">
        <Pressable onPress={() => setIsPaused(!isPaused)} className="flex-1 border-2 border-stone-300 dark:border-slate-700 rounded-xl py-2 items-center">
          <Text className="text-slate-600 dark:text-slate-300 text-xs font-semibold">{isPaused ? '▶ Resume' : '⏸ Pause'}</Text>
        </Pressable>
        <Pressable onPress={goNext} className="flex-1 bg-emerald-500 rounded-xl py-2 items-center active:bg-emerald-400">
          <Text className="text-white text-xs font-semibold">{currentIndex + 1 >= steps.length ? 'Finish' : 'Next →'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
