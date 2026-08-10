import { revalidatePath } from 'next/cache';
import { getActiveTeam } from '@/lib/active-team';
import { createTournamentAction } from '@/actions/tournaments.actions';
import { TournamentMatchRow } from '@/components/trainings/tournament-match-row';
import { TournamentStandingRow } from '@/components/trainings/tournament-standing-row';
import { Button } from '@/components/ui/button';

export default async function TorneiPage({
  params,
}: {
  params: Promise<{ trainingId: string }>;
}) {
  const { trainingId } = await params;
  const { supabase } = await getActiveTeam();

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name, mode')
    .eq('training_id', trainingId);

  const createAction = createTournamentAction.bind(null, trainingId);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tornei</h2>

      <form action={createAction} className="space-y-2 rounded-xl border bg-card p-3">
        <input name="name" placeholder="Nome torneo" className="h-10 w-full rounded-lg border px-2 text-sm" />
        <input
          name="teamNames"
          placeholder="Squadre separate da virgola (es. Rossi, Blu, Verdi)"
          className="h-10 w-full rounded-lg border px-2 text-sm"
        />
        <select name="mode" className="h-10 w-full rounded-lg border px-2 text-sm">
          <option value="risultati">Inserimento risultati</option>
          <option value="classifica">Inserimento classifica finale</option>
        </select>
        <Button type="submit">Crea torneo</Button>
      </form>

      {(tournaments ?? []).map((t) => (
        <TournamentBlock key={t.id} tournamentId={t.id} trainingId={trainingId} mode={t.mode} name={t.name} />
      ))}
    </div>
  );
}

async function TournamentBlock({
  tournamentId,
  trainingId,
  mode,
  name,
}: {
  tournamentId: string;
  trainingId: string;
  mode: string;
  name: string;
}) {
  const { supabase } = await getActiveTeam();
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select('id, name')
    .eq('tournament_id', tournamentId);

  if (mode === 'classifica') {
    const { data: standings } = await supabase
      .from('tournament_standing_entries')
      .select('tournament_team_id, final_position, points')
      .eq('tournament_id', tournamentId);

    const byTeam = new Map((standings ?? []).map((s) => [s.tournament_team_id, s]));

    return (
      <div className="rounded-xl border bg-card p-3">
        <p className="mb-2 font-medium">{name}</p>
        {(teams ?? []).map((t) => (
          <TournamentStandingRow
            key={t.id}
            tournamentId={tournamentId}
            trainingId={trainingId}
            tournamentTeamId={t.id}
            teamName={t.name}
            initialPosition={byTeam.get(t.id)?.final_position}
            initialPoints={byTeam.get(t.id)?.points}
          />
        ))}
      </div>
    );
  }

  // modalità risultati: tutte le combinazioni round-robin come esempio,
  // il mister può cancellare quelle non giocate direttamente da Supabase
  // Studio o estendere con un pulsante "aggiungi partita" (v2)
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select('id, team_a_id, team_b_id, score_a, score_b')
    .eq('tournament_id', tournamentId);

  const teamName = (id: string) => teams?.find((t) => t.id === id)?.name ?? '?';

  return (
    <div className="rounded-xl border bg-card p-3">
      <p className="mb-2 font-medium">{name}</p>
      {(matches ?? []).length === 0 && (
        <CreateRoundRobinForm tournamentId={tournamentId} trainingId={trainingId} teams={teams ?? []} />
      )}
      {(matches ?? []).map((m) => (
        <TournamentMatchRow
          key={m.id}
          matchId={m.id}
          trainingId={trainingId}
          teamAName={teamName(m.team_a_id)}
          teamBName={teamName(m.team_b_id)}
          initialScoreA={m.score_a}
          initialScoreB={m.score_b}
        />
      ))}
    </div>
  );
}

async function CreateRoundRobinForm({
  tournamentId,
  trainingId,
  teams,
}: {
  tournamentId: string;
  trainingId: string;
  teams: { id: string; name: string }[];
}) {
  async function generate() {
    'use server';
    const { supabase } = await getActiveTeam();
    const pairs: { team_a_id: string; team_b_id: string; tournament_id: string }[] = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        pairs.push({ tournament_id: tournamentId, team_a_id: teams[i].id, team_b_id: teams[j].id });
      }
    }
    if (pairs.length > 0) await supabase.from('tournament_matches').insert(pairs);
    revalidatePath(`/allenamenti/${trainingId}/tornei`);
  }

  return (
    <form action={generate}>
      <Button type="submit" variant="outline">
        Genera partite (girone all&apos;italiana)
      </Button>
    </form>
  );
}
