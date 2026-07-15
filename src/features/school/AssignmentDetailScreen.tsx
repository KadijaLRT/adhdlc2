import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useAppStore, selectAssignments, selectEnergyLevel, selectIsOverwhelmed } from '@/store/index';
import { avivaBrain } from '@/core/ai/AvivaBrain';
import { spreadStepsAcrossDays, groupStepsByDate } from './spreadWorkload';
import { Heading } from '@/shared/components/Heading';

export default function AssignmentDetailScreen({ assignmentId }: { assignmentId: string }) {
  const assignments = useAppStore(selectAssignments);
  const energyLevel = useAppStore(selectEnergyLevel);
  const isOverwhelmed = useAppStore(selectIsOverwhelmed);
  const toggleAssignmentComplete = useAppStore((s) => s.toggleAssignmentComplete);
  const toggleAssignmentSubStep = useAppStore((s) => s.toggleAssignmentSubStep);
  const updateAssignment = useAppStore((s) => s.updateAssignment);
  const [breakingDown, setBreakingDown] = useState(false);

  const assignment = (assignments || []).find((a) => a.id === assignmentId);

  if (!assignment) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-slate-500 text-center">This assignment isn&apos;t here anymore.</Text>
      </View>
    );
  }

  const handleBreakDown = async () => {
    setBreakingDown(true);
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

    const decomposition = await avivaBrain.breakDownAssignment(assignment.title, {
      currentEnergyLevel: energyLevel,
      isOverwhelmed,
      timeOfDay,
    });

    if (decomposition) {
      const rawSteps = (decomposition.subSteps || []).map((s) => ({ id: s.id, title: s.title, isComplete: false }));
      const spreadSteps = spreadStepsAcrossDays(rawSteps, assignment.dueDate);
      await updateAssignment(assignment.id, {
        subSteps: spreadSteps,
        estimatedMinutes: decomposition.estimatedIdealMinutes,
      });
    }
    setBreakingDown(false);
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
      <View className="w-full max-w-md self-center">
        <Heading className="mb-1 mt-2">{assignment.title}</Heading>
        <Text className="text-slate-500 text-sm mb-6">Due {assignment.dueDate}</Text>

        <Pressable
          onPress={() => toggleAssignmentComplete(assignment.id)}
          className={assignment.isComplete ? 'bg-emerald-500 rounded-full py-4 mb-6' : 'bg-indigo-600 rounded-full py-4 mb-6 active:bg-indigo-500'}
        >
          <Text className={assignment.isComplete ? 'text-white text-center font-semibold' : 'text-white text-center font-semibold'}>
            {assignment.isComplete ? 'Marked done ✓' : 'Done'}
          </Text>
        </Pressable>

        {(assignment.subSteps?.length || 0) === 0 ? (
          <Pressable onPress={handleBreakDown} disabled={breakingDown} className="border-2 border-indigo-500 rounded-full py-4 mb-6 items-center">
            {breakingDown ? <ActivityIndicator color="#818cf8" /> : <Text className="text-indigo-700 font-semibold">Break this into steps</Text>}
          </Pressable>
        ) : (
          <View className="gap-4 mb-6">
            {groupStepsByDate(assignment.subSteps || []).map((group) => (
              <View key={group.date}>
                <Text className="text-slate-500 text-xs font-medium mb-2">
                  {group.date === new Date().toISOString().split('T')[0] ? 'Today' : group.date}
                </Text>
                <View className="gap-2">
                  {group.steps.map((step) => (
                    <Pressable key={step.id} onPress={() => toggleAssignmentSubStep(assignment.id, step.id)} className="bg-white rounded-xl p-4 flex-row items-center gap-3">
                      <View className={step.isComplete ? 'w-5 h-5 rounded-full bg-emerald-500 items-center justify-center' : 'w-5 h-5 rounded-full border-2 border-stone-300'}>
                        {step.isComplete && <Text className="text-white text-xs">✓</Text>}
                      </View>
                      <Text className={step.isComplete ? 'text-slate-500 line-through flex-1' : 'text-slate-900 flex-1'}>{step.title}</Text>
                    </Pressable>
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
