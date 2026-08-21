import Link from 'next/link';
import { PlusCircle, Users, Swords, Activity } from 'lucide-react';
import { getActiveTeam } from '@/lib/active-team';
import { getTrainingsSummary } from '@/services/trainings.service';
import { cn } from '@/lib/utils';

export default async function AllenamentiPage() {
  const { supabase, activeTeam } = await getActiveTeam();
  const trainings = await getTrainingsSummary(supabase, activeTeam.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sedute</h2>
        <Link
          href="/allenamenti/nuovo"
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          <PlusCircle className="h-4 w-4" /> Nuova
        </Link>
      </div>

      {trainings.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nessuna seduta registrata ancora.
        </p>
      ) : (
        <div className="space-y-2">
          {trainings.map((t) => {
            const isPartita = t.session_type === 'partita';
            return (
              <Link
                key={t.id}
                href={`/allenamenti/${t.id}`}
                className="block rounded-xl border bg-card p-3.5 transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t.title || 'Seduta'}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-medium',
                        isPartita ? 'bg-orange-500/15 text-orange-600' : 'bg-primary/10 text-primary'
                      )}
                    >
                      {isPartita ? 'Partita' : 'Allenamento'}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(t.session_date).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {t.presences_count} presenti
                    {t.absences_count > 0 ? ` · ${t.absences_count} assenti` : ''}
                  </span>
                  {t.matches_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Swords className="h-3.5 w-3.5" />
                      {t.matches_count} partitell{t.matches_count === 1 ? 'a' : 'e'}
                    </span>
                  )}
                  {t.avg_rpe != null && (
                    <span className="flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5" />
                      RPE medio {t.avg_rpe}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
