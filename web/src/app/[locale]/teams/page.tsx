import { teams } from "@/lib/mock-data";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Teams" };

export default async function TeamsPage() {
  const t = await getTranslations("teams");
  const sorted = [...teams].sort((a, b) => a.rank - b.rank);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading font-bold text-4xl text-text-primary mb-8">
        {t("title")}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sorted.map((team) => {
          const wr = Math.round(
            (team.wins / (team.wins + team.losses + team.draws || 1)) * 100
          );
          return (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="flex items-center gap-4 p-5 bg-bg-card border border-border rounded-xl hover:border-accent-blue/40 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] transition-all duration-300 group"
            >
              <span className="font-mono text-text-muted text-sm w-6">
                #{team.rank}
              </span>
              <TeamLogo logo={team.logo} name={team.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-text-primary group-hover:text-accent-blue transition-colors truncate">
                  {team.name}
                </p>
                <p className="text-text-muted text-xs">
                  {team.region} · {team.wins}W {team.losses}L
                </p>
              </div>
              <div className="flex items-center gap-1 text-success text-xs font-mono">
                <TrendingUp size={12} />
                {wr}%
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
