import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authErr } = await userClient.auth.getClaims(token);
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const uid = claims.claims.sub;

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', uid);
    if (!roles?.some((r) => r.role === 'admin')) {
      return new Response(JSON.stringify({ error: 'Admins only' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Gather data snapshot (last 30 days)
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [editionsRes, trendsRes, eventsRes, deploymentsRes, keywordsRes] = await Promise.all([
      admin.from('editions').select('id, title, status, publish_date').order('publish_date', { ascending: false }).limit(20),
      admin.from('trend_cards').select('id, title, category, performance_score, edition_id').order('performance_score', { ascending: false, nullsFirst: false }).limit(40),
      admin.from('page_events').select('edition_id, event_type, section, card_id, source, ts').gte('ts', since).limit(2000),
      admin.from('deployments').select('edition_id, channel, status, recipient_count, deployed_at'),
      admin.from('aeo_keywords').select('keyword, current_rank, previous_rank').limit(30),
    ]);

    // Aggregate events
    const eventsByEdition: Record<string, { views: number; sectionViews: Record<string, number>; cardClicks: Record<string, number> }> = {};
    for (const ev of eventsRes.data || []) {
      const id = ev.edition_id || 'unknown';
      eventsByEdition[id] ??= { views: 0, sectionViews: {}, cardClicks: {} };
      if (ev.event_type === 'page_view') eventsByEdition[id].views++;
      if (ev.section) eventsByEdition[id].sectionViews[ev.section] = (eventsByEdition[id].sectionViews[ev.section] || 0) + 1;
      if (ev.card_id) eventsByEdition[id].cardClicks[ev.card_id] = (eventsByEdition[id].cardClicks[ev.card_id] || 0) + 1;
    }

    const snapshot = {
      window_days: 30,
      editions: editionsRes.data,
      trends_top: trendsRes.data,
      engagement_by_edition: eventsByEdition,
      deployments: deploymentsRes.data,
      keywords: keywordsRes.data,
    };

    const systemPrompt = `You are the AI analyst for ExhibitHappy's editorial dashboard. Inspect the JSON snapshot of editorial editions, trend cards, page events, deployments, and AEO keywords. Produce 5-8 plain-language insights covering: engagement anomalies, top/bottom performers, week-over-week shifts, content recommendations (which trends need new copy, which underperform in Compact vs Depth), and new trend candidates from emerging tags. Keep each body 1-2 sentences, specific, and actionable. Use the produce_insights tool.`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Data snapshot:\n```json\n' + JSON.stringify(snapshot).slice(0, 60000) + '\n```' },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'produce_insights',
              description: 'Return structured insights about the editorial data.',
              parameters: {
                type: 'object',
                properties: {
                  insights: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        kind: { type: 'string', enum: ['engagement', 'anomaly', 'recommendation', 'trend'] },
                        title: { type: 'string' },
                        body: { type: 'string' },
                        edition_id: { type: 'string', description: 'Related edition id if applicable' },
                        card_id: { type: 'string', description: 'Related trend card id if applicable' },
                      },
                      required: ['kind', 'title', 'body'],
                    },
                  },
                },
                required: ['insights'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'produce_insights' } },
      }),
    });

    if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error('AI error', aiRes.status, t);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: 'No insights returned' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const args = JSON.parse(toolCall.function.arguments);
    const insights = (args.insights || []) as Array<{ kind: string; title: string; body: string; edition_id?: string; card_id?: string }>;

    // Clear old insights of these kinds (keep last refresh only) - optional: keep history
    const rows = insights.map((i) => ({
      insight_type: i.kind,
      kind: i.kind,
      title: i.title,
      content: i.body,
      status: 'new',
      edition_id: i.edition_id || null,
      metadata: { card_id: i.card_id || null },
    }));
    if (rows.length) await admin.from('ai_insights').insert(rows);

    return new Response(JSON.stringify({ ok: true, count: rows.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('insights-generate error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});