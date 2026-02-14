"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Article, ArticleCategory } from "@/types";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { Tabs } from "@/components/ui/Tabs";

const CATEGORIES: Array<ArticleCategory | "all"> = [
  "all",
  "news",
  "interview",
  "highlight",
  "recap",
];

interface Props {
  articles: Article[];
}

export function NewsFilterClient({ articles }: Props) {
  const [cat, setCat] = useState<string>("all");
  const tabs = CATEGORIES.map((c) => ({
    id: c,
    label: c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1),
  }));
  const filtered =
    cat === "all" ? articles : articles.filter((a) => a.category === cat);
  return (
    <>
      <Tabs
        tabs={tabs}
        defaultTab="all"
        onChange={setCat}
        className="mb-8 max-w-xl"
      />
      <motion.div
        key={cat}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </motion.div>
    </>
  );
}
