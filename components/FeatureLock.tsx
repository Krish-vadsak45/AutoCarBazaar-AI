"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureLockProps = {
  locked: boolean;
  children: ReactNode;
  title?: string;
  description?: string;
  upgradeHref?: string;
  upgradeLabel?: string;
  className?: string;
};

export function FeatureLock({
  locked,
  children,
  title = "Upgrade required",
  description,
  upgradeHref = "/vendor",
  upgradeLabel = "View plans",
  className,
}: FeatureLockProps) {
  if (!locked) return <>{children}</>;

  return (
    <div className={cn("relative rounded-lg border border-dashed border-muted-foreground/30", className)}>
      <div className="pointer-events-none select-none opacity-[0.22] blur-[1px] grayscale">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 p-4 text-center backdrop-blur-[2px]">
        <Lock className="h-8 w-8 text-muted-foreground" aria-hidden />
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
        ) : null}
        <Link
          href={upgradeHref}
          className="pointer-events-auto text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          {upgradeLabel}
        </Link>
      </div>
    </div>
  );
}
