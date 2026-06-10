import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const NField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string }>(
  function NField({ label, className, ...rest }, ref) {
    return (
      <label className="block space-y-2">
        {label && <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>}
        <input
          ref={ref}
          className={cn(
            'w-full h-12 rounded-2xl bg-secondary/40 border border-border px-4 text-foreground placeholder:text-muted-foreground/60',
            'focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition',
            className
          )}
          {...rest}
        />
      </label>
    );
  }
);

export const NTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  function NTextarea({ label, className, ...rest }, ref) {
    return (
      <label className="block space-y-2">
        {label && <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>}
        <textarea
          ref={ref}
          className={cn(
            'w-full min-h-[100px] rounded-2xl bg-secondary/40 border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/60',
            'focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition resize-none',
            className
          )}
          {...rest}
        />
      </label>
    );
  }
);

export function ChipSelect<T extends string>({ options, value, onChange, multi = false }: {
  options: { value: T; label: string }[];
  value: T | T[] | null;
  onChange: (v: any) => void;
  multi?: boolean;
}) {
  const selected = (v: T) => Array.isArray(value) ? value.includes(v) : value === v;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => {
            if (multi && Array.isArray(value)) {
              onChange(value.includes(opt.value) ? value.filter(v => v !== opt.value) : [...value, opt.value]);
            } else onChange(opt.value);
          }}
          className={cn(
            'px-4 h-10 rounded-full text-sm border transition-all',
            selected(opt.value)
              ? 'bg-gradient-accent text-primary-foreground border-transparent shadow-glow'
              : 'bg-secondary/40 border-border text-foreground/80 hover:border-primary/40'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
