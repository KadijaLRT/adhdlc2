import { SafeAreaView } from 'react-native-safe-area-context';
import ProgramsScreen from '@/features/workout/ProgramsScreen';

export default function ProgramsRoute() {
  return <SafeAreaView className="flex-1 bg-slate-950"><ProgramsScreen /></SafeAreaView>;
}
