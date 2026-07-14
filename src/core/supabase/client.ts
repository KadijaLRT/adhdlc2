import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('supabase: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY missing. Check .env.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  }
);

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
