import { Match } from "@/types";
import { TeamLogo } from "./TeamLogo";
import { Badge } from "@/components/ui/Badge";
import { cn, timeAgo } from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  className?: string;
}

export function MatchCard({ match, className }: MatchCardProps) {
  const isCompleted = match.status === "completed";
  const t1Wins = isCompleted && match.winnerId === match.team1.id;
  const t2Wins = isCompleted && match.winnerId === match.team2.id;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 bg-bg-card border border-white/10 rounded-xl hover:border-white/20 transition-colors",
        className
      )}
    >
      {/* Team 1 */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span
          className={cn(
            "font-heading font-semibold text-sm truncate",
            t1Wins ? "text-white" : "text-text-secondary"
          )}
        >
          {match.team1.name}
        </span>
        <TeamLogo logo={match.team1.logo} name={match.team1.name} size="sm" />
      </div>

      {/* Score */}
      <div className="flex flex-col items-center min-w-[80px]">
        <Badge status={match.status} pulse={match.status === "live"} />
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              "font-mono text-xl font-bold",
              t1Wins ? "text-white" : "text-text-secondary"
            )}
          >
            {match.score.team1}
          </span>
          <span className="text-text-muted text-sm">:</span>
          <span
            className={cn(
              "font-mono text-xl font-bold",
              t2Wins ? "text-white" : "text-text-secondary"
            )}
          >
            {match.score.team2}
          </span>
        </div>
        {match.map && (
          <span className="text-text-muted text-xs">{match.map}</span>
        )}
      </div>

      {/* Team 2 */}
      <div className="flex items-center gap-2 flex-1 justify-start">
        <TeamLogo logo={match.team2.logo} name={match.team2.name} size="sm" />
        <span
          className={cn(
            "font-heading font-semibold text-sm truncate",
            t2Wins ? "text-white" : "text-text-secondary"
          )}
        >
          {match.team2.name}
        </span>
      </div>

      {/* Time */}
      <span className="text-text-muted text-xs hidden md:block w-16 text-right">
        {timeAgo(match.scheduledTime)}
      </span>
    </div>
  );
}
