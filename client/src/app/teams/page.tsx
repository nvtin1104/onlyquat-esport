import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TeamsGrid } from '@/components/player/TeamsGrid';
import { getTeams, getPlayers } from '@/lib/mock';

export const metadata = {
  title: 'Teams | ARCADE ARENA',
  description: 'Khám phá các đội esport và đội hình tuyển thủ.',
};

export default async function TeamsPage() {
  const [teams, players] = await Promise.all([getTeams(), getPlayers()]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-base pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <SectionHeader
            label="Đội tuyển"
            title="Teams"
            description="Khám phá các đội esport và đội hình tuyển thủ hàng đầu."
          />
          <TeamsGrid teams={teams} players={players} />
        </div>
      </main>
      <Footer />
    </>
  );
}
