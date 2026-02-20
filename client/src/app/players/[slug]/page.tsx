import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  getPlayerBySlug,
  getRatings,
  getGames,
  getTeamPlayers,
  getTeams,
  getPlayers,
} from '@/lib/mock';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { RatingNumber } from '@/components/ui/RatingNumber';
import { PlayerStats } from '@/components/player/PlayerStats';
import { RatingList } from '@/components/player/RatingList';
import { TrendLine } from '@/components/charts/TrendLine';
import { formatNumber, TIER_COLORS } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const players = await getPlayers();
  return players.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) {
    return { title: 'Tuyển thủ không tồn tại — ARCADE ARENA' };
  }
  return {
    title: `${player.displayName} — ARCADE ARENA`,
    description: `Xem thống kê, đánh giá và phân tích ${player.displayName} — tuyển thủ ${player.role}.`,
  };
}

export default async function PlayerProfilePage({ params }: Props) {
  const { slug } = await params;

  const player = await getPlayerBySlug(slug);
  if (!player) notFound();

  const [ratings, games, teams, teamPlayers] = await Promise.all([
    getRatings(player.id),
    getGames(),
    getTeams(),
    player.teamId ? getTeamPlayers(player.teamId) : Promise.resolve([]),
  ]);

  const gameMap = new Map(games.map((g) => [g.id, g]));
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const game = gameMap.get(player.gameId);
  const team = player.teamId ? teamMap.get(player.teamId) : undefined;
  const tierColor = TIER_COLORS[player.tier];

  // Teammates: same team, exclude current player
  const teammates = teamPlayers.filter((p) => p.id !== player.id);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-base">
        {/* ─── Profile Hero ──────────────────────────────────────────────── */}
        <section className="relative pt-16 overflow-hidden">
          {/* Banner / gradient bg */}
          <div className="absolute inset-0 h-80">
            {player.bannerUrl ? (
              <Image
                src={player.bannerUrl}
                alt=""
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at 60% 0%, ${tierColor}22 0%, transparent 65%), var(--bg-base)`,
                }}
              />
            )}
            {/* Gradient fade to bg-base */}
            <div className="absolute inset-0 bg-gradient-to-b from-bg-base/30 via-bg-base/55 to-bg-base" />
          </div>

          {/* Hero content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Avatar */}
              <div
                className="relative w-32 h-32 rounded-sm overflow-hidden border-2 shrink-0 shadow-lg"
                style={{ borderColor: tierColor }}
              >
                <Image
                  src={player.imageUrl}
                  alt={player.displayName}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0 space-y-2 pb-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge tier={player.tier} size="md" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim">
                    #{String(player.rank).padStart(2, '0')} BXH
                  </span>
                  {!player.isActive && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-accent-lava border border-accent-lava/30 bg-accent-lava/10 px-2 py-0.5 rounded-sm">
                      Inactive
                    </span>
                  )}
                </div>
                <h1 className="font-display font-bold text-3xl md:text-5xl text-text-primary leading-tight">
                  {player.displayName}
                </h1>
                {player.realName && (
                  <p className="font-body text-sm text-text-secondary">
                    {player.realName}
                  </p>
                )}
                <p className="font-mono text-xs uppercase tracking-wider text-text-dim">
                  {player.role}
                  {game ? ` · ${game.shortName}` : ''}
                  {` · ${player.nationality}`}
                </p>
              </div>

              {/* Rating badge */}
              <div className="shrink-0 text-right pb-1 space-y-1">
                <div className="flex items-baseline gap-1 justify-end">
                  <RatingNumber value={player.rating} size="lg" />
                  <span className="font-mono text-sm text-text-dim">/10</span>
                </div>
                <p className="font-mono text-xs text-text-dim">
                  {formatNumber(player.totalRatings)} đánh giá
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Body ──────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Main ──────────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-8">
              <PlayerStats stats={player.stats} />

              {/* Community Ratings */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-display font-bold text-xl text-text-primary">
                    Đánh giá cộng đồng
                  </h2>
                  {ratings.length > 0 && (
                    <span className="font-mono text-xs text-text-dim">
                      ({ratings.length})
                    </span>
                  )}
                </div>
                <RatingList ratings={ratings} />
              </section>
            </div>

            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <aside className="space-y-6">
              {/* Quick Info */}
              <div className="bg-bg-elevated border border-border-subtle rounded-sm p-5">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-acid mb-4">
                  Thông tin
                </h3>
                <dl className="space-y-3">
                  <InfoRow label="Game" value={game?.name ?? player.gameId} />
                  <InfoRow label="Role" value={player.role} />
                  <InfoRow
                    label="Team"
                    value={team ? `${team.name} [${team.tag}]` : '—'}
                  />
                  <InfoRow label="Region" value={player.nationality} />
                  <InfoRow
                    label="Rank"
                    value={`#${String(player.rank).padStart(2, '0')}`}
                  />
                  <InfoRow
                    label="Ratings"
                    value={formatNumber(player.totalRatings)}
                  />
                </dl>
              </div>

              {/* Trend */}
              <div className="bg-bg-elevated border border-border-subtle rounded-sm p-5">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-acid mb-3">
                  Rating Trend
                </h3>
                <TrendLine />
              </div>

              {/* Teammates */}
              {teammates.length > 0 && (
                <div className="bg-bg-elevated border border-border-subtle rounded-sm p-5">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-acid mb-4">
                    Đồng đội
                  </h3>
                  <div className="space-y-1">
                    {teammates.map((mate) => {
                      const mateGame = gameMap.get(mate.gameId);
                      return (
                        <Link
                          key={mate.id}
                          href={`/players/${mate.slug}`}
                          className="flex items-center gap-3 p-2 -mx-2 rounded-sm hover:bg-bg-surface transition-colors duration-200 group"
                        >
                          {/* Avatar */}
                          <div className="relative w-9 h-9 rounded-sm overflow-hidden shrink-0 bg-bg-surface border border-border-subtle">
                            <Image
                              src={mate.imageUrl}
                              alt={mate.displayName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm font-semibold text-text-primary group-hover:text-accent-acid transition-colors duration-200 truncate">
                              {mate.displayName}
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim truncate">
                              {mate.role}
                              {mateGame ? ` · ${mateGame.shortName}` : ''}
                            </p>
                          </div>
                          {/* Rating */}
                          <RatingNumber value={mate.rating} size="sm" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ─── InfoRow sub-component ───────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-text-dim shrink-0">
        {label}
      </dt>
      <dd className="font-body text-sm text-text-primary text-right truncate">
        {value}
      </dd>
    </div>
  );
}
