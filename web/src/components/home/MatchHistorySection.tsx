import { getTranslations } from "next-intl/server";
import { Match } from "@/types";
import { MatchCard } from "@/components/shared/MatchCard";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

interface MatchHistorySectionProps {
  matches: Match[];
}

export async function MatchHistorySection({
  matches,
}: MatchHistorySectionProps) {
  const t = await getTranslations("matches");
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-bold text-3xl text-text-primary">
          {t("title")}
        </h2>
        <Link
          href="/tournaments"
          className="text-accent-blue text-sm flex items-center gap-1 hover:gap-2 transition-all"
        >
          {t("viewDetails")} <ArrowRight size={14} />
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}
