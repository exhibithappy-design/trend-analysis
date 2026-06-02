import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const current = options.find((o) => o.value === value);

  const updatePos = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  };

  useLayoutEffect(() => {
    if (open) updatePos();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onScrollResize = () => updatePos();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScrollResize, true);
    window.addEventListener('resize', onScrollResize);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
    };
  }, [open]);

  return (
    <div ref={ref} className={`ad-select-root ${className}`} style={width ? { width } : undefined}>
      <button
        ref={triggerRef}
        type="button"
        className={`ad-select-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ad-select-value">{current?.label ?? placeholder ?? ''}</span>
        <ChevronDown size={14} className="ad-select-chev" />
      </button>
      {open && pos && createPortal(
        <div
          ref={menuRef}
          className="ad-select-menu ad-select-menu-portal"
          role="listbox"
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
        >
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
        </div>,
        document.body
      )}
    </div>
  );
}