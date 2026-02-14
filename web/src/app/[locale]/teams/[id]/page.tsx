import { notFound } from "next/navigation";
import { teams } from "@/lib/mock-data";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { Shield, Trophy, Users } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return teams.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const team = teams.find((t) => t.id === id);
  return { title: team?.name ?? "Team" };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const team = teams.find((t) => t.id === id);
  if (!team) notFound();
  const wr = Math.round(
    (team.wins / (team.wins + team.losses + team.draws || 1)) * 100
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-10 p-6 bg-bg-card border border-white/10 rounded-2xl">
        <TeamLogo logo={team.logo} name={team.name} size="lg" />
        <div className="flex-1">
          <p className="text-text-muted text-sm font-mono mb-1">
            {team.tag} · {team.region} · {team.country}
          </p>
          <h1 className="font-heading font-bold text-4xl text-white">
            {team.name}
          </h1>
        </div>
        <div className="flex gap-8">
          {(
            [
              {
                label: "Wins",
                value: team.wins,
                icon: Trophy,
                color: "text-success",
              },
              {
                label: "Losses",
                value: team.losses,
                icon: Shield,
                color: "text-danger",
              },
              {
                label: "Win Rate",
                value: `${wr}%`,
                icon: Users,
                color: "text-accent-cyan",
              },
            ] as const
          ).map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center">
              <Icon size={16} className={`${color} mx-auto mb-1`} />
              <p className={`font-mono font-bold text-xl ${color}`}>{value}</p>
              <p className="text-text-muted text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roster */}
      <h2 className="font-heading font-bold text-2xl text-white mb-5">
        Roster
      </h2>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {team.players.map((player) => (
          <div
            key={player.id}
            className="flex flex-col items-center gap-3 p-4 bg-bg-card border border-white/10 rounded-xl hover:border-accent-cyan/30 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-bg-surface border border-white/10 flex items-center justify-center overflow-hidden">
              <span className="font-heading font-bold text-accent-cyan text-xl">
                {player.ign.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div className="text-center">
              <p className="font-heading font-semibold text-white text-sm">
                {player.ign}
              </p>
              <p className="text-text-muted text-xs">{player.realName}</p>
              <span className="mt-1 inline-block text-xs font-mono text-accent-purple px-2 py-0.5 rounded bg-accent-purple/10 border border-accent-purple/30">
                {player.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
