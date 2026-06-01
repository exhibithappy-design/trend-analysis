import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { useRealtime } from '@/hooks/admin/useRealtime';

type Edition = { id: string; title: string; publish_date: string | null; status: string };
type Channel = { id: string; name: string; slug: string };
type Dep = {
  id: string; edition_id: string; channel: string; status: string;
  deployed_at: string | null; recipient_count: number; external_url: string | null; notes: string | null; updated_at: string;
};

function statusClass(s: string) {
  switch (s) {
    case 'live':
    case 'completed': return 'green';
    case 'queued': return 'amber';
    case 'failed': return 'red';
    default: return 'gray';
  }
}
function statusLabel(s: string) {
  return s.replace('_', ' ');
}

export default function Distribution() {
  const { isAdmin, user } = useAdminAuth();
  const [editions, setEditions] = useState<Edition[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [deps, setDeps] = useState<Dep[]>([]);

  async function load() {
    const [{ data: ed }, { data: ch }, { data: dp }] = await Promise.all([
      supabase.from('editions').select('id, title, publish_date, status').neq('status', 'archived').order('publish_date', { ascending: false, nullsFirst: false }),
      supabase.from('channels').select('*').order('display_order'),
      supabase.from('deployments').select('*'),
    ]);
    setEditions((ed || []) as Edition[]);
    setChannels((ch || []) as Channel[]);
    setDeps((dp || []) as Dep[]);
  }
  useEffect(() => { load(); }, []);
  useRealtime('deployments', load);
  useRealtime('editions', load);
  useRealtime('channels', load);

  const stalled = useMemo(() => {
    const cutoff = Date.now() - 5 * 86400000;
    return deps.filter((d) => d.status === 'queued' && new Date(d.updated_at).getTime() < cutoff);
  }, [deps]);

  function cellFor(editionId: string, channelSlug: string) {
    return deps.find((d) => d.edition_id === editionId && d.channel === channelSlug);
  }

  async function markDeployed(editionId: string, channelSlug: string, existing?: Dep) {
    if (!isAdmin) return;
    if (existing) {
      await supabase.from('deployments').update({ status: 'completed', deployed_at: new Date().toISOString(), deployed_by: user?.id }).eq('id', existing.id);
    } else {
      await supabase.from('deployments').insert({ edition_id: editionId, channel: channelSlug, status: 'completed', deployed_at: new Date().toISOString(), deployed_by: user?.id });
    }
    load();
  }

  async function addNote(dep: Dep) {
    const text = prompt('Add a deployment note:');
    if (!text || !user) return;
    await supabase.from('notes').insert({ deployment_id: dep.id, edition_id: dep.edition_id, author_id: user.id, content: text });
    alert('Note added.');
  }

  return (
    <>
      <header className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Distribution tracker</h1>
          <p className="ad-page-sub">{editions.length} editions across {channels.length} channels</p>
        </div>
      </header>

      {stalled.length > 0 && (
        <div className="alert-banner">
          <AlertTriangle size={16} />
          <span><strong>{stalled.length}</strong> deployment{stalled.length === 1 ? '' : 's'} stalled in queued state for more than 5 days.</span>
        </div>
      )}

      {editions.length === 0 ? (
        <div className="ad-card ad-empty">
          <div className="ad-empty-title">No active editions</div>
          <div className="ad-empty-sub">Create or unarchive an edition to track its distribution.</div>
        </div>
      ) : (
        <div className="dist-matrix">
          <table>
            <thead>
              <tr>
                <th className="row-head">Edition</th>
                {channels.map((c) => (<th key={c.id}>{c.name}</th>))}
              </tr>
            </thead>
            <tbody>
              {editions.map((e) => (
                <tr key={e.id}>
                  <td className="row-head">
                    <div className="cell-title" style={{ color: '#fff', fontWeight: 500, fontSize: 13 }}>{e.title}</div>
                    <div className="cell-sub" style={{ color: '#555', fontSize: 11, marginTop: 2 }}>{e.publish_date ? new Date(e.publish_date).toLocaleDateString() : 'Unpublished'}</div>
                  </td>
                  {channels.map((c) => {
                    const d = cellFor(e.id, c.slug);
                    const s = d?.status || 'not_deployed';
                    return (
                      <td key={c.id} className="dist-cell">
                        <div className="dist-cell-status"><span className={`ad-dot ${statusClass(s)}`} /> <span style={{ color: '#fff' }}>{statusLabel(s)}</span></div>
                        <div className="dist-cell-meta">
                          {d?.deployed_at ? `Deployed ${new Date(d.deployed_at).toLocaleDateString()}` : d ? `Updated ${new Date(d.updated_at).toLocaleDateString()}` : '—'}
                          {d && d.recipient_count > 0 && <> · {d.recipient_count.toLocaleString()} recipients</>}
                        </div>
                        <div className="dist-cell-actions">
                          {isAdmin && s !== 'completed' && (
                            <button className="ad-icon-btn" title="Mark as deployed" onClick={() => markDeployed(e.id, c.slug, d)}>
                              <Check size={12} />
                            </button>
                          )}
                          {d && (
                            <button className="ad-icon-btn" title="Add note" onClick={() => addNote(d)}>
                              <FileText size={12} />
                            </button>
                          )}
                          {d?.external_url && (
                            <a className="ad-icon-btn" href={d.external_url} target="_blank" rel="noreferrer" title="Open deployment record">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
