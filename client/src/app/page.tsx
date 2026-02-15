import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsRibbon } from '@/components/landing/StatsRibbon';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { TopPlayers } from '@/components/landing/TopPlayers';
import { CTABanner } from '@/components/landing/CTABanner';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsRibbon />
        <FeaturesGrid />
        <TopPlayers />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
