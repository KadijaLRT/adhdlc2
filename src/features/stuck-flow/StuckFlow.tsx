import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/index';
import { STUCK_PROMPTS, getRandomPrompt } from '@/content/stuckPrompts';
import { Heading } from '@/shared/components/Heading';

type Room = 'eat' | 'work' | 'gym';
const ROOM_LABELS: Record<Room, string> = { eat: 'Eating', work: 'Work', gym: 'Gym' };

export default function StuckFlow() {
  const router = useRouter();
  const bodyDoublingRoom = useAppStore((s) => s.bodyDoublingRoom);
  const setBodyDoublingRoom = useAppStore((s) => s.setBodyDoublingRoom);
  const setOverwhelmed = useAppStore((s) => s.setOverwhelmed);
  const incrementMilestone = useAppStore((s) => s.incrementMilestone);
  const awardProgress = useAppStore((s) => s.awardProgress);

  const [currentPrompt, setCurrentPrompt] = useState(STUCK_PROMPTS?.[0] || { id: 'water', text: 'Take a sip of water.' });

  const handleNextStep = () => {
    setCurrentPrompt(getRandomPrompt(currentPrompt?.id));
    incrementMilestone('stuck_flow_used');
    awardProgress('confidence', 3, 1);
  };
  const handleDone = () => {
    setOverwhelmed(false);
    setBodyDoublingRoom(null);
    router?.back?.();
  };
  const handleRoomSelect = (room: Room) => {
    const isTurningOn = bodyDoublingRoom !== room;
    setBodyDoublingRoom(bodyDoublingRoom === room ? null : room);
    if (isTurningOn) incrementMilestone('body_doubling_session');
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <View className="flex-1 w-full max-w-md self-center px-6 pt-safe pb-safe justify-center">
        <View className="mb-10">
          <Heading>I&apos;m feeling stuck</Heading>
          <Text className="text-slate-500 text-base mt-1">No pressure. Just one small thing.</Text>
        </View>
        <View className="bg-white rounded-2xl p-8 mb-8 items-center">
          <Text className="text-indigo-700 text-xs uppercase tracking-wider mb-3">Try this micro step</Text>
          <Text className="text-slate-50 text-xl text-center font-medium">{currentPrompt?.text || 'Take a sip of water.'}</Text>
        </View>
        <Pressable onPress={handleNextStep} className="bg-indigo-600 rounded-full py-4 px-8 mb-4 active:bg-indigo-500">
          <Text className="text-white text-lg text-center font-semibold">Did it. What&apos;s next?</Text>
        </Pressable>
        <View className="mb-6">
          <Text className="text-slate-500 text-sm mb-3 text-center">Want to start a body doubling session?</Text>
          <View className="flex-row flex-wrap justify-center gap-2">
            {(Object.keys(ROOM_LABELS) as Room[]).map((room) => {
              const isActive = bodyDoublingRoom === room;
              return (
                <Pressable key={room} onPress={() => handleRoomSelect(room)}
                  className={isActive ? 'border-2 border-emerald-400 bg-emerald-400/10 rounded-full py-3 px-5' : 'border-2 border-stone-300 rounded-full py-3 px-5 active:border-slate-500'}>
                  <Text className={isActive ? 'text-emerald-700 font-medium' : 'text-slate-700 font-medium'}>
                    {bodyDoublingRoom === room ? '🟢 ' : '⚪️ '}{ROOM_LABELS[room]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <Pressable onPress={handleDone} className="py-3">
          <Text className="text-slate-500 text-center text-sm">I&apos;m okay now, take me back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
