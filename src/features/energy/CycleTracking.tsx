import { useMemo } from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { useAppStore, selectCycleTrackingEnabled, selectCycleLogs, type CycleLogEntry } from '@/store/index';
import { getPeriodStartDates, getAverageCycleLength, getPredictedNextPeriod } from './cyclePredictions';
import AppleHealthImportCard from '@/features/settings/AppleHealthImportCard';

type Phase = CycleLogEntry['phase'];
const PHASE_OPTIONS: { phase: Phase; label: string }[] = [
  { phase: 'menstrual', label: 'Menstrual' }, { phase: 'follicular', label: 'Follicular' },
  { phase: 'ovulation', label: 'Ovulation' }, { phase: 'luteal', label: 'Luteal' }, { phase: 'unspecified', label: 'Not sure' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function CycleTracking() {
  const cycleTrackingEnabled = useAppStore(selectCycleTrackingEnabled);
  const setCycleTrackingEnabled = useAppStore((s) => s.setCycleTrackingEnabled);
  const cycleLogs = useAppStore(selectCycleLogs);
  const logCycleForToday = useAppStore((s) => s.logCycleForToday);
  const today = new Date().toISOString().split('T')[0];
  const todaysLog = (cycleLogs || []).find((l) => l.date === today);

  const periodStarts = useMemo(() => getPeriodStartDates(cycleLogs || []), [cycleLogs]);
  const averageCycleLength = useMemo(() => getAverageCycleLength(periodStarts), [periodStarts]);
  const predictedNext = useMemo(() => getPredictedNextPeriod(periodStarts, averageCycleLength), [periodStarts, averageCycleLength]);
  const lastPeriodStart = periodStarts[periodStarts.length - 1];

  return (
    <View className="gap-4">
      <View className="bg-white rounded-2xl p-5 w-full dark:bg-slate-900">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-slate-900 text-base font-semibold dark:text-slate-100">Cycle Tracking</Text>
          <Switch value={cycleTrackingEnabled} onValueChange={setCycleTrackingEnabled}
            trackColor={{ false: '#334155', true: '#4f46e5' }} thumbColor="#e2e8f0" />
        </View>
        <Text className="text-slate-500 text-xs mb-4">Optional. Off by default. Only you can see this.</Text>
        {cycleTrackingEnabled && (
          <View className="flex-row flex-wrap gap-2">
            {(PHASE_OPTIONS || []).map((option) => {
              const isActive = todaysLog?.phase === option.phase;
              return (
                <Pressable key={option.phase} onPress={() => logCycleForToday(option.phase)}
                  className={isActive ? 'bg-emerald-400/10 border-2 border-emerald-400 rounded-full py-2 px-4' : 'bg-stone-100 dark:bg-slate-800 border-2 border-transparent rounded-full py-2 px-4 active:border-stone-300'}>
                  <Text className={isActive ? 'text-emerald-700 dark:text-emerald-400 text-sm font-medium' : 'text-slate-700 dark:text-slate-300 text-sm font-medium'}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {cycleTrackingEnabled && periodStarts.length > 0 && (
        <View className="bg-white rounded-2xl p-5 w-full dark:bg-slate-900">
          <Text className="text-slate-900 dark:text-slate-100 text-base font-semibold mb-3">History & Estimate</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-500 text-sm">Periods logged</Text>
            <Text className="text-slate-800 dark:text-slate-200 text-sm font-medium">{periodStarts.length}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-500 text-sm">Last period started</Text>
            <Text className="text-slate-800 dark:text-slate-200 text-sm font-medium">{lastPeriodStart ? formatDate(lastPeriodStart) : '—'}</Text>
          </View>
          {averageCycleLength ? (
            <>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-500 text-sm">Average cycle length</Text>
                <Text className="text-slate-800 dark:text-slate-200 text-sm font-medium">{averageCycleLength} days</Text>
              </View>
              {predictedNext && (
                <View className="bg-indigo-600/10 rounded-xl p-3 mt-2">
                  <Text className="text-indigo-700 dark:text-indigo-300 text-sm font-medium">Next period estimate: {formatDate(predictedNext)}</Text>
                  <Text className="text-slate-500 text-xs mt-1">Based on your average cycle — an estimate, not a guarantee.</Text>
                </View>
              )}
            </>
          ) : (
            <Text className="text-slate-500 text-xs mt-1">Log or import one more period to see your average cycle length and an estimate for your next one.</Text>
          )}
        </View>
      )}

      {cycleTrackingEnabled && (
        <AppleHealthImportCard />
      )}
    </View>
  );
}
