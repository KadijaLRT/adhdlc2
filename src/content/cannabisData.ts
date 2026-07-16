// Terpene effect associations are based on preliminary, largely
// observational/preclinical research, not controlled human clinical
// trials. Educational and exploratory only — never dosing or medical
// advice, and this module never suggests amounts, methods, or timing.
export const CANNABIS_DISCLAIMER =
  'Preliminary, observational research only. Not medical advice, not a dosing guide. Always follow local law and consult a doctor for anything health-related.';

export const CANNABIS_EFFECTS = ['Focus', 'Relaxation', 'Sleep', 'Anxiety relief', 'Pain relief', 'Creativity', 'Appetite', 'Energy', 'Social', 'Mood lift'];

export const CANNABIS_STRAINS_BY_TYPE: Record<'sativa' | 'hybrid' | 'indica', string[]> = {
  sativa: ['Jack Herer', 'Green Crack', 'Durban Poison', 'Super Silver Haze', 'Strawberry Cough', 'Lemon Haze', 'Sour Diesel', 'Ghost Train Haze'],
  hybrid: ['Blue Dream', 'OG Kush', 'Gelato', 'Wedding Cake', 'Girl Scout Cookies', 'Runtz', 'Pineapple Express', 'Trainwreck', 'White Widow'],
  indica: ['Granddaddy Purple', 'Northern Lights', 'Bubba Kush', 'Purple Punch', 'Ice Cream Cake', 'Zkittlez', 'Do-Si-Dos', 'Blueberry'],
};

export const TERPENE_PROFILES: Record<string, { label: string; effect: string }> = {
  pinene: { label: 'Pinene', effect: 'alertness, memory, focus' },
  limonene: { label: 'Limonene', effect: 'mood lift, stress reduction' },
  terpinolene: { label: 'Terpinolene', effect: 'uplifting, balanced energy' },
  myrcene: { label: 'Myrcene', effect: 'relaxation, sedation' },
  linalool: { label: 'Linalool', effect: 'calming, sleep support' },
  caryophyllene: { label: 'Caryophyllene', effect: 'anxiety relief, stress reduction' },
};

// Dominant terpenes per strain — published lab data plus
// consumer-reported dominants. Full list ported from the strain
// database (previously only 6 of these 25 strains were included).
export const STRAIN_TERPENES: Record<string, string[]> = {
  'Jack Herer': ['terpinolene', 'pinene'],
  'Green Crack': ['myrcene', 'limonene'],
  'Durban Poison': ['terpinolene', 'pinene'],
  'Super Silver Haze': ['terpinolene', 'caryophyllene'],
  'Strawberry Cough': ['myrcene', 'pinene'],
  'Lemon Haze': ['limonene', 'pinene'],
  'Sour Diesel': ['limonene', 'myrcene'],
  'Ghost Train Haze': ['terpinolene', 'limonene'],
  'Blue Dream': ['myrcene', 'pinene'],
  'OG Kush': ['limonene', 'myrcene'],
  'Gelato': ['limonene', 'caryophyllene'],
  'Wedding Cake': ['limonene', 'caryophyllene'],
  'Girl Scout Cookies': ['caryophyllene', 'limonene'],
  'Runtz': ['limonene', 'caryophyllene'],
  'Pineapple Express': ['caryophyllene', 'myrcene'],
  'Trainwreck': ['terpinolene', 'pinene'],
  'White Widow': ['myrcene', 'pinene'],
  'Granddaddy Purple': ['myrcene', 'caryophyllene'],
  'Northern Lights': ['myrcene', 'caryophyllene'],
  'Bubba Kush': ['myrcene', 'linalool'],
  'Purple Punch': ['myrcene', 'caryophyllene'],
  'Ice Cream Cake': ['linalool', 'caryophyllene'],
  'Zkittlez': ['linalool', 'myrcene'],
  'Do-Si-Dos': ['linalool', 'caryophyllene'],
  'Blueberry': ['myrcene', 'linalool'],
};

/**
 * Maps the person's stated ADHD symptoms (from onboarding) to which
 * terpenes are most relevant, with a cited reason for each. This is
 * the core of the personalization — it reads what someone actually
 * said shows up for them, not a generic profile. Symptom-flag names
 * differ slightly from the reference implementation this was ported
 * from (this app's onboarding uses `easily_distracted`,
 * `rejection_sensitivity`, etc.) but the terpene mapping and reasoning
 * are the same.
 */
export function getRecommendedTerpenes(adhdSymptoms: string[]): { terpenes: string[]; reasons: string[] } {
  const symptoms = new Set(adhdSymptoms || []);
  const wanted = new Set<string>();
  const reasons: string[] = [];

  const lowMotivation = symptoms.has('executive_dysfunction') || symptoms.has('procrastination');
  const inattention = symptoms.has('easily_distracted') || symptoms.has('forgetfulness');
  const hyperfocus = symptoms.has('hyperfocus');
  const anxiety = symptoms.has('emotional_dysregulation') || symptoms.has('rejection_sensitivity');
  const timeBlindness = symptoms.has('time_blindness');

  if (lowMotivation || inattention) {
    wanted.add('pinene'); wanted.add('terpinolene');
    reasons.push('Pinene and terpinolene are associated with alertness and sustained attention — relevant for motivation and focus.');
  }
  if (hyperfocus) {
    wanted.add('limonene');
    reasons.push('Limonene is associated with mood lift without heavy sedation — may suit hyperfocus without adding excess stimulation.');
  }
  if (anxiety) {
    wanted.add('caryophyllene'); wanted.add('linalool');
    reasons.push('Caryophyllene and linalool are associated with anxiety relief and calming effects.');
  }
  if (timeBlindness || symptoms.has('procrastination')) {
    wanted.add('pinene');
    reasons.push('Pinene is associated with mental clarity, which may help with task initiation.');
  }

  if (!wanted.size) {
    wanted.add('limonene'); wanted.add('pinene');
    reasons.push('A balanced, mood-supportive profile based on general focus and clarity research.');
  }

  return { terpenes: Array.from(wanted), reasons: Array.from(new Set(reasons)) };
}

export interface RecommendedStrain {
  strain: string;
  matchCount: number;
  terpenes: string[];
}

/** Ranks strains by how many of the person's recommended terpenes they contain, top 6. */
export function getRecommendedStrains(adhdSymptoms: string[]): { strains: RecommendedStrain[]; terpenes: string[]; reasons: string[] } {
  const { terpenes, reasons } = getRecommendedTerpenes(adhdSymptoms);
  const scored = Object.entries(STRAIN_TERPENES)
    .map(([strain, strainTerpenes]) => ({
      strain,
      matchCount: strainTerpenes.filter((t) => terpenes.includes(t)).length,
      terpenes: strainTerpenes,
    }))
    .filter((s) => s.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);
  return { strains: scored.slice(0, 6), terpenes, reasons };
}

export function getStrainsForEffect(effect: string): string[] {
  const target = (effect || '').toLowerCase();
  const map: Record<string, string[]> = {
    focus: ['pinene', 'terpinolene'], relaxation: ['myrcene', 'linalool'], sleep: ['myrcene', 'linalool'],
    'anxiety relief': ['linalool', 'caryophyllene'], 'pain relief': ['caryophyllene', 'myrcene'],
    creativity: ['terpinolene', 'limonene'], appetite: ['myrcene'],
    energy: ['terpinolene', 'limonene'], social: ['limonene', 'terpinolene'], 'mood lift': ['limonene'],
  };
  const terpenes = map[target] || [];
  if (!terpenes.length) return [];
  return Object.entries(STRAIN_TERPENES || {})
    .filter(([, t]) => (t || []).some((x) => terpenes.includes(x)))
    .map(([strain]) => strain);
}
