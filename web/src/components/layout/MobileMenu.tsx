"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { X } from "lucide-react";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "tournaments", href: "/tournaments" },
  { key: "teams", href: "/teams" },
  { key: "news", href: "/news" },
  { key: "minigames", href: "/minigames" },
] as const;

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const t = useTranslations("nav");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-bg-primary/95 backdrop-blur-md md:hidden"
        >
          <div className="flex flex-col h-full p-6">
            <button
              onClick={onClose}
              className="self-end text-text-secondary hover:text-text-primary mb-8"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={onClose}
                  className="font-heading font-bold text-2xl text-text-secondary hover:text-accent-blue transition-colors"
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
