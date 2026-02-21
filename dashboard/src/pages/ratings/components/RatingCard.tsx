import { XCircle, CheckCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { StatBar } from '@/components/shared/StatBar';
import { cn, TIER_COLORS, getTierFromRating } from '@/lib/utils';
import type { AdminRating } from '@/types/admin';

interface RatingCardProps {
  rating: AdminRating;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  showActions?: boolean;
}

export function RatingCard({ rating, onApprove, onReject, showActions = true }: RatingCardProps) {
  const tier = getTierFromRating(rating.overall);
  const tierColor = TIER_COLORS[tier];

  return (
    <div className="bg-bg-card border border-border-subtle rounded-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            src={rating.userAvatar}
            alt={rating.userName}
            fallback={rating.userName}
            size="sm"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-body text-sm text-text-primary font-medium">
              {rating.userName}
            </span>
            <span className="text-text-dim text-xs">→</span>
            <span className="font-body text-sm text-text-primary font-semibold">
              {rating.playerName}
            </span>
            <span className="font-mono text-xs text-text-dim">
              ({rating.playerGame} · {rating.playerRole})
            </span>
          </div>
        </div>
        <span className="text-text-dim text-xs shrink-0">{rating.timeAgo}</span>
      </div>

      {/* Overall score */}
      <p
        className="font-mono font-bold text-2xl mt-3"
        style={{ color: tierColor }}
      >
        {rating.overall.toFixed(1)}
      </p>

      {/* Stat bars */}
      <div className="grid grid-cols-5 gap-4 mt-3">
        <StatBar label="Aim" value={rating.aim} />
        <StatBar label="IQ" value={rating.gameIq} />
        <StatBar label="Clutch" value={rating.clutch} />
        <StatBar label="Team" value={rating.teamplay} />
        <StatBar label="Con" value={rating.consistency} />
      </div>

      {/* Comment */}
      {rating.comment && (
        <div className="mt-3 bg-bg-elevated rounded p-3">
          <p className="text-sm text-text-secondary italic">"{rating.comment}"</p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className={cn('border-danger/50 text-danger hover:bg-danger/10 hover:border-danger')}
            onClick={() => onReject(rating.id)}
          >
            <XCircle className="w-3.5 h-3.5" />
            Tu choi
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApprove(rating.id)}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Duyet
          </Button>
        </div>
      )}
    </div>
  );
}
