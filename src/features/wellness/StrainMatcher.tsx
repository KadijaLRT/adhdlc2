import { useState } from 'react';
import { View, Text, Switch, Pressable, ScrollView } from 'react-native';
import { useAppStore, selectWellnessPreferences } from '@/store/index';
import { CANNABIS_DISCLAIMER, CANNABIS_EFFECTS, getStrainsForEffect } from '@/content/cannabisData';

export default function StrainMatcher() {
  const wellnessPreferences = useAppStore(selectWellnessPreferences);
  const setWellnessPreferences = useAppStore((s) => s.setWellnessPreferences);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const matches = selectedEffect ? getStrainsForEffect(selectedEffect) : [];

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
      <View className="w-full max-w-md self-center gap-4">
        <View className="bg-white rounded-2xl p-5">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-slate-900 text-base font-semibold">Strain Explorer</Text>
            <Switch value={wellnessPreferences?.cannabisModuleEnabled || false}
              onValueChange={(v) => setWellnessPreferences({ cannabisModuleEnabled: v })}
              trackColor={{ false: '#334155', true: '#4f46e5' }} thumbColor="#e2e8f0" />
          </View>
          <Text className="text-slate-500 text-xs">{CANNABIS_DISCLAIMER}</Text>
        </View>
        {wellnessPreferences?.cannabisModuleEnabled && (
          <>
            <View className="flex-row flex-wrap gap-2">
              {(CANNABIS_EFFECTS || []).map((effect) => {
                const isActive = selectedEffect === effect;
                return (
                  <Pressable key={effect} onPress={() => setSelectedEffect(effect)}
                    className={isActive ? 'bg-emerald-400/10 border-2 border-emerald-400 rounded-full py-2 px-4' : 'bg-stone-100 border-2 border-transparent rounded-full py-2 px-4'}>
                    <Text className={isActive ? 'text-emerald-700' : 'text-slate-700'}>{effect}</Text>
                  </Pressable>
                );
              })}
            </View>
            {selectedEffect && (
              <View className="bg-white rounded-2xl p-4 mt-2">
                {(matches || []).length
                  ? (matches || []).map((strain) => <Text key={strain} className="text-slate-800 mb-1">{strain}</Text>)
                  : <Text className="text-slate-500 text-sm">No commonly reported matches for this effect yet.</Text>}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
