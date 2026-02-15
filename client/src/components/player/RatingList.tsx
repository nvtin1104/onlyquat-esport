import Image from 'next/image';
import type { Rating } from '@/types';
import { formatRating } from '@/lib/utils';

interface RatingListProps {
  ratings: Rating[];
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function RatingList({ ratings }: RatingListProps) {
  if (ratings.length === 0) {
    return (
      <div className="bg-bg-elevated border border-border-subtle rounded-sm p-8 text-center">
        <p className="font-mono text-sm text-text-dim">Chưa có đánh giá nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ratings.map((rating) => (
        <article
          key={rating.id}
          className="bg-bg-surface border border-border-subtle rounded-sm p-4 space-y-2"
        >
          {/* Header row */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-bg-elevated shrink-0 border border-border-subtle">
              {rating.userAvatar ? (
                <Image
                  src={rating.userAvatar}
                  alt={rating.userName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex items-center justify-center w-full h-full font-mono text-xs text-text-dim uppercase">
                  {rating.userName.charAt(0)}
                </span>
              )}
            </div>

            {/* Name + date */}
            <div className="flex-1 min-w-0">
              <span className="font-body text-sm font-semibold text-text-primary block truncate">
                {rating.userName}
              </span>
              <span className="font-mono text-[10px] text-text-dim">
                {formatDate(rating.createdAt)}
              </span>
            </div>

            {/* Overall score */}
            <div className="shrink-0 flex items-center gap-1">
              <span className="font-mono font-bold text-base text-accent-acid">
                {formatRating(rating.overall)}
              </span>
              <span className="font-mono text-[10px] text-text-dim">/10</span>
            </div>
          </div>

          {/* Comment */}
          {rating.comment && (
            <p className="font-body text-sm text-text-secondary leading-relaxed pl-11">
              {rating.comment}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
