import { View, Text, Pressable, Switch } from 'react-native';
import { useAppStore, selectCycleTrackingEnabled, selectCycleLogs, type CycleLogEntry } from '@/store/index';

type Phase = CycleLogEntry['phase'];
const PHASE_OPTIONS: { phase: Phase; label: string }[] = [
  { phase: 'menstrual', label: 'Menstrual' }, { phase: 'follicular', label: 'Follicular' },
  { phase: 'ovulation', label: 'Ovulation' }, { phase: 'luteal', label: 'Luteal' }, { phase: 'unspecified', label: 'Not sure' },
];

export default function CycleTracking() {
  const cycleTrackingEnabled = useAppStore(selectCycleTrackingEnabled);
  const setCycleTrackingEnabled = useAppStore((s) => s.setCycleTrackingEnabled);
  const cycleLogs = useAppStore(selectCycleLogs);
  const logCycleForToday = useAppStore((s) => s.logCycleForToday);
  const today = new Date().toISOString().split('T')[0];
  const todaysLog = (cycleLogs || []).find((l) => l.date === today);

  return (
    <View className="bg-slate-900 rounded-2xl p-5 w-full">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-slate-100 text-base font-semibold">Cycle Tracking</Text>
        <Switch value={cycleTrackingEnabled} onValueChange={setCycleTrackingEnabled}
          trackColor={{ false: '#334155', true: '#4f46e5' }} thumbColor="#e2e8f0" />
      </View>
      <Text className="text-slate-400 text-xs mb-4">Optional. Off by default. Only you can see this.</Text>
      {cycleTrackingEnabled && (
        <View className="flex-row flex-wrap gap-2">
          {(PHASE_OPTIONS || []).map((option) => {
            const isActive = todaysLog?.phase === option.phase;
            return (
              <Pressable key={option.phase} onPress={() => logCycleForToday(option.phase)}
                className={isActive ? 'bg-emerald-400/10 border-2 border-emerald-400 rounded-full py-2 px-4' : 'bg-slate-800 border-2 border-transparent rounded-full py-2 px-4 active:border-slate-600'}>
                <Text className={isActive ? 'text-emerald-300 text-sm font-medium' : 'text-slate-300 text-sm font-medium'}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
