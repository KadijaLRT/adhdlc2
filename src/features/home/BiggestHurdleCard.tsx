import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useAppStore } from '@/store/index';
import { avivaBrain } from '@/core/ai/AvivaBrain';

/**
 * Moved here from onboarding on purpose — "what's your biggest hurdle"
 * is a today question, not a one-time setup question. Answering it
 * creates a real, broken-down task the same way the old onboarding
 * step did, but now it can be asked fresh each day rather than once,
 * ever, during setup.
 */
export default function BiggestHurdleCard() {
  const energyLevel = useAppStore((s) => s.energyLevel);
  const isOverwhelmed = useAppStore((s) => s.isOverwhelmed);
  const addTask = useAppStore((s) => s.addTask);

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

    const decomposition = await Promise.race([
      avivaBrain.decomposeTask(text, { currentEnergyLevel: energyLevel, isOverwhelmed, timeOfDay }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
    ]);

    if (decomposition) {
      await addTask({
        id: `hurdle-${Date.now()}`,
        title: decomposition.originalTask || text,
        isComplete: false,
        energyRequired: decomposition.suggestedEnergyLevel,
        realMinutes: decomposition.estimatedRealMinutes,
        estimatedMinutes: decomposition.estimatedIdealMinutes,
        priority: 'important',
        category: 'general',
        createdAt: new Date().toISOString(),
        subSteps: (decomposition.subSteps || []).map((s) => ({ id: s.id, title: s.title, isComplete: false })),
      });
    } else {
      await addTask({
        id: `hurdle-${Date.now()}`,
        title: text,
        isComplete: false,
        energyRequired: energyLevel,
        priority: 'important',
        category: 'general',
        createdAt: new Date().toISOString(),
        subSteps: [],
      });
    }

    setLoading(false);
    setDone(true);
    setText('');
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <View className="bg-white rounded-2xl p-4">
      <Text className="text-slate-900 text-sm font-medium mb-1">What's the biggest hurdle today?</Text>
      <Text className="text-slate-500 text-xs mb-3">I'll turn it into a small first step.</Text>

      {done ? (
        <Text className="text-emerald-700 text-sm">Added to your tasks ✓</Text>
      ) : (
        <View className="flex-row gap-2">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Getting started on anything..."
            placeholderTextColor="#64748b"
            onSubmitEditing={handleSubmit}
            className="flex-1 bg-stone-100 text-slate-900 rounded-xl px-3 py-2"
          />
          <Pressable onPress={handleSubmit} disabled={loading} className="bg-indigo-600 rounded-xl px-4 justify-center">
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text className="text-white text-sm font-semibold">Go</Text>}
          </Pressable>
        </View>
      )}
    </View>
  );
}
