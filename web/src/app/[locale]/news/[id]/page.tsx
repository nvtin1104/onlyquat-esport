import { notFound } from "next/navigation";
import { articles } from "@/lib/mock-data";
import Image from "next/image";
import { Clock, User, Tag } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return articles.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = articles.find((a) => a.id === id);
  return { title: article?.title ?? "Article" };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const article = articles.find((a) => a.id === id);
  if (!article) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Category */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-mono font-semibold uppercase px-2.5 py-1 rounded border bg-bg-card text-accent-cyan border-accent-cyan/40">
          {article.category}
        </span>
      </div>
      <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4">
        {article.title}
      </h1>
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-text-muted text-sm mb-6">
        <span className="flex items-center gap-1.5">
          <User size={14} />
          {article.author}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {article.readTime} min read
        </span>
        <span>{timeAgo(article.publishDate)}</span>
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-bg-card border border-white/10 text-text-secondary"
          >
            <Tag size={10} />
            {tag}
          </span>
        ))}
      </div>
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-bg-surface">
        <Image
          src={article.thumbnail}
          alt={article.title}
          fill
          className="object-cover"
        />
      </div>
      {/* Excerpt (demo content) */}
      <p className="text-text-secondary leading-relaxed text-base">
        {article.excerpt}
      </p>
      <div className="mt-6 p-6 bg-bg-card border border-white/10 rounded-xl text-text-muted text-sm">
        Full article content will be loaded from the CMS/backend in production.
      </div>
    </article>
  );
}
