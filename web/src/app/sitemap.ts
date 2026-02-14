import type { MetadataRoute } from "next";
import { tournaments, teams, articles } from "@/lib/mock-data";

const BASE = "https://onlyquat.gg";
const LOCALES = ["vi", "en"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/tournaments", "/teams", "/news", "/minigames"];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE}/${locale}${route}`,
        priority: route === "" ? 1 : 0.8,
      });
    }
    for (const t of tournaments) {
      entries.push({
        url: `${BASE}/${locale}/tournaments/${t.id}`,
        priority: 0.7,
      });
    }
    for (const t of teams) {
      entries.push({
        url: `${BASE}/${locale}/teams/${t.id}`,
        priority: 0.7,
      });
    }
    for (const a of articles) {
      entries.push({
        url: `${BASE}/${locale}/news/${a.id}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }
  return entries;
}
