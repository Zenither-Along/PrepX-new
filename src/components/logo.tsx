"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Logo({ className = "", width = 120, height = 40 }: { className?: string; width?: number; height?: number }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const iconSrc = mounted && resolvedTheme === "dark" ? "/logo-icon-dark.png" : "/logo-icon-light.png";

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
      <span className="text-2xl font-bold tracking-tight text-foreground">PrepX</span>
    </div>
  );
}
