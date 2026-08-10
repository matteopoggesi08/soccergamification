import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * ATTENZIONE: bypassa completamente la RLS. Usare esclusivamente nelle
 * Server Action dell'Area Giocatore (features/player-area/), dopo aver
 * verificato manualmente il token contro player_tokens.
 * Non importare mai in un componente client.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
