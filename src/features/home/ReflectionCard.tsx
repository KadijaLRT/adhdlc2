import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAppStore, selectReflections } from '@/store/index';

/**
 * The evening half of the "three interface modes" idea: not a full
 * separate app state, just a different primary card on Home once it's
 * evening. Morning/day keeps the existing plan-forward view; this
 * replaces it with a quick, optional day-review prompt.
 */
export default function ReflectionCard() {
  const reflections = useAppStore(selectReflections);
  const saveReflectionForToday = useAppStore((s) => s.saveReflectionForToday);
  const today = new Date().toISOString().split('T')[0];
  const todaysReflection = (reflections || []).find((r) => r.date === today);

  const [note, setNote] = useState(todaysReflection?.note || '');
  const [saved, setSaved] = useState(!!todaysReflection);

  const handleSave = async () => {
    await saveReflectionForToday(note);
    setSaved(true);
  };

  return (
    <View className="bg-slate-900 rounded-2xl p-5">
      <Text className="text-indigo-300 text-xs uppercase tracking-wider mb-1">Evening check-in</Text>
      <Text className="text-slate-100 text-base font-medium mb-3">How was today?</Text>

      <TextInput
        value={note}
        onChangeText={(text) => { setNote(text); setSaved(false); }}
        placeholder="One line is plenty..."
        placeholderTextColor="#64748b"
        multiline
        className="bg-slate-800 text-slate-100 rounded-xl p-3 min-h-[70px] mb-3"
      />

      <Pressable
        onPress={handleSave}
        className={saved ? 'bg-emerald-500/20 rounded-full py-3 items-center' : 'bg-indigo-600 rounded-full py-3 items-center active:bg-indigo-500'}
      >
        <Text className={saved ? 'text-emerald-300 font-medium' : 'text-white font-semibold'}>
          {saved ? 'Saved ✓' : 'Save'}
        </Text>
      </Pressable>
    </View>
  );
}
