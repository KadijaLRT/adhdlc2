import { useMemo, useState } from 'react';
import { View, Text, Switch, Pressable, ScrollView } from 'react-native';
import { useAppStore, selectWellnessPreferences, selectProfile } from '@/store/index';
import { CANNABIS_DISCLAIMER, CANNABIS_EFFECTS, CANNABIS_STRAINS_BY_TYPE, TERPENE_PROFILES, getRecommendedStrains } from '@/content/cannabisData';

type StrainType = 'sativa' | 'indica' | 'hybrid';
const MOOD_LABELS: Record<number, string> = { [-2]: '😞', [-1]: '😕', [0]: '😐', [1]: '🙂', [2]: '😄' };

function todayLocal(): string {
  return (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
}

export default function StrainMatcher() {
  const wellnessPreferences = useAppStore(selectWellnessPreferences);
  const setWellnessPreferences = useAppStore((s) => s.setWellnessPreferences);
  const profile = useAppStore(selectProfile);
  const logWeedSession = useAppStore((s) => s.logWeedSession);

  const [showLogForm, setShowLogForm] = useState(false);
  const [logType, setLogType] = useState<StrainType>('sativa');
  const [logStrain, setLogStrain] = useState('');
  const [logEffects, setLogEffects] = useState<string[]>([]);
  const [logMood, setLogMood] = useState(0);

  const adhdSymptoms = profile?.adhdSymptoms || [];
  const { strains, reasons } = useMemo(() => getRecommendedStrains(adhdSymptoms), [adhdSymptoms]);
  const weedLog = wellnessPreferences?.weedLog || [];
  const recentSessions = useMemo(() => [...weedLog].reverse().slice(0, 5), [weedLog]);

  const toggleEffect = (effect: string) => {
    setLogEffects((prev) => (prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]));
  };

  const handleLogSession = async () => {
    if (!logStrain) return;
    await logWeedSession({ date: todayLocal(), strain: logStrain, type: logType, effects: logEffects, mood: logMood });
    setShowLogForm(false);
    setLogStrain('');
    setLogEffects([]);
    setLogMood(0);
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
      <View className="w-full max-w-md self-center gap-4">
        <View className="bg-white rounded-2xl p-5 dark:bg-slate-900">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-slate-900 text-base font-semibold dark:text-slate-100">Strain Explorer</Text>
            <Switch value={wellnessPreferences?.cannabisModuleEnabled || false}
              onValueChange={(v) => setWellnessPreferences({ cannabisModuleEnabled: v })}
              trackColor={{ false: '#334155', true: '#4f46e5' }} thumbColor="#e2e8f0" />
          </View>
          <Text className="text-slate-500 text-xs">{CANNABIS_DISCLAIMER}</Text>
        </View>

        {wellnessPreferences?.cannabisModuleEnabled && (
          <>
            <View className="bg-white dark:bg-slate-900 rounded-2xl p-4">
              <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">Strains Matched to Your Profile</Text>
              {strains.length === 0 ? (
                <Text className="text-slate-500 text-xs">No strong matches yet — try any strain and log how it feels.</Text>
              ) : (
                <View className="gap-2 mb-3">
                  {strains.map((s) => (
                    <View key={s.strain} className="flex-row items-center justify-between bg-stone-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                      <Text className="text-slate-800 dark:text-slate-200 text-sm font-semibold">🌿 {s.strain}</Text>
                      <Text className="text-slate-500 text-xs capitalize">{s.terpenes.map((t) => TERPENE_PROFILES[t]?.label || t).join(', ')}</Text>
                    </View>
                  ))}
                </View>
              )}
              {reasons.length > 0 && (
                <View className="border-t border-stone-100 dark:border-slate-800 pt-3">
                  {reasons.map((reason, i) => (
                    <Text key={i} className="text-slate-500 text-xs mb-1">→ {reason}</Text>
                  ))}
                </View>
              )}
            </View>

            <Pressable onPress={() => setShowLogForm(!showLogForm)} className="bg-indigo-600 rounded-2xl py-3 items-center active:bg-indigo-500">
              <Text className="text-white text-sm font-semibold">{showLogForm ? 'Cancel' : '+ Log a session'}</Text>
            </Pressable>

            {showLogForm && (
              <View className="bg-white dark:bg-slate-900 rounded-2xl p-4">
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-2">Type</Text>
                <View className="flex-row gap-2 mb-4">
                  {(['sativa', 'hybrid', 'indica'] as StrainType[]).map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => { setLogType(t); setLogStrain(''); }}
                      className={logType === t ? 'flex-1 bg-emerald-400/10 border-2 border-emerald-400 rounded-full py-2 items-center' : 'flex-1 bg-stone-100 dark:bg-slate-800 border-2 border-transparent rounded-full py-2 items-center'}
                    >
                      <Text className={logType === t ? 'text-emerald-700 dark:text-emerald-400 text-xs font-medium capitalize' : 'text-slate-700 dark:text-slate-300 text-xs font-medium capitalize'}>{t}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-2">Strain</Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {CANNABIS_STRAINS_BY_TYPE[logType].map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => setLogStrain(logStrain === s ? '' : s)}
                      className={logStrain === s ? 'bg-emerald-400/10 border-2 border-emerald-400 rounded-full py-1.5 px-3' : 'bg-stone-100 dark:bg-slate-800 border-2 border-transparent rounded-full py-1.5 px-3'}
                    >
                      <Text className={logStrain === s ? 'text-emerald-700 dark:text-emerald-400 text-xs font-medium' : 'text-slate-700 dark:text-slate-300 text-xs font-medium'}>{s}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-2">Effects noticed</Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {CANNABIS_EFFECTS.map((effect) => {
                    const isActive = logEffects.includes(effect);
                    return (
                      <Pressable
                        key={effect}
                        onPress={() => toggleEffect(effect)}
                        className={isActive ? 'bg-indigo-600/20 border-2 border-indigo-400 rounded-full py-1.5 px-3' : 'bg-stone-100 dark:bg-slate-800 border-2 border-transparent rounded-full py-1.5 px-3'}
                      >
                        <Text className={isActive ? 'text-indigo-700 dark:text-indigo-300 text-xs' : 'text-slate-700 dark:text-slate-300 text-xs'}>{effect}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-2">Mood after</Text>
                <View className="flex-row gap-2 mb-5">
                  {[-2, -1, 0, 1, 2].map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => setLogMood(m)}
                      className={logMood === m ? 'flex-1 bg-emerald-400/10 border-2 border-emerald-400 rounded-xl py-2 items-center' : 'flex-1 bg-stone-100 dark:bg-slate-800 border-2 border-transparent rounded-xl py-2 items-center'}
                    >
                      <Text className="text-lg">{MOOD_LABELS[m]}</Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  onPress={handleLogSession}
                  disabled={!logStrain}
                  className={logStrain ? 'bg-emerald-500 rounded-xl py-3 items-center active:bg-emerald-400' : 'bg-slate-300 dark:bg-slate-700 rounded-xl py-3 items-center'}
                >
                  <Text className="text-white text-sm font-semibold">Save session</Text>
                </Pressable>
              </View>
            )}

            {recentSessions.length > 0 && (
              <View className="bg-white dark:bg-slate-900 rounded-2xl p-4">
                <Text className="text-slate-900 dark:text-slate-100 text-sm font-semibold mb-3">Recent sessions</Text>
                <View className="gap-2">
                  {recentSessions.map((session) => (
                    <View key={session.id} className="flex-row items-center justify-between bg-stone-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                      <View className="flex-1">
                        <Text className="text-slate-800 dark:text-slate-200 text-sm font-medium">{session.strain || 'Unnamed strain'}</Text>
                        <Text className="text-slate-500 text-xs">{session.date} · {session.type}{session.effects.length ? ` · ${session.effects.join(', ')}` : ''}</Text>
                      </View>
                      <Text className="text-lg">{MOOD_LABELS[session.mood] || '😐'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
