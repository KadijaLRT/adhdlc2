import { z } from 'zod';
import { callGroqJSON } from '@/core/ai/simpleGroqCall';

const CourseSuggestionSchema = z.object({
  courses: z.array(z.object({
    name: z.string(),
    suggestedCredits: z.number().min(1).max(6),
  })).min(1),
});

export interface SuggestedCourse {
  name: string;
  suggestedCredits: number;
}

/**
 * Generates a realistic starter set of courses typical for a stated
 * program/major, from the model's general training knowledge — this is
 * NOT pulled from any specific university's actual live course catalog
 * (no app can browse a real registrar page at runtime without a
 * separate search integration this project doesn't have). Framed
 * honestly in the UI as a generated starting point to edit, not an
 * authoritative source. Optionally takes a university name to bias
 * tone/context, but the result is still general-knowledge, not
 * verified against that school specifically.
 */
export async function generateStarterCourses(program: string, universityName?: string): Promise<SuggestedCourse[] | null> {
  const result = await callGroqJSON(
    'You generate a realistic, typical first-semester or representative course list for a given ' +
    'college/university program, based on common general-education and major requirements. This is a ' +
    'general starting point, not tied to any specific real university\'s actual catalog. Keep it to 4-6 courses.',
    { program, universityName: universityName || undefined },
    CourseSuggestionSchema
  );
  return result?.courses || null;
}

/** Builds a search URL to the person's actual university's official catalog, for manual verification. */
export function buildOfficialCatalogSearchUrl(universityName: string, program: string): string {
  const query = `${universityName} ${program} course catalog requirements`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
