"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface TeamLogoProps {
  logo: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}

const sizes = { sm: 24, md: 40, lg: 64 };

export function TeamLogo({ logo, name, size = "md", className, priority }: TeamLogoProps) {
  const px = sizes[size];
  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden bg-bg-secondary flex-shrink-0",
        className
      )}
      style={{ width: px, height: px }}
    >
      <Image
        src={logo}
        alt={`${name} logo`}
        fill
        sizes={`${px}px`}
        className="object-contain p-1"
        priority={priority}
        unoptimized={logo.endsWith(".svg")}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <span
        className="absolute inset-0 flex items-center justify-center text-xs font-heading font-bold text-accent-blue"
        aria-hidden
      >
        {name.slice(0, 3).toUpperCase()}
      </span>
    </div>
  );
}
