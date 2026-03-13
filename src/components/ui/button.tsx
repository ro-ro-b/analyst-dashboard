import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'hover:bg-slate-800 hover:text-slate-50': variant === 'ghost',
            'border border-slate-700 bg-transparent hover:bg-slate-800': variant === 'outline',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-12 px-6': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
