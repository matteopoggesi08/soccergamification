'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import {
  assignPlayerToMatchAction,
  updateMatchScoreAction,
  deleteMatchAction,
} from '@/actions/matches.actions';
import { cn } from '@/lib/utils';

type Player = { id: string; first_name: string; last_name: string };
type MatchPlayer = { player_id: string; team_side: 'A' | 'B' };
type Match = {
  id: string;
  team_a_name: string;
  team_b_name: string;
  score_a: number;
  score_b: number;
};

export function MatchCard({
  match,
  trainingId,
  players,
  matchPlayers,
}: {
  match: Match;
  trainingId: string;
  players: Player[];
  matchPlayers: MatchPlayer[];
}) {
  const [scoreA, setScoreA] = useState(match.score_a);
  const [scoreB, setScoreB] = useState(match.score_b);
  const [isPending, startTransition] = useTransition();

  const sideOf = (playerId: string) => matchPlayers.find((mp) => mp.player_id === playerId)?.team_side ?? null;

  function cycleSide(playerId: string) {
    const current = sideOf(playerId);
    const next = current === null ? 'A' : current === 'A' ? 'B' : null;
    startTransition(() => assignPlayerToMatchAction(match.id, trainingId, playerId, next));
  }

  function saveScore() {
    startTransition(() => updateMatchScoreAction(match.id, trainingId, scoreA, scoreB));
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center justify-center gap-2">
          <span className="flex-1 truncate text-right text-sm font-medium">{match.team_a_name}</span>
          <input
            type="number"
            value={scoreA}
            onChange={(e) => setScoreA(Number(e.target.value))}
            onBlur={saveScore}
            className="h-10 w-14 rounded-lg border text-center text-lg font-semibold"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            value={scoreB}
            onChange={(e) => setScoreB(Number(e.target.value))}
            onBlur={saveScore}
            className="h-10 w-14 rounded-lg border text-center text-lg font-semibold"
          />
          <span className="flex-1 truncate text-sm font-medium">{match.team_b_name}</span>
        </div>
        <form action={deleteMatchAction.bind(null, match.id, trainingId)}>
          <button type="submit" className="text-muted-foreground">
            <Trash2 className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {players.map((p) => {
          const side = sideOf(p.id);
          return (
            <button
              key={p.id}
              type="button"
              disabled={isPending}
              onClick={() => cycleSide(p.id)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium',
                side === 'A' && 'border-blue-600 bg-blue-600 text-white',
                side === 'B' && 'border-orange-600 bg-orange-600 text-white',
                side === null && 'text-muted-foreground'
              )}
            >
              {p.first_name}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Tocca un giocatore per assegnarlo: grigio → squadra A → squadra B → nessuna
      </p>
    </div>
  );
}
