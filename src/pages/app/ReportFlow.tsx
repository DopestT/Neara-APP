import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/store/AppStore';
import { findProfile } from '@/lib/demoData';
import { NButton } from '@/components/neara/NButton';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const REASONS = [
  { v: 'fake_profile', t: 'Fake Profile / Catfish', d: 'This person\'s photos or identity seem fake.' },
  { v: 'off_app_pressure', t: 'Off-App Pressure', d: 'They kept pressuring me to move the conversation off Neara.' },
  { v: 'location_pressure', t: 'Location Pressure', d: 'They pressured me to reveal my exact location.' },
  { v: 'harassment', t: 'Harassment' },
  { v: 'underage', t: 'Underage' },
  { v: 'spam', t: 'Spam' },
  { v: 'scam', t: 'Scam' },
  { v: 'threatening_behavior', t: 'Threatening Behavior' },
  { v: 'inappropriate_content', t: 'Inappropriate Content' },
  { v: 'impersonation', t: 'Impersonation' },
  { v: 'other', t: 'Other' },
];

export default function ReportFlow() {
  const { id } = useParams();
  const nav = useNavigate();
  const { block, hide, fileReport } = useApp();
  const [chosen, setChosen] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const p = id ? findProfile(id) : null;

  if (submitted) {
    return (
      <div className="px-5 py-10 text-center min-h-[80dvh] flex flex-col justify-center">
        <h1 className="font-display text-3xl">Report received.</h1>
        <p className="text-muted-foreground mt-3">Our team will review. Thank you for helping keep Neara safe.</p>
        <div className="space-y-3 mt-10 max-w-xs mx-auto w-full">
          <NButton full size="lg" onClick={() => { if (id) block(id); toast('Blocked. They won\'t be able to see you, Signal you, or message you.'); nav('/app/map'); }}>Block this user</NButton>
          <NButton full variant="ghost" onClick={() => nav('/app/map')}>Done</NButton>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 space-y-6">
      <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
      <div>
        <p className="text-xs uppercase tracking-widest text-primary/80">Report</p>
        <h1 className="font-display text-3xl mt-2">{p ? `Report ${p.name}` : 'Report user'}</h1>
        <p className="text-muted-foreground text-sm mt-2">Choose what happened. Reports are confidential.</p>
      </div>
      <div className="space-y-2">
        {REASONS.map(r => (
          <button key={r.v} onClick={() => setChosen(r.v)}
            className={`w-full text-left glass rounded-2xl p-4 transition ${chosen===r.v?'border-primary/60 ring-glow':''}`}>
            <p className="font-medium text-sm">{r.t}</p>
            {r.d && <p className="text-xs text-muted-foreground mt-1">{r.d}</p>}
          </button>
        ))}
      </div>
      <NButton full size="lg" disabled={!chosen} onClick={() => { if (id && chosen) { fileReport({ targetId: id, reason: chosen }); hide(id); } setSubmitted(true); }}>Submit Report</NButton>
    </div>
  );
}
