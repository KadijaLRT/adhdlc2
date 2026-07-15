import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAppStore } from '@/store/index';

const ALLERGY_OPTIONS = ['dairy', 'shellfish', 'peanut', 'gluten', 'egg', 'soy'];
const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'pescatarian', 'halal', 'kosher', 'none'];

export default function PersonalizeNutritionCard() {
  const setNutritionPreferences = useAppStore((s) => s.setNutritionPreferences);
  const dismissNutritionCard = useAppStore((s) => s.dismissNutritionCard);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);

  const toggleAllergy = (item: string) => {
    setAllergies((prev) => (prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]));
  };
  const toggleRestriction = (item: string) => {
    setRestrictions((prev) => (prev.includes(item) ? prev.filter((r) => r !== item) : [...prev, item]));
  };

  return (
    <View className="bg-white rounded-2xl p-5 mx-4 mb-4">
      <Text className="text-slate-900 text-base font-semibold mb-1">Want recipes matched to you?</Text>
      <Text className="text-slate-400 text-xs mb-4">
        We'll hide anything with your allergies and prioritize what fits your diet. Never shared, change anytime.
      </Text>

      <Text className="text-slate-700 text-xs font-medium mb-2">Allergies</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {(ALLERGY_OPTIONS || []).map((item) => {
          const isActive = allergies.includes(item);
          return (
            <Pressable
              key={item}
              onPress={() => toggleAllergy(item)}
              className={isActive ? 'bg-amber-400/10 border-2 border-amber-400 rounded-full py-2 px-3' : 'bg-stone-100 border-2 border-transparent rounded-full py-2 px-3'}
            >
              <Text className={isActive ? 'text-amber-200 text-xs capitalize' : 'text-slate-700 text-xs capitalize'}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="text-slate-700 text-xs font-medium mb-2">Diet</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {(DIETARY_OPTIONS || []).map((item) => {
          const isActive = restrictions.includes(item);
          return (
            <Pressable
              key={item}
              onPress={() => toggleRestriction(item)}
              className={isActive ? 'bg-indigo-600/20 border-2 border-indigo-400 rounded-full py-2 px-3' : 'bg-stone-100 border-2 border-transparent rounded-full py-2 px-3'}
            >
              <Text className={isActive ? 'text-indigo-200 text-xs capitalize' : 'text-slate-700 text-xs capitalize'}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row gap-2">
        <Pressable
          onPress={() => setNutritionPreferences({ allergies, dietaryRestrictions: restrictions })}
          className="flex-1 bg-indigo-600 rounded-full py-3 items-center active:bg-indigo-500"
        >
          <Text className="text-white text-sm font-semibold">Save preferences</Text>
        </Pressable>
        <Pressable onPress={dismissNutritionCard} className="py-3 px-4">
          <Text className="text-slate-500 text-sm">Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}
