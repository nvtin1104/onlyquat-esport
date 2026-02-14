"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Team } from "@/types";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { ArrowRight, TrendingUp } from "lucide-react";

interface TeamsSectionProps {
  teams: Team[];
}

const MEDAL = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];

export function TeamsSection({ teams }: TeamsSectionProps) {
  const t = useTranslations("teams");
  const top6 = [...teams].sort((a, b) => a.rank - b.rank).slice(0, 6);

  return (
    <section className="py-16 bg-bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading font-bold text-3xl text-white">
            {t("title")}
          </h2>
          <Link
            href="/teams"
            className="text-accent-cyan text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            {t("viewAll")} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {top6.map((team, i) => {
            const winRate = Math.round(
              (team.wins / (team.wins + team.losses + team.draws || 1)) * 100
            );
            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.04 }}
              >
                <Link
                  href={`/teams/${team.id}`}
                  className="flex flex-col items-center gap-3 p-4 bg-bg-card border border-white/10 rounded-xl hover:border-accent-cyan/40 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-text-muted text-xs font-mono">
                      {MEDAL[i] ?? `#${team.rank}`}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs text-success">
                      <TrendingUp size={10} />
                      {winRate}%
                    </span>
                  </div>
                  <TeamLogo logo={team.logo} name={team.name} size="lg" />
                  <div className="text-center">
                    <p className="font-heading font-bold text-white text-sm group-hover:text-accent-cyan transition-colors">
                      {team.tag}
                    </p>
                    <p className="text-text-muted text-xs">
                      {team.wins}W {team.losses}L
                    </p>
                  </div>
                  <span className="font-mono text-xs text-accent-cyan font-semibold">
                    {team.points} pts
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
