import { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, selectSavedRecipeIds, selectEnergyLevel, selectWellnessPreferences, selectFoodLog } from '@/store/index';
import { RECIPES } from '@/content/recipes';
import { getMealSuggestions } from '@/content/mealSuggestions';
import { buildMergedGroceryList } from '@/content/groceryListBuilder';
import { Heading, Subheading } from '@/shared/components/Heading';

function todayLocal(): string {
  return (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
}

/**
 * Leads with an actual recommendation and this week's real grocery
 * count, not a menu of "Recipes" / "Groceries" buttons — matching the
 * document's "every screen should be immediately useful" principle.
 */
export default function MealsHub() {
  const router = useRouter();
  const savedRecipeIds = useAppStore(selectSavedRecipeIds);
  const energyLevel = useAppStore(selectEnergyLevel);
  const wellnessPreferences = useAppStore(selectWellnessPreferences);
  const foodLog = useAppStore(selectFoodLog);

  const todaysCalories = useMemo(
    () => (foodLog || []).filter((f) => f.date === todayLocal()).reduce((sum, f) => sum + f.calories, 0),
    [foodLog]
  );

  const savedRecipes = useMemo(() => (RECIPES || []).filter((r) => (savedRecipeIds || []).includes(r.id)), [savedRecipeIds]);

  const suggestion = useMemo(() => {
    const matches = getMealSuggestions(energyLevel, wellnessPreferences?.bloodTypeEnabled ? wellnessPreferences?.bloodType : null);
    return matches[0] || null;
  }, [energyLevel, wellnessPreferences]);

  const groceryCount = useMemo(() => buildMergedGroceryList(savedRecipes, []).length, [savedRecipes]);

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Meals</Heading>
        <Text className="text-slate-500 text-sm mb-6">What should I eat right now?</Text>

        {suggestion && (
          <View className="bg-indigo-600/10 border-2 border-indigo-500 rounded-2xl p-5 mb-4">
            <Text className="text-indigo-700 text-xs uppercase tracking-wider mb-1">Suggested for your energy today</Text>
            <Subheading className="mb-1">{suggestion.title}</Subheading>
            <Text className="text-slate-500 text-xs">{suggestion.prepMinutes} min · {(suggestion.ingredients || []).join(', ')}</Text>
          </View>
        )}

        <View className="gap-3">
          <Pressable onPress={() => router?.push?.('/nutrition/diary')} className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-900 dark:text-slate-100 text-sm">📊 Nutrition diary</Text>
            <Text className="text-slate-500 text-xs">{todaysCalories > 0 ? `${todaysCalories} cal today` : 'log today →'}</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/nutrition/recipes')} className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-900 dark:text-slate-100 text-sm">🍎 Browse recipes</Text>
            <Text className="text-slate-500 text-xs">{savedRecipes.length} saved</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/nutrition/groceries')} className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-900 dark:text-slate-100 text-sm">🛒 This week's groceries</Text>
            <Text className="text-slate-500 text-xs">{groceryCount} items</Text>
          </Pressable>
          <Pressable onPress={() => router?.push?.('/wellness/meals')} className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex-row items-center justify-between">
            <Text className="text-slate-900 dark:text-slate-100 text-sm">🩸 Blood type meal lens</Text>
            <Text className="text-slate-500 text-xs">optional →</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
