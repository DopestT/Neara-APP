import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-5xl md:text-6xl' };
  return (
    <span className={cn('font-display tracking-tight', sizes[size], className)}>
      <span className="accent-text">Neara</span>
    </span>
  );
}

export function PrivacyOrb({ size = 220, children, glow = true, className }: { size?: number; children?: ReactNode; glow?: boolean; className?: string }) {
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      {glow && <div className="absolute inset-0 rounded-full bg-gradient-glow blur-2xl" />}
      <div className="relative pulse-ring privacy-circle w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function TrustBadge({ size = 32, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <div
      className={cn('relative inline-flex items-center justify-center rounded-full bg-gradient-accent shadow-glow',
        animated && 'animate-stamp-in')}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-2/3 h-2/3" stroke="hsl(var(--primary-foreground))" strokeWidth="3">
        <path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, className }: { eyebrow?: string; title: string; subtitle?: string; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-primary/80">{eyebrow}</p>}
      <h1 className="font-display text-3xl md:text-4xl leading-tight text-foreground">{title}</h1>
      {subtitle && <p className="text-muted-foreground text-base leading-relaxed max-w-md">{subtitle}</p>}
    </div>
  );
}
