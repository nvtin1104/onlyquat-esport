import { cn } from '@/lib/utils';

const GAME_COLORS: Record<string, string> = {
  LoL: '#C89B3C',
  VAL: '#FF4654',
  CS2: '#DE9B35',
  Dota2: '#E05926',
};

interface GameBadgeProps {
  game: string;
  className?: string;
}

export function GameBadge({ game, className }: GameBadgeProps) {
  const color = GAME_COLORS[game] ?? '#6B7280';

  return (
    <span
      className={cn('font-mono text-[10px] uppercase px-2 py-0.5 rounded-full', className)}
      style={{
        backgroundColor: `${color}1A`,
        color,
        border: `1px solid ${color}4D`,
      }}
    >
      {game}
    </span>
  );
}
