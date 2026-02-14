import { tournaments } from "@/lib/mock-data";
import { getTranslations } from "next-intl/server";
import { TournamentsFilterClient } from "@/components/page/TournamentsFilterClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tournaments" };

export default async function TournamentsPage() {
  const t = await getTranslations("tournaments");
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading font-bold text-4xl text-white mb-8">
        {t("title")}
      </h1>
      <TournamentsFilterClient tournaments={tournaments} />
    </div>
  );
}
