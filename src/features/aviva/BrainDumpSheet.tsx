import { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { avivaBrain, type BrainDumpResult } from '@/core/ai/AvivaBrain';
import type { TaskCategory } from '@/store/index';
import { useAppStore } from '@/store/index';

export default function BrainDumpSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrainDumpResult | null>(null);
  const energyLevel = useAppStore((s) => s.energyLevel);
  const isOverwhelmed = useAppStore((s) => s.isOverwhelmed);
  const addTask = useAppStore((s) => s.addTask);

  const handleSubmit = async () => {
    if (!text?.trim()) return;
    setLoading(true);
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
    const parsed = await avivaBrain.parseBrainDump(text, { currentEnergyLevel: energyLevel, isOverwhelmed, timeOfDay });
    setResult(parsed);
    setLoading(false);
  };

  const mapBrainDumpCategory = (category: string): TaskCategory => {
    if (category === 'bill' || category === 'errand') return 'errands';
    if (category === 'appointment' || category === 'reminder' || category === 'phone_call') return 'general';
    return 'general';
  };

  const handleAddAll = async () => {
    for (const item of result?.items || []) {
      await addTask({
        id: item.id,
        title: item.text,
        isComplete: false,
        energyRequired: item.suggestedEnergyLevel,
        category: mapBrainDumpCategory(item.category),
        priority: 'nice',
        createdAt: new Date().toISOString(),
        subSteps: [],
      });
    }
    setText(''); setResult(null); onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-stone-50 rounded-t-3xl p-6 pb-safe max-h-[85%]">
          <Text className="text-slate-900 text-xl font-semibold mb-1">Brain Dump</Text>
          <Text className="text-slate-400 text-sm mb-4">Type whatever&apos;s in your head. Aviva will sort it out.</Text>
          <TextInput value={text} onChangeText={setText} placeholder="everything is chaos..." placeholderTextColor="#64748b" multiline
            className="bg-white text-slate-900 rounded-xl p-4 min-h-[100px] mb-4" />
          {!result && (
            <Pressable onPress={handleSubmit} disabled={loading} className="bg-indigo-600 rounded-full py-4 mb-2 active:bg-indigo-500">
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-semibold">Sort this out</Text>}
            </Pressable>
          )}
          {result && (
            <ScrollView className="mb-4 max-h-64">
              <Text className="text-emerald-300 text-sm mb-3">{result?.reasoning || ''}</Text>
              {(result?.items || []).map((item) => (
                <View key={item.id} className="bg-white rounded-xl p-3 mb-2">
                  <Text className="text-slate-900">{item.text}</Text>
                  <Text className="text-slate-500 text-xs mt-1">{item.category} · {item.suggestedTiming}</Text>
                </View>
              ))}
              <Pressable onPress={handleAddAll} className="bg-emerald-500 rounded-full py-3 mt-2">
                <Text className="text-white text-center font-semibold">Add all to my tasks</Text>
              </Pressable>
            </ScrollView>
          )}
          <Pressable onPress={onClose} className="py-3">
            <Text className="text-slate-500 text-center text-sm">Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
