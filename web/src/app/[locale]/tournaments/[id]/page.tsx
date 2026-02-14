import { notFound } from "next/navigation";
import { tournaments, matches, teams } from "@/lib/mock-data";
import { Badge } from "@/components/ui/Badge";
import { MatchCard } from "@/components/shared/MatchCard";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { formatPrizePool } from "@/lib/utils";
import { Trophy, Users, Calendar } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return tournaments.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tournament = tournaments.find((t) => t.id === id);
  return { title: tournament?.name ?? "Tournament" };
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const tournament = tournaments.find((t) => t.id === id);
  if (!tournament) notFound();

  const tournamentMatches = matches.filter((m) => m.tournamentId === id);
  const tournamentTeams = teams.filter((t) =>
    tournament.teamIds.includes(t.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Badge
            status={tournament.status}
            pulse={tournament.status === "ongoing"}
          />
          <span className="text-text-muted text-sm font-mono">
            {tournament.game}
          </span>
        </div>
        <h1 className="font-heading font-bold text-4xl lg:text-5xl text-text-primary mb-3">
          {tournament.name}
        </h1>
        <p className="text-text-secondary max-w-2xl">
          {tournament.description}
        </p>
        {/* Stats row */}
        <div className="flex flex-wrap gap-6 mt-6">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-warning" />
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider">
                Prize Pool
              </p>
              <p className="font-mono font-bold text-text-primary">
                {formatPrizePool(tournament.prizePool, tournament.prizeCurrency)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users size={20} className="text-accent-blue" />
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider">
                Teams
              </p>
              <p className="font-mono font-bold text-text-primary">
                {tournament.teams}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-accent-purple" />
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider">
                Dates
              </p>
              <p className="font-mono text-text-primary text-sm">
                {new Date(tournament.startDate).toLocaleDateString()} –{" "}
                {new Date(tournament.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Matches */}
        <div className="lg:col-span-2">
          <h2 className="font-heading font-bold text-xl text-text-primary mb-4">
            Matches
          </h2>
          {tournamentMatches.length === 0 ? (
            <p className="text-text-muted">No matches scheduled yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {tournamentMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </div>
        {/* Teams */}
        <div>
          <h2 className="font-heading font-bold text-xl text-text-primary mb-4">
            Participating Teams
          </h2>
          <div className="flex flex-col gap-2">
            {tournamentTeams.map((team) => (
              <div
                key={team.id}
                className="flex items-center gap-3 p-3 bg-bg-card border border-border rounded-xl"
              >
                <TeamLogo logo={team.logo} name={team.name} size="sm" />
                <div>
                  <p className="font-heading font-semibold text-text-primary text-sm">
                    {team.name}
                  </p>
                  <p className="text-text-muted text-xs">{team.region}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
