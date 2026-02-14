"use client";
import { motion } from "framer-motion";
import { Radio, Users, ExternalLink } from "lucide-react";
import { Match } from "@/types";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface HeroSectionProps {
  liveMatch: Match;
}

export function HeroSection({ liveMatch }: HeroSectionProps) {
  const t = useTranslations("hero");
  const viewers = "127K";

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary bg-[length:200%_200%] animate-gradient-shift" />
      {/* Neon orb decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-purple/[0.08] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-3xl">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <Badge status="live" pulse />
            <span className="flex items-center gap-1.5 text-text-secondary text-sm">
              <Users size={14} />
              <span className="font-mono text-accent-blue">{viewers}</span>{" "}
              {t("viewers")}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-text-primary leading-none mb-4"
          >
            VCT CHAMPIONS
            <span className="block text-accent-blue neon-blue">2026</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-text-secondary text-lg mb-8 max-w-xl"
          >
            The world&apos;s biggest Valorant tournament. 16 teams. One
            champion.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-3 mb-12"
          >
            {liveMatch.streamUrl && (
              <a
                href={liveMatch.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="lg" glow>
                  <Radio size={16} className="animate-pulse-live" />
                  {t("watchStream")}
                  <ExternalLink size={14} />
                </Button>
              </a>
            )}
            <Link href="/tournaments">
              <Button variant="ghost" size="lg">
                {t("viewBracket")}
              </Button>
            </Link>
          </motion.div>

          {/* Featured match card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="glass p-5 inline-flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
          >
            <span className="text-text-muted text-xs font-mono uppercase tracking-wider">
              {t("featuredMatch")}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TeamLogo
                  logo={liveMatch.team1.logo}
                  name={liveMatch.team1.name}
                  size="md"
                  priority
                />
                <span className="font-heading font-bold text-text-primary">
                  {liveMatch.team1.name}
                </span>
              </div>
              <div className="text-center">
                <div className="font-mono text-2xl font-bold text-text-primary">
                  {liveMatch.score.team1}
                  <span className="text-text-muted mx-1">:</span>
                  {liveMatch.score.team2}
                </div>
                {liveMatch.map && (
                  <div className="text-text-muted text-xs">{liveMatch.map}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-text-primary">
                  {liveMatch.team2.name}
                </span>
                <TeamLogo
                  logo={liveMatch.team2.logo}
                  name={liveMatch.team2.name}
                  size="md"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
