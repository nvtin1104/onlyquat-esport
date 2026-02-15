import { SectionHeader } from '@/components/ui/SectionHeader';
import { PlayerGrid } from '@/components/player/PlayerGrid';
import { getPlayers } from '@/lib/mock';

export async function TopPlayers() {
  const players = await getPlayers();
  const top4 = players.slice(0, 4);

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          label="Top Rated"
          title="Tuyển thủ hàng đầu"
          description="Những tuyển thủ được đánh giá cao nhất bởi cộng đồng."
        />
        <PlayerGrid players={top4} showRank />
      </div>
    </section>
  );
}
