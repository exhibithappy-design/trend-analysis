import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, RefreshCw, ExternalLink, AlertTriangle, TrendingUp, Lightbulb, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { useRealtime } from '@/hooks/admin/useRealtime';
import { SEED_INSIGHTS, type SeedInsight } from '@/lib/admin/seedInsights';
import { toast } from 'sonner';

type Insight = {
  id: string;
  kind: string;
  insight_type: string;
  title: string | null;
  content: string;
  status: string;
  generated_at: string;
  edition_id: string | null;
  metadata: { card_id?: string | null } | null;
};

const KIND_META: Record<string, { icon: typeof Sparkles; label: string; dot: string }> = {
  engagement: { icon: TrendingUp, label: 'Engagement', dot: 'green' },
  anomaly: { icon: AlertTriangle, label: 'Anomaly', dot: 'amber' },
  recommendation: { icon: Lightbulb, label: 'Recommendation', dot: 'gold' },
  trend: { icon: Activity, label: 'Trend candidate', dot: 'pink' },
};

export default function Insights() {
  const { isAdmin } = useAdminAuth();
  const [tab, setTab] = useState<'engagement' | 'recommendation'>('engagement');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastGen, setLastGen] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from('ai_insights')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(40);
    const rows = (data || []) as Insight[];
    setInsights(rows);
    if (rows.length) setLastGen(rows[0].generated_at);
  }
  useEffect(() => { load(); }, []);
  useRealtime('ai_insights', load);

  async function refresh() {
    if (!isAdmin) return;
    setRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/insights-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.status === 402) toast.error('AI credits exhausted. Add credits in Workspace Settings → Usage.');
      else if (res.status === 429) toast.error('Rate limit hit — try again in a minute.');
      else if (!res.ok) {
        const t = await res.json().catch(() => ({ error: 'Unknown error' }));
        toast.error(t.error || 'Failed to refresh insights');
      } else {
        toast.success('Insights refreshed');
        load();
      }
    } catch (e) {
      toast.error('Network error');
    }
    setRefreshing(false);
  }

  const showSeeds = insights.length === 0;

  const engagementItems: (Insight | SeedInsight)[] = showSeeds
    ? SEED_INSIGHTS.filter((s) => s.kind === 'engagement' || s.kind === 'anomaly')
    : insights.filter((i) => i.kind === 'engagement' || i.kind === 'anomaly');

  const recItems: (Insight | SeedInsight)[] = showSeeds
    ? SEED_INSIGHTS.filter((s) => s.kind === 'recommendation' || s.kind === 'trend')
    : insights.filter((i) => i.kind === 'recommendation' || i.kind === 'trend');

  const items = tab === 'engagement' ? engagementItems : recItems;

  return (
    <>
      <header className="ad-page-header">
        <div>
          <h1 className="ad-page-title">AI insights</h1>
          <p className="ad-page-sub">
            {showSeeds
              ? 'Sample insights shown — refresh to generate real ones from your data.'
              : lastGen
              ? `Last generated ${new Date(lastGen).toLocaleString()}`
              : 'Plain-language insights from the data layer'}
          </p>
        </div>
        {isAdmin && (
          <button className="ad-btn" onClick={refresh} disabled={refreshing}>
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Generating…' : 'Refresh insights'}
          </button>
        )}
      </header>

      <div className="ad-tabs">
        <button className={'ad-tab' + (tab === 'engagement' ? ' active' : '')} onClick={() => setTab('engagement')}>
          Engagement insights
        </button>
        <button className={'ad-tab' + (tab === 'recommendation' ? ' active' : '')} onClick={() => setTab('recommendation')}>
          Content recommendations
        </button>
      </div>

      {items.length === 0 ? (
        <div className="ad-card ad-empty">
          <div className="ad-empty-title">No {tab === 'engagement' ? 'engagement insights' : 'recommendations'} yet</div>
          <div className="ad-empty-sub">Click "Refresh insights" to generate them from your latest data.</div>
        </div>
      ) : (
        <div className="ad-insight-grid">
          {items.map((i) => <InsightCard key={i.id} item={i} />)}
        </div>
      )}
    </>
  );
}

function InsightCard({ item }: { item: Insight | SeedInsight }) {
  const kind = (item as any).kind || (item as any).insight_type || 'engagement';
  const meta = KIND_META[kind] || KIND_META.engagement;
  const Icon = meta.icon;
  const isSeed = 'sample' in item;
  const title = (item as Insight).title || (item as SeedInsight).title || meta.label;
  const body = (item as any).content || (item as any).body || '';
  const editionId = (item as Insight).edition_id || (item as SeedInsight).metadata?.edition_id;
  const cardId = (item as Insight).metadata?.card_id || (item as SeedInsight).metadata?.card_id;

  return (
    <div className="ad-card ad-insight-card">
      <div className="ad-insight-head">
        <span className={`ad-dot ${meta.dot}`} />
        <Icon size={13} style={{ color: '#888' }} />
        <span className="ad-insight-kind">{meta.label}</span>
        {isSeed && <span className="ad-insight-sample">Sample</span>}
      </div>
      <div className="ad-insight-title">{title}</div>
      <div className="ad-insight-body">{body}</div>
      <div className="ad-insight-actions">
        {editionId && (
          <Link className="ad-link" to={`/admin/editions/${editionId}`}>
            View edition <ExternalLink size={11} />
          </Link>
        )}
        {cardId && (
          <Link className="ad-link" to={`/admin/content?card=${cardId}`}>
            Open in Library <ExternalLink size={11} />
          </Link>
        )}
      </div>
    </div>
  );
}