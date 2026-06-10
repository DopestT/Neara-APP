import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { findProfile } from '@/lib/demoData';
import { ChevronLeft, UserX } from 'lucide-react';
import { NButton } from '@/components/neara/NButton';
import { EmptyState } from '@/components/neara/EmptyState';
import { toast } from 'sonner';

export default function Blocked() {
  const nav = useNavigate();
  const { blockedIds, unblock } = useApp();
  return (
    <div className="px-5 py-6 space-y-6 pb-32">
      <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
      <div>
        <p className="text-xs uppercase tracking-widest text-primary/80">Safety</p>
        <h1 className="font-display text-3xl mt-2">Blocked users</h1>
        <p className="text-sm text-muted-foreground mt-2">Blocked users can't see you, Signal you, or message you. You won't see them either.</p>
      </div>
      {blockedIds.length === 0 ? (
        <EmptyState icon={UserX} title="No blocked users." subtitle="When you block someone they disappear from both sides of Neara." />
      ) : (
        <div className="space-y-2">
          {blockedIds.map(id => {
            const p = findProfile(id);
            return (
              <div key={id} className="glass rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-secondary">
                  {p && <img src={p.photo} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p?.name || 'Unknown user'}</p>
                  <p className="text-[11px] text-muted-foreground">Blocked</p>
                </div>
                <NButton size="sm" variant="outline" onClick={() => { unblock(id); toast(`Unblocked ${p?.name || 'user'}.`); }}>Unblock</NButton>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
