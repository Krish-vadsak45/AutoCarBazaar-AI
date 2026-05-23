import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'bg-gray-200 dark:bg-zinc-800',
        'bg-gradient-to-r from-transparent via-gray-300/50 dark:via-zinc-700/50 to-transparent',
        'bg-[length:200%_100%] animate-shimmer',
        'rounded-md overflow-hidden',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
