import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
          variant === 'default' &&
            'bg-primary text-primary-foreground hover:bg-primary/90',
          variant === 'outline' &&
            'border border-input bg-transparent hover:bg-accent',
          variant === 'ghost' && 'hover:bg-accent',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
