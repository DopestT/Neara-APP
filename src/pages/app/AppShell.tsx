import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Logo } from '@/components/neara/Brand';
import { useApp } from '@/store/AppStore';
import { Map, Radio, Heart, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/app/map', icon: Map, label: 'Map' },
  { to: '/app/signals', icon: Radio, label: 'Signals' },
  { to: '/app/matches', icon: Heart, label: 'Matches' },
  { to: '/app/chats', icon: MessageCircle, label: 'Chats' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

export default function AppShell() {
  const { signalsLeft, user, matches, showMe } = useApp();
  const loc = useLocation();
  const staleChatId = loc.pathname.match(/^\/app\/chat\/([^/]+)$/)?.[1];
  const hideChrome = Boolean(staleChatId && matches.some(match => match.id === staleChatId));
  const paused = user.visibility === 'paused';

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {!hideChrome && (
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/60 border-b border-border/50">
          <div className="mx-auto max-w-md px-5 h-14 flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 h-7 rounded-full bg-secondary/60 border border-border flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="tabular-nums">{signalsLeft}</span>
                <span className="text-muted-foreground">signals</span>
              </span>
              {paused ? (
                <button onClick={showMe} className="px-3 h-7 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-[11px]">
                  Hidden · Show me
                </button>
              ) : (
                <span className="px-3 h-7 rounded-full bg-secondary/60 border border-border capitalize text-muted-foreground">
                  {user.visibility === 'visible' ? 'Visible' : user.visibility.replace(/_/g,' ')}
                </span>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 mx-auto w-full max-w-md pb-24">
        <Outlet />
      </main>

      {!hideChrome && (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <div className="glass-strong rounded-full px-2 py-2 flex items-center gap-1">
            {tabs.map(t => (
              <NavLink key={t.to} to={t.to}
                className={({isActive}) => cn(
                  'flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all',
                  isActive ? 'bg-gradient-accent text-primary-foreground shadow-glow' : 'text-muted-foreground hover:text-foreground'
                )}>
                <t.icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">{t.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
