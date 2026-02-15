import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getTeamBySlug, getTeams, getTeamPlayers, getGames } from '@/lib/mock';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PlayerGrid } from '@/components/player/PlayerGrid';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { formatRating, formatNumber } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const teams = await getTeams();
  return teams.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) {
    return { title: 'Team không tồn tại — ARCADE ARENA' };
  }
  return {
    title: `${team.name} [${team.tag}] — ARCADE ARENA`,
    description: `Xem đội hình và thống kê của ${team.name} — đội esport khu vực ${team.region}.`,
  };
}

export default async function TeamProfilePage({ params }: Props) {
  const { slug } = await params;

  const team = await getTeamBySlug(slug);
  if (!team) notFound();

  const [teamPlayers, games] = await Promise.all([
    getTeamPlayers(team.id),
    getGames(),
  ]);

  const gameMap = new Map(games.map((g) => [g.id, g]));

  const avgRating =
    teamPlayers.length > 0
      ? teamPlayers.reduce((sum, p) => sum + p.rating, 0) / teamPlayers.length
      : 0;

  const totalVotes = teamPlayers.reduce((sum, p) => sum + p.totalRatings, 0);

  // Group players by game
  const playersByGame = teamPlayers.reduce<Record<string, typeof teamPlayers>>(
    (acc, p) => {
      if (!acc[p.gameId]) acc[p.gameId] = [];
      acc[p.gameId].push(p);
      return acc;
    },
    {}
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-base">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative pt-16 overflow-hidden">
          {/* Gradient backdrop */}
          <div
            className="absolute inset-0 h-72"
            style={{
              background:
                'radial-gradient(ellipse at 50% -20%, rgba(204,255,0,0.12) 0%, transparent 60%), #121212',
            }}
          />
          <div className="absolute inset-0 h-72 bg-gradient-to-b from-transparent via-bg-base/60 to-bg-base" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              {/* Logo */}
              <div className="relative w-28 h-28 rounded-sm overflow-hidden border border-border-subtle bg-bg-surface shrink-0">
                <Image
                  src={team.logoUrl}
                  alt={team.name}
                  fill
                  priority
                  className="object-contain p-2"
                />
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1 pb-1">
                <p className="font-mono text-xs text-accent-acid font-bold tracking-widest">
                  [{team.tag}]
                </p>
                <h1 className="font-display font-bold text-3xl md:text-5xl text-text-primary leading-tight">
                  {team.name}
                </h1>
                <p className="font-mono text-xs uppercase tracking-wider text-text-dim">
                  Region: {team.region}
                </p>
              </div>

              {/* Quick stats */}
              <div className="flex gap-6 sm:gap-8 pb-1 shrink-0">
                <div className="text-center">
                  <div className="font-mono text-3xl font-bold text-accent-acid">
                    {teamPlayers.length}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-text-dim mt-0.5">
                    Tuyển thủ
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-3xl font-bold text-text-primary">
                    {avgRating > 0 ? formatRating(avgRating) : '—'}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-text-dim mt-0.5">
                    Rating TB
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-3xl font-bold text-text-primary">
                    {formatNumber(totalVotes)}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-text-dim mt-0.5">
                    Lượt vote
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Roster ────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {teamPlayers.length > 0 ? (
            <>
              <SectionHeader
                label="Đội hình"
                title="Roster"
                description={`${teamPlayers.length} tuyển thủ trong đội ${team.name}.`}
              />
              <PlayerGrid players={teamPlayers} showRank />
            </>
          ) : (
            <div className="text-center py-24">
              <p className="font-body text-text-secondary">
                Đội này chưa có tuyển thủ nào.
              </p>
            </div>
          )}

          {/* ── Game breakdown ─────────────────────────────────────────── */}
          {Object.keys(playersByGame).length > 1 && (
            <div className="mt-16">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim mb-6">
                Theo Game
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(playersByGame).map(([gameId, gamePlayers]) => {
                  const game = gameMap.get(gameId);
                  return (
                    <div
                      key={gameId}
                      className="bg-bg-elevated border border-border-subtle rounded-sm p-4 text-center"
                    >
                      <div className="font-mono text-2xl font-bold text-accent-acid">
                        {gamePlayers.length}
                      </div>
                      <div className="font-mono text-xs text-text-secondary mt-1">
                        {game?.shortName ?? gameId}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
