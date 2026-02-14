"use client";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "cyan" | "purple" | "none";
  hover?: boolean;
}

export function Card({ children, className, glow = "none", hover = false }: CardProps) {
  const glowMap = {
    cyan: "hover:shadow-[0_0_20px_rgba(0,212,255,0.25)]",
    purple: "hover:shadow-[0_0_20px_rgba(147,51,234,0.25)]",
    none: "",
  };
  return (
    <div
      className={cn(
        "bg-bg-card border border-white/10 rounded-xl",
        "backdrop-blur-sm",
        hover && "transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5",
        glowMap[glow],
        className
      )}
    >
      {children}
    </div>
  );
}
