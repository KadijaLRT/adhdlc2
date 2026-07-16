import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, selectCourses, selectAssignments } from '@/store/index';
import { avivaBrain, type FlashcardSet } from '@/core/ai/AvivaBrain';
import { Heading } from '@/shared/components/Heading';

const COURSE_EMOJIS = ['📖', '🧮', '🧪', '🎨', '🌍', '💻'];

export default function CourseDetailScreen({ courseId }: { courseId: string }) {
  const router = useRouter();
  const courses = useAppStore(selectCourses);
  const assignments = useAppStore(selectAssignments);
  const addAssignment = useAppStore((s) => s.addAssignment);
  const updateCourse = useAppStore((s) => s.updateCourse);
  const removeCourse = useAppStore((s) => s.removeCourse);

  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [creditsInput, setCreditsInput] = useState('');
  const [notesText, setNotesText] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardSet | null>(null);
  const [generatingCards, setGeneratingCards] = useState(false);
  const [editingCourse, setEditingCourse] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emojiInput, setEmojiInput] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const course = (courses || []).find((c) => c.id === courseId);
  const courseAssignments = (assignments || []).filter((a) => a.courseId === courseId);

  const handleSaveGrade = () => {
    const grade = Number(gradeInput);
    const goal = Number(goalInput);
    const credits = Number(creditsInput);
    updateCourse(courseId, {
      currentGrade: gradeInput ? grade : course?.currentGrade,
      gradeGoal: goalInput ? goal : course?.gradeGoal,
      credits: creditsInput ? credits : course?.credits,
    });
  };

  const handleStartEditCourse = () => {
    setNameInput(course?.name || '');
    setEmojiInput(course?.emoji || COURSE_EMOJIS[0] || '📘');
    setEditingCourse(true);
  };

  const handleSaveCourseEdit = async () => {
    if (!nameInput.trim()) return;
    await updateCourse(courseId, { name: nameInput.trim(), emoji: emojiInput });
    setEditingCourse(false);
  };

  const handleDeleteCourse = async () => {
    await removeCourse(courseId);
    router?.replace?.('/school');
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
        {editingCourse ? (
          <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-6 mt-2">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-2">Emoji</Text>
            <View className="flex-row gap-2 mb-3">
              {COURSE_EMOJIS.map((emoji) => (
                <Pressable key={emoji} onPress={() => setEmojiInput(emoji)} className={emojiInput === emoji ? 'bg-indigo-600/30 rounded-lg p-2' : 'p-2'}>
                  <Text className="text-lg">{emoji}</Text>
                </Pressable>
              ))}
            </View>
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-2">Course name</Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Course name"
              placeholderTextColor="#64748b"
              className="bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 mb-3"
            />
            <View className="flex-row gap-2">
              <Pressable onPress={handleSaveCourseEdit} disabled={!nameInput.trim()} className={nameInput.trim() ? 'flex-1 bg-indigo-600 rounded-xl py-2.5 items-center active:bg-indigo-500' : 'flex-1 bg-slate-300 dark:bg-slate-700 rounded-xl py-2.5 items-center'}>
                <Text className="text-white text-sm font-semibold">Save</Text>
              </Pressable>
              <Pressable onPress={() => setEditingCourse(false)} className="flex-1 bg-stone-100 dark:bg-slate-800 rounded-xl py-2.5 items-center">
                <Text className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center justify-between mb-6 mt-2">
            <Heading>{course.emoji} {course.name}</Heading>
            <Pressable onPress={handleStartEditCourse} className="p-2">
              <Text className="text-indigo-500 text-sm">Edit</Text>
            </Pressable>
          </View>
        )}

        <View className="bg-white rounded-2xl p-4 mb-4 dark:bg-slate-900">
          <Text className="text-slate-700 text-sm font-medium mb-2 dark:text-slate-300">Grade</Text>
          {course.currentGrade !== undefined && course.gradeGoal !== undefined && (
            <Text className="text-slate-500 text-xs mb-2">
              Currently {course.currentGrade}% · goal {course.gradeGoal}%
              {course.currentGrade >= course.gradeGoal ? ' · on track' : ` · ${course.gradeGoal - course.currentGrade} points to go`}
              {course.credits !== undefined ? ` · ${course.credits} credits` : ''}
            </Text>
          )}
          <View className="flex-row gap-2 mb-2">
            <TextInput
              value={gradeInput}
              onChangeText={setGradeInput}
              placeholder="Current %"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              className="flex-1 bg-stone-100 text-slate-900 rounded-xl px-3 py-2 dark:text-slate-100 dark:bg-slate-800"
            />
            <TextInput
              value={goalInput}
              onChangeText={setGoalInput}
              placeholder="Goal %"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              className="flex-1 bg-stone-100 text-slate-900 rounded-xl px-3 py-2 dark:text-slate-100 dark:bg-slate-800"
            />
          </View>
          <View className="flex-row gap-2">
            <TextInput
              value={creditsInput}
              onChangeText={setCreditsInput}
              placeholder="Credit hours (for GPA)"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              className="flex-1 bg-stone-100 text-slate-900 rounded-xl px-3 py-2 dark:text-slate-100 dark:bg-slate-800"
            />
            <Pressable onPress={handleSaveGrade} className="bg-indigo-600 rounded-xl px-4 justify-center">
              <Text className="text-white text-sm font-semibold">Save</Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4 dark:bg-slate-900">
          <Text className="text-slate-700 text-sm font-medium mb-2 dark:text-slate-300">Notes & flashcards</Text>
          <TextInput
            value={notesText}
            onChangeText={setNotesText}
            placeholder="Paste or type your notes..."
            placeholderTextColor="#64748b"
            multiline
            className="bg-stone-100 text-slate-900 rounded-xl p-3 min-h-[80px] mb-2 dark:text-slate-100 dark:bg-slate-800"
          />
          <Pressable onPress={handleGenerateFlashcards} disabled={generatingCards} className="border-2 border-indigo-500 rounded-xl py-2 items-center mb-2">
            {generatingCards ? <ActivityIndicator color="#818cf8" /> : <Text className="text-indigo-700 text-sm font-medium dark:text-indigo-300">Generate flashcards</Text>}
          </Pressable>
          {flashcards?.cards?.length ? (
            <View className="gap-2">
              {flashcards.cards.map((card, i) => (
                <View key={i} className="bg-stone-100 rounded-lg p-3 dark:bg-slate-800">
                  <Text className="text-slate-900 text-sm mb-1 dark:text-slate-100">{card.front}</Text>
                  <Text className="text-slate-500 text-xs">{card.back}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4 dark:bg-slate-900">
          <Text className="text-slate-700 text-sm font-medium mb-2 dark:text-slate-300">New assignment</Text>
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Research paper, Chapter 6 reading..."
            placeholderTextColor="#64748b"
            className="bg-stone-100 text-slate-900 rounded-xl px-4 py-3 mb-2 dark:text-slate-100 dark:bg-slate-800"
          />
          <View className="flex-row gap-2">
            <TextInput
              value={newDueDate}
              onChangeText={setNewDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#64748b"
              onSubmitEditing={handleAdd}
              className="flex-1 bg-stone-100 text-slate-900 rounded-xl px-4 py-3 dark:text-slate-100 dark:bg-slate-800"
            />
            <Pressable onPress={handleAdd} className="bg-indigo-600 rounded-xl px-5 justify-center">
              <Text className="text-white font-semibold">Add</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-2 mb-8">
          {courseAssignments.length === 0 && <Text className="text-slate-500 text-center mt-4">No assignments yet.</Text>}
          {courseAssignments.map((a) => (
            <Pressable key={a.id} onPress={() => router?.push?.(`/school/assignment/${a.id}`)} className="bg-white rounded-xl p-4 flex-row items-center justify-between dark:bg-slate-900">
              <Text className={a.isComplete ? 'text-slate-500 line-through flex-1' : 'text-slate-900 flex-1'}>{a.title}</Text>
              <Text className="text-slate-500 text-xs">{a.dueDate}</Text>
            </Pressable>
          ))}
        </View>

        {confirmingDelete ? (
          <View className="border-2 border-red-400 bg-red-400/10 rounded-2xl p-4">
            <Text className="text-red-500 text-sm font-medium mb-3">
              Delete {course.name}? Its assignments will stay in your list but won't show under any course anymore.
            </Text>
            <View className="flex-row gap-2">
              <Pressable onPress={handleDeleteCourse} className="flex-1 bg-red-500 rounded-xl py-2.5 items-center active:bg-red-400">
                <Text className="text-white text-sm font-semibold">Delete course</Text>
              </Pressable>
              <Pressable onPress={() => setConfirmingDelete(false)} className="flex-1 bg-stone-100 dark:bg-slate-800 rounded-xl py-2.5 items-center">
                <Text className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setConfirmingDelete(true)} className="py-2">
            <Text className="text-red-500 text-center text-xs">Delete this course</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
