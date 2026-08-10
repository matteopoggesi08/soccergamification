import { getActiveTeam } from '@/lib/active-team';
import { AttendanceToggle } from '@/components/trainings/attendance-toggle';

export default async function PresenzePage({
  params,
}: {
  params: Promise<{ trainingId: string }>;
}) {
  const { trainingId } = await params;
  const { supabase, activeTeam } = await getActiveTeam();

  const [{ data: players }, { data: attendances }] = await Promise.all([
    supabase.from('players').select('id, first_name, last_name').eq('team_id', activeTeam.id),
    supabase.from('attendances').select('player_id, status').eq('training_id', trainingId),
  ]);

  const statusByPlayer = new Map((attendances ?? []).map((a) => [a.player_id, a.status]));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Presenze</h2>
      <div className="space-y-2">
        {(players ?? []).map((p) => (
          <AttendanceToggle
            key={p.id}
            trainingId={trainingId}
            playerId={p.id}
            playerName={`${p.first_name} ${p.last_name}`}
            initialStatus={(statusByPlayer.get(p.id) as 'presente' | 'assente') ?? null}
          />
        ))}
      </div>
    </div>
  );
}
