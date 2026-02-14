"use client";
import { minigames } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Trophy, Gamepad2, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  prediction: <Trophy size={48} className="text-warning" />,
  bracket: <Gamepad2 size={48} className="text-accent-cyan" />,
  quiz: <Zap size={48} className="text-accent-purple" />,
};

export default function MinigamesPage() {
  const t = useTranslations("minigames");
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading font-bold text-5xl text-white mb-3">
          {t("title")}
        </h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Compete, predict, and win exclusive rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {minigames.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 40px rgba(0,212,255,0.2)",
            }}
            className="flex flex-col gap-6 p-8 bg-bg-card border border-white/10 rounded-2xl"
          >
            <div className="flex justify-center">
              {TYPE_ICONS[game.type]}
            </div>
            <div className="text-center">
              <h2 className="font-heading font-bold text-2xl text-white mb-2">
                {game.name}
              </h2>
              <p className="text-text-secondary text-sm">{game.description}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-text-muted">
                <Users size={14} />
                {game.playerCount.toLocaleString()} {t("players")}
              </span>
              <span className="font-mono font-bold text-warning text-lg">
                {game.reward}
              </span>
            </div>
            <Button
              variant="primary"
              glow
              className="w-full justify-center"
              disabled
            >
              {t("playNow")} — Coming Soon
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
