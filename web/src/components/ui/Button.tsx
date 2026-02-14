"use client";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  glow?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  glow = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-heading font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan disabled:opacity-50";
  const variants = {
    primary:
      "bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/30",
    secondary:
      "bg-accent-purple/20 border border-accent-purple/50 text-accent-purple hover:bg-accent-purple/30",
    ghost:
      "border border-white/10 text-text-secondary hover:border-white/30 hover:text-white",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        glow &&
          "shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
