import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type AdSelectOption = { value: string; label: string };

interface AdSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AdSelectOption[];
  className?: string;
  placeholder?: string;
  width?: number | string;
}

export function AdSelect({ value, onChange, options, className = '', placeholder, width }: AdSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`ad-select-root ${className}`} style={width ? { width } : undefined}>
      <button
        type="button"
        className={`ad-select-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ad-select-value">{current?.label ?? placeholder ?? ''}</span>
        <ChevronDown size={14} className="ad-select-chev" />
      </button>
      {open && (
        <div className="ad-select-menu" role="listbox">
          {options.map((opt) => {
            const sel = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={sel}
                className={`ad-select-opt ${sel ? 'selected' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                <span>{opt.label}</span>
                {sel && <Check size={13} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}