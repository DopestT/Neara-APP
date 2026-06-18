import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon, title, subtitle, action }: {
  icon: LucideIcon; title: string; subtitle: string; action?: ReactNode;
}) {
  return (
    <div className="glass rounded-3xl p-10 text-center flex flex-col items-center gap-4 animate-fade-in">
      <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-glow">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="font-display text-xl text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
