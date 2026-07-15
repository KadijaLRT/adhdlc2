import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let cachedClient: SupabaseClient | null = null;

/**
 * Lazily constructs the Supabase client on first real use, rather than
 * at module-import time. This matters because Expo Router's static web
 * export prerenders every route in Node.js (no `window`), and eagerly
 * creating a client wired to AsyncStorage would try to touch
 * `window.localStorage` during that prerender pass and crash the build.
 * AsyncStorage itself is imported lazily too, for the same reason.
 */
async function getSupabaseClient(): Promise<SupabaseClient> {
  if (cachedClient) return cachedClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('supabase: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY missing. Check .env.');
  }

  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');

  cachedClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    }
  );
  return cachedClient;
}

/**
 * Best-effort cloud profile sync. The app never requires an account:
 * this checks for an existing session and returns quietly (no error
 * noise) if there isn't one. Local storage is always the source of
 * truth; this is purely an optional upgrade path.
 */
export async function syncProfileIfSignedIn(profile: {
  timezone: string; energyBaseline: string; stressThreshold: string; biggestHurdle: string;
}): Promise<void> {
  try {
    // Guards against any server-side/prerender execution context, not
    // just the eager-init case above — belt and suspenders.
    if (typeof window === 'undefined') return;

    const supabase = await getSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return; // no account yet — expected, not an error

    const { error } = await supabase.from('profiles').upsert(
      {
        user_id: userId,
        timezone: profile?.timezone || 'UTC',
        energy_baseline: profile?.energyBaseline || 'medium',
        stress_threshold: profile?.stressThreshold || 'medium',
        biggest_hurdle: profile?.biggestHurdle || '',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    if (error) console.error('supabase: profile sync failed', error);
  } catch (error) {
    console.error('supabase: unexpected sync error', error);
  }
}
