import { useState } from 'react';
import { ChevronRight, Sparkles, Shuffle, Crown } from 'lucide-react';
import { useApp } from '@/store/AppStore';

const PROMPTS = [
  "What's something I wouldn't know from your profile?",
  "What's the last thing that made you genuinely laugh?",
  "If we had a free Sunday, what's the plan?",
  "What's a small thing you're really good at?",
  "Pick a song that fits your week so far.",
  "What's the best meal you've had this month?",
  "What would you geek out about for an hour?",
];

export function OpeningMoves({ onLocked }: { onLocked?: () => void }) {
  const { user } = useApp();
  const [idx, setIdx] = useState(0);
  const prompt = PROMPTS[idx % PROMPTS.length];

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" />Your Opening Moves</p>
        <button
          onClick={() => user.premium ? setIdx(i => i + 1) : onLocked?.()}
          className="text-[11px] text-muted-foreground hover:text-foreground transition flex items-center gap-1">
          {user.premium ? <><Shuffle className="w-3 h-3" />Shuffle</> : <><Crown className="w-3 h-3 text-primary" />Edit</>}
        </button>
      </div>
      <button className="mt-3 w-full text-left bg-secondary/40 hover:bg-secondary/60 transition rounded-full px-4 h-11 flex items-center justify-between gap-2">
        <span className="text-sm truncate">{prompt}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>
      <p className="text-[10px] text-muted-foreground mt-2">A warm first line lands better than "hey."</p>
    </div>
  );
}
