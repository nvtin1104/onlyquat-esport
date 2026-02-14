import { articles } from "@/lib/mock-data";
import { getTranslations } from "next-intl/server";
import { NewsFilterClient } from "@/components/page/NewsFilterClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "News" };

export default async function NewsPage() {
  const t = await getTranslations("news");
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading font-bold text-4xl text-white mb-8">
        {t("title")}
      </h1>
      <NewsFilterClient articles={articles} />
    </div>
  );
}
