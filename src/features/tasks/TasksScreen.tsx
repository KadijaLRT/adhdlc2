import { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, selectTasks, selectEnergyLevel, type TaskCategory, type TaskPriority } from '@/store/index';
import { suggestNextTask } from './suggestNextTask';

const CATEGORY_OPTIONS: { id: TaskCategory; label: string; emoji: string }[] = [
  { id: 'general', label: 'All', emoji: '📋' },
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'school', label: 'School', emoji: '📚' },
  { id: 'health', label: 'Health', emoji: '❤️' },
  { id: 'errands', label: 'Errands', emoji: '🛒' },
  { id: 'adhd', label: 'ADHD', emoji: '🧠' },
];

const PRIORITY_DOT: Record<TaskPriority, string> = {
  critical: '🔴',
  important: '🟠',
  nice: '🟢',
};

export default function TasksScreen() {
  const router = useRouter();
  const tasks = useAppStore(selectTasks);
  const energyLevel = useAppStore(selectEnergyLevel);
  const addTask = useAppStore((s) => s.addTask);
  const toggleTaskComplete = useAppStore((s) => s.toggleTaskComplete);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('nice');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('general');

  const suggested = useMemo(() => suggestNextTask(tasks, energyLevel), [tasks, energyLevel]);

  const filteredTasks = useMemo(() => {
    const withoutSuggested = (tasks || []).filter((t) => t.id !== suggested?.id);
    const byCategory = selectedCategory === 'general'
      ? withoutSuggested
      : withoutSuggested.filter((t) => (t.category || 'general') === selectedCategory);
    const incomplete = byCategory.filter((t) => !t.isComplete);
    const complete = byCategory.filter((t) => t.isComplete);
    return [...incomplete, ...complete];
  }, [tasks, selectedCategory, suggested]);

  const totalCount = (tasks || []).length;
  const completedCount = (tasks || []).filter((t) => t.isComplete).length;
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = async () => {
    if (!newTaskTitle?.trim()) return;
    await addTask({
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      isComplete: false,
      energyRequired: energyLevel,
      priority: newTaskPriority,
      category: selectedCategory === 'general' ? 'general' : selectedCategory,
      createdAt: new Date().toISOString(),
      subSteps: [],
    });
    setNewTaskTitle('');
    setNewTaskPriority('nice');
  };

  return (
    <View className="flex-1 w-full max-w-md self-center px-4 pt-safe">
      <Text className="text-slate-100 text-2xl font-semibold mb-1 mt-2">Tasks</Text>

      {totalCount > 0 && (
        <View className="mb-4">
          <View className="h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
            <View className="h-2 bg-emerald-500 rounded-full" style={{ width: `${progressPercent}%` }} />
          </View>
          <Text className="text-slate-500 text-xs">
            {completedCount} of {totalCount} done today — progress, not a to-do pile.
          </Text>
        </View>
      )}

      {suggested && (
        <Pressable
          onPress={() => router?.push?.(`/task/${suggested.id}`)}
          className="bg-indigo-600/10 border-2 border-indigo-500 rounded-2xl p-4 mb-4"
        >
          <Text className="text-indigo-300 text-xs uppercase tracking-wider mb-1">Today's focus</Text>
          <Text className="text-slate-100 text-lg font-medium mb-1">
            {PRIORITY_DOT[suggested.priority || 'nice']} {suggested.title}
          </Text>
          {(suggested.estimatedMinutes || suggested.realMinutes) && (
            <Text className="text-slate-400 text-xs">
              About {suggested.realMinutes || suggested.estimatedMinutes} min
            </Text>
          )}
        </Pressable>
      )}

      <View className="flex-row gap-2 mb-2">
        <TextInput
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          placeholder="Add a task..."
          placeholderTextColor="#64748b"
          onSubmitEditing={handleAdd}
          className="flex-1 bg-slate-900 text-slate-100 rounded-xl px-4 py-3"
        />
        <Pressable onPress={handleAdd} className="bg-indigo-600 rounded-xl px-5 justify-center active:bg-indigo-500">
          <Text className="text-white font-semibold">Add</Text>
        </Pressable>
      </View>

      {newTaskTitle.trim().length > 0 && (
        <View className="flex-row gap-2 mb-4">
          {(['nice', 'important', 'critical'] as TaskPriority[]).map((p) => {
            const isActive = newTaskPriority === p;
            return (
              <Pressable
                key={p}
                onPress={() => setNewTaskPriority(p)}
                className={isActive ? 'bg-slate-800 border-2 border-indigo-400 rounded-full py-1.5 px-3' : 'bg-slate-900 border-2 border-transparent rounded-full py-1.5 px-3'}
              >
                <Text className="text-slate-300 text-xs">{PRIORITY_DOT[p]} {p}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORY_OPTIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 8, marginBottom: 12 }}
        renderItem={({ item }) => {
          const isActive = selectedCategory === item.id;
          return (
            <Pressable
              onPress={() => setSelectedCategory(item.id)}
              className={isActive ? 'bg-indigo-600/20 border-2 border-indigo-400 rounded-full py-2 px-4' : 'bg-slate-900 border-2 border-transparent rounded-full py-2 px-4'}
            >
              <Text className={isActive ? 'text-indigo-200 text-xs' : 'text-slate-300 text-xs'}>{item.emoji} {item.label}</Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, gap: 10 }}
        ListEmptyComponent={
          <Text className="text-slate-500 text-center mt-10">
            {suggested ? 'Nothing else here right now.' : 'Nothing here yet. Add one small thing above.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router?.push?.(`/task/${item.id}`)}
            className="bg-slate-900 rounded-xl p-4 flex-row items-center gap-3"
          >
            <Pressable
              onPress={() => toggleTaskComplete(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item?.isComplete || false }}
              className={item?.isComplete ? 'w-6 h-6 rounded-full bg-emerald-500 items-center justify-center' : 'w-6 h-6 rounded-full border-2 border-slate-600'}
            >
              {item?.isComplete && <Text className="text-slate-950 text-xs">✓</Text>}
            </Pressable>
            <View className="flex-1">
              <Text className={item?.isComplete ? 'text-slate-500 line-through' : 'text-slate-100'}>
                {item?.priority ? `${PRIORITY_DOT[item.priority]} ` : ''}{item?.title || 'Untitled task'}
              </Text>
              {(item?.subSteps?.length || 0) > 0 && (
                <Text className="text-slate-500 text-xs mt-1">
                  {(item.subSteps || []).filter((s) => s?.isComplete).length} of {item.subSteps.length} steps
                </Text>
              )}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
