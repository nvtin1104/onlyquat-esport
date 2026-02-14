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
import { Users, Trophy, ArrowRight } from "lucide-react";

interface TournamentsSectionProps {
  tournaments: Tournament[];
}

const TAB_STATUS_MAP: Record<string, TournamentStatus[]> = {
  live: ["ongoing"],
  upcoming: ["upcoming"],
  completed: ["completed", "cancelled"],
};

export function TournamentsSection({
  tournaments,
}: TournamentsSectionProps) {
  const t = useTranslations("tournaments");
  const [activeTab, setActiveTab] = useState("live");

  const tabs = [
    {
      id: "live",
      label: t("live"),
      icon: (
        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse-live" />
      ),
    },
    { id: "upcoming", label: t("upcoming") },
    { id: "completed", label: t("completed") },
  ];

  const filtered = tournaments.filter((tournament) =>
    TAB_STATUS_MAP[activeTab]?.includes(tournament.status)
  );

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="font-heading font-bold text-3xl text-text-primary">
          {t("title")}
        </h2>
        <Link
          href="/tournaments"
          className="text-accent-blue text-sm flex items-center gap-1 hover:gap-2 transition-all"
        >
          {t("viewAll")} <ArrowRight size={14} />
        </Link>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        defaultTab="live"
        onChange={setActiveTab}
        className="mb-8 max-w-sm"
      />

      {/* Grid */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filtered.length === 0 && (
          <p className="text-text-muted col-span-3 py-12 text-center">
            No tournaments in this category.
          </p>
        )}
        {filtered.map((tournament, i) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={`/tournaments/${tournament.id}`}>
              <Card hover glow="cyan" className="overflow-hidden group">
                {/* Banner */}
                <div className="aspect-video bg-bg-secondary relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-card to-transparent z-10" />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl font-heading font-black text-text-primary/10 select-none">
                    {tournament.game.toUpperCase()}
                  </div>
                  <div className="absolute top-3 left-3 z-20">
                    <Badge
                      status={tournament.status}
                      pulse={tournament.status === "ongoing"}
                    />
                  </div>
                  <div className="absolute top-3 right-3 z-20 text-xs font-mono text-text-secondary bg-bg-primary/60 backdrop-blur-sm px-2 py-1 rounded">
                    {tournament.game}
                  </div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-text-primary mb-3 group-hover:text-accent-blue transition-colors line-clamp-1">
                    {tournament.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <Trophy size={14} className="text-warning" />
                      {formatPrizePool(
                        tournament.prizePool,
                        tournament.prizeCurrency
                      )}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-accent-blue" />
                      {tournament.teams} {t("teams")}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
