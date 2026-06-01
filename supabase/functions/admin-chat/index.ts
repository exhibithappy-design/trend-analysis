import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Expose-Headers': 'x-conversation-id',
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

    const { messages, conversation_id } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const systemPrompt = `You are the Trend Research Lab assistant for ExhibitHappy — a senior trade-show trend analyst.

Your job is to help the editor research trade show, experiential marketing, and event design trends; surface candidate trends worth tracking for future Trend Reports; pressure-test hypotheses; and summarize signals from across the industry.

Guidelines:
- Be concise, specific, and editorial in tone — like a sharp research partner, not a chatbot.
- When proposing trend candidates, give each a short name, a one-line definition, and 2-3 concrete signals (shows, brands, formats).
- Use markdown headings, bold, and bullet lists for structure.
- If you don't have data to back something, say so honestly and propose how to validate it.
- Never reference internal analytics tables, editions, AEO, or engagement events — focus on trend research itself.`;

    // Ensure conversation exists & ownership
    let convId: string | null = conversation_id ?? null;
    const lastUser = [...messages].reverse().find((m: any) => m.role === 'user');
    if (convId) {
      const { data: conv } = await admin.from('chat_conversations').select('id, user_id').eq('id', convId).maybeSingle();
      if (!conv || conv.user_id !== uid) convId = null;
    }
    if (!convId) {
      const title = (lastUser?.content ?? 'New conversation').slice(0, 80).replace(/\s+/g, ' ').trim() || 'New conversation';
      const { data: created } = await admin.from('chat_conversations').insert({ user_id: uid, title }).select('id').single();
      convId = created?.id ?? null;
    } else {
      await admin.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);
    }

    if (lastUser && convId) {
      await admin.from('ai_chat_messages').insert({ user_id: uid, role: 'user', content: lastUser.content, conversation_id: convId });
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
          if (assistantText.trim() && convId) {
            await admin.from('ai_chat_messages').insert({ user_id: uid, role: 'assistant', content: assistantText, conversation_id: convId });
          }
        }
      },
    });

    return new Response(stream, { headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'X-Conversation-Id': convId ?? '' } });
  } catch (e) {
    console.error('admin-chat error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});