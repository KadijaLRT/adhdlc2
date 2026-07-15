import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAppStore } from '@/store/index';
import type { FitnessPreferences } from '@/store/slices/nutritionFitnessSlice';

const EQUIPMENT_OPTIONS = ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'resistance_band'];
const GOAL_OPTIONS: { id: NonNullable<FitnessPreferences['primaryGoal']>; label: string }[] = [
  { id: 'strength', label: 'Strength' },
  { id: 'endurance', label: 'Endurance' },
  { id: 'mobility', label: 'Mobility' },
  { id: 'general', label: 'General fitness' },
];

export default function PersonalizeFitnessCard() {
  const setFitnessPreferences = useAppStore((s) => s.setFitnessPreferences);
  const dismissFitnessCard = useAppStore((s) => s.dismissFitnessCard);
  const [equipment, setEquipment] = useState<string[]>(['bodyweight']);
  const [goal, setGoal] = useState<FitnessPreferences['primaryGoal']>(null);

  const toggleEquipment = (item: string) => {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]));
  };

  return (
    <View className="bg-white rounded-2xl p-5 mx-4 mb-4">
      <Text className="text-slate-900 text-base font-semibold mb-1">Want a workout list matched to you?</Text>
      <Text className="text-slate-500 text-xs mb-4">
        We'll only show exercises you can actually do. Change anytime.
      </Text>

      <Text className="text-slate-700 text-xs font-medium mb-2">What do you have access to?</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {(EQUIPMENT_OPTIONS || []).map((item) => {
          const isActive = equipment.includes(item);
          return (
            <Pressable
              key={item}
              onPress={() => toggleEquipment(item)}
              className={isActive ? 'bg-emerald-400/10 border-2 border-emerald-400 rounded-full py-2 px-3' : 'bg-stone-100 border-2 border-transparent rounded-full py-2 px-3'}
            >
              <Text className={isActive ? 'text-emerald-700 text-xs capitalize' : 'text-slate-700 text-xs capitalize'}>{item.replace('_', ' ')}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="text-slate-700 text-xs font-medium mb-2">Main goal</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {(GOAL_OPTIONS || []).map((option) => {
          const isActive = goal === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setGoal(option.id)}
              className={isActive ? 'bg-indigo-600/20 border-2 border-indigo-400 rounded-full py-2 px-3' : 'bg-stone-100 border-2 border-transparent rounded-full py-2 px-3'}
            >
              <Text className={isActive ? 'text-indigo-700 text-xs' : 'text-slate-700 text-xs'}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row gap-2">
        <Pressable
          onPress={() => setFitnessPreferences({ equipment, primaryGoal: goal })}
          className="flex-1 bg-indigo-600 rounded-full py-3 items-center active:bg-indigo-500"
        >
          <Text className="text-white text-sm font-semibold">Save preferences</Text>
        </Pressable>
        <Pressable onPress={dismissFitnessCard} className="py-3 px-4">
          <Text className="text-slate-500 text-sm">Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}
