import { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import {
  useAppStore,
  selectSavedRecipeIds,
  selectPantryItems,
  selectCheckedIngredients,
} from '@/store/index';
import { RECIPES } from '@/content/recipes';
import { buildMergedGroceryList } from '@/content/groceryListBuilder';
import { Heading } from '@/shared/components/Heading';

export default function GroceryScreen() {
  const savedRecipeIds = useAppStore(selectSavedRecipeIds);
  const pantryItems = useAppStore(selectPantryItems);
  const checkedIngredients = useAppStore(selectCheckedIngredients);
  const addPantryItem = useAppStore((s) => s.addPantryItem);
  const removePantryItem = useAppStore((s) => s.removePantryItem);
  const toggleCheckedIngredient = useAppStore((s) => s.toggleCheckedIngredient);
  const clearCheckedIngredients = useAppStore((s) => s.clearCheckedIngredients);

  const [shoppingMode, setShoppingMode] = useState(false);
  const [newPantryItem, setNewPantryItem] = useState('');
  const [showPantry, setShowPantry] = useState(false);

  const savedRecipes = useMemo(
    () => (RECIPES || []).filter((r) => (savedRecipeIds || []).includes(r.id)),
    [savedRecipeIds]
  );

  const groceryList = useMemo(
    () => buildMergedGroceryList(savedRecipes, pantryItems),
    [savedRecipes, pantryItems]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof groceryList>();
    for (const item of groceryList) {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries());
  }, [groceryList]);

  const handleAddPantryItem = () => {
    if (!newPantryItem.trim()) return;
    addPantryItem(newPantryItem);
    setNewPantryItem('');
  };

  if (savedRecipes.length === 0) {
    return (
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        <View className="w-full max-w-md self-center">
          <Heading className="mb-1 mt-2">Groceries</Heading>
          <Text className="text-slate-400 text-sm">
            Save a few recipes and your grocery list builds itself here, grouped by aisle.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <View className="flex-row items-center justify-between mb-1 mt-2">
          <Heading>Groceries</Heading>
          <Pressable onPress={() => setShoppingMode(!shoppingMode)}>
            <Text className="text-indigo-400 text-sm font-medium">
              {shoppingMode ? 'Exit shopping mode' : 'Shopping mode'}
            </Text>
          </Pressable>
        </View>
        <Text className="text-slate-400 text-sm mb-6">
          {groceryList.length} item{groceryList.length === 1 ? '' : 's'} from {savedRecipes.length} saved recipe{savedRecipes.length === 1 ? '' : 's'}
        </Text>

        {!shoppingMode && (
          <Pressable onPress={() => setShowPantry(!showPantry)} className="bg-slate-900 rounded-2xl p-4 mb-4">
            <Text className="text-slate-100 text-sm font-medium mb-1">
              🥫 Pantry ({(pantryItems || []).length} item{(pantryItems || []).length === 1 ? '' : 's'})
            </Text>
            <Text className="text-slate-500 text-xs">
              Things you already have. They're left off your list automatically.
            </Text>
          </Pressable>
        )}

        {!shoppingMode && showPantry && (
          <View className="bg-slate-900 rounded-2xl p-4 mb-4">
            <View className="flex-row gap-2 mb-3">
              <TextInput
                value={newPantryItem}
                onChangeText={setNewPantryItem}
                placeholder="e.g. olive oil"
                placeholderTextColor="#64748b"
                onSubmitEditing={handleAddPantryItem}
                className="flex-1 bg-slate-800 text-slate-100 rounded-xl px-3 py-2"
              />
              <Pressable onPress={handleAddPantryItem} className="bg-indigo-600 rounded-xl px-4 justify-center">
                <Text className="text-white text-sm font-semibold">Add</Text>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {(pantryItems || []).map((item) => (
                <Pressable key={item} onPress={() => removePantryItem(item)} className="bg-slate-800 rounded-full py-1.5 px-3">
                  <Text className="text-slate-300 text-xs capitalize">{item} ✕</Text>
                </Pressable>
              ))}
              {(pantryItems || []).length === 0 && (
                <Text className="text-slate-600 text-xs">No pantry items yet.</Text>
              )}
            </View>
          </View>
        )}

        {shoppingMode ? (
          <View className="gap-1">
            {[...groceryList]
              .sort((a, b) => {
                const aChecked = checkedIngredients.includes(a.ingredient) ? 1 : 0;
                const bChecked = checkedIngredients.includes(b.ingredient) ? 1 : 0;
                return aChecked - bChecked;
              })
              .map((item) => {
                const isChecked = checkedIngredients.includes(item.ingredient);
                return (
                  <Pressable
                    key={item.ingredient}
                    onPress={() => toggleCheckedIngredient(item.ingredient)}
                    className="bg-slate-900 rounded-xl p-4 flex-row items-center gap-3"
                  >
                    <View className={isChecked ? 'w-6 h-6 rounded-md bg-emerald-500 items-center justify-center' : 'w-6 h-6 rounded-md border-2 border-slate-600'}>
                      {isChecked && <Text className="text-slate-950 text-xs">✓</Text>}
                    </View>
                    <Text className={isChecked ? 'text-slate-500 line-through text-lg capitalize' : 'text-slate-100 text-lg capitalize'}>
                      {item.ingredient}
                    </Text>
                  </Pressable>
                );
              })}
            <Pressable onPress={clearCheckedIngredients} className="py-3 mt-2">
              <Text className="text-slate-600 text-center text-sm">Uncheck everything</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-4">
            {grouped.map(([category, items]) => (
              <View key={category}>
                <Text className="text-slate-400 text-xs font-medium mb-2">{category} ({items.length})</Text>
                <View className="gap-2">
                  {items.map((item) => (
                    <View key={item.ingredient} className="bg-slate-900 rounded-xl p-3">
                      <Text className="text-slate-100 text-sm capitalize mb-1">{item.ingredient}</Text>
                      <Text className="text-slate-500 text-xs">Used for: {item.usedFor.join(', ')}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
