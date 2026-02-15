import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ComparePageClient } from '@/components/player/ComparePageClient';
import { getPlayers } from '@/lib/mock';

export const metadata = {
  title: 'So Sánh Tuyển Thủ | ARCADE ARENA',
  description: 'So sánh chỉ số và thống kê giữa các tuyển thủ esport.',
};

export default async function ComparePage() {
  const players = await getPlayers();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-base pt-16">
        <ComparePageClient players={players} />
      </main>
      <Footer />
    </>
  );
}
