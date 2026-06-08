import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


export default function HeaderImages() {
  const TRENDS = Array.from({ length: 12 }, (_, i) => i + 1);
  const [urls, setUrls] = useState<Record<number, string>>({});
  const [positions, setPositions] = useState<Record<number, number>>({});
  const [initial, setInitial] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const u: Record<number, string> = {};
      await Promise.all(
        TRENDS.map(async (n) => {
          const file = `trend-${String(n).padStart(2, '0')}-header.jpg`;
          const { data } = await supabase.storage
            .from('trend-images')
            .createSignedUrl(file, 31536000);
          if (data?.signedUrl) u[n] = data.signedUrl;
        }),
      );
      setUrls(u);

      const { data } = await supabase
        .from('trend_image_positions')
        .select('trend_num, position');
      const p: Record<number, number> = {};
      for (const n of TRENDS) p[n] = 50;
      for (const row of (data || []) as { trend_num: number; position: number }[]) {
        p[row.trend_num] = Number(row.position);
      }
      setPositions(p);
      setInitial(p);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = TRENDS.some((n) => (positions[n] ?? 50) !== (initial[n] ?? 50));

  async function save() {
    setSaving(true);
    const rows = TRENDS.map((n) => ({ trend_num: n, position: Math.round(positions[n] ?? 50) }));
    const { error } = await supabase
      .from('trend_image_positions')
      .upsert(rows, { onConflict: 'trend_num' });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Header positions saved');
      setInitial({ ...positions });
    }
  }

  return (
    <>
      <style>{`
        .header-img-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #FF0069;
          cursor: pointer;
          border: 2px solid #111;
          margin-top: -5px;
        }
        .header-img-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #FF0069;
          cursor: pointer;
          border: 2px solid #111;
        }
        .header-img-slider::-moz-range-track {
          height: 6px;
          border-radius: 3px;
          background: #333;
        }
        .header-img-slider::-moz-range-progress {
          height: 6px;
          border-radius: 3px;
          background: #FF0069;
        }
      `}</style>
      <header className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Header Images</h1>
          <p className="ad-page-sub">Adjust the vertical crop of each trend header. Previews match the public report exactly (16:6).</p>
        </div>
        <button className="ad-btn" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </header>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {TRENDS.map((n) => {
          const pos = positions[n] ?? 50;
          const url = urls[n];
          return (
            <div
              key={n}
              style={{
                border: '1px solid #2A2A2A',
                borderRadius: 10,
                overflow: 'hidden',
                background: '#111',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 6',
                  maxHeight: 260,
                  background: '#000',
                  overflow: 'hidden',
                }}
              >
                {url ? (
                  <img
                    src={url}
                    alt={`Trend ${n} header`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: `center ${pos}%`,
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#555',
                      fontSize: 12,
                    }}
                  >
                    No image
                  </div>
                )}
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 10,
                  }}
                >
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                    Trend {String(n).padStart(2, '0')}
                  </span>
                  <span style={{ color: '#888', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
                    {Math.round(pos)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={pos}
                  onChange={(e) => setPositions((prev) => ({ ...prev, [n]: Number(e.target.value) }))}
                  className="header-img-slider"
                  style={{
                    width: '100%',
                    height: 6,
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    background: `linear-gradient(to right, #FF0069 0%, #FF0069 ${pos}%, #333 ${pos}%, #333 100%)`,
                    borderRadius: 3,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ color: '#555', fontSize: 10 }}>Top</span>
                  <span style={{ color: '#555', fontSize: 10 }}>Bottom</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}