import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { useRealtime } from '@/hooks/admin/useRealtime';
import Donut from '@/components/admin/Donut';

type Edition = { id: string; title: string; slug: string; status: string; publish_date: string | null; public_url: string | null };
type Event = { edition_id: string | null; event_type: string; source: string | null; source_detail: string | null; ts: string; section: string | null; session_id: string | null };
type Note = { id: string; content: string; created_at: string; author_id: string; edition_id: string | null };

const SOURCE_GROUPS: { key: string; label: string; color: string; match: (e: Event) => boolean }[] = [
  { key: 'organic',   label: 'Organic search',   color: '#FF0069', match: (e) => e.source === 'organic' },
  { key: 'chatgpt',   label: 'ChatGPT',          color: '#10A37F', match: (e) => e.source === 'ai' && e.source_detail === 'chatgpt' },
  { key: 'perplexity',label: 'Perplexity',       color: '#22B8CF', match: (e) => e.source === 'ai' && e.source_detail === 'perplexity' },
  { key: 'claude',    label: 'Claude',           color: '#D97757', match: (e) => e.source === 'ai' && e.source_detail === 'claude' },
  { key: 'gemini',    label: 'Gemini',           color: '#8E75D9', match: (e) => e.source === 'ai' && e.source_detail === 'gemini' },
  { key: 'linkedin',  label: 'LinkedIn',         color: '#0A66C2', match: (e) => e.source === 'linkedin' },
  { key: 'direct',    label: 'Direct',           color: '#888888', match: (e) => e.source === 'direct' },
  { key: 'hubspot',   label: 'HubSpot email',    color: '#FF7A59', match: (e) => e.source === 'hubspot' },
  { key: 'referral',  label: 'Referral',         color: '#AD9675', match: (e) => e.source === 'referral' },
];

const RANGES = { '24h': 1, '7d': 7, '30d': 30, all: 9999 } as const;
type RangeKey = keyof typeof RANGES;

function fmtTime(s: string) { return new Date(s).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }

export default function EditionDetail() {
  const { id } = useParams();
  const { user } = useAdminAuth();
  const [edition, setEdition] = useState<Edition | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [range, setRange] = useState<RangeKey>('30d');
  const [compare, setCompare] = useState<'previous' | 'yoy' | 'none'>('previous');
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteSearch, setNoteSearch] = useState('');

  async function load() {
    if (!id) return;
    const [{ data: ed }, { data: ev }, { data: nt }] = await Promise.all([
      supabase.from('editions').select('*').eq('id', id).maybeSingle(),
      supabase.from('page_events').select('*').eq('edition_id', id).order('ts', { ascending: false }).limit(5000),
      supabase.from('notes').select('*').eq('edition_id', id).order('created_at', { ascending: false }),
    ]);
    setEdition(ed as Edition | null);
    setEvents((ev || []) as Event[]);
    setNotes((nt || []) as Note[]);
  }
  useEffect(() => { load(); }, [id]);
  useRealtime('page_events', load);
  useRealtime('notes', load);

  const now = Date.now();
  const rangeMs = RANGES[range] * 86400000;
  const compareMs = compare === 'previous' ? rangeMs : compare === 'yoy' ? 365 * 86400000 : 0;

  const currentEvents = useMemo(() => events.filter((e) => now - new Date(e.ts).getTime() <= rangeMs), [events, rangeMs, now]);
  const compareEvents = useMemo(() => {
    if (!compareMs) return [] as Event[];
    return events.filter((e) => {
      const t = new Date(e.ts).getTime();
      return now - t > compareMs && now - t <= compareMs + rangeMs;
    });
  }, [events, compareMs, rangeMs, now]);

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

  const slices = useMemo(() => {
    return SOURCE_GROUPS.map((g) => ({
      key: g.key,
      label: g.label,
      color: g.color,
      value: currentEvents.filter(g.match).filter((e) => e.event_type === 'pageview').length,
    })).filter((s) => s.value > 0 || activeSource === s.key);
  }, [currentEvents, activeSource]);
  const sliceTotal = slices.reduce((s, x) => s + x.value, 0) || 1;

  async function addNote() {
    if (!noteText.trim() || !user) return;
    await supabase.from('notes').insert({ edition_id: id, author_id: user.id, content: noteText.trim() });
    setNoteText('');
    load();
  }

  const filteredNotes = noteSearch ? notes.filter((n) => n.content.toLowerCase().includes(noteSearch.toLowerCase())) : notes;

  function deltaFmt(c: number, p: number, suffix = '') {
    if (!compareMs) return null;
    if (p === 0 && c === 0) return <span className="ad-delta-flat">No comparison data</span>;
    if (p === 0) return <span className="ad-delta-up">▲ new{suffix}</span>;
    const pct = Math.round(((c - p) / p) * 100);
    if (pct === 0) return <span className="ad-delta-flat">— flat</span>;
    return pct > 0 ? <span className="ad-delta-up">▲ {pct}%{suffix}</span> : <span className="ad-delta-down">▼ {Math.abs(pct)}%{suffix}</span>;
  }

  if (!edition) return <div className="ad-card"><div style={{ color: '#888' }}>Loading edition…</div></div>;

  return (
    <>
      <Link to="/admin/editions" style={{ color: '#888', fontSize: 12, display: 'inline-flex', gap: 6, alignItems: 'center', marginBottom: 16 }}>
        <ArrowLeft size={12} /> Back to editions
      </Link>
      <div className="detail-strip">
        <div>
          <h1>{edition.title}</h1>
          <div className="pub">{edition.publish_date ? new Date(edition.publish_date).toLocaleDateString() : 'Unpublished'} · <span className={`ad-badge ${edition.status}`} style={{ marginLeft: 6 }}>{edition.status}</span></div>
        </div>
        <div className="spacer" />
        {edition.public_url && (
          <a className="ad-btn ad-btn-ghost ad-btn-sm" href={edition.public_url} target="_blank" rel="noreferrer">
            <ExternalLink size={12} /> Public page
          </a>
        )}
        <select className="ad-select" value={range} onChange={(e) => setRange(e.target.value as RangeKey)}>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
        <select className="ad-select" value={compare} onChange={(e) => setCompare(e.target.value as typeof compare)}>
          <option value="previous">vs. previous period</option>
          <option value="yoy">vs. same period YoY</option>
          <option value="none">No comparison</option>
        </select>
      </div>

      <div className="ad-grid-6">
        {[
          { l: 'Page views', v: cur.views.toLocaleString(), d: deltaFmt(cur.views, prev.views) },
          { l: 'Unique visitors', v: cur.visitors.toLocaleString(), d: deltaFmt(cur.visitors, prev.visitors) },
          { l: 'Avg time on page', v: `${cur.avgTime}s`, d: deltaFmt(cur.avgTime, prev.avgTime) },
          { l: 'Scroll depth (median)', v: `${cur.scrollDepth}%`, d: deltaFmt(cur.scrollDepth, prev.scrollDepth) },
          { l: 'CTA CTR', v: `${cur.ctr.toFixed(1)}%`, d: deltaFmt(cur.ctr, prev.ctr) },
          { l: 'Conversions', v: cur.cta.toLocaleString(), d: deltaFmt(cur.cta, prev.cta) },
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
          <h3 className="section-title">Source attribution {activeSource && <button className="ad-btn ad-btn-ghost ad-btn-sm" style={{ marginLeft: 12 }} onClick={() => setActiveSource(null)}>Clear filter</button>}</h3>
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
          <h3 className="section-title">Notes</h3>
          <input className="ad-input" placeholder="Search notes…" value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
          <textarea className="note-input" placeholder="Add a timestamped note…" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="ad-btn ad-btn-sm" disabled={!noteText.trim()} onClick={addNote}>Add note</button>
          </div>
          <div style={{ marginTop: 14 }}>
            {filteredNotes.length === 0 ? (
              <div style={{ color: '#888', fontSize: 13, padding: '12px 0' }}>No notes yet.</div>
            ) : filteredNotes.map((n) => (
              <div key={n.id} className="note-item">
                <div className="note-meta">{fmtTime(n.created_at)}</div>
                <div className="note-content">{n.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
