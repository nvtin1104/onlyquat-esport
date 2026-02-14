import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Article } from "@/types";
import { cn, timeAgo } from "@/lib/utils";
import { Clock } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  locale?: string;
  className?: string;
}

const categoryColors: Record<string, string> = {
  news: "text-accent-blue border-accent-blue/50",
  interview: "text-accent-purple border-accent-purple/50",
  highlight: "text-success border-success/50",
  recap: "text-warning border-warning/50",
};

export function ArticleCard({ article, className }: ArticleCardProps) {
  return (
    <Link
      href={`/news/${article.id}`}
      className={cn(
        "group block bg-bg-card border border-border rounded-xl overflow-hidden hover:border-border transition-all duration-300 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="relative aspect-video bg-bg-secondary">
        <Image
          src={article.thumbnail}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span
          className={cn(
            "absolute top-3 left-3 text-xs font-mono font-semibold uppercase px-2 py-1 rounded border bg-bg-card/80 backdrop-blur-sm",
            categoryColors[article.category]
          )}
        >
          {article.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-text-primary line-clamp-2 mb-2 group-hover:text-accent-blue transition-colors">
          {article.title}
        </h3>
        <p className="text-text-muted text-sm line-clamp-2 mb-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>{article.author}</span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {article.readTime} min · {timeAgo(article.publishDate)}
          </span>
        </div>
      </div>
    </Link>
  );
}
