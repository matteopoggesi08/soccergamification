import type { createClient } from '@/lib/supabase/server';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type TrainingSummary = {
  id: string;
  session_date: string;
  title: string | null;
  session_type: 'allenamento' | 'partita';
  presences_count: number;
  absences_count: number;
  matches_count: number;
  avg_rpe: number | null;
};

export async function getTrainingsSummary(
  supabase: SupabaseServerClient,
  teamId: string
): Promise<TrainingSummary[]> {
  const { data, error } = await supabase.rpc('get_trainings_summary', { p_team_id: teamId });
  if (error) throw error;
  return data ?? [];
}
