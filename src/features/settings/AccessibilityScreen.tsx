import { View, Text, Pressable, Switch, ScrollView } from 'react-native';
import {
  useAppStore, selectTextSize, selectReduceMotion, selectHighContrast, selectDyslexiaFont,
  selectTasks, selectAssignments, type TextSize,
} from '@/store/index';
import { Heading } from '@/shared/components/Heading';
import { buildIcsContent, downloadIcsFile } from './exportCalendar';

const TEXT_SIZES: { id: TextSize; label: string; scale: number }[] = [
  { id: 'small', label: 'A', scale: 0.85 },
  { id: 'medium', label: 'A', scale: 1 },
  { id: 'large', label: 'A', scale: 1.25 },
];

export default function AccessibilityScreen() {
  const textSize = useAppStore(selectTextSize);
  const reduceMotion = useAppStore(selectReduceMotion);
  const highContrast = useAppStore(selectHighContrast);
  const dyslexiaFont = useAppStore(selectDyslexiaFont);
  const setTextSize = useAppStore((s) => s.setTextSize);
  const setReduceMotion = useAppStore((s) => s.setReduceMotion);
  const setHighContrast = useAppStore((s) => s.setHighContrast);
  const setDyslexiaFont = useAppStore((s) => s.setDyslexiaFont);
  const tasks = useAppStore(selectTasks);
  const assignments = useAppStore(selectAssignments);

  const handleExportCalendar = () => {
    const content = buildIcsContent(tasks, assignments);
    downloadIcsFile(content);
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Accessibility</Heading>
        <Text className="text-slate-500 text-sm mb-6">Make the app fit how you read and see best.</Text>

        <View className="bg-white border border-stone-200 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-indigo-600 text-xs font-bold uppercase tracking-wider">🗓️ Calendar Export</Text>
          </View>
          <Text className="text-slate-900 text-base font-semibold mb-1">Send your schedule to any calendar app</Text>
          <Text className="text-slate-500 text-xs mb-4">
            Downloads a .ics file with your open tasks and school assignments that have a due date. Import it into Google Calendar, Outlook, or Apple Calendar. Tasks show as all-day events since exact times aren't tracked yet. Currently available on web only.
          </Text>
          <Pressable onPress={handleExportCalendar} className="bg-indigo-600 rounded-2xl py-4 items-center active:bg-indigo-500">
            <Text className="text-white font-semibold">🗓️ Export Schedule (.ics)</Text>
          </Pressable>
        </View>

        <View className="bg-white border border-stone-200 rounded-2xl p-4">
          <Text className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">♿ Accessibility</Text>

          <Text className="text-slate-900 text-base font-semibold mb-3">Text Size</Text>
          <View className="flex-row gap-2 mb-4">
            {TEXT_SIZES.map((option) => {
              const isActive = textSize === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setTextSize(option.id)}
                  className={isActive ? 'flex-1 bg-emerald-100 border-2 border-emerald-500 rounded-xl py-4 items-center' : 'flex-1 bg-stone-50 border border-stone-200 rounded-xl py-4 items-center'}
                >
                  <Text style={{ fontSize: 16 * option.scale }} className={isActive ? 'text-emerald-700 font-bold' : 'text-slate-800 font-bold'}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View className="h-px bg-stone-200 my-4" />

          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-1 pr-3">
              <Text className="text-slate-900 text-base font-semibold">Reduce Motion</Text>
              <Text className="text-slate-500 text-xs">Turns off breathing animations and transitions</Text>
            </View>
            <Switch value={reduceMotion} onValueChange={setReduceMotion} trackColor={{ false: '#d6d3d1', true: '#4f46e5' }} thumbColor="#fff" />
          </View>

          <View className="h-px bg-stone-200 my-4" />

          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-1 pr-3">
              <Text className="text-slate-900 text-base font-semibold">High Contrast</Text>
              <Text className="text-slate-500 text-xs">Boosts contrast for easier reading. Applied to new screens going forward — not yet retrofitted everywhere.</Text>
            </View>
            <Switch value={highContrast} onValueChange={setHighContrast} trackColor={{ false: '#d6d3d1', true: '#4f46e5' }} thumbColor="#fff" />
          </View>

          <View className="h-px bg-stone-200 my-4" />

          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-slate-900 text-base font-semibold">Dyslexia-Friendly Font</Text>
              <Text className="text-slate-500 text-xs">Switches to Lexend, a font built for reading ease. Restart the app for it to fully apply.</Text>
            </View>
            <Switch value={dyslexiaFont} onValueChange={setDyslexiaFont} trackColor={{ false: '#d6d3d1', true: '#4f46e5' }} thumbColor="#fff" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
