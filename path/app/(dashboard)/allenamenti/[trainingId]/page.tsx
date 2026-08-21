import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckSquare, Swords, Trophy, Activity, Timer, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { getActiveTeam } from '@/lib/active-team';
import { updateTrainingAction, deleteTrainingAction } from '@/actions/trainings.actions';
import { Button } from '@/components/ui/button';

const MODULES = [
  { href: 'presenze', label: 'Presenze', icon: CheckSquare, desc: 'Presenti e assenti' },
  { href: 'partitelle', label: 'Partitelle', icon: Swords, desc: 'Squadre, risultato, punti' },
  { href: 'tornei', label: 'Tornei', icon: Trophy, desc: 'Risultati o classifica finale' },
  { href: 'rpe', label: 'RPE e Carichi', icon: Activity, desc: 'Scala Borg 1-10' },
  { href: 'minutaggi', label: 'Minutaggi', icon: Timer, desc: 'Minuti giocati da ciascuno' },
];

export default async function AllenamentoHubPage({
  params,
}: {
  params: Promise<{ trainingId: string }>;
}) {
  const { trainingId } = await params;
  const { supabase, activeTeam } = await getActiveTeam();

  const { data: training } = await supabase
    .from('trainings')
    .select('id, session_date, title, notes')
    .eq('id', trainingId)
    .eq('team_id', activeTeam.id)
    .single();

  if (!training) notFound();

  const updateAction = updateTrainingAction.bind(null, trainingId);
  const deleteAction = deleteTrainingAction.bind(null, trainingId);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{training.title || 'Seduta'}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(training.session_date).toLocaleDateString('it-IT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
      </div>

      <details className="group rounded-xl border bg-card p-3">
        <summary className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Pencil className="h-3.5 w-3.5" /> Modifica seduta
        </summary>
        <form action={updateAction} className="mt-3 space-y-2">
          <input
            name="title"
            defaultValue={training.title ?? ''}
            placeholder="Titolo (es. Seduta tecnica)"
            className="h-10 w-full rounded-lg border px-2 text-sm"
          />
          <input
            name="sessionDate"
            type="date"
            defaultValue={training.session_date}
            required
            className="h-10 w-full rounded-lg border px-2 text-sm"
          />
          <textarea
            name="notes"
            defaultValue={training.notes ?? ''}
            placeholder="Note sulla seduta (opzionale)"
            rows={2}
            className="w-full rounded-lg border px-2 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <Button type="submit" className="w-auto flex-1 px-4">
              Salva
            </Button>
          </div>
        </form>
        <form action={deleteAction} className="mt-2">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-destructive/30 py-2 text-sm text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Elimina seduta
          </button>
        </form>
      </details>

      <div className="space-y-2">
        {MODULES.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={`/allenamenti/${trainingId}/${href}`}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
