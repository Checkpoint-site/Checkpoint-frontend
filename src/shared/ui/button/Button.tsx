import React from 'react';
import { cn } from '@shared/lib';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm',
      secondary: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700',
      outline: 'border border-neutral-700 hover:bg-neutral-800 text-neutral-300',
      ghost: 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100',
    };

    const sizes = {
      sm: 'px-2.5 py-1 text-xs rounded-md',
      md: 'px-3.5 py-2 text-sm rounded-lg',
      lg: 'px-5 py-2.5 text-base rounded-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
