'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const floatStats = [
  { label: 'AIM', value: '97.3', top: '20%', right: '10%', delay: 0.8 },
  { label: 'WIN', value: '84%', top: '45%', right: '5%', delay: 1.0 },
  { label: 'CLUTCH', value: 'A+', top: '65%', right: '15%', delay: 1.2 },
];

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-acid bg-accent-acid-dim px-3 py-1 rounded-sm">
                Season 12 Live
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight"
            >
              <span className="text-text-primary">ĐÁNH GIÁ.</span>
              <br />
              <span className="text-text-primary">PHÂN TÍCH.</span>
              <br />
              <span className="text-accent-acid">CHẤM ĐIỂM</span>
              <br />
              <span className="text-text-primary">TUYỂN THỦ E-SPORTS.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="font-body text-text-secondary max-w-md text-base"
            >
              Nền tảng đánh giá tuyển thủ E-sports hàng đầu Việt Nam.
              Phân tích chi tiết, so sánh Head-to-Head, bảng xếp hạng real-time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link href="/players">
                <Button size="lg">VÀO ĐẤU TRƯỜNG</Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="secondary" size="lg">BẢNG XẾP HẠNG</Button>
              </Link>
            </motion.div>
          </div>

          {/* Right - Player Showcase */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Glow background */}
              <div className="absolute inset-0 bg-gradient-radial from-accent-acid-dim to-transparent rounded-full blur-3xl" />

              {/* Player image */}
              <div className="relative w-full h-full rounded-sm overflow-hidden border border-border-subtle">
                <Image
                  src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=dragonslayer&size=500"
                  alt="Featured Player"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent" />
              </div>

              {/* Floating stat badges */}
              {floatStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: stat.delay, duration: 0.4 }}
                  className="absolute bg-bg-base/90 backdrop-blur border border-border-subtle rounded-sm px-3 py-2"
                  style={{ top: stat.top, right: stat.right }}
                >
                  <span className="font-mono text-[9px] uppercase tracking-wider text-text-dim block">
                    {stat.label}
                  </span>
                  <span className="font-mono text-sm font-bold text-accent-acid">
                    {stat.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
