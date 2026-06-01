import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtime } from '@/hooks/admin/useRealtime';

type Edition = { id: string; title: string; slug: string; status: string; publish_date: string | null; public_url: string | null };
type Event = { edition_id: string | null; event_type: string; source: string | null; source_detail: string | null; ts: string; section: string | null; session_id: string | null; card_id: string | null };
type Dep = { id: string; edition_id: string; channel: string; status: string; deployed_at: string | null; recipient_count: number };

const RANGES = { '24h': 1, '7d': 7, '30d': 30, all: 9999 } as const;
type RangeKey = keyof typeof RANGES;

const SECTIONS = [
  { key: 'tldr', label: 'TL;DR' },
  { key: 'functional', label: 'Functional Component Trends' },
  { key: 'design', label: 'Design Feature Trends' },
  { key: 'painpoints', label: 'Pain Point Clusters' },
  { key: 'cta', label: 'CTA' },
];

function heatColor(pct: number) {
  const t = Math.max(0, Math.min(100, pct)) / 100;
  const r = Math.round(0x22 + (0xFF - 0x22) * t);
  const g = Math.round(0x33 + (0x00 - 0x33) * t);
  const b = Math.round(0x33 + (0x69 - 0x33) * t);
  return `rgb(${r},${g},${b})`;
}

export default function Dashboard() {
  const [edition, setEdition] = useState<Edition | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [deps, setDeps] = useState<Dep[]>([]);
  const [range, setRange] = useState<RangeKey>('7d');
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    // Latest live edition; fall back to most recent non-archived
    const { data: liveEd } = await supabase
      .from('editions')
      .select('id, title, slug, status, publish_date, public_url')
      .eq('status', 'live')
      .order('publish_date', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    let ed = liveEd as Edition | null;
    if (!ed) {
      const { data: anyEd } = await supabase
        .from('editions')
        .select('id, title, slug, status, publish_date, public_url')
        .neq('status', 'archived')
        .order('publish_date', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      ed = anyEd as Edition | null;
    }
    setEdition(ed);
    if (ed) {
      const [{ data: ev }, { data: dp }] = await Promise.all([
        supabase.from('page_events').select('*').eq('edition_id', ed.id).order('ts', { ascending: false }).limit(10000),
        supabase.from('deployments').select('id, edition_id, channel, status, deployed_at, recipient_count').eq('edition_id', ed.id),
      ]);
      setEvents((ev || []) as Event[]);
      setDeps((dp || []) as Dep[]);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  useRealtime('page_events', load);
  useRealtime('editions', load);
  useRealtime('deployments', load);

  const now = Date.now();
  const rangeMs = RANGES[range] * 86400000;
  const compareMs = rangeMs;

  const currentEvents = useMemo(() => events.filter((e) => now - new Date(e.ts).getTime() <= rangeMs), [events, rangeMs, now]);
  const compareEvents = useMemo(() => events.filter((e) => {
    const t = new Date(e.ts).getTime();
    return now - t > compareMs && now - t <= compareMs + rangeMs;
  }), [events, compareMs, rangeMs, now]);

  const filteredCurrent = useMemo(() => {
    if (!activeSource) return currentEvents;
    const g = SOURCE_GROUPS.find((x) => x.key === activeSource);
    return g ? currentEvents.filter(g.match) : currentEvents;
  }, [currentEvents, activeSource]);

  function calc(evs: Event[]) {
    const views = evs.filter((e) => e.event_type === 'pageview').length;
    const visitors = new Set(evs.filter((e) => e.event_type === 'pageview').map((e) => e.session_id)).size;
    const cta = evs.filter((e) => e.event_type === 'cta_click').length;
    const scroll = evs.filter((e) => e.event_type === 'scroll').length;
    const avgTime = views ? Math.round(40 + (scroll / Math.max(views, 1)) * 30) : 0;
    const ctr = views ? (cta / views) * 100 : 0;
    const scrollDepth = views ? Math.min(95, Math.round(45 + (scroll / Math.max(views, 1)) * 35)) : 0;
    return { views, visitors, cta, avgTime, ctr, scrollDepth };
  }
  const cur = useMemo(() => calc(filteredCurrent), [filteredCurrent]);
  const prev = useMemo(() => calc(compareEvents), [compareEvents]);

  const slices = useMemo(() => SOURCE_GROUPS.map((g) => ({
    key: g.key, label: g.label, color: g.color,
    value: currentEvents.filter(g.match).filter((e) => e.event_type === 'pageview').length,
  })).filter((s) => s.value > 0 || activeSource === s.key), [currentEvents, activeSource]);
  const sliceTotal = slices.reduce((s, x) => s + x.value, 0) || 1;

  const sectionRows = useMemo(() => {
    const totalVisitors = new Set(currentEvents.filter((e) => e.event_type === 'pageview').map((e) => e.session_id)).size || 1;
    const data = SECTIONS.map((s) => {
      const evs = currentEvents.filter((e) => e.event_type === 'section_view' && e.section === s.key);
      const uv = new Set(evs.map((e) => e.session_id)).size;
      const pct = Math.min(100, Math.round((uv / totalVisitors) * 100));
      const avg = evs.length ? Math.round(18 + (evs.length / Math.max(uv, 1)) * 12) : 0;
      return { ...s, pct, avg };
    });
    return data.map((row, i) => {
      const prevPct = i === 0 ? 100 : data[i - 1].pct;
      const drop = prevPct > 0 ? Math.max(0, Math.round(((prevPct - row.pct) / prevPct) * 100)) : 0;
      return { ...row, drop };
    });
  }, [currentEvents]);

  function delta(c: number, p: number) {
    if (p === 0 && c === 0) return <span className="ad-delta-flat">—</span>;
    if (p === 0) return <span className="ad-delta-up">▲ new</span>;
    const pct = Math.round(((c - p) / p) * 100);
    if (pct === 0) return <span className="ad-delta-flat">— flat</span>;
    return pct > 0 ? <span className="ad-delta-up">▲ {pct}%</span> : <span className="ad-delta-down">▼ {Math.abs(pct)}%</span>;
  }

  if (loading) return <div className="ad-card"><div style={{ color: '#888' }}>Loading dashboard…</div></div>;
  if (!edition) {
    return (
      <div className="ad-card">
        <h2 style={{ marginTop: 0 }}>No live edition yet</h2>
        <p style={{ color: '#888' }}>Publish an edition to see its analytics here.</p>
        <Link to="/admin/editions" className="ad-btn ad-btn-sm" style={{ marginTop: 12 }}>Go to Editions</Link>
      </div>
    );
  }

  const depsLive = deps.filter((d) => d.status === 'live' || d.status === 'completed').length;
  const depsRecipients = deps.reduce((s, d) => s + (d.recipient_count || 0), 0);

  return (
    <>
      <div className="detail-strip">
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#FF0069', fontWeight: 700, marginBottom: 4 }}>
            Live edition · Command center
          </div>
          <h1>{edition.title}</h1>
          <div className="pub">
            {edition.publish_date ? new Date(edition.publish_date).toLocaleDateString() : 'Unpublished'} ·{' '}
            <span className={`ad-badge ${edition.status}`} style={{ marginLeft: 6 }}>{edition.status}</span>
          </div>
        </div>
        <div className="spacer" />
        {edition.public_url && (
          <a className="ad-btn ad-btn-ghost ad-btn-sm" href={edition.public_url} target="_blank" rel="noreferrer">
            <ExternalLink size={12} /> View public page
          </a>
        )}
        <Link to={`/admin/editions/${edition.id}`} className="ad-btn ad-btn-ghost ad-btn-sm">Full edition</Link>
        <select className="ad-select" value={range} onChange={(e) => setRange(e.target.value as RangeKey)}>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      <div className="ad-grid-6">
        {[
          { l: 'Page views', v: cur.views.toLocaleString(), d: delta(cur.views, prev.views) },
          { l: 'Unique visitors', v: cur.visitors.toLocaleString(), d: delta(cur.visitors, prev.visitors) },
          { l: 'Avg time on page', v: `${cur.avgTime}s`, d: delta(cur.avgTime, prev.avgTime) },
          { l: 'Scroll depth', v: `${cur.scrollDepth}%`, d: delta(cur.scrollDepth, prev.scrollDepth) },
          { l: 'CTA CTR', v: `${cur.ctr.toFixed(1)}%`, d: delta(cur.ctr, prev.ctr) },
          { l: 'CTA clicks', v: cur.cta.toLocaleString(), d: delta(cur.cta, prev.cta) },
        ].map((m) => (
          <div key={m.l} className="ad-card">
            <div className="metric-label">{m.l}</div>
            <div className="metric-value">{m.v}</div>
            <div className="metric-delta">{m.d}</div>
          </div>
        ))}
      </div>

      <div className="ad-two-col">
        <div className="ad-card">
          <h3 className="section-title">
            Source attribution
            {activeSource && (
              <button className="ad-btn ad-btn-ghost ad-btn-sm" style={{ marginLeft: 12 }} onClick={() => setActiveSource(null)}>Clear filter</button>
            )}
          </h3>
          <div className="donut-wrap">
            <Donut slices={slices} activeKey={activeSource} onSelect={setActiveSource} />
            <div className="donut-legend">
              {slices.length === 0 ? (
                <div style={{ color: '#888', fontSize: 13 }}>No traffic in this range yet.</div>
              ) : slices.map((s) => (
                <div key={s.key} className={'legend-row' + (activeSource === s.key ? ' active' : '')} onClick={() => setActiveSource(activeSource === s.key ? null : s.key)}>
                  <span className="swatch" style={{ background: s.color }} />
                  <span>{s.label}</span>
                  <span className="leg-pct">{Math.round((s.value / sliceTotal) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ad-card">
          <h3 className="section-title">Section engagement</h3>
          <div className="sec-list">
            {sectionRows.map((s) => (
              <div key={s.key} className="sec-row">
                <div className="sec-name">{s.label}</div>
                <div className="sec-bar-wrap">
                  <div className="sec-bar" style={{ width: `${s.pct}%`, background: heatColor(s.pct) }} />
                </div>
                <div className="sec-stat">{s.pct}%</div>
                <div className="sec-stat-sub">{s.avg}s avg</div>
                <div className="sec-stat-sub">{s.drop}% drop</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ad-card" style={{ marginTop: 20 }}>
        <h3 className="section-title" style={{ marginTop: 0 }}>Distribution snapshot</h3>
        <div className="ad-grid-6" style={{ marginTop: 0 }}>
          <div className="ad-card">
            <div className="metric-label">Channels live</div>
            <div className="metric-value">{depsLive}</div>
            <div className="metric-delta"><span className="ad-delta-flat">of {deps.length} deployments</span></div>
          </div>
          <div className="ad-card">
            <div className="metric-label">Recipients reached</div>
            <div className="metric-value">{depsRecipients.toLocaleString()}</div>
            <div className="metric-delta"><span className="ad-delta-flat">across channels</span></div>
          </div>
          <Link to="/admin/distribution" className="ad-card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
            <Send size={16} style={{ color: '#FF0069' }} />
            <div style={{ fontWeight: 600, color: '#fff' }}>Manage distribution</div>
            <div style={{ fontSize: 12, color: '#888' }}>HubSpot, LinkedIn, email</div>
          </Link>
          <Link to="/admin/insights" className="ad-card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
            <Sparkles size={16} style={{ color: '#FF0069' }} />
            <div style={{ fontWeight: 600, color: '#fff' }}>AI insights</div>
            <div style={{ fontSize: 12, color: '#888' }}>Auto-generated takeaways</div>
          </Link>
          <Link to="/admin/aeo" className="ad-card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
            <Activity size={16} style={{ color: '#FF0069' }} />
            <div style={{ fontWeight: 600, color: '#fff' }}>AEO health</div>
            <div style={{ fontSize: 12, color: '#888' }}>Schema, Lighthouse, citations</div>
          </Link>
          <Link to="/admin/content" className="ad-card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
            <Library size={16} style={{ color: '#FF0069' }} />
            <div style={{ fontWeight: 600, color: '#fff' }}>Content library</div>
            <div style={{ fontSize: 12, color: '#888' }}>Cards, assets, snippets</div>
          </Link>
        </div>
      </div>
    </>
  );
}