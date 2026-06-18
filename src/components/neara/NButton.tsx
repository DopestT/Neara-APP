import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
  size?: 'md' | 'lg' | 'sm';
  full?: boolean;
}

export const NButton = forwardRef<HTMLButtonElement, Props>(function NButton(
  { variant = 'primary', size = 'md', full, className, children, ...rest }, ref
) {
  const base = 'relative inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap';
  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-12 px-6 text-sm',
    lg: 'h-14 px-8 text-base',
  };
  const variants = {
    primary: 'bg-gradient-accent text-primary-foreground shadow-glow hover:shadow-[0_0_60px_hsl(var(--primary)/0.5)] hover:-translate-y-0.5',
    ghost: 'text-foreground hover:bg-secondary/60',
    outline: 'border border-border bg-secondary/30 text-foreground hover:bg-secondary/60 hover:border-primary/40',
    danger: 'border border-destructive/40 text-destructive hover:bg-destructive/10',
  };
  return (
    <button ref={ref} className={cn(base, sizes[size], variants[variant], full && 'w-full', className)} {...rest}>
      {children}
    </button>
  );
});
