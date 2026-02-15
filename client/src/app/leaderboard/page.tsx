import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LeaderboardClient } from '@/components/player/LeaderboardClient';
import { getPlayers, getGames } from '@/lib/mock';

export const metadata = {
  title: 'Bảng Xếp Hạng | ARCADE ARENA',
  description: 'Bảng xếp hạng tuyển thủ esport theo rating và tier.',
};

export default async function LeaderboardPage() {
  const [players, games] = await Promise.all([getPlayers(), getGames()]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-base pt-16">
        <LeaderboardClient players={players} games={games} />
      </main>
      <Footer />
    </>
  );
}
