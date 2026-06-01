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
    if (!roles?.length) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Build a compact data snapshot to ground the model
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [eds, trends, evCount, deps, kws] = await Promise.all([
      admin.from('editions').select('id, title, status, publish_date').order('publish_date', { ascending: false }).limit(15),
      admin.from('trend_cards').select('id, title, category, performance_score, edition_id, tags').order('performance_score', { ascending: false, nullsFirst: false }).limit(30),
      admin.from('page_events').select('event_type, section, edition_id, ts').gte('ts', since).limit(500),
      admin.from('deployments').select('edition_id, channel, status, recipient_count'),
      admin.from('aeo_keywords').select('keyword, current_rank, previous_rank').limit(25),
    ]);

    const dataContext = JSON.stringify({
      editions: eds.data,
      trend_cards: trends.data,
      recent_events_sample: evCount.data?.slice(0, 200),
      event_counts_by_type: (evCount.data || []).reduce((acc: Record<string, number>, e: any) => {
        acc[e.event_type] = (acc[e.event_type] || 0) + 1;
        return acc;
      }, {}),
      deployments: deps.data,
      aeo_keywords: kws.data,
    }).slice(0, 40000);

    const systemPrompt = `You are the AI data assistant for ExhibitHappy's editorial admin dashboard. Answer questions grounded in the data snapshot below. Be concise, cite specific edition titles, trend names, or numbers when relevant, and use markdown for structure. If asked about something not in the data, say so.\n\nDATA SNAPSHOT (last 30 days):\n${dataContext}`;

    // Persist last user message
    const lastUser = [...messages].reverse().find((m: any) => m.role === 'user');
    if (lastUser) {
      await admin.from('ai_chat_messages').insert({ user_id: uid, role: 'user', content: lastUser.content });
    }

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!aiRes.ok || !aiRes.body) {
      const t = await aiRes.text();
      console.error('AI error', aiRes.status, t);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Tee stream: pass through to client, collect for persistence
    let assistantText = '';
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const reader = aiRes.body.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
            buffer += decoder.decode(value, { stream: true });
            let idx;
            while ((idx = buffer.indexOf('\n')) !== -1) {
              let line = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 1);
              if (line.endsWith('\r')) line = line.slice(0, -1);
              if (!line.startsWith('data: ')) continue;
              const json = line.slice(6).trim();
              if (json === '[DONE]') continue;
              try {
                const parsed = JSON.parse(json);
                const c = parsed.choices?.[0]?.delta?.content;
                if (c) assistantText += c;
              } catch { /* ignore */ }
            }
          }
        } finally {
          controller.close();
          if (assistantText.trim()) {
            await admin.from('ai_chat_messages').insert({ user_id: uid, role: 'assistant', content: assistantText });
          }
        }
      },
    });

    return new Response(stream, { headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' } });
  } catch (e) {
    console.error('admin-chat error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});