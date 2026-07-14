import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useAppStore } from '@/store/index';
import { AGENTS } from '@/core/ai/agents';
import { askOrchestrator } from '@/core/ai/orchestrator';
import { Heading } from '@/shared/components/Heading';

export default function CoachScreen() {
  const energyLevel = useAppStore((s) => s.energyLevel);
  const isOverwhelmed = useAppStore((s) => s.isOverwhelmed);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<{ agentLabel: string; message: string; reasoning: string } | null>(null);

  const handleAsk = async () => {
    if (!message?.trim()) return;
    setLoading(true);
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

    const { agentLabel, response } = await askOrchestrator(
      message,
      { energyLevel, isOverwhelmed, timeOfDay },
      selectedAgentId || undefined
    );

    setReply(response ? { agentLabel, message: response.message, reasoning: response.reasoning } : null);
    setLoading(false);
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Coach</Heading>
        <Text className="text-slate-400 text-sm mb-4">Pick a specialist, or just ask and I&apos;ll route it for you.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setSelectedAgentId(null)}
              className={selectedAgentId === null ? 'bg-indigo-600/20 border-2 border-indigo-400 rounded-full py-2 px-4' : 'bg-slate-900 border-2 border-transparent rounded-full py-2 px-4'}
            >
              <Text className={selectedAgentId === null ? 'text-indigo-200 text-xs' : 'text-slate-300 text-xs'}>Auto</Text>
            </Pressable>
            {(AGENTS || []).map((agent) => (
              <Pressable
                key={agent.id}
                onPress={() => setSelectedAgentId(agent.id)}
                className={selectedAgentId === agent.id ? 'bg-indigo-600/20 border-2 border-indigo-400 rounded-full py-2 px-4' : 'bg-slate-900 border-2 border-transparent rounded-full py-2 px-4'}
              >
                <Text className={selectedAgentId === agent.id ? 'text-indigo-200 text-xs' : 'text-slate-300 text-xs'}>{agent.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="What's on your mind?"
          placeholderTextColor="#64748b"
          multiline
          className="bg-slate-900 text-slate-100 rounded-xl p-4 min-h-[80px] mb-4"
        />

        <Pressable onPress={handleAsk} disabled={loading} className="bg-indigo-600 rounded-full py-4 mb-6 active:bg-indigo-500">
          {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-semibold">Ask</Text>}
        </Pressable>

        {reply && (
          <View className="bg-slate-900 rounded-2xl p-4">
            <Text className="text-indigo-300 text-xs uppercase tracking-wider mb-2">{reply.agentLabel}</Text>
            <Text className="text-slate-100 mb-3">{reply.message}</Text>
            <Text className="text-slate-500 text-xs">{reply.reasoning}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
