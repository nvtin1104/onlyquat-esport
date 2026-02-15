import Link from 'next/link';
import { Zap } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-bg-surface border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent-acid flex items-center justify-center rounded-sm">
              <Zap className="w-4 h-4 text-bg-base" />
            </div>
            <span className="font-display font-bold text-sm text-text-primary">
              ARCADE ARENA
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-xs text-text-dim hover:text-text-secondary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <span className="font-mono text-[10px] text-text-dim">
            &copy; 2026 ARCADE ARENA
          </span>
        </div>
      </div>
    </footer>
  );
}
