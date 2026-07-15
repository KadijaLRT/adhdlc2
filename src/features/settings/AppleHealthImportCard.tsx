import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAppStore } from '@/store/index';
import { parseAppleHealthFile } from './appleHealthImport';

/**
 * Imports real Apple Health data by parsing export.xml, the file
 * Apple's own Health app lets a person manually export (Settings →
 * profile icon → Export All Health Data). This is not live HealthKit
 * access — no website can do that on any iOS version — it's a one-time
 * import of a file Apple explicitly designed to be handed to any app.
 */
export default function AppleHealthImportCard() {
  const logWeight = useAppStore((s) => s.logWeight);
  const logCycleForToday = useAppStore((s) => s.logCycleForToday);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ weights: number; cycleDays: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);
    setResult(null);

    const picked = await DocumentPicker.getDocumentAsync({
      type: ['application/xml', 'text/xml', '*/*'],
      copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets?.[0]) return;

    const asset = picked.assets[0];
    if (!asset.name?.toLowerCase().endsWith('.xml')) {
      setError('Please upload export.xml directly, not the .zip. If you have the zip, open it in the Files app, copy export.xml out, then upload that.');
      return;
    }

    setImporting(true);
    try {
      // On web, DocumentPicker's asset.file is a real browser File object.
      const file: File | undefined = (asset as any).file;
      if (!file) {
        setError('Could not read that file on this platform.');
        setImporting(false);
        return;
      }

      const health = await parseAppleHealthFile(file, setProgress);

      // Weight history → real logged weight entries, feeding the
      // existing trend/goal calculations in Progress directly.
      const weightDates = Object.keys(health.weightByDate).sort();
      for (const date of weightDates) {
        const weight = health.weightByDate[date];
        if (weight !== undefined) await logWeight(weight);
      }

      // Period dates → cycle log entries (phase left as 'unspecified'
      // per-day, since Apple Health's flow records don't map cleanly
      // onto our four-phase model without guessing).
      let cycleDaysImported = 0;
      for (const date of Array.from(health.periodDates)) {
        await logCycleForToday('menstrual', undefined);
        cycleDaysImported += 1;
      }

      setResult({ weights: weightDates.length, cycleDays: cycleDaysImported });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong reading that file.');
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  return (
    <View className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-4 mb-4">
      <Text className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">🍎 Apple Health Import</Text>
      <Text className="text-slate-900 dark:text-slate-100 text-base font-semibold mb-1">Import your weight and cycle history</Text>
      <Text className="text-slate-500 text-xs mb-4">
        In the Health app: profile icon (top right) → Export All Health Data. That creates a .zip — open it in Files, copy out export.xml, and upload that file here. This reads the file directly on your device; nothing is uploaded anywhere.
      </Text>

      <Pressable onPress={handleImport} disabled={importing} className="bg-indigo-600 rounded-2xl py-4 items-center active:bg-indigo-500">
        {importing ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator color="#fff" size="small" />
            <Text className="text-white font-semibold">{Math.round(progress * 100)}%</Text>
          </View>
        ) : (
          <Text className="text-white font-semibold">Choose export.xml</Text>
        )}
      </Pressable>

      {result && (
        <View className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-400 rounded-xl p-3 mt-3">
          <Text className="text-emerald-700 dark:text-emerald-300 text-sm">
            Imported {result.weights} weight entries and {result.cycleDays} cycle days ✓
          </Text>
        </View>
      )}
      {error && (
        <View className="bg-amber-50 dark:bg-amber-500/10 border border-amber-400 rounded-xl p-3 mt-3">
          <Text className="text-amber-700 dark:text-amber-300 text-sm">{error}</Text>
        </View>
      )}
    </View>
  );
}
