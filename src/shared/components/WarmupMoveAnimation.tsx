import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

export type WarmupAnimationType = 'vertical' | 'quickVertical' | 'horizontal' | 'rotate' | 'twist' | 'pulse';

interface Props {
  emoji: string;
  animation?: WarmupAnimationType;
  paused?: boolean;
}

const DURATIONS: Record<WarmupAnimationType, number> = {
  vertical: 900,
  quickVertical: 420,
  horizontal: 800,
  rotate: 1400,
  twist: 700,
  pulse: 900,
};

/**
 * A small looping animation shown alongside each warm-up step's emoji
 * so the countdown isn't just a static icon — the icon actually moves
 * in a shape that echoes the exercise (squats/bridges = up-down,
 * jumping jacks/high knees = a quicker pop, leg swings/lunges =
 * side-to-side, arm circles = a full rotation, side bends = a lean).
 * Deliberately built on React Native's built-in Animated API rather
 * than per-exercise illustrated art or a new animation dependency, so
 * it renders identically on web and native with zero extra assets and
 * no added install risk.
 */
export default function WarmupMoveAnimation({ emoji, animation = 'pulse', paused = false }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    progress.setValue(0);
    loopRef.current?.stop();
    if (paused) return;

    const duration = DURATIONS[animation];
    const easing = Easing.inOut(Easing.quad);

    // Rotation loops in one continuous direction (0deg → 360deg looks
    // seamless since they're visually identical); everything else is a
    // there-and-back oscillation so it starts and ends at rest.
    const sequence = animation === 'rotate'
      ? Animated.timing(progress, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })
      : Animated.sequence([
          Animated.timing(progress, { toValue: 1, duration, easing, useNativeDriver: true }),
          Animated.timing(progress, { toValue: 0, duration, easing, useNativeDriver: true }),
        ]);

    loopRef.current = Animated.loop(sequence);
    loopRef.current.start();
    return () => loopRef.current?.stop();
  }, [animation, paused, progress]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let transform: any[];

  switch (animation) {
    case 'vertical':
      transform = [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }) }];
      break;
    case 'quickVertical':
      transform = [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -16] }) }];
      break;
    case 'horizontal':
      transform = [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-14, 14] }) }];
      break;
    case 'rotate':
      transform = [{ rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }];
      break;
    case 'twist':
      transform = [{ rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['-16deg', '16deg'] }) }];
      break;
    case 'pulse':
    default:
      transform = [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }];
      break;
  }

  return (
    <View className="items-center justify-center" style={{ height: 64 }}>
      <Animated.Text style={{ fontSize: 40, transform }}>{emoji}</Animated.Text>
    </View>
  );
}
