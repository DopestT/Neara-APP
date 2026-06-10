import { useRef, useState } from 'react';
import { X, Camera, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  photos: string[];
  onChange: (next: string[]) => void;
  max?: number;
}

/**
 * Premium photo uploader.
 * - Real file picker → data URL preview
 * - Pinch-style scale-in animation per tile
 * - First photo is the "Main" (verification anchor)
 * - Tap a non-main tile's star to promote it to main
 * - Tap × to remove
 */
export function PhotoUploader({ photos, onChange, max = 6 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const openPicker = (index: number) => {
    setPendingIndex(index);
    inputRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image too large (max 8MB).');
      return;
    }
    const url = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    const next = [...photos];
    const idx = pendingIndex ?? next.length;
    next[idx] = url;
    // compact (no holes)
    onChange(next.filter(Boolean));
    setPendingIndex(null);
  };

  const remove = (i: number) => onChange(photos.filter((_, n) => n !== i));
  const makeMain = (i: number) => {
    if (i === 0) return;
    const next = [...photos];
    const [picked] = next.splice(i, 1);
    next.unshift(picked);
    onChange(next);
  };

  const slots = Array.from({ length: Math.min(max, Math.max(photos.length + 1, 3)) });

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <div className="grid grid-cols-3 gap-3">
        {slots.map((_, i) => {
          const url = photos[i];
          const isMain = i === 0 && !!url;
          return (
            <div key={i} className="relative">
              <button
                type="button"
                onClick={() => !url && openPicker(i)}
                className={`aspect-[3/4] w-full rounded-2xl glass flex items-center justify-center relative overflow-hidden transition active:scale-[0.97] ${
                  isMain ? 'ring-2 ring-primary/60 shadow-glow' : 'hover:border-primary/40'
                }`}
              >
                {url ? (
                  <img
                    src={url}
                    alt={isMain ? 'Main photo' : `Photo ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover animate-scale-in"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground/70">
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-widest">Add</span>
                  </div>
                )}
                {isMain && (
                  <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-widest bg-background/80 backdrop-blur px-2 py-1 rounded-full text-primary">
                    Main
                  </span>
                )}
              </button>
              {url && (
                <>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="Remove photo"
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center hover:border-destructive/60 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeMain(i)}
                      aria-label="Make main photo"
                      className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:border-primary/60 transition"
                      title="Make main"
                    >
                      <Star className="w-3.5 h-3.5 text-primary" />
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {photos.length}/{max} added · Main photo anchors verification. Tap ★ to promote, × to remove.
      </p>
    </div>
  );
}
