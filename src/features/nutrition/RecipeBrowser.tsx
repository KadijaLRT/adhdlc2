import { useState } from 'react';
import { View, Text, Pressable, TextInput, FlatList } from 'react-native';
import { useAppStore, selectSavedRecipeIds, selectNutritionPreferences, selectNutritionCardDismissed } from '@/store/index';
import PersonalizeNutritionCard from './PersonalizeNutritionCard';
import { RECIPES, type Recipe } from '@/content/recipes';
import { useRouter } from 'expo-router';
import { Heading } from '@/shared/components/Heading';

const CUISINES = ['all', 'jamaican', 'american', 'southern', 'italian', 'mexican', 'caribbean', 'japanese'];
const MEAL_TYPES = ['all', 'breakfast', 'lunch', 'dinner'];

export default function RecipeBrowser() {
  const router = useRouter();
  const savedRecipeIds = useAppStore(selectSavedRecipeIds);
  const toggleSavedRecipe = useAppStore((s) => s.toggleSavedRecipe);
  const nutritionPreferences = useAppStore(selectNutritionPreferences);
  const nutritionCardDismissed = useAppStore(selectNutritionCardDismissed);
  const [cuisine, setCuisine] = useState('all');
  const [mealType, setMealType] = useState('all');
  const [search, setSearch] = useState('');


  const allergies = nutritionPreferences?.allergies || [];
  const restrictions = (nutritionPreferences?.dietaryRestrictions || []).filter((r) => r !== 'none');

  const filteredByPreferences = (RECIPES || []).filter((r) => {
    const ingredients = (r.g || []).map((i) => i.toLowerCase());
    // Hard filter: never show a recipe containing a stated allergen.
    const hasAllergen = allergies.some((a) => ingredients.some((i) => i.includes(a)));
    if (hasAllergen) return false;
    return true;
  });

  const sortedByRestrictions = restrictions.length
    ? [...filteredByPreferences].sort((a, b) => {
        // Soft boost only — dietary preference reorders results, it
        // never hides anything the way an allergy does.
        const aMatch = restrictions.some((r) => (a.g || []).some((i) => i.toLowerCase().includes(r))) ? 0 : 1;
        const bMatch = restrictions.some((r) => (b.g || []).some((i) => i.toLowerCase().includes(r))) ? 0 : 1;
        return aMatch - bMatch;
      })
    : filteredByPreferences;

  const filtered = sortedByRestrictions.filter((r) => {
    const matchesCuisine = cuisine === 'all' || r.c === cuisine;
    const matchesType = mealType === 'all' || r.t === mealType;
    const matchesSearch = !search.trim() || (r.n || '').toLowerCase().includes(search.toLowerCase());
    return matchesCuisine && matchesType && matchesSearch;
  });



  return (
    <View className="flex-1">
      <View className="px-4 pt-4 w-full max-w-md self-center">
        <Heading className="mb-1">Recipes</Heading>
        <Text className="text-slate-400 text-sm mb-4">Simple, high-protein meals, browsable by cuisine and time of day.</Text>

        {!nutritionCardDismissed && <PersonalizeNutritionCard />}

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search recipes..."
          placeholderTextColor="#64748b"
          className="bg-white text-slate-900 rounded-xl px-4 py-3 mb-3"
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={MEAL_TYPES}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 8, marginBottom: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setMealType(item)}
              className={mealType === item ? 'bg-indigo-600/20 border-2 border-indigo-400 rounded-full py-2 px-4' : 'bg-white border-2 border-transparent rounded-full py-2 px-4'}
            >
              <Text className={mealType === item ? 'text-indigo-200 text-xs capitalize' : 'text-slate-700 text-xs capitalize'}>{item}</Text>
            </Pressable>
          )}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CUISINES}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 8, marginBottom: 10 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setCuisine(item)}
              className={cuisine === item ? 'bg-emerald-400/10 border-2 border-emerald-400 rounded-full py-2 px-4' : 'bg-white border-2 border-transparent rounded-full py-2 px-4'}
            >
              <Text className={cuisine === item ? 'text-emerald-300 text-xs capitalize' : 'text-slate-700 text-xs capitalize'}>{item}</Text>
            </Pressable>
          )}
        />

        {(savedRecipeIds || []).length > 0 && (
          <Pressable onPress={() => router?.push?.('/nutrition/groceries')} className="bg-amber-400/10 border-2 border-amber-400 rounded-xl py-3 mb-3 items-center">
            <Text className="text-amber-300 font-medium">View grocery list ({savedRecipeIds.length} recipe{savedRecipeIds.length === 1 ? '' : 's'}) →</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40, width: '100%', maxWidth: 448, alignSelf: 'center' }}
        renderItem={({ item }) => <RecipeCard recipe={item} isSaved={(savedRecipeIds || []).includes(item.id)} onToggleSave={() => toggleSavedRecipe(item.id)} />}
        ListEmptyComponent={<Text className="text-slate-500 text-center mt-6">No recipes match those filters.</Text>}
      />
    </View>
  );
}

function RecipeCard({ recipe, isSaved, onToggleSave }: { recipe: Recipe; isSaved: boolean; onToggleSave: () => void }) {
  return (
    <View className="bg-white rounded-2xl p-4">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-slate-900 font-medium flex-1">{recipe?.n || 'Untitled recipe'}</Text>
        <Pressable onPress={onToggleSave}>
          <Text className="text-lg">{isSaved ? '⭐️' : '☆'}</Text>
        </Pressable>
      </View>
      <Text className="text-slate-500 text-xs mb-2 capitalize">{recipe?.c} · {recipe?.t} · {recipe?.prep} prep · {recipe?.cook} cook</Text>
      <Text className="text-slate-400 text-xs">{recipe?.cal || 0} cal · {recipe?.pro} protein · {recipe?.carb} carb · {recipe?.fat} fat</Text>
    </View>
  );
}
