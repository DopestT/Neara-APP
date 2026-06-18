import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import { LEGAL_DOCS, findLegal } from '@/lib/legalContent';
import { NEARA_DOMAIN } from '@/lib/brand';

export function LegalIndex() {
  const nav = useNavigate();
  return (
    <div className="px-5 py-6 space-y-6 pb-32">
      <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
      <div>
        <p className="text-xs uppercase tracking-widest text-primary/80">Legal & Safety</p>
        <h1 className="font-display text-3xl mt-2">Policies that protect you.</h1>
        <p className="text-sm text-muted-foreground mt-2">Plain-language documents. Updated as Neara evolves.</p>
      </div>
      <div className="glass rounded-3xl divide-y divide-border/50 overflow-hidden">
        {LEGAL_DOCS.map(d => (
          <Link key={d.slug} to={`/app/legal/${d.slug}`} className="flex items-center gap-3 px-5 h-16 hover:bg-secondary/40 transition">
            <FileText className="w-4 h-4 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{d.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{d.short}</p>
            </div>
            <span className="text-muted-foreground">›</span>
          </Link>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground/60 text-center">{NEARA_DOMAIN} · policies are versioned and dated</p>
    </div>
  );
}

export function LegalDoc() {
  const { slug } = useParams();
  const nav = useNavigate();
  const doc = slug ? findLegal(slug) : null;
  if (!doc) {
    return (
      <div className="px-5 py-10 text-center text-muted-foreground">
        <p>Document not found.</p>
        <Link to="/app/legal" className="text-primary text-sm">Back to Legal & Safety</Link>
      </div>
    );
  }
  return (
    <div className="px-5 py-6 space-y-6 pb-32">
      <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
      <div>
        <p className="text-xs uppercase tracking-widest text-primary/80">{doc.short}</p>
        <h1 className="font-display text-3xl mt-2">{doc.title}</h1>
        <p className="text-[11px] text-muted-foreground mt-2">Updated {doc.updated} · {NEARA_DOMAIN}</p>
      </div>
      <div className="space-y-5">
        {doc.body.map(s => (
          <section key={s.heading} className="glass rounded-2xl p-5 space-y-2">
            <h2 className="font-display text-lg">{s.heading}</h2>
            <p className="text-sm leading-relaxed text-foreground/85">{s.text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
