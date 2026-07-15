import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, FlatList } from 'react-native';
import { useAppStore, selectActiveProgramId, selectGyms, selectActiveGymId } from '@/store/index';
import { PROGRAMS } from '@/content/programs';
import { getCurrentProgramWeek, getSessionsThisWeek } from './buildProgramSession';
import { Heading, Subheading } from '@/shared/components/Heading';

const EQUIPMENT_OPTIONS = ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'resistance_band'];

function GymSelectorCard() {
  const gyms = useAppStore(selectGyms);
  const activeGymId = useAppStore(selectActiveGymId);
  const addGym = useAppStore((s) => s.addGym);
  const updateGymEquipment = useAppStore((s) => s.updateGymEquipment);
  const removeGym = useAppStore((s) => s.removeGym);
  const setActiveGym = useAppStore((s) => s.setActiveGym);

  const [adding, setAdding] = useState(false);
  const [managingGymId, setManagingGymId] = useState<string | null>(null);
  const [newGymName, setNewGymName] = useState('');
  const [newGymEquipment, setNewGymEquipment] = useState<string[]>(['bodyweight']);

  const activeGym = gyms.find((g) => g.id === activeGymId) || null;
  const managingGym = gyms.find((g) => g.id === managingGymId) || null;

  const toggleEquipment = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((e) => e !== item) : [...list, item]);
  };

  const handleAddGym = async () => {
    if (!newGymName.trim()) return;
    await addGym(newGymName.trim(), newGymEquipment);
    setNewGymName('');
    setNewGymEquipment(['bodyweight']);
    setAdding(false);
  };

  if (adding) {
    return (
      <View className="bg-white border-2 border-indigo-500 rounded-2xl p-4 mb-4">
        <TextInput
          value={newGymName}
          onChangeText={setNewGymName}
          placeholder="Gym name..."
          placeholderTextColor="#64748b"
          autoFocus
          className="bg-stone-100 text-slate-900 rounded-xl px-3 py-2 mb-3"
        />
        <Text className="text-slate-700 text-xs font-medium mb-2">What equipment does this gym have?</Text>
        <View className="flex-row flex-wrap gap-2 mb-3">
          {EQUIPMENT_OPTIONS.map((eq) => {
            const isActive = newGymEquipment.includes(eq);
            return (
              <Pressable key={eq} onPress={() => toggleEquipment(newGymEquipment, setNewGymEquipment, eq)}
                className={isActive ? 'bg-emerald-100 border-2 border-emerald-500 rounded-full py-2 px-3' : 'bg-stone-100 border-2 border-transparent rounded-full py-2 px-3'}>
                <Text className={isActive ? 'text-emerald-700 text-xs capitalize' : 'text-slate-700 text-xs capitalize'}>{eq.replace('_', ' ')}</Text>
              </Pressable>
            );
          })}
        </View>
        <View className="flex-row gap-2">
          <Pressable onPress={handleAddGym} className="flex-1 bg-indigo-600 rounded-xl py-3 items-center">
            <Text className="text-white text-sm font-semibold">Save gym</Text>
          </Pressable>
          <Pressable onPress={() => setAdding(false)} className="py-3 px-4">
            <Text className="text-slate-500 text-sm">Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (managingGym) {
    return (
      <View className="bg-white border-2 border-indigo-500 rounded-2xl p-4 mb-4">
        <Text className="text-slate-900 font-semibold mb-3">{managingGym.name}</Text>
        <Text className="text-slate-700 text-xs font-medium mb-2">Equipment available here</Text>
        <View className="flex-row flex-wrap gap-2 mb-3">
          {EQUIPMENT_OPTIONS.map((eq) => {
            const isActive = managingGym.equipment.includes(eq);
            return (
              <Pressable key={eq}
                onPress={() => updateGymEquipment(managingGym.id, isActive ? managingGym.equipment.filter((e) => e !== eq) : [...managingGym.equipment, eq])}
                className={isActive ? 'bg-emerald-100 border-2 border-emerald-500 rounded-full py-2 px-3' : 'bg-stone-100 border-2 border-transparent rounded-full py-2 px-3'}>
                <Text className={isActive ? 'text-emerald-700 text-xs capitalize' : 'text-slate-700 text-xs capitalize'}>{eq.replace('_', ' ')}</Text>
              </Pressable>
            );
          })}
        </View>
        <View className="flex-row gap-2">
          <Pressable onPress={() => setManagingGymId(null)} className="flex-1 bg-indigo-600 rounded-xl py-3 items-center">
            <Text className="text-white text-sm font-semibold">Done</Text>
          </Pressable>
          <Pressable onPress={() => { removeGym(managingGym.id); setManagingGymId(null); }} className="py-3 px-4">
            <Text className="text-red-600 text-sm">Remove gym</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4">
      {gyms.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={gyms}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{ gap: 8, marginBottom: 8 }}
          renderItem={({ item }) => {
            const isActive = item.id === activeGymId;
            return (
              <Pressable onPress={() => setActiveGym(item.id)} onLongPress={() => setManagingGymId(item.id)}
                className={isActive ? 'bg-purple-100 border-2 border-purple-500 rounded-2xl py-3 px-4' : 'bg-white border-2 border-stone-200 rounded-2xl py-3 px-4'}>
                <Text className={isActive ? 'text-purple-700 font-semibold text-sm' : 'text-slate-700 text-sm'}>{item.name}</Text>
              </Pressable>
            );
          }}
        />
      )}
      <Pressable onPress={() => setAdding(true)} className="bg-purple-50 border-2 border-purple-400 rounded-2xl p-4 flex-row items-center justify-between">
        <View>
          <Text className="text-purple-700 font-semibold">{activeGym ? `Exercises tailored to ${activeGym.name}` : 'Add a gym'}</Text>
          <Text className="text-slate-500 text-xs">{gyms.length > 0 ? 'Tap a gym to switch, hold to edit equipment, or add another' : "Workouts adapt to that gym's actual equipment"}</Text>
        </View>
      </Pressable>
    </View>
  );
}

// This screen is now just the program switcher: gym equipment, the
// currently active program with a Stop option, and the list of other
// programs to switch to. The day-of-week split view (day strip +
// DayCard list) lives on the Workouts tab landing page
// (WorkoutsHome.tsx), which is what actually opens when a program is
// active — this screen is only reached via the "Programs" button
// from there.
export default function ProgramsScreen() {
  const activeProgramId = useAppStore(selectActiveProgramId);
  const sessionsCompletedInProgram = useAppStore((s) => s.sessionsCompletedInProgram);
  const startProgram = useAppStore((s) => s.startProgram);
  const stopProgram = useAppStore((s) => s.stopProgram);

  const activeProgram = PROGRAMS.find((p) => p.id === activeProgramId) || null;
  const currentWeek = activeProgram ? getCurrentProgramWeek(activeProgram, sessionsCompletedInProgram) : 0;
  const sessionsThisWeek = activeProgram ? getSessionsThisWeek(activeProgram, sessionsCompletedInProgram) : 0;

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Programs</Heading>

        <GymSelectorCard />

        {activeProgram && (
          <View className="bg-white rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-1">
              <Subheading>{activeProgram.emoji} {activeProgram.title}</Subheading>
              <Pressable onPress={stopProgram}>
                <Text className="text-slate-500 text-xs">Stop</Text>
              </Pressable>
            </View>
            <Text className="text-slate-500 text-xs">
              Week {currentWeek} of {activeProgram.durationWeeks} · {sessionsThisWeek} of {activeProgram.daysPerWeek} sessions this week
            </Text>
          </View>
        )}

        <Text className="text-slate-900 text-lg font-semibold mb-3">{activeProgram ? 'Switch program' : 'Choose a program'}</Text>
        <FlatList
          data={PROGRAMS.filter((p) => p.id !== activeProgramId)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-4">
              <Text className="text-slate-900 font-medium mb-1">{item.emoji} {item.title}</Text>
              <Text className="text-slate-500 text-xs mb-2">{item.forWhom}</Text>
              <Text className="text-slate-500 text-xs mb-3">
                {item.daysPerWeek}x/week · {item.durationWeeks} weeks · {item.sessionExerciseCount} exercises per session
              </Text>
              <Pressable onPress={() => startProgram(item.id)} className="bg-stone-100 rounded-full py-2 items-center active:bg-stone-200">
                <Text className="text-slate-800 text-xs font-medium">Start this program</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}
