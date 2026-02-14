import { getTranslations } from "next-intl/server";
import { Article } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

interface NewsSectionProps {
  articles: Article[];
}

export async function NewsSection({ articles }: NewsSectionProps) {
  const t = await getTranslations("news");
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading font-bold text-3xl text-text-primary">
          {t("title")}
        </h2>
        <Link
          href="/news"
          className="text-accent-blue text-sm flex items-center gap-1 hover:gap-2 transition-all"
        >
          {t("viewAll")} <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
