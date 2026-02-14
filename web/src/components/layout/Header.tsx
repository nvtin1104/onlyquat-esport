"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, Sun, Moon } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "tournaments", href: "/tournaments" },
  { key: "teams", href: "/teams" },
  { key: "news", href: "/news" },
  { key: "minigames", href: "/minigames" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-bg-primary/80 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading font-bold text-xl text-text-primary">
              ONLY<span className="text-accent-blue">QUAT</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="px-4 py-2 text-sm font-heading font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-all duration-200"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <LanguageSwitcher />
            <button
              className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
