'use client';

import { useTransition } from 'react';
import { setAttendanceAction } from '@/actions/attendances.actions';
import { cn } from '@/lib/utils';

type Props = {
  trainingId: string;
  playerId: string;
  playerName: string;
  initialStatus: 'presente' | 'assente' | null;
};

export function AttendanceToggle({ trainingId, playerId, playerName, initialStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  function set(status: 'presente' | 'assente') {
    startTransition(() => setAttendanceAction(trainingId, playerId, status));
  }

  return (
    <div className="flex items-center justify-between rounded-xl border bg-card p-3">
      <span className="font-medium">{playerName}</span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => set('presente')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium',
            initialStatus === 'presente'
              ? 'bg-green-600 text-white'
              : 'bg-muted text-muted-foreground'
          )}
        >
          Presente
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => set('assente')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium',
            initialStatus === 'assente'
              ? 'bg-destructive text-white'
              : 'bg-muted text-muted-foreground'
          )}
        >
          Assente
        </button>
      </div>
    </div>
  );
}
