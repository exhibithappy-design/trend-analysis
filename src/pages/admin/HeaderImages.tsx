import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';

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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: 20,
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
                <Slider
                  value={[pos]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => setPositions((prev) => ({ ...prev, [n]: v[0] }))}
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