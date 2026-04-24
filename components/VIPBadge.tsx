'use client';

import { cn } from '@/lib/utils';
import { normalizeVendorPriority } from '@/lib/vip';

const TIERS = [
  {
    level: 1,
    label: 'Bronze',
    className: 'bg-amber-900/15 text-amber-900 dark:text-amber-200 border-amber-800/30',
  },
  {
    level: 2,
    label: 'Silver',
    className: 'bg-slate-400/15 text-slate-800 dark:text-slate-200 border-slate-500/30',
  },
  {
    level: 3,
    label: 'Gold',
    className: 'bg-yellow-500/15 text-yellow-900 dark:text-yellow-200 border-yellow-600/30',
  },
  {
    level: 4,
    label: 'Platinum',
    className: 'bg-cyan-500/15 text-cyan-900 dark:text-cyan-200 border-cyan-600/30',
  },
  {
    level: 5,
    label: 'Diamond',
    className: 'bg-violet-500/15 text-violet-900 dark:text-violet-200 border-violet-600/30',
  },
] as const;

type VIPBadgeProps = {
  priority: unknown;
  className?: string;
};

export function VIPBadge({ priority, className }: VIPBadgeProps) {
  const level = normalizeVendorPriority(priority);
  const tier = TIERS.find((t) => t.level === level) ?? TIERS[0];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        tier.className,
        className
      )}
    >
      VIP {tier.label} · L{level}
    </span>
  );
}
