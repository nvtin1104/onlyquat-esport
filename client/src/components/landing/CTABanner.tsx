'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CTABanner() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="relative bg-bg-surface border border-border-subtle rounded-sm p-12 md:p-16 overflow-hidden"
        >
          {/* Gradient top border */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent-acid via-accent-lava to-accent-acid" />

          {/* Radial glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-acid/5 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary mb-2">
                Sẵn sàng vào đấu trường?
              </h2>
              <p className="font-body text-text-secondary">
                52,000+ game thủ đã tham gia đánh giá tuyển thủ yêu thích.
              </p>
            </div>
            <Link href="/players">
              <Button size="lg" className="whitespace-nowrap gap-2">
                BẮT ĐẦU NGAY
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
