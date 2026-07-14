import { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, selectCourses, selectAssignments, selectEnergyLevel } from '@/store/index';
import { Heading } from '@/shared/components/Heading';

const COURSE_EMOJIS = ['📖', '🧮', '🧪', '🎨', '🌍', '💻'];

function daysUntil(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * "What should I study next" — scores incomplete assignments by how
 * soon they're due and how long they'll take, so the person never has
 * to weigh that tradeoff themselves. Same "one recommendation, not a
 * ranked list" principle as suggestNextTask and pickStartSomewhere.
 */
function suggestNextAssignment(assignments: ReturnType<typeof selectAssignments>) {
  const incomplete = (assignments || []).filter((a) => !a.isComplete);
  if (!incomplete.length) return null;
  const scored = incomplete.map((a) => {
    const days = daysUntil(a.dueDate);
    const urgency = days <= 0 ? 100 : Math.max(0, 30 - days);
    const effortPenalty = (a.estimatedMinutes || 30) / 60;
    return { assignment: a, score: urgency - effortPenalty };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.assignment || null;
}

export default function SchoolScreen() {
  const router = useRouter();
  const courses = useAppStore(selectCourses);
  const assignments = useAppStore(selectAssignments);
  const energyLevel = useAppStore(selectEnergyLevel);
  const addCourse = useAppStore((s) => s.addCourse);
  const toggleAssignmentComplete = useAppStore((s) => s.toggleAssignmentComplete);

  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseEmoji, setNewCourseEmoji] = useState(COURSE_EMOJIS[0]);

  const suggested = useMemo(() => suggestNextAssignment(assignments), [assignments]);

  const handleAddCourse = async () => {
    if (!newCourseName.trim()) return;
    await addCourse({ id: `course-${Date.now()}`, name: newCourseName.trim(), emoji: newCourseEmoji });
    setNewCourseName('');
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">Study</Heading>
        <Text className="text-slate-400 text-sm mb-6">What should I study next?</Text>

        {suggested && (
          <Pressable onPress={() => router?.push?.(`/school/assignment/${suggested.id}`)} className="bg-indigo-600 rounded-2xl p-5 mb-4 active:bg-indigo-500">
            <Text className="text-indigo-100 text-xs uppercase tracking-wider mb-1">
              Recommended {daysUntil(suggested.dueDate) <= 0 ? '· due now' : `· due in ${daysUntil(suggested.dueDate)} day${daysUntil(suggested.dueDate) === 1 ? '' : 's'}`}
            </Text>
            <Text className="text-white text-lg font-semibold mb-1">{suggested.title}</Text>
            {suggested.estimatedMinutes && <Text className="text-indigo-200 text-xs">About {suggested.estimatedMinutes} min</Text>}
          </Pressable>
        )}

        <Pressable onPress={() => router?.push?.('/school/semester')} className="bg-slate-900 rounded-2xl p-4 flex-row items-center justify-between mb-4">
          <Text className="text-slate-100 text-sm">🗓️ Semester view</Text>
          <Text className="text-slate-500 text-xs">→</Text>
        </Pressable>

        <Text className="text-slate-100 text-lg font-semibold mb-3">Courses</Text>
        <View className="bg-slate-900 rounded-2xl p-4 mb-4">
          <View className="flex-row gap-2 mb-3">
            {(COURSE_EMOJIS || []).map((emoji) => (
              <Pressable key={emoji} onPress={() => setNewCourseEmoji(emoji)} className={newCourseEmoji === emoji ? 'bg-indigo-600/30 rounded-lg p-2' : 'p-2'}>
                <Text className="text-lg">{emoji}</Text>
              </Pressable>
            ))}
          </View>
          <View className="flex-row gap-2">
            <TextInput
              value={newCourseName}
              onChangeText={setNewCourseName}
              placeholder="Biology, Algebra II..."
              placeholderTextColor="#64748b"
              onSubmitEditing={handleAddCourse}
              className="flex-1 bg-slate-800 text-slate-100 rounded-xl px-4 py-3"
            />
            <Pressable onPress={handleAddCourse} className="bg-indigo-600 rounded-xl px-5 justify-center">
              <Text className="text-white font-semibold">Add</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-2 mb-6">
          {(courses || []).length === 0 && <Text className="text-slate-500 text-center">No courses yet. Add one above.</Text>}
          {(courses || []).map((course) => {
            const courseAssignments = (assignments || []).filter((a) => a.courseId === course.id);
            const openCount = courseAssignments.filter((a) => !a.isComplete).length;
            return (
              <Pressable key={course.id} onPress={() => router?.push?.(`/school/course/${course.id}`)} className="bg-slate-900 rounded-xl p-4 flex-row items-center justify-between">
                <Text className="text-slate-100 text-sm">{course.emoji} {course.name}</Text>
                <Text className="text-slate-500 text-xs">{openCount} open</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
