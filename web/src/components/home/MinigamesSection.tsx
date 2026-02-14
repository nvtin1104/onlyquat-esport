"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Minigame } from "@/types";
import { Users, Trophy, Gamepad2 } from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  prediction: <Trophy size={32} className="text-warning" />,
  bracket: <Gamepad2 size={32} className="text-accent-blue" />,
  quiz: <Users size={32} className="text-accent-purple" />,
};

interface MinigamesSectionProps {
  minigames: Minigame[];
}

export function MinigamesSection({ minigames }: MinigamesSectionProps) {
  const t = useTranslations("minigames");
  return (
    <section className="py-16 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading font-bold text-3xl text-text-primary mb-8">
          {t("title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {minigames.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Link
                href="/minigames"
                className="flex flex-col gap-4 p-6 bg-bg-card border border-border rounded-xl
                  hover:border-accent-blue/40 hover:shadow-[0_0_25px_rgba(14,165,233,0.2)]
                  transition-all duration-300 group h-full"
              >
                <div className="flex items-start justify-between">
                  {TYPE_ICONS[game.type]}
                  <span className="font-mono text-xs text-warning font-semibold">
                    {game.reward}
                  </span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-text-primary text-lg mb-1 group-hover:text-accent-blue transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-text-muted text-sm line-clamp-2">
                    {game.description}
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-2 text-xs text-text-secondary">
                  <Users size={12} />
                  {game.playerCount.toLocaleString()} {t("players")}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
