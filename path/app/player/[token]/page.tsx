import { notFound } from 'next/navigation';
import { getPlayerDataByToken } from '@/features/player-area/get-player-data';

export default async function PlayerAreaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getPlayerDataByToken(token);

  if (!data) notFound();

  const { player, standing, position, trainings, workload } = data;
  const latestWorkload = workload[workload.length - 1] as
    | { acwr: number | null; monotony: number | null }
    | undefined;

  return (
    <div className="min-h-dvh bg-background px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            {player.first_name} {player.last_name}
          </h1>
          <p className="text-sm text-muted-foreground">Area giocatore · sola lettura</p>
        </div>

        {standing && (
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-xl border bg-card p-3">
              <p className="text-2xl font-bold">{position}°</p>
              <p className="text-muted-foreground">Posizione</p>
            </div>
            <div className="rounded-xl border bg-card p-3">
              <p className="text-2xl font-bold">{standing.points}</p>
              <p className="text-muted-foreground">Punti</p>
            </div>
            <div className="rounded-xl border bg-card p-3">
              <p className="text-2xl font-bold">{standing.attendances_count}</p>
              <p className="text-muted-foreground">Presenze</p>
            </div>
          </div>
        )}

        {latestWorkload && (
          <div className="rounded-xl border bg-card p-3 text-sm">
            <p className="font-medium">Carico recente</p>
            <p className="text-muted-foreground">
              ACWR: {latestWorkload.acwr ?? '–'} · Monotonia: {latestWorkload.monotony ?? '–'}
            </p>
          </div>
        )}

        <div>
          <p className="mb-2 font-medium">Storico allenamenti</p>
          <div className="space-y-1.5">
            {trainings.map(
              (
                t: { status: string; trainings: { id: string; session_date: string; title: string | null } },
                i: number
              ) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
                >
                  <span>{t.trainings?.title || 'Seduta'}</span>
                  <span
                    className={t.status === 'presente' ? 'text-green-600' : 'text-destructive'}
                  >
                    {t.status === 'presente' ? 'Presente' : 'Assente'}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
