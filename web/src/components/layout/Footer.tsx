import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Twitter, Facebook, Instagram, Youtube } from "lucide-react";

const SOCIAL_LINKS = [
  { icon: Twitter, href: "#", label: "X / Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-secondary mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <span className="font-heading font-bold text-lg text-text-primary">
              ONLY<span className="text-accent-blue">QUAT</span>
            </span>
            <p className="text-text-muted text-sm mt-2">
              The premier eSport tournament platform.
            </p>
          </div>
          {/* Platform links */}
          <div>
            <h4 className="font-heading font-semibold text-text-primary text-sm mb-3 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link
                  href="/tournaments"
                  className="hover:text-accent-blue transition-colors"
                >
                  {tNav("tournaments")}
                </Link>
              </li>
              <li>
                <Link
                  href="/teams"
                  className="hover:text-accent-blue transition-colors"
                >
                  {tNav("teams")}
                </Link>
              </li>
            </ul>
          </div>
          {/* Community links */}
          <div>
            <h4 className="font-heading font-semibold text-text-primary text-sm mb-3 uppercase tracking-wider">
              Community
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link
                  href="/news"
                  className="hover:text-accent-blue transition-colors"
                >
                  {tNav("news")}
                </Link>
              </li>
              <li>
                <Link
                  href="/minigames"
                  className="hover:text-accent-blue transition-colors"
                >
                  {tNav("minigames")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-text-muted text-sm">
            &copy; {year} OnlyQuat. {t("rights")}.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-text-muted text-sm">{t("followUs")}:</span>
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-text-muted hover:text-accent-blue transition-colors"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
