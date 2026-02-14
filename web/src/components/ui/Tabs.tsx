"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  const handleSelect = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div
      className={cn(
        "flex gap-1 bg-bg-secondary p-1 rounded-xl border border-border",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleSelect(tab.id)}
          className={cn(
            "relative flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-colors duration-200 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
            active === tab.id
              ? "text-white"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          {active === tab.id && (
            <motion.span
              layoutId="tab-indicator"
              className="absolute inset-0 bg-accent-blue/15 border border-accent-blue/30 rounded-lg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          {tab.icon}
          <span className="relative">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
