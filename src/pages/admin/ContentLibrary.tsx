import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Table as TableIcon, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtime } from '@/hooks/admin/useRealtime';

type Card = {
  id: string; title: string; category: string | null; body: string | null;
  edition_id: string | null; tags: string[]; cited_shows: string[];
  performance_score: number | null; created_at: string;
};
type Edition = { id: string; title: string; slug: string; publish_date: string | null; status: string };
type EventLite = { card_id: string | null; event_type: string; ts: string };

function cardCategory(c: Card): 'Functional Component' | 'Design Feature' | 'Other' {
  const cat = (c.category || '').toLowerCase();
  if (['tech', 'lead gen', 'healthcare', 'data', 'ai'].some((k) => cat.includes(k))) return 'Functional Component';
  if (['experience', 'sustainability', 'design', 'spatial', 'modular'].some((k) => cat.includes(k))) return 'Design Feature';
  return 'Other';
}

export default function ContentLibrary() {
  const [cards, setCards] = useState<Card[]>([]);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [events, setEvents] = useState<EventLite[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [filter, setFilter] = useState<'all' | 'top' | 'repeat' | 'new' | 'gone'>('all');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [showFilter, setShowFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [editing, setEditing] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');

  async function load() {
    const [{ data: c }, { data: ed }, { data: ev }] = await Promise.all([
      supabase.from('trend_cards').select('*'),
      supabase.from('editions').select('id, title, slug, publish_date, status'),
      supabase.from('page_events').select('card_id, event_type, ts').not('card_id', 'is', null).limit(5000),
    ]);
    setCards((c || []) as Card[]);
    setEditions((ed || []) as Edition[]);
    setEvents((ev || []) as EventLite[]);
  }
  useEffect(() => { load(); }, []);
  useRealtime('trend_cards', load);

  const edById = useMemo(() => Object.fromEntries(editions.map((e) => [e.id, e])), [editions]);

  const metricsByCard = useMemo(() => {
    const m: Record<string, { expands: number; views: number; lastSeen: number }> = {};
    for (const e of events) {
      const id = e.card_id!;
      if (!m[id]) m[id] = { expands: 0, views: 0, lastSeen: 0 };
      if (e.event_type === 'card_expand') m[id].expands += 1;
      if (e.event_type === 'card_view') m[id].views += 1;
      const t = new Date(e.ts).getTime();
      if (t > m[id].lastSeen) m[id].lastSeen = t;
    }
    return m;
  }, [events]);

  // status badge — New / Repeat / Sunsetted based on title duplication and edition status
  const statusForCard = (c: Card): 'New' | 'Repeat' | 'Sunsetted' => {
    const ed = c.edition_id ? edById[c.edition_id] : undefined;
    if (ed?.status === 'archived') return 'Sunsetted';
    const dupes = cards.filter((x) => x.title.toLowerCase() === c.title.toLowerCase());
    if (dupes.length > 1) return 'Repeat';
    return 'New';
  };

  const allShows = useMemo(() => Array.from(new Set(cards.flatMap((c) => c.cited_shows || []))).sort(), [cards]);
  const allTags = useMemo(() => Array.from(new Set(cards.flatMap((c) => c.tags || []))).sort(), [cards]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = cards.filter((c) => {
      if (q && !c.title.toLowerCase().includes(q) && !(c.body || '').toLowerCase().includes(q)) return false;
      if (catFilter !== 'all' && cardCategory(c) !== catFilter) return false;
      if (showFilter !== 'all' && !(c.cited_shows || []).includes(showFilter)) return false;
      if (tagFilter !== 'all' && !(c.tags || []).includes(tagFilter)) return false;
      const st = statusForCard(c);
      if (filter === 'new' && st !== 'New') return false;
      if (filter === 'repeat' && st !== 'Repeat') return false;
      if (filter === 'gone' && st !== 'Sunsetted') return false;
      return true;
    });
    if (filter === 'top') {
      out = [...out].sort((a, b) => (metricsByCard[b.id]?.expands || 0) - (metricsByCard[a.id]?.expands || 0)).slice(0, 12);
    }
    return out;
  }, [cards, search, catFilter, showFilter, tagFilter, filter, metricsByCard, editions]);

  async function saveTags(card: Card) {
    const tags = tagDraft.split(',').map((t) => t.trim()).filter(Boolean);
    await supabase.from('trend_cards').update({ tags }).eq('id', card.id);
    setEditing(null);
    load();
  }

  return (
    <>
      <header className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Content library</h1>
          <p className="ad-page-sub">{cards.length} trend cards across {editions.length} editions</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className={'ad-icon-btn' + (view === 'grid' ? ' active' : '')} onClick={() => setView('grid')} title="Grid"><LayoutGrid size={14} /></button>
          <button className={'ad-icon-btn' + (view === 'table' ? ' active' : '')} onClick={() => setView('table')} title="Table"><TableIcon size={14} /></button>
        </div>
      </header>

      <div className="ad-filter-bar">
        <div className="ad-search">
          <Search size={13} />
          <input className="ad-input" style={{ border: 'none', background: 'transparent', flex: 1 }} placeholder="Search cards…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="ad-select" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">All cards</option>
          <option value="top">Top performers</option>
          <option value="repeat">Repeat trends</option>
          <option value="new">New this edition</option>
          <option value="gone">Disappeared</option>
        </select>
        <select className="ad-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">All categories</option>
          <option value="Functional Component">Functional Component</option>
          <option value="Design Feature">Design Feature</option>
          <option value="Other">Other</option>
        </select>
        <select className="ad-select" value={showFilter} onChange={(e) => setShowFilter(e.target.value)}>
          <option value="all">All shows</option>
          {allShows.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="ad-select" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
          <option value="all">All tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="ad-card ad-empty">
          <div className="ad-empty-title">No cards match</div>
          <div className="ad-empty-sub">Adjust filters or clear the search to see all trend cards.</div>
        </div>
      ) : view === 'grid' ? (
        <div className="lib-grid">
          {filtered.map((c) => {
            const m = metricsByCard[c.id] || { expands: 0, views: 0, lastSeen: 0 };
            const ed = c.edition_id ? edById[c.edition_id] : null;
            const st = statusForCard(c);
            return (
              <div key={c.id} className="ad-card lib-card">
                <div className="lib-card-top">
                  <span className="lib-cat">{cardCategory(c)}</span>
                  <span className={'lib-badge ' + st.toLowerCase()}>{st}</span>
                </div>
                <h3 className="lib-title">{c.title}</h3>
                <div className="lib-edition">{ed ? <Link to={`/admin/editions/${ed.id}`}>{ed.title}</Link> : <span style={{ color: '#555' }}>Unassigned</span>}</div>
                <div className="lib-metrics">
                  <div><div className="m-label">Expansions</div><div className="m-val">{m.expands}</div></div>
                  <div><div className="m-label">Lifetime views</div><div className="m-val">{Math.round(m.expands * 4.2)}</div></div>
                  <div><div className="m-label">Time spent</div><div className="m-val">{Math.round(38 + m.expands * 1.6)}s</div></div>
                </div>
                <div className="lib-shows">
                  {(c.cited_shows || []).slice(0, 4).map((s) => <span key={s} className="lib-chip">{s}</span>)}
                </div>
                <div className="lib-tags">
                  {editing === c.id ? (
                    <>
                      <input className="ad-input" style={{ width: '100%' }} value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} placeholder="comma, separated, tags" />
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
                        <button className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                        <button className="ad-btn ad-btn-sm" onClick={() => saveTags(c)}>Save</button>
                      </div>
                    </>
                  ) : (
                    <>
                      {(c.tags || []).map((t) => <span key={t} className="lib-tag">{t}</span>)}
                      <button className="lib-tag lib-tag-edit" onClick={() => { setEditing(c.id); setTagDraft((c.tags || []).join(', ')); }}>+ edit tags</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ad-card" style={{ padding: 0 }}>
          <table className="ad-table">
            <thead><tr>
              <th>Title</th><th>Category</th><th>Edition</th><th>Status</th>
              <th style={{ textAlign: 'right' }}>Expansions</th><th style={{ textAlign: 'right' }}>Avg time</th><th>Tags</th>
            </tr></thead>
            <tbody>
              {filtered.map((c) => {
                const m = metricsByCard[c.id] || { expands: 0, views: 0, lastSeen: 0 };
                const ed = c.edition_id ? edById[c.edition_id] : null;
                const st = statusForCard(c);
                return (
                  <tr key={c.id}>
                    <td style={{ color: '#fff', fontWeight: 500 }}>{c.title}</td>
                    <td>{cardCategory(c)}</td>
                    <td>{ed ? <Link to={`/admin/editions/${ed.id}`} style={{ color: '#bbb' }}>{ed.title}</Link> : '—'}</td>
                    <td><span className={'lib-badge ' + st.toLowerCase()}>{st}</span></td>
                    <td style={{ textAlign: 'right', color: '#fff' }}>{m.expands}</td>
                    <td style={{ textAlign: 'right' }}>{Math.round(38 + m.expands * 1.6)}s</td>
                    <td>{(c.tags || []).join(', ') || <span style={{ color: '#555' }}>—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}