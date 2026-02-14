"use client";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-lg p-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={cn(
            "px-3 py-1 rounded text-xs font-mono font-semibold uppercase transition-colors",
            locale === loc
              ? "bg-accent-blue/20 text-accent-blue"
              : "text-text-muted hover:text-text-primary"
          )}
          aria-pressed={locale === loc}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
