import { SafeAreaView } from 'react-native-safe-area-context';
import ExerciseBrowser from '@/features/workout/ExerciseBrowser';

export default function WorkoutsRoute() {
  return <SafeAreaView className="flex-1 bg-slate-950"><ExerciseBrowser /></SafeAreaView>;
}
