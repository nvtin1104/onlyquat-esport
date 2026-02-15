'use client';

import { motion } from 'framer-motion';
import { Star, BarChart3, Swords, Trophy, Users, Gamepad2 } from 'lucide-react';
import { staggerContainer, fadeUpItem } from '@/lib/animations';
import { SectionHeader } from '@/components/ui/SectionHeader';

const features = [
  { num: '01', icon: Star, title: 'CHẤM ĐIỂM TUYỂN THỦ', desc: 'Đánh giá chi tiết 5 chỉ số: Aim, Game IQ, Clutch, Teamplay, Consistency.' },
  { num: '02', icon: BarChart3, title: 'PHÂN TÍCH ĐỘI HÌNH', desc: 'Radar chart, stat bars và trend line cho từng tuyển thủ và đội tuyển.' },
  { num: '03', icon: Swords, title: 'HEAD-TO-HEAD', desc: 'So sánh trực tiếp 2 tuyển thủ bất kỳ với overlay radar chart.' },
  { num: '04', icon: Trophy, title: 'BXH LIVE', desc: 'Bảng xếp hạng real-time theo game, role, và tier.' },
  { num: '05', icon: Users, title: 'CỘNG ĐỒNG', desc: 'Hệ thống đánh giá từ cộng đồng với 52,000+ game thủ.' },
  { num: '06', icon: Gamepad2, title: 'MINI GAME', desc: 'Dự đoán kết quả, quiz kiến thức, và thử thách cùng bạn bè.' },
];

export function FeaturesGrid() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          label="Tính năng"
          title="Nền tảng toàn diện"
          description="Mọi công cụ bạn cần để đánh giá và theo dõi tuyển thủ E-sports."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border-subtle"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.num}
                variants={fadeUpItem}
                className="bg-bg-surface p-8 group hover:bg-bg-elevated transition-colors duration-400 relative"
              >
                {/* Top border animation */}
                <div className="absolute top-0 left-0 w-0 h-px bg-accent-acid transition-all duration-500 group-hover:w-full" />

                <span className="font-mono text-[10px] text-text-dim block mb-4">
                  {f.num}
                </span>
                <div className="w-10 h-10 rounded-sm bg-border-subtle flex items-center justify-center mb-4 group-hover:bg-accent-acid-dim transition-colors duration-400">
                  <Icon className="w-5 h-5 text-text-dim group-hover:text-accent-acid transition-colors duration-400" />
                </div>
                <h3 className="font-display font-semibold text-sm text-text-primary mb-2">
                  {f.title}
                </h3>
                <p className="font-body text-sm text-text-dim leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
