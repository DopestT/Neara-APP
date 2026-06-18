import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { NButton } from '@/components/neara/NButton';
import { ChevronLeft } from 'lucide-react';
import { findProfile } from '@/lib/demoData';

const PLACES = ['Coffee shop', 'Restaurant', 'Bar', 'Hotel lobby', 'Public lounge', 'Custom public place'];

export default function SafeMeet() {
  const { id } = useParams();
  const nav = useNavigate();
  const { matches, sendMessage } = useApp();
  const m = matches.find(x => x.id === id);
  if (!m) return <div className="p-10 text-center text-muted-foreground">Match not found.</div>;
  const p = findProfile(m.profileId);

  return (
    <div className="px-5 py-6 space-y-6">
      <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
      <div>
        <p className="text-xs uppercase tracking-widest text-primary/80">Safe Meet</p>
        <h1 className="font-display text-3xl mt-2">Suggest a safer place to meet.</h1>
        <p className="text-muted-foreground mt-2 text-sm">Neara recommends meeting in public first.</p>
      </div>
      <div className="space-y-2">
        {PLACES.map(place => (
          <button key={place} onClick={() => {
            sendMessage(m.id, `Meet at a ${place.toLowerCase()}?`, 'meetup_suggestion');
            nav('/app/chat/' + m.id);
          }} className="w-full glass rounded-2xl p-4 text-left hover:border-primary/50 transition flex items-center justify-between">
            <span>{place}</span>
            <span className="text-primary">→</span>
          </button>
        ))}
      </div>
      {p && <p className="text-xs text-muted-foreground text-center">Suggesting to {p.name}.</p>}
    </div>
  );
}
