'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { updateTournamentMatchAction, deleteTournamentMatchAction } from '@/actions/tournaments.actions';

export function TournamentMatchRow({
  matchId,
  trainingId,
  teamAName,
  teamBName,
  initialScoreA,
  initialScoreB,
}: {
  matchId: string;
  trainingId: string;
  teamAName: string;
  teamBName: string;
  initialScoreA: number;
  initialScoreB: number;
}) {
  const [a, setA] = useState(initialScoreA);
  const [b, setB] = useState(initialScoreB);
  const [, startTransition] = useTransition();

  function save() {
    startTransition(() => updateTournamentMatchAction(matchId, trainingId, a, b));
  }

  return (
    <div className="flex items-center justify-center gap-2 py-1.5 text-sm">
      <span className="flex-1 truncate text-right">{teamAName}</span>
      <input
        type="number"
        value={a}
        onChange={(e) => setA(Number(e.target.value))}
        onBlur={save}
        className="h-8 w-12 rounded border text-center"
      />
      <span>–</span>
      <input
        type="number"
        value={b}
        onChange={(e) => setB(Number(e.target.value))}
        onBlur={save}
        className="h-8 w-12 rounded border text-center"
      />
      <span className="flex-1 truncate">{teamBName}</span>
      <button
        type="button"
        aria-label="Elimina partita"
        onClick={() => startTransition(() => deleteTournamentMatchAction(matchId, trainingId))}
        className="ml-1 text-muted-foreground"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
