import { cn } from '@/lib/utils';

interface GameVars {
  color: string;
  dim: string;
  border: string;
}

const GAME_VARS: Record<string, GameVars> = {
  LoL: {
    color: 'var(--color-game-lol)',
    dim: 'var(--color-game-lol-dim)',
    border: 'var(--color-game-lol-border)',
  },
  VAL: {
    color: 'var(--color-game-val)',
    dim: 'var(--color-game-val-dim)',
    border: 'var(--color-game-val-border)',
  },
  CS2: {
    color: 'var(--color-game-cs2)',
    dim: 'var(--color-game-cs2-dim)',
    border: 'var(--color-game-cs2-border)',
  },
  Dota2: {
    color: 'var(--color-game-dota2)',
    dim: 'var(--color-game-dota2-dim)',
    border: 'var(--color-game-dota2-border)',
  },
};

const fallbackVars: GameVars = {
  color: 'var(--color-game-default)',
  dim: 'var(--color-game-default-dim)',
  border: 'var(--color-game-default-border)',
};

interface GameBadgeProps {
  game: string;
  className?: string;
}

export function GameBadge({ game, className }: GameBadgeProps) {
  const vars = GAME_VARS[game] ?? fallbackVars;

  return (
    <span
      className={cn('font-mono text-[10px] uppercase px-2 py-0.5 rounded-full', className)}
      style={{
        backgroundColor: vars.dim,
        color: vars.color,
        border: `1px solid ${vars.border}`,
      }}
    >
      {game}
    </span>
  );
}
