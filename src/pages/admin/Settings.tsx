import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trash2, Plus, Plug, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { toast } from 'sonner';
import { AdSelect } from '@/components/admin/AdSelect';
import { Slider } from '@/components/ui/slider';

type Allow = { email: string; role: 'admin' | 'viewer'; invited_at: string };
type Profile = { id: string; email: string; name: string | null; notification_prefs: Record<string, boolean> };
type Channel = { id: string; name: string; slug: string; is_custom: boolean; display_order: number };

export default function Settings() {
  const { isAdmin, user } = useAdminAuth();
  const [params, setParams] = useSearchParams();
  const initial = (params.get('tab') as any) || 'profile';
  const [tab, setTab] = useState<'profile' | 'users' | 'channels' | 'integrations' | 'images'>(initial);

  function pick(t: typeof tab) {
    setTab(t);
    setParams({ tab: t }, { replace: true });
  }

  return (
    <>
      <header className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Settings</h1>
          <p className="ad-page-sub">Profile, team access, and channel configuration</p>
        </div>
      </header>
      <div className="ad-tabs">
        <button className={'ad-tab' + (tab === 'profile' ? ' active' : '')} onClick={() => pick('profile')}>Profile</button>
        {isAdmin && <button className={'ad-tab' + (tab === 'users' ? ' active' : '')} onClick={() => pick('users')}>Users</button>}
        {isAdmin && <button className={'ad-tab' + (tab === 'channels' ? ' active' : '')} onClick={() => pick('channels')}>Channels</button>}
        {isAdmin && <button className={'ad-tab' + (tab === 'integrations' ? ' active' : '')} onClick={() => pick('integrations')}>Integrations</button>}
        {isAdmin && <button className={'ad-tab' + (tab === 'images' ? ' active' : '')} onClick={() => pick('images')}>Header Images</button>}
      </div>
      {tab === 'profile' && <ProfileTab />}
      {tab === 'users' && isAdmin && <UsersTab />}
      {tab === 'channels' && isAdmin && <ChannelsTab />}
      {tab === 'integrations' && isAdmin && <IntegrationsTab />}
      {tab === 'images' && isAdmin && <HeaderImagesTab />}
    </>
  );
}

function HeaderImagesTab() {
  const TRENDS = Array.from({ length: 12 }, (_, i) => i + 1);
  const [urls, setUrls] = useState<Record<number, string>>({});
  const [positions, setPositions] = useState<Record<number, number>>({});
  const [initial, setInitial] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      // Signed URLs for each header image
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
    <div className="ad-card" style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h3 className="section-title" style={{ margin: 0 }}>Header image positions</h3>
          <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>
            Drag each slider to set the vertical crop focal point of the trend header image. 0% shows the top of the image, 100% shows the bottom. Default is 50% (center).
          </p>
        </div>
        <button className="ad-btn" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 18,
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
                borderRadius: 8,
                overflow: 'hidden',
                background: '#111',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '60%',
                  background: '#000',
                  overflow: 'hidden',
                }}
              >
                {url ? (
                  <img
                    src={url}
                    alt={`Trend ${n} header`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: `center ${pos}%`,
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
              <div style={{ padding: '12px 14px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                    Trend {String(n).padStart(2, '0')}
                  </span>
                  <span style={{ color: '#888', fontSize: 11 }}>{Math.round(pos)}%</span>
                </div>
                <Slider
                  value={[pos]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => setPositions((prev) => ({ ...prev, [n]: v[0] }))}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const [status, setStatus] = useState<{ connected: boolean; has_secret: boolean; last_synced_at: string | null } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hubspot-connect`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.ok) setStatus(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function action(act: 'connect' | 'disconnect') {
    setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hubspot-connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ action: act }),
    });
    const body = await res.json();
    if (!res.ok) toast.error(body.error || 'Action failed');
    else toast.success(act === 'connect' ? 'HubSpot connected' : 'HubSpot disconnected');
    await load();
    setBusy(false);
  }

  return (
    <div className="ad-card ad-integration-card" style={{ maxWidth: 640 }}>
      <div className="ad-integration-head">
        <div className="ad-integration-icon"><Plug size={18} /></div>
        <div style={{ flex: 1 }}>
          <div className="ad-integration-title">HubSpot</div>
          <div className="ad-integration-sub">Sync deployment metrics into the distribution tracker.</div>
        </div>
        <span className={'ad-status-pill ' + (status?.connected ? 'green' : 'amber')}>
          {status?.connected ? <><CheckCircle2 size={12} /> Connected</> : 'Pending connection'}
        </span>
      </div>

      <div className="ad-integration-body">
        {!status?.has_secret && (
          <p style={{ fontSize: 12, color: '#888', margin: '0 0 12px' }}>
            A <code style={{ color: '#fff' }}>HUBSPOT_API_KEY</code> secret needs to be added to Lovable Cloud before connecting. Ask Lovable in chat to add it, then return here to mark HubSpot connected.
          </p>
        )}
        {status?.has_secret && !status.connected && (
          <p style={{ fontSize: 12, color: '#888', margin: '0 0 12px' }}>
            Secret detected. Click connect to activate the HubSpot column on the distribution matrix.
          </p>
        )}
        {status?.connected && status.last_synced_at && (
          <p style={{ fontSize: 12, color: '#888', margin: '0 0 12px' }}>
            Last synced {new Date(status.last_synced_at).toLocaleString()}
          </p>
        )}
        {status?.connected && !status.last_synced_at && (
          <p style={{ fontSize: 12, color: '#888', margin: '0 0 12px' }}>
            Awaiting first sync. Distribution columns will populate once HubSpot returns data.
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          {!status?.connected ? (
            <button className="ad-btn" onClick={() => action('connect')} disabled={busy || !status?.has_secret}>
              <Plug size={13} /> Connect HubSpot
            </button>
          ) : (
            <button className="ad-btn ad-btn-ghost" onClick={() => action('disconnect')} disabled={busy}>
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user } = useAdminAuth();
  const [p, setP] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ email_digest: true, deployment_alerts: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setP(data as Profile);
        setName(data.name || '');
        setPrefs((data.notification_prefs as Record<string, boolean>) || prefs);
      }
    });
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ name, notification_prefs: prefs }).eq('id', user.id);
    setSaving(false);
    setMsg(error ? error.message : 'Saved.');
    setTimeout(() => setMsg(''), 2500);
  }

  return (
    <div className="ad-card" style={{ maxWidth: 560 }}>
      <h3 className="section-title">Your profile</h3>
      <label style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Email</label>
      <input className="ad-input" value={p?.email || user?.email || ''} disabled style={{ width: '100%', marginBottom: 14 }} />
      <label style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Name</label>
      <input className="ad-input" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', marginBottom: 18 }} />

      <h3 className="section-title" style={{ marginTop: 16 }}>Notifications</h3>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '6px 0' }}>
        <input type="checkbox" checked={!!prefs.email_digest} onChange={(e) => setPrefs({ ...prefs, email_digest: e.target.checked })} />
        Weekly email digest
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '6px 0' }}>
        <input type="checkbox" checked={!!prefs.deployment_alerts} onChange={(e) => setPrefs({ ...prefs, deployment_alerts: e.target.checked })} />
        Deployment alerts (failures, stalls)
      </label>

      <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center' }}>
        <button className="ad-btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        {msg && <span style={{ fontSize: 12, color: '#888' }}>{msg}</span>}
      </div>
    </div>
  );
}

function UsersTab() {
  const [rows, setRows] = useState<Allow[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'viewer'>('viewer');

  async function load() {
    const { data } = await supabase.from('authorized_emails').select('*').order('invited_at');
    setRows((data || []) as Allow[]);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!email.trim()) return;
    const { error } = await supabase.from('authorized_emails').insert({ email: email.trim().toLowerCase(), role });
    if (error) alert(error.message);
    setEmail('');
    load();
  }
  async function remove(em: string) {
    if (!confirm(`Remove ${em}?`)) return;
    await supabase.from('authorized_emails').delete().eq('email', em);
    load();
  }
  async function changeRole(em: string, r: 'admin' | 'viewer') {
    await supabase.from('authorized_emails').update({ role: r }).eq('email', em);
    load();
  }

  return (
    <div className="ad-card" style={{ maxWidth: 760 }}>
      <h3 className="section-title">Authorized users</h3>
      <div className="ad-form-row" style={{ borderBottom: '1px solid #2A2A2A', paddingBottom: 14 }}>
        <input className="ad-input" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <AdSelect
          value={role}
          onChange={(v) => setRole(v as 'admin' | 'viewer')}
          options={[{ value: 'viewer', label: 'Viewer' }, { value: 'admin', label: 'Admin' }]}
          width={140}
        />
        <button className="ad-btn" onClick={add}><Plus size={13} /> Add</button>
        <span />
      </div>

      {rows.length === 0 ? (
        <div className="ad-empty"><div className="ad-empty-sub">No authorized users yet.</div></div>
      ) : rows.map((r) => (
        <div key={r.email} className="ad-form-row">
          <div style={{ color: '#fff', fontSize: 13 }}>{r.email}</div>
          <AdSelect
            value={r.role}
            onChange={(v) => changeRole(r.email, v as 'admin' | 'viewer')}
            options={[{ value: 'viewer', label: 'Viewer' }, { value: 'admin', label: 'Admin' }]}
            width={140}
          />
          <span style={{ fontSize: 11, color: '#555' }}>{new Date(r.invited_at).toLocaleDateString()}</span>
          <button className="ad-icon-btn" onClick={() => remove(r.email)} title="Remove"><Trash2 size={13} /></button>
        </div>
      ))}
    </div>
  );
}

function ChannelsTab() {
  const [rows, setRows] = useState<Channel[]>([]);
  const [name, setName] = useState('');

  async function load() {
    const { data } = await supabase.from('channels').select('*').order('display_order');
    setRows((data || []) as Channel[]);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!name.trim()) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { error } = await supabase.from('channels').insert({ name: name.trim(), slug, is_custom: true, display_order: rows.length + 1 });
    if (error) alert(error.message);
    setName('');
    load();
  }
  async function rename(id: string, newName: string) {
    await supabase.from('channels').update({ name: newName }).eq('id', id);
    load();
  }
  async function remove(id: string) {
    if (!confirm('Remove this channel?')) return;
    await supabase.from('channels').delete().eq('id', id);
    load();
  }

  return (
    <div className="ad-card" style={{ maxWidth: 640 }}>
      <h3 className="section-title">Distribution channels</h3>
      <div className="ad-form-row" style={{ paddingBottom: 14 }}>
        <input className="ad-input" placeholder="Add channel name…" value={name} onChange={(e) => setName(e.target.value)} />
        <span />
        <button className="ad-btn" onClick={add}><Plus size={13} /> Add</button>
        <span />
      </div>
      {rows.map((c) => (
        <div key={c.id} className="ad-form-row">
          <input className="ad-input" defaultValue={c.name} onBlur={(e) => e.target.value !== c.name && rename(c.id, e.target.value)} />
          <span style={{ fontSize: 11, color: '#555' }}>{c.slug}</span>
          <span style={{ fontSize: 11, color: c.is_custom ? '#AD9675' : '#555' }}>{c.is_custom ? 'Custom' : 'Default'}</span>
          {c.is_custom && <button className="ad-icon-btn" onClick={() => remove(c.id)} title="Remove"><Trash2 size={13} /></button>}
          {!c.is_custom && <span />}
        </div>
      ))}
    </div>
  );
}
