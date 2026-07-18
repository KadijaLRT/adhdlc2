import { useLocalSearchParams } from 'expo-router';
import WorkoutDaySchedulePicker from '@/features/workout/WorkoutDaySchedulePicker';

export default function ScheduleDayRoute() {
  const { weekdayIndex } = useLocalSearchParams<{ weekdayIndex: string }>();
  return <WorkoutDaySchedulePicker weekdayIndex={Number(weekdayIndex) || 0} />;
}
