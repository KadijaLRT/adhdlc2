import { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import {
  useAppStore, selectFoodLog, selectDailyTargets, type MealType, type FoodLogEntry,
} from '@/store/index';
import { searchFoodDatabase, type FoodItem } from '@/content/foodDatabase';
import { Heading } from '@/shared/components/Heading';

const MEAL_TYPES: { id: MealType; label: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'lunch', label: 'Lunch', icon: '🥪' },
  { id: 'dinner', label: 'Dinner', icon: '🍽️' },
  { id: 'snack', label: 'Snacks', icon: '🍪' },
];

function todayLocal(): string {
  return new Date().toISOString().split('T')[0] || '';
}

function formatDateLabel(dateStr: string): string {
  const today = todayLocal();
  if (dateStr === today) return 'Today';
  const date = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === (yesterday.toISOString().split('T')[0] || '')) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function shiftDate(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0] || dateStr;
}

/** Fills toward 100% but never implies failure past it — matches this app's cumulative, non-punitive progress style elsewhere. */
function ProgressBar({ value, target, color }: { value: number; target: number | null; color: string }) {
  if (!target || target <= 0) return null;
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <View className="h-1.5 rounded-full bg-stone-200 dark:bg-slate-800 overflow-hidden">
      <View className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </View>
  );
}

export default function NutritionDiaryScreen() {
  const foodLog = useAppStore(selectFoodLog);
  const dailyTargets = useAppStore(selectDailyTargets);
  const logFood = useAppStore((s) => s.logFood);
  const removeFoodLogEntry = useAppStore((s) => s.removeFoodLogEntry);
  const setDailyTargets = useAppStore((s) => s.setDailyTargets);

  const [selectedDate, setSelectedDate] = useState(todayLocal());
  const [addingToMeal, setAddingToMeal] = useState<MealType | null>(null);
  const [search, setSearch] = useState('');
  const [pickedFood, setPickedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState('1');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customPro, setCustomPro] = useState('');
  const [customCarb, setCustomCarb] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [editingTargets, setEditingTargets] = useState(false);
  const [targetCalInput, setTargetCalInput] = useState(dailyTargets?.calories ? String(dailyTargets.calories) : '');
  const [targetProInput, setTargetProInput] = useState(dailyTargets?.protein ? String(dailyTargets.protein) : '');
  const [targetCarbInput, setTargetCarbInput] = useState(dailyTargets?.carbs ? String(dailyTargets.carbs) : '');
  const [targetFatInput, setTargetFatInput] = useState(dailyTargets?.fat ? String(dailyTargets.fat) : '');

  const entriesForDay = useMemo(() => (foodLog || []).filter((f) => f.date === selectedDate), [foodLog, selectedDate]);

  const totals = useMemo(() => {
    return entriesForDay.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fat: acc.fat + e.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [entriesForDay]);

  const searchResults = useMemo(() => searchFoodDatabase(search).slice(0, 12), [search]);

  const resetAddFlow = () => {
    setAddingToMeal(null);
    setSearch('');
    setPickedFood(null);
    setServings('1');
    setShowCustomForm(false);
    setCustomName(''); setCustomCal(''); setCustomPro(''); setCustomCarb(''); setCustomFat('');
  };

  const handleLogPickedFood = async () => {
    if (!pickedFood || !addingToMeal) return;
    const multiplier = Number(servings) || 1;
    await logFood({
      date: selectedDate,
      mealType: addingToMeal,
      foodName: pickedFood.name,
      servings: multiplier,
      calories: Math.round(pickedFood.calories * multiplier),
      protein: Math.round(pickedFood.protein * multiplier),
      carbs: Math.round(pickedFood.carbs * multiplier),
      fat: Math.round(pickedFood.fat * multiplier),
    });
    resetAddFlow();
  };

  const handleLogCustomFood = async () => {
    if (!customName.trim() || !addingToMeal) return;
    await logFood({
      date: selectedDate,
      mealType: addingToMeal,
      foodName: customName.trim(),
      servings: 1,
      calories: Number(customCal) || 0,
      protein: Number(customPro) || 0,
      carbs: Number(customCarb) || 0,
      fat: Number(customFat) || 0,
    });
    resetAddFlow();
  };

  const handleSaveTargets = async () => {
    await setDailyTargets({
      calories: targetCalInput ? Number(targetCalInput) : null,
      protein: targetProInput ? Number(targetProInput) : null,
      carbs: targetCarbInput ? Number(targetCarbInput) : null,
      fat: targetFatInput ? Number(targetFatInput) : null,
    });
    setEditingTargets(false);
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Nutrition Diary</Heading>
        <Text className="text-slate-500 text-sm mb-4">Log what you eat — no perfect days required, just what's true.</Text>

        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => setSelectedDate(shiftDate(selectedDate, -1))} className="p-2">
            <Text className="text-indigo-500 text-lg">‹</Text>
          </Pressable>
          <Text className="text-slate-900 dark:text-slate-100 text-sm font-semibold">{formatDateLabel(selectedDate)}</Text>
          <Pressable onPress={() => setSelectedDate(shiftDate(selectedDate, 1))} className="p-2">
            <Text className="text-indigo-500 text-lg">›</Text>
          </Pressable>
        </View>

        <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Today's totals</Text>
            <Pressable onPress={() => setEditingTargets(!editingTargets)}>
              <Text className="text-indigo-500 text-xs">{dailyTargets?.calories ? 'Edit targets' : 'Set targets'}</Text>
            </Pressable>
          </View>

          {editingTargets ? (
            <View>
              <View className="flex-row gap-2 mb-2">
                <TextInput value={targetCalInput} onChangeText={setTargetCalInput} placeholder="Calories" placeholderTextColor="#64748b" keyboardType="numeric" className="flex-1 bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2" />
                <TextInput value={targetProInput} onChangeText={setTargetProInput} placeholder="Protein g" placeholderTextColor="#64748b" keyboardType="numeric" className="flex-1 bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2" />
              </View>
              <View className="flex-row gap-2 mb-3">
                <TextInput value={targetCarbInput} onChangeText={setTargetCarbInput} placeholder="Carbs g" placeholderTextColor="#64748b" keyboardType="numeric" className="flex-1 bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2" />
                <TextInput value={targetFatInput} onChangeText={setTargetFatInput} placeholder="Fat g" placeholderTextColor="#64748b" keyboardType="numeric" className="flex-1 bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2" />
              </View>
              <Text className="text-slate-500 text-[11px] mb-3">These are numbers you choose for yourself — set whatever you want to track toward, or leave blank to just log without targets.</Text>
              <Pressable onPress={handleSaveTargets} className="bg-indigo-600 rounded-xl py-2.5 items-center active:bg-indigo-500">
                <Text className="text-white text-sm font-semibold">Save targets</Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-2">
              <View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-600 dark:text-slate-300 text-xs">Calories</Text>
                  <Text className="text-slate-600 dark:text-slate-300 text-xs">{totals.calories}{dailyTargets?.calories ? ` / ${dailyTargets.calories}` : ''}</Text>
                </View>
                <ProgressBar value={totals.calories} target={dailyTargets?.calories ?? null} color="bg-indigo-500" />
              </View>
              <View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-600 dark:text-slate-300 text-xs">Protein</Text>
                  <Text className="text-slate-600 dark:text-slate-300 text-xs">{totals.protein}g{dailyTargets?.protein ? ` / ${dailyTargets.protein}g` : ''}</Text>
                </View>
                <ProgressBar value={totals.protein} target={dailyTargets?.protein ?? null} color="bg-emerald-500" />
              </View>
              <View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-600 dark:text-slate-300 text-xs">Carbs</Text>
                  <Text className="text-slate-600 dark:text-slate-300 text-xs">{totals.carbs}g{dailyTargets?.carbs ? ` / ${dailyTargets.carbs}g` : ''}</Text>
                </View>
                <ProgressBar value={totals.carbs} target={dailyTargets?.carbs ?? null} color="bg-amber-500" />
              </View>
              <View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-600 dark:text-slate-300 text-xs">Fat</Text>
                  <Text className="text-slate-600 dark:text-slate-300 text-xs">{totals.fat}g{dailyTargets?.fat ? ` / ${dailyTargets.fat}g` : ''}</Text>
                </View>
                <ProgressBar value={totals.fat} target={dailyTargets?.fat ?? null} color="bg-red-400" />
              </View>
            </View>
          )}
        </View>

        {MEAL_TYPES.map((meal) => {
          const mealEntries = entriesForDay.filter((e) => e.mealType === meal.id);
          const mealCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);
          return (
            <View key={meal.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-slate-900 dark:text-slate-100 text-sm font-semibold">{meal.icon} {meal.label}</Text>
                <Text className="text-slate-500 text-xs">{mealCalories > 0 ? `${mealCalories} cal` : ''}</Text>
              </View>

              {mealEntries.map((entry) => (
                <View key={entry.id} className="flex-row items-center justify-between py-1.5 border-t border-stone-100 dark:border-slate-800">
                  <View className="flex-1">
                    <Text className="text-slate-800 dark:text-slate-200 text-sm">{entry.foodName}{entry.servings !== 1 ? ` ×${entry.servings}` : ''}</Text>
                    <Text className="text-slate-500 text-xs">{entry.calories} cal · {entry.protein}p · {entry.carbs}c · {entry.fat}f</Text>
                  </View>
                  <Pressable onPress={() => removeFoodLogEntry(entry.id)} className="p-2">
                    <Text className="text-slate-400 text-xs">✕</Text>
                  </Pressable>
                </View>
              ))}

              {addingToMeal === meal.id ? (
                <View className="mt-2 pt-2 border-t border-stone-100 dark:border-slate-800">
                  {!showCustomForm ? (
                    <>
                      <TextInput
                        value={search}
                        onChangeText={(v) => { setSearch(v); setPickedFood(null); }}
                        placeholder="Search foods…"
                        placeholderTextColor="#64748b"
                        autoFocus
                        className="bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 mb-2"
                      />
                      {!pickedFood && (
                        <View className="max-h-48">
                          {searchResults.map((f) => (
                            <Pressable key={f.id} onPress={() => setPickedFood(f)} className="py-2 border-b border-stone-100 dark:border-slate-800">
                              <Text className="text-slate-800 dark:text-slate-200 text-sm">{f.name}</Text>
                              <Text className="text-slate-500 text-xs">{f.servingLabel} · {f.calories} cal · {f.protein}p / {f.carbs}c / {f.fat}f</Text>
                            </Pressable>
                          ))}
                          {searchResults.length === 0 && (
                            <Text className="text-slate-500 text-xs py-2">No matches — try "Add custom food" below.</Text>
                          )}
                        </View>
                      )}
                      {pickedFood && (
                        <View className="bg-stone-50 dark:bg-slate-800 rounded-xl p-3 mb-2">
                          <Text className="text-slate-900 dark:text-slate-100 text-sm font-medium mb-2">{pickedFood.name}</Text>
                          <View className="flex-row items-center gap-2 mb-2">
                            <Text className="text-slate-500 text-xs">Servings ({pickedFood.servingLabel} each)</Text>
                            <TextInput
                              value={servings}
                              onChangeText={setServings}
                              keyboardType="numeric"
                              className="w-16 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg px-2 py-1 text-center"
                            />
                          </View>
                          <Pressable onPress={handleLogPickedFood} className="bg-emerald-500 rounded-xl py-2 items-center active:bg-emerald-400">
                            <Text className="text-white text-sm font-semibold">Add to {meal.label.toLowerCase()}</Text>
                          </Pressable>
                        </View>
                      )}
                      <Pressable onPress={() => setShowCustomForm(true)} className="py-2">
                        <Text className="text-indigo-500 text-xs">+ Add custom food</Text>
                      </Pressable>
                    </>
                  ) : (
                    <View>
                      <TextInput value={customName} onChangeText={setCustomName} placeholder="Food name" placeholderTextColor="#64748b" className="bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 mb-2" />
                      <View className="flex-row gap-2 mb-2">
                        <TextInput value={customCal} onChangeText={setCustomCal} placeholder="Calories" placeholderTextColor="#64748b" keyboardType="numeric" className="flex-1 bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2" />
                        <TextInput value={customPro} onChangeText={setCustomPro} placeholder="Protein g" placeholderTextColor="#64748b" keyboardType="numeric" className="flex-1 bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2" />
                      </View>
                      <View className="flex-row gap-2 mb-3">
                        <TextInput value={customCarb} onChangeText={setCustomCarb} placeholder="Carbs g" placeholderTextColor="#64748b" keyboardType="numeric" className="flex-1 bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2" />
                        <TextInput value={customFat} onChangeText={setCustomFat} placeholder="Fat g" placeholderTextColor="#64748b" keyboardType="numeric" className="flex-1 bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2" />
                      </View>
                      <Pressable onPress={handleLogCustomFood} disabled={!customName.trim()} className={customName.trim() ? 'bg-emerald-500 rounded-xl py-2 items-center active:bg-emerald-400' : 'bg-slate-300 dark:bg-slate-700 rounded-xl py-2 items-center'}>
                        <Text className="text-white text-sm font-semibold">Add to {meal.label.toLowerCase()}</Text>
                      </Pressable>
                    </View>
                  )}
                  <Pressable onPress={resetAddFlow} className="py-2">
                    <Text className="text-slate-500 text-center text-xs">Cancel</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => setAddingToMeal(meal.id)} className="mt-2 border-2 border-dashed border-stone-300 dark:border-slate-700 rounded-xl py-2 items-center">
                  <Text className="text-slate-500 text-xs">+ Add food</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
