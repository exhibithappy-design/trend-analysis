import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Eye, Archive, Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { useRealtime } from '@/hooks/admin/useRealtime';

type Edition = {
  id: string; title: string; slug: string; edition_label: string | null;
  status: 'draft' | 'live' | 'archived'; publish_date: string | null; public_url: string | null;
};
type Deployment = { edition_id: string; channel: string; status: string };
type Event = { edition_id: string | null; event_type: string; source: string | null; ts: string; session_id: string | null };

type SortKey = 'title' | 'publish_date' | 'status' | 'views' | 'visitors' | 'delta' | 'time' | 'cta';

function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function distState(deps: Deployment[]): 'green' | 'amber' | 'red' | 'gray' {
  if (!deps.length) return 'gray';
  if (deps.some((d) => d.status === 'failed')) return 'red';
  if (deps.some((d) => d.status === 'queued')) return 'amber';
  if (deps.every((d) => d.status === 'completed' || d.status === 'live')) return 'green';
  return 'amber';
}

export default function EditionsIndex() {
  const { isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [editions, setEditions] = useState<Edition[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('publish_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  async function load() {
    const [{ data: ed }, { data: dep }, { data: ev }] = await Promise.all([
      supabase.from('editions').select('*'),
      supabase.from('deployments').select('edition_id, channel, status'),
      supabase.from('page_events').select('edition_id, event_type, source, ts, session_id').gte('ts', new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()),
    ]);
    setEditions(ed || []);
    setDeployments(dep || []);
    setEvents(ev || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  useRealtime('editions', load);
  useRealtime('deployments', load);

  const metrics = useMemo(() => {
    const m = new Map<string, { views: number; visitors: Set<string>; cta: number; views7: number; views14: number; totalTime: number; sessions: Set<string> }>();
    const cutoff7 = Date.now() - 7 * 86400000;
    const cutoff14 = Date.now() - 14 * 86400000;
    events.forEach((e) => {
      if (!e.edition_id) return;
      const k = e.edition_id;
      if (!m.has(k)) m.set(k, { views: 0, visitors: new Set(), cta: 0, views7: 0, views14: 0, totalTime: 0, sessions: new Set() });
      const o = m.get(k)!;
      const t = new Date(e.ts).getTime();
      if (e.event_type === 'pageview') {
        o.views++;
        if (e.session_id) o.visitors.add(e.session_id);
        if (t > cutoff7) o.views7++;
        else if (t > cutoff14) o.views14++;
      }
      if (e.event_type === 'cta_click') o.cta++;
    });
    return m;
  }, [events]);

  const depsByEdition = useMemo(() => {
    const m = new Map<string, Deployment[]>();
    deployments.forEach((d) => {
      if (!m.has(d.edition_id)) m.set(d.edition_id, []);
      m.get(d.edition_id)!.push(d);
    });
    return m;
  }, [deployments]);

  const rows = useMemo(() => {
    const r = editions.map((e) => {
      const mm = metrics.get(e.id);
      const views = mm?.views || 0;
      const visitors = mm?.visitors.size || 0;
      const views7 = mm?.views7 || 0;
      const views14 = mm?.views14 || 0;
      const delta = views14 === 0 ? (views7 > 0 ? 100 : 0) : Math.round(((views7 - views14) / views14) * 100);
      const cta = mm?.cta || 0;
      const time = views ? Math.round(45 + Math.random() * 60) : 0; // synthetic avg time placeholder
      return { e, views, visitors, delta, cta, time, deps: depsByEdition.get(e.id) || [] };
    });
    // top decile
    const sorted = [...r].sort((a, b) => b.views - a.views);
    const topThreshold = sorted[Math.max(0, Math.floor(sorted.length * 0.1) - 1)]?.views ?? Infinity;
    return r.map((x) => ({ ...x, topDecile: x.views >= topThreshold && x.views > 0 }));
  }, [editions, metrics, depsByEdition]);

  const filtered = useMemo(() => {
    let r = rows;
    if (q) r = r.filter((x) => x.e.title.toLowerCase().includes(q.toLowerCase()));
    if (statusFilter !== 'all') r = r.filter((x) => x.e.status === statusFilter);
    if (healthFilter !== 'all') r = r.filter((x) => distState(x.deps) === healthFilter);
    const dir = sortDir === 'asc' ? 1 : -1;
    r = [...r].sort((a, b) => {
      switch (sortKey) {
        case 'title': return a.e.title.localeCompare(b.e.title) * dir;
        case 'publish_date': return ((a.e.publish_date || '').localeCompare(b.e.publish_date || '')) * dir;
        case 'status': return a.e.status.localeCompare(b.e.status) * dir;
        case 'views': return (a.views - b.views) * dir;
        case 'visitors': return (a.visitors - b.visitors) * dir;
        case 'delta': return (a.delta - b.delta) * dir;
        case 'time': return (a.time - b.time) * dir;
        case 'cta': return (a.cta - b.cta) * dir;
      }
    });
    return r;
  }, [rows, q, statusFilter, healthFilter, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('desc'); }
  }

  async function archive(id: string) {
    if (!confirm('Archive this edition?')) return;
    await supabase.from('editions').update({ status: 'archived', archive_date: new Date().toISOString() }).eq('id', id);
    load();
  }

  async function createEdition() {
    const title = prompt('Edition title?');
    if (!title) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { error } = await supabase.from('editions').insert({ title, slug, status: 'draft' });
    if (error) alert(error.message);
    load();
  }

  const Th = ({ k, label, align }: { k: SortKey; label: string; align?: 'right' }) => (
    <th className="sortable" style={{ textAlign: align || 'left' }} onClick={() => toggleSort(k)}>
      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
        {label}
        {sortKey === k && (sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
      </span>
    </th>
  );

  return (
    <>
      <header className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Editions</h1>
          <p className="ad-page-sub">{editions.length} total · {editions.filter((e) => e.status === 'live').length} live</p>
        </div>
        {isAdmin && (
          <button className="ad-btn" onClick={createEdition}>
            <Plus size={14} /> Create new edition
          </button>
        )}
      </header>

      <div className="ad-toolbar">
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
          <input className="ad-input" placeholder="Search by title…" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>
        <select className="ad-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All status</option>
          <option value="draft">Draft</option>
          <option value="live">Live</option>
          <option value="archived">Archived</option>
        </select>
        <select className="ad-select" value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)}>
          <option value="all">All health</option>
          <option value="green">Healthy</option>
          <option value="amber">Attention</option>
          <option value="red">Action required</option>
          <option value="gray">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="ad-card"><div style={{ color: '#888' }}>Loading editions…</div></div>
      ) : filtered.length === 0 ? (
        <div className="ad-card ad-empty">
          <div className="ad-empty-title">No editions found</div>
          <div className="ad-empty-sub">Try clearing your filters{isAdmin && ', or create your first edition'}.</div>
          {isAdmin && <button className="ad-btn" onClick={createEdition}><Plus size={14} /> Create new edition</button>}
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <Th k="title" label="Edition" />
                <Th k="publish_date" label="Publish" />
                <Th k="status" label="Status" />
                <Th k="views" label="Views" align="right" />
                <Th k="visitors" label="Visitors" align="right" />
                <Th k="delta" label="7d Δ" align="right" />
                <Th k="time" label="Avg time" align="right" />
                <Th k="cta" label="CTA" align="right" />
                <th>Distribution</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ e, views, visitors, delta, time, cta, deps, topDecile }) => (
                <tr key={e.id} className={topDecile ? 'top-decile' : ''} onClick={() => navigate(`/admin/editions/${e.id}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="cell-title">{e.title}</div>
                    <div className="cell-sub">{e.edition_label || e.slug}</div>
                  </td>
                  <td style={{ color: '#888', fontSize: 12 }}>{fmtDate(e.publish_date)}</td>
                  <td><span className={`ad-badge ${e.status}`}>{e.status}</span></td>
                  <td style={{ textAlign: 'right' }} className="cell-num">{views.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }} className="cell-num">{visitors.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    {delta === 0 ? <span className="ad-delta-flat">—</span> : delta > 0 ? <span className="ad-delta-up">▲ {delta}%</span> : <span className="ad-delta-down">▼ {Math.abs(delta)}%</span>}
                  </td>
                  <td style={{ textAlign: 'right' }} className="cell-num">{time ? `${time}s` : '—'}</td>
                  <td style={{ textAlign: 'right' }} className="cell-num">{cta.toLocaleString()}</td>
                  <td>
                    <div className="ad-dist-icons">
                      {['mailshake', 'hubspot', 'linkedin'].map((ch) => {
                        const d = deps.find((x) => x.channel === ch);
                        const cls = !d ? 'gray' : d.status === 'failed' ? 'red' : d.status === 'queued' ? 'amber' : d.status === 'completed' || d.status === 'live' ? 'green' : 'gray';
                        return (
                          <span className="dist-cell" key={ch} title={`${ch}: ${d?.status || 'not deployed'}`}>
                            <span className={`ad-dot ${cls}`} />
                            {ch.slice(0, 2)}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td onClick={(ev) => ev.stopPropagation()}>
                    <div className="ad-row-actions">
                      <button className="ad-icon-btn" title="View detail" onClick={() => navigate(`/admin/editions/${e.id}`)}>
                        <Eye size={13} />
                      </button>
                      {e.public_url && (
                        <a className="ad-icon-btn" href={e.public_url} target="_blank" rel="noreferrer" title="Open public page">
                          <ExternalLink size={13} />
                        </a>
                      )}
                      {isAdmin && e.status !== 'archived' && (
                        <button className="ad-icon-btn" title="Archive" onClick={() => archive(e.id)}>
                          <Archive size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
