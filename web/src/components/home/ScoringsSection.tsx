import { getTranslations } from "next-intl/server";
import { Standing } from "@/types";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { cn } from "@/lib/utils";

interface ScoringsSectionProps {
  standings: Standing[];
}

const MEDAL_COLORS = ["text-yellow-400", "text-slate-300", "text-amber-600"];
const FORM_COLORS: Record<string, string> = {
  W: "bg-success",
  L: "bg-danger",
  D: "bg-warning",
};

export async function ScoringsSection({ standings }: ScoringsSectionProps) {
  const t = await getTranslations("standings");
  return (
    <section className="py-16 bg-bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading font-bold text-3xl text-white mb-8">
          {t("title")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted font-mono text-xs uppercase tracking-wider">
                <th className="pb-3 text-left w-12">#</th>
                <th className="pb-3 text-left">Team</th>
                <th className="pb-3 text-center hidden sm:table-cell">
                  {t("wl")}
                </th>
                <th className="pb-3 text-center hidden md:table-cell">
                  {t("diff")}
                </th>
                <th className="pb-3 text-center">Form</th>
                <th className="pb-3 text-right">{t("points")}</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, i) => (
                <tr
                  key={row.team.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3">
                    <span
                      className={cn(
                        "font-mono font-bold text-sm",
                        MEDAL_COLORS[i] ?? "text-text-secondary"
                      )}
                    >
                      {i < 3
                        ? ["\u{1F947}", "\u{1F948}", "\u{1F949}"][i]
                        : `#${row.rank}`}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <TeamLogo
                        logo={row.team.logo}
                        name={row.team.name}
                        size="sm"
                      />
                      <span className="font-heading font-semibold text-white">
                        {row.team.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-center hidden sm:table-cell text-text-secondary font-mono">
                    {row.wins}-{row.losses}
                  </td>
                  <td
                    className={cn(
                      "py-3 text-center hidden md:table-cell font-mono text-xs",
                      row.roundDiff >= 0 ? "text-success" : "text-danger"
                    )}
                  >
                    {row.roundDiff >= 0 ? `+${row.roundDiff}` : row.roundDiff}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-1">
                      {row.form.map((r, j) => (
                        <span
                          key={j}
                          className={cn(
                            "w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold text-white",
                            FORM_COLORS[r]
                          )}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-accent-cyan">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
