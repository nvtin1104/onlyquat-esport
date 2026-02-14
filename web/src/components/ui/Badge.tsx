import { cn } from "@/lib/utils";
import { TournamentStatus, MatchStatus } from "@/types";

type BadgeStatus = TournamentStatus | MatchStatus | "live";

const statusConfig: Record<string, { label: string; classes: string }> = {
  live: { label: "LIVE", classes: "bg-red-500/20 border-red-400/50 text-red-400" },
  ongoing: { label: "LIVE", classes: "bg-red-500/20 border-red-400/50 text-red-400" },
  upcoming: { label: "UPCOMING", classes: "bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan" },
  scheduled: { label: "SCHEDULED", classes: "bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan" },
  completed: { label: "ENDED", classes: "bg-white/10 border-white/20 text-text-secondary" },
  cancelled: { label: "CANCELLED", classes: "bg-warning/10 border-warning/30 text-warning" },
};

interface BadgeProps {
  status: BadgeStatus;
  pulse?: boolean;
  className?: string;
}

export function Badge({ status, pulse = false, className }: BadgeProps) {
  const cfg = statusConfig[status] ?? statusConfig.upcoming;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border",
        cfg.classes,
        className
      )}
    >
      {(status === "live" || status === "ongoing") && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full bg-red-400",
            pulse && "animate-pulse-live"
          )}
        />
      )}
      {cfg.label}
    </span>
  );
}
