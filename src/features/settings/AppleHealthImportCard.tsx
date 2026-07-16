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
  const importWeightEntries = useAppStore((s) => s.importWeightEntries);
  const importCycleLogs = useAppStore((s) => s.importCycleLogs);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ weights: number; cycleDays: number; ovulationDays: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Everything lives inside this try/catch, including the file-picker
  // call itself — that call previously sat outside any try/catch, so
  // if it ever threw (a real possibility across different mobile
  // browsers' file-picker implementations), it was a genuine unhandled
  // crash rather than a message shown in the card.
  const handleImport = async () => {
    setError(null);
    setResult(null);
    setImporting(true);

    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (picked.canceled || !picked.assets?.[0]) {
        setImporting(false);
        return;
      }

      const asset = picked.assets[0];
      if (!asset.name?.toLowerCase().endsWith('.xml')) {
        setError('Please upload export.xml directly, not the .zip. If you have the zip, open it in the Files app, copy export.xml out, then upload that.');
        setImporting(false);
        return;
      }

      // On web, DocumentPicker's asset.file is a real browser File object.
      const file: File | undefined = (asset as any)?.file;
      if (!file) {
        setError('Could not read that file on this platform.');
        setImporting(false);
        return;
      }

      const health = await parseAppleHealthFile(file, setProgress);

      // Weight and cycle history import as one batch each — real dates
      // preserved, one storage write per domain instead of one per
      // entry, which matters a lot on a real export with months or
      // years of records.
      const weightEntries = Object.entries(health.weightByDate || {}).map(([date, weightLbs]) => ({ date, weightLbs }));
      await importWeightEntries(weightEntries);

      const cycleEntries = [
        ...Array.from(health.periodDates || []).map((date) => ({ date, phase: 'menstrual' as const })),
        ...Array.from(health.ovulationDates || []).map((date) => ({ date, phase: 'ovulation' as const })),
      ];
      await importCycleLogs(cycleEntries);

      setResult({
        weights: weightEntries.length,
        cycleDays: health.periodDates?.size || 0,
        ovulationDays: health.ovulationDates?.size || 0,
      });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong reading that file. Try again, or make sure it\'s the export.xml file itself.');
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
            Imported {result.weights} weight entries, {result.cycleDays} period days, and {result.ovulationDays} ovulation days ✓
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
