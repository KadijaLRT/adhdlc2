import { useLocalSearchParams } from 'expo-router';
import FocusSession from '@/features/focus/FocusSession';

export default function FocusSessionRoute() {
  const { taskTitle, durationMinutes } = useLocalSearchParams<{ taskTitle?: string; durationMinutes?: string }>();
  return <FocusSession taskTitle={taskTitle || null} durationMinutes={Number(durationMinutes) || 15} />;
}
