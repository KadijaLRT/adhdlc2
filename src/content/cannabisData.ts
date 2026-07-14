// Terpene effect associations are based on preliminary, largely
// observational/preclinical research, not controlled human clinical
// trials. Educational and exploratory only — never dosing or medical
// advice, and this module never suggests amounts, methods, or timing.
export const CANNABIS_DISCLAIMER =
  'Preliminary, observational research only. Not medical advice, not a dosing guide. Always follow local law and consult a doctor for anything health-related.';

export const CANNABIS_EFFECTS = ['Focus', 'Relaxation', 'Sleep', 'Anxiety relief', 'Creativity', 'Appetite', 'Energy', 'Mood lift'];

export const TERPENE_PROFILES: Record<string, { label: string; effect: string }> = {
  pinene: { label: 'Pinene', effect: 'alertness, memory, focus' },
  limonene: { label: 'Limonene', effect: 'mood lift, stress reduction' },
  terpinolene: { label: 'Terpinolene', effect: 'uplifting, balanced energy' },
  myrcene: { label: 'Myrcene', effect: 'relaxation, sedation' },
  linalool: { label: 'Linalool', effect: 'calming, sleep support' },
  caryophyllene: { label: 'Caryophyllene', effect: 'anxiety relief, stress reduction' },
};

export const STRAIN_TERPENES: Record<string, string[]> = {
  'Jack Herer': ['terpinolene', 'pinene'], 'Blue Dream': ['myrcene', 'pinene'],
  'Granddaddy Purple': ['myrcene', 'caryophyllene'], 'Sour Diesel': ['limonene', 'myrcene'],
  'Northern Lights': ['myrcene', 'caryophyllene'], 'Green Crack': ['myrcene', 'limonene'],
};

export function getStrainsForEffect(effect: string): string[] {
  const target = (effect || '').toLowerCase();
  const map: Record<string, string[]> = {
    focus: ['pinene', 'terpinolene'], relaxation: ['myrcene', 'linalool'], sleep: ['myrcene', 'linalool'],
    'anxiety relief': ['linalool', 'caryophyllene'], creativity: ['terpinolene', 'limonene'],
    energy: ['terpinolene', 'limonene'], 'mood lift': ['limonene'],
  };
  const terpenes = map[target] || [];
  if (!terpenes.length) return [];
  return Object.entries(STRAIN_TERPENES || {})
    .filter(([, t]) => (t || []).some((x) => terpenes.includes(x)))
    .map(([strain]) => strain);
}
