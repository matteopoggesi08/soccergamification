import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckSquare, Swords, Trophy, Activity, ChevronRight } from 'lucide-react';
import { getActiveTeam } from '@/lib/active-team';

const MODULES = [
  { href: 'presenze', label: 'Presenze', icon: CheckSquare, desc: 'Presenti e assenti' },
  { href: 'partitelle', label: 'Partitelle', icon: Swords, desc: 'Squadre, risultato, punti' },
  { href: 'tornei', label: 'Tornei', icon: Trophy, desc: 'Risultati o classifica finale' },
  { href: 'rpe', label: 'RPE e Carichi', icon: Activity, desc: 'Scala Borg 1-10' },
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
    .select('id, session_date, title')
    .eq('id', trainingId)
    .eq('team_id', activeTeam.id)
    .single();

  if (!training) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{training.title || 'Seduta'}</h2>
        <p className="text-sm text-muted-foreground">
          {new Date(training.session_date).toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      <div className="space-y-2">
        {MODULES.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={`/allenamenti/${trainingId}/${href}`}
            className="flex items-center gap-3 rounded-xl border bg-card p-4"
          >
            <Icon className="h-6 w-6 text-primary" />
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
