import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Screen({ children, className, center }: { children: ReactNode; className?: string; center?: boolean }) {
  return (
    <div className={cn('relative min-h-[100dvh] w-full overflow-hidden', className)}>
      <div className={cn('relative z-10 mx-auto w-full max-w-md px-6 py-10 animate-fade-in', center && 'min-h-[100dvh] flex flex-col justify-center')}>
        {children}
      </div>
    </div>
  );
}

export function StepHeader({ step, total, onBack }: { step: number; total: number; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      {onBack && (
        <button onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:border-primary/40 transition">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
      <div className="flex-1 h-1 bg-secondary/60 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-accent transition-all duration-500" style={{ width: `${(step/total)*100}%` }} />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">{step}/{total}</span>
    </div>
  );
}
