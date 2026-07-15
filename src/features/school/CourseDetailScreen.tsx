import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, selectCourses, selectAssignments } from '@/store/index';
import { avivaBrain, type FlashcardSet } from '@/core/ai/AvivaBrain';
import { Heading } from '@/shared/components/Heading';

export default function CourseDetailScreen({ courseId }: { courseId: string }) {
  const router = useRouter();
  const courses = useAppStore(selectCourses);
  const assignments = useAppStore(selectAssignments);
  const addAssignment = useAppStore((s) => s.addAssignment);
  const updateCourse = useAppStore((s) => s.updateCourse);

  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [notesText, setNotesText] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardSet | null>(null);
  const [generatingCards, setGeneratingCards] = useState(false);

  const course = (courses || []).find((c) => c.id === courseId);
  const courseAssignments = (assignments || []).filter((a) => a.courseId === courseId);

  const handleSaveGrade = () => {
    const grade = Number(gradeInput);
    const goal = Number(goalInput);
    updateCourse(courseId, {
      currentGrade: gradeInput ? grade : course?.currentGrade,
      gradeGoal: goalInput ? goal : course?.gradeGoal,
    });
  };

  const handleGenerateFlashcards = async () => {
    if (!notesText.trim()) return;
    setGeneratingCards(true);
    const result = await avivaBrain.generateFlashcards(notesText);
    setFlashcards(result);
    setGeneratingCards(false);
    updateCourse(courseId, { notes: notesText });
  };

  const handleAdd = async () => {
    if (!newTitle.trim() || !newDueDate.trim()) return;
    await addAssignment({
      id: `assignment-${Date.now()}`,
      courseId,
      title: newTitle.trim(),
      dueDate: newDueDate.trim(),
      isComplete: false,
      subSteps: [],
    });
    setNewTitle('');
    setNewDueDate('');
  };

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-slate-500 text-center">This course isn&apos;t here anymore.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-6 mt-2">{course.emoji} {course.name}</Heading>

        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-slate-700 text-sm font-medium mb-2">Grade</Text>
          {course.currentGrade !== undefined && course.gradeGoal !== undefined && (
            <Text className="text-slate-500 text-xs mb-2">
              Currently {course.currentGrade}% · goal {course.gradeGoal}%
              {course.currentGrade >= course.gradeGoal ? ' · on track' : ` · ${course.gradeGoal - course.currentGrade} points to go`}
            </Text>
          )}
          <View className="flex-row gap-2">
            <TextInput
              value={gradeInput}
              onChangeText={setGradeInput}
              placeholder="Current %"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              className="flex-1 bg-stone-100 text-slate-900 rounded-xl px-3 py-2"
            />
            <TextInput
              value={goalInput}
              onChangeText={setGoalInput}
              placeholder="Goal %"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              className="flex-1 bg-stone-100 text-slate-900 rounded-xl px-3 py-2"
            />
            <Pressable onPress={handleSaveGrade} className="bg-indigo-600 rounded-xl px-4 justify-center">
              <Text className="text-white text-sm font-semibold">Save</Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-slate-700 text-sm font-medium mb-2">Notes & flashcards</Text>
          <TextInput
            value={notesText}
            onChangeText={setNotesText}
            placeholder="Paste or type your notes..."
            placeholderTextColor="#64748b"
            multiline
            className="bg-stone-100 text-slate-900 rounded-xl p-3 min-h-[80px] mb-2"
          />
          <Pressable onPress={handleGenerateFlashcards} disabled={generatingCards} className="border-2 border-indigo-500 rounded-xl py-2 items-center mb-2">
            {generatingCards ? <ActivityIndicator color="#818cf8" /> : <Text className="text-indigo-700 text-sm font-medium">Generate flashcards</Text>}
          </Pressable>
          {flashcards?.cards?.length ? (
            <View className="gap-2">
              {flashcards.cards.map((card, i) => (
                <View key={i} className="bg-stone-100 rounded-lg p-3">
                  <Text className="text-slate-900 text-sm mb-1">{card.front}</Text>
                  <Text className="text-slate-500 text-xs">{card.back}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-slate-700 text-sm font-medium mb-2">New assignment</Text>
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Research paper, Chapter 6 reading..."
            placeholderTextColor="#64748b"
            className="bg-stone-100 text-slate-900 rounded-xl px-4 py-3 mb-2"
          />
          <View className="flex-row gap-2">
            <TextInput
              value={newDueDate}
              onChangeText={setNewDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#64748b"
              onSubmitEditing={handleAdd}
              className="flex-1 bg-stone-100 text-slate-900 rounded-xl px-4 py-3"
            />
            <Pressable onPress={handleAdd} className="bg-indigo-600 rounded-xl px-5 justify-center">
              <Text className="text-white font-semibold">Add</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-2">
          {courseAssignments.length === 0 && <Text className="text-slate-500 text-center mt-4">No assignments yet.</Text>}
          {courseAssignments.map((a) => (
            <Pressable key={a.id} onPress={() => router?.push?.(`/school/assignment/${a.id}`)} className="bg-white rounded-xl p-4 flex-row items-center justify-between">
              <Text className={a.isComplete ? 'text-slate-500 line-through flex-1' : 'text-slate-900 flex-1'}>{a.title}</Text>
              <Text className="text-slate-500 text-xs">{a.dueDate}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
