import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'narrative' | 'info' | 'new';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        {
          'bg-primary/20 text-primary': variant === 'default',
          'bg-secondary/20 text-secondary': variant === 'secondary',
          'bg-destructive/20 text-destructive': variant === 'destructive',
          'border border-border text-muted-foreground': variant === 'outline',
          'bg-blue-500/20 text-blue-400': variant === 'narrative',
          'bg-slate-500/20 text-slate-400': variant === 'info',
          'bg-red-500/20 text-red-400 animate-pulse': variant === 'new',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
