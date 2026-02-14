import {
  teams,
  tournaments,
  matches,
  articles,
  minigames,
  standings,
} from "@/lib/mock-data";
import { HeroSection } from "@/components/home/HeroSection";
import { TournamentsSection } from "@/components/home/TournamentsSection";
import { TeamsSection } from "@/components/home/TeamsSection";
import { MatchHistorySection } from "@/components/home/MatchHistorySection";
import { ScoringsSection } from "@/components/home/ScoringsSection";
import { NewsSection } from "@/components/home/NewsSection";
import { MinigamesSection } from "@/components/home/MinigamesSection";

export default async function HomePage() {
  const liveMatch = matches.find((m) => m.status === "live") ?? matches[0];
  const recentMatches = matches
    .filter((m) => m.status !== "scheduled")
    .slice(0, 6);
  const latestNews = articles.slice(0, 6);

  return (
    <>
      <HeroSection liveMatch={liveMatch} />
      <TournamentsSection tournaments={tournaments} />
      <TeamsSection teams={teams} />
      <MatchHistorySection matches={recentMatches} />
      <ScoringsSection standings={standings} />
      <NewsSection articles={latestNews} />
      <MinigamesSection minigames={minigames} />
    </>
  );
}
