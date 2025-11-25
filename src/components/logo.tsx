"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Logo({ className = "", width = 120, height = 40, textColor, forceTheme }: { className?: string; width?: number; height?: number; textColor?: string; forceTheme?: "light" | "dark" }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveTheme = forceTheme || (mounted ? resolvedTheme : "light");
  const iconSrc = effectiveTheme === "dark" ? "/logo-icon-dark.png" : "/logo-icon-light.png";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: 30, height: 30 }}>
        <Image
          src={iconSrc}
          alt="PrepX Icon"
          fill
          className="object-contain"
          priority
        />
      </div>
      <span className={`text-2xl font-bold tracking-tight ${textColor || "text-foreground"}`}>PrepX</span>
    </div>
  );
}
