"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Tournament, TournamentStatus } from "@/types";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatPrizePool } from "@/lib/utils";
import { Trophy, Users, Calendar } from "lucide-react";

const STATUS_GROUPS: Record<string, TournamentStatus[]> = {
  all: ["upcoming", "ongoing", "completed", "cancelled"],
  live: ["ongoing"],
  upcoming: ["upcoming"],
  completed: ["completed", "cancelled"],
};

interface Props {
  tournaments: Tournament[];
}

export function TournamentsFilterClient({ tournaments }: Props) {
  const t = useTranslations("tournaments");
  const [tab, setTab] = useState("all");
  const tabs = [
    { id: "all", label: "All" },
    {
      id: "live",
      label: t("live"),
      icon: (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-live" />
      ),
    },
    { id: "upcoming", label: t("upcoming") },
    { id: "completed", label: t("completed") },
  ];
  const filtered = tournaments.filter((tr) =>
    STATUS_GROUPS[tab]?.includes(tr.status)
  );
  return (
    <>
      <Tabs
        tabs={tabs}
        defaultTab="all"
        onChange={setTab}
        className="mb-8 max-w-lg"
      />
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.map((tournament) => (
          <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
            <Card hover glow="cyan" className="overflow-hidden group">
              <div className="aspect-video bg-bg-surface relative flex items-center justify-center">
                <div className="text-5xl font-heading font-black text-white/10 select-none">
                  {tournament.game}
                </div>
                <div className="absolute top-3 left-3">
                  <Badge
                    status={tournament.status}
                    pulse={tournament.status === "ongoing"}
                  />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-white mb-1 group-hover:text-accent-cyan transition-colors line-clamp-2">
                  {tournament.name}
                </h3>
                <p className="text-text-muted text-xs mb-4 line-clamp-2">
                  {tournament.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <Trophy size={14} className="text-warning" />
                    {formatPrizePool(
                      tournament.prizePool,
                      tournament.prizeCurrency
                    )}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-accent-cyan" />
                    {tournament.teams} {t("teams")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(tournament.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </motion.div>
    </>
  );
}
