import { getPlayers, getGames } from '@/lib/mock';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PlayersPageClient } from '@/components/player/PlayersPageClient';

export const metadata = {
  title: 'Tuyển thủ — ARCADE ARENA',
  description: 'Khám phá và chấm điểm tuyển thủ E-sports hàng đầu Việt Nam.',
};

export default async function PlayersPage() {
  const [players, games] = await Promise.all([getPlayers(), getGames()]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-base pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            label="Tuyển thủ"
            title="Khám phá tuyển thủ"
            description="Khám phá & chấm điểm tuyển thủ E-sports"
          />
          <PlayersPageClient players={players} games={games} />
        </div>
      </main>
      <Footer />
    </>
  );
}
