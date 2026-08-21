import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { getActiveTeam } from '@/lib/active-team';

export default async function AllenamentiPage() {
  const { supabase, activeTeam } = await getActiveTeam();

  const { data: trainings } = await supabase
    .from('trainings')
    .select('id, session_date, title')
    .eq('team_id', activeTeam.id)
    .order('session_date', { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Allenamenti</h2>
        <Link
          href="/allenamenti/nuovo"
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          <PlusCircle className="h-4 w-4" /> Nuovo
        </Link>
      </div>

      {!trainings || trainings.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nessuna seduta registrata ancora.
        </p>
      ) : (
        <div className="space-y-2">
          {trainings.map((t) => (
            <Link
              key={t.id}
              href={`/allenamenti/${t.id}`}
              className="flex items-center justify-between rounded-xl border bg-card p-3"
            >
              <span className="font-medium">{t.title || 'Seduta'}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(t.session_date).toLocaleDateString('it-IT')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
