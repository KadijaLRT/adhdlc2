export type BloodType = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

// The blood type diet concept has not been supported by controlled
// research (e.g. a 2014 PLOS ONE systematic review found no evidence
// linking blood type to diet-response outcomes). Offered as an optional,
// belief-based wellness lens some users enjoy, never as clinical guidance.
export const BLOOD_TYPE_DISCLAIMER =
  'This is a traditional wellness framework, not clinically validated science. Some people enjoy following it anyway. It never overrides general nutrition guidance.';

export const BLOOD_TYPE_AFFINITIES: Record<BloodType, { avoid: string[]; beneficial: string[] }> = {
  'O+': { avoid: ['wheat', 'gluten', 'corn', 'kidney bean', 'lentil', 'peanut', 'dairy', 'oat'], beneficial: ['beef', 'lamb', 'fish', 'salmon', 'spinach', 'broccoli', 'kale', 'sweet potato', 'walnut', 'olive oil'] },
  'O-': { avoid: ['wheat', 'gluten', 'corn', 'kidney bean', 'lentil', 'peanut', 'dairy', 'oat'], beneficial: ['beef', 'lamb', 'fish', 'salmon', 'spinach', 'broccoli', 'kale', 'sweet potato', 'walnut', 'olive oil'] },
  'A+': { avoid: ['red meat', 'beef', 'pork', 'lamb', 'dairy', 'whole milk'], beneficial: ['tofu', 'fish', 'vegetables', 'fruits', 'legumes', 'whole grain', 'soy', 'olive oil', 'carrot', 'spinach'] },
  'A-': { avoid: ['red meat', 'beef', 'pork', 'lamb', 'dairy', 'whole milk'], beneficial: ['tofu', 'fish', 'vegetables', 'fruits', 'legumes', 'whole grain', 'soy', 'olive oil', 'carrot'] },
  'B+': { avoid: ['chicken', 'corn', 'lentil', 'peanut', 'sesame', 'buckwheat', 'wheat'], beneficial: ['lamb', 'rabbit', 'dairy', 'egg', 'leafy green', 'peppers', 'potato', 'oat', 'rice', 'ginger'] },
  'B-': { avoid: ['chicken', 'corn', 'lentil', 'peanut', 'sesame', 'buckwheat', 'wheat'], beneficial: ['lamb', 'dairy', 'egg', 'leafy green', 'peppers', 'potato', 'oat', 'rice'] },
  'AB+': { avoid: ['red meat', 'beef', 'pork', 'corn', 'buckwheat', 'sesame'], beneficial: ['tofu', 'fish', 'dairy', 'egg', 'broccoli', 'cauliflower', 'celery', 'oat', 'rice', 'olive oil', 'walnut'] },
  'AB-': { avoid: ['red meat', 'beef', 'pork', 'corn', 'buckwheat', 'sesame'], beneficial: ['tofu', 'fish', 'dairy', 'egg', 'broccoli', 'celery', 'oat', 'rice', 'olive oil', 'walnut'] },
};

export type BloodTypeAffinity = 'beneficial' | 'avoid' | 'neutral';

/**
 * Returns 'beneficial' | 'avoid' | 'neutral' for a Recipes-screen recipe
 * given a blood type, using soft keyword matching against the recipe's
 * name and ingredients. Reuses the same affinity data used for meal
 * suggestions elsewhere — one source of truth for both.
 */
export function getBloodTypeAffinity(
  recipe: { n: string; ing?: string[]; g?: string[] },
  bloodType: BloodType | null | undefined
): BloodTypeAffinity {
  if (!bloodType || !BLOOD_TYPE_AFFINITIES[bloodType]) return 'neutral';
  const { avoid, beneficial } = BLOOD_TYPE_AFFINITIES[bloodType];
  const haystack = [recipe.n, ...(recipe.ing || []), ...(recipe.g || [])].join(' ').toLowerCase();
  if (avoid.some((k) => haystack.includes(k))) return 'avoid';
  if (beneficial.some((k) => haystack.includes(k))) return 'beneficial';
  return 'neutral';
}
