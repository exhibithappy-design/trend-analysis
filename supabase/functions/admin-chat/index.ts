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
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) throw new Error('PERPLEXITY_API_KEY not configured');

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    // Use getUser() so the SDK auto-refreshes the session when the access token has expired mid-conversation.
    const { data: userData, error: authErr } = await userClient.auth.getUser();
    if (authErr || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const uid = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', uid);
    if (!roles?.length) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { messages, conversation_id } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Sanitize messages: only allow user/assistant roles, cap count and length to prevent prompt injection / abuse
    const safeMessages = (messages as any[])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-40)
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 8000) }));
    if (safeMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'no valid messages' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const systemPrompt = `You are the Trend Research Lab assistant for ExhibitHappy — a senior analyst of the NORTH AMERICAN trade show and B2B exhibitor market, with live web access via Perplexity.

Scope (strict):
- Focus exclusively on North American trade shows, conferences, and brand activations: e.g. CES, HIMSS, InfoComm, NAB, SXSW, Dreamforce, Salesforce World Tour, Adobe Summit, RSA, Black Hat, Money 20/20, NRF, Shoptalk, AWS re:Invent, Google Cloud Next, Microsoft Ignite, IBC (NA editions), ASCO, RSNA, AAOS, AACR, JPM Healthcare, SHRM, ISC West, IMTS, Pack Expo, MJBizCon, Cannes-style NA equivalents, Super Bowl activations, F1 Las Vegas/Miami/Austin, etc.
- All recommendations, signals, and trend candidates must be grounded in the NA B2B exhibitor / experiential context. If a signal is European or APAC-only, call that out explicitly and explain whether it has crossed into the NA market yet.
- The audience is exhibitors, brand marketers, and experiential agencies working primarily in the United States and Canada.

Your job: help the editor research NA trade show, experiential marketing, and event design trends; surface candidate trends worth tracking for future Trend Reports; pressure-test hypotheses; and summarize signals from across the NA industry. Always ground claims in current web sources when possible.

Guidelines:
- Be concise, specific, and editorial in tone — like a sharp research partner, not a chatbot.
- When proposing trend candidates, give each a short name, a one-line definition, and 2-3 concrete signals (NA shows, NA brands, formats).
- Use markdown headings, bold, and bullet lists for structure.
- Cite sources inline with numbered references [1], [2] that map to the citations list you receive.
- If a user attaches an image, you will receive a "[Attached image description]:" block — treat it as primary visual evidence and tie it to a specific NA trade show trend, format, or brand activation pattern.
- If you don't have data to back something, say so honestly and propose how to validate it.
- Never reference internal analytics tables, editions, AEO, or engagement events — focus on trend research itself.`;

    // Ensure conversation exists & ownership
    let convId: string | null = conversation_id ?? null;
    const lastUser = [...safeMessages].reverse().find((m) => m.role === 'user');
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

    // 55s upstream timeout so we surface a clean error before the edge function itself times out.
    const aiController = new AbortController();
    const aiTimeout = setTimeout(() => aiController.abort(), 55000);
    let aiRes: Response;
    try {
      aiRes = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${PERPLEXITY_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [{ role: 'system', content: systemPrompt }, ...safeMessages],
          stream: true,
          return_citations: true,
        }),
        signal: aiController.signal,
      });
    } catch (e) {
      clearTimeout(aiTimeout);
      const aborted = (e as any)?.name === 'AbortError';
      console.error('Perplexity fetch failed', aborted ? 'timeout' : e);
      return new Response(
        JSON.stringify({
          error: aborted
            ? 'This search took too long — try rephrasing or breaking the question into smaller parts.'
            : 'Could not reach the research model. Please try again.',
          code: aborted ? 'timeout' : 'upstream_unreachable',
        }),
        { status: aborted ? 504 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (aiRes.status === 429) { clearTimeout(aiTimeout); return new Response(JSON.stringify({ error: 'Rate limit exceeded', code: 'rate_limited' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
    if (aiRes.status === 402) { clearTimeout(aiTimeout); return new Response(JSON.stringify({ error: 'AI credits exhausted', code: 'credits_exhausted' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
    if (!aiRes.ok || !aiRes.body) {
      clearTimeout(aiTimeout);
      const t = await aiRes.text();
      console.error('Perplexity error', aiRes.status, t);
      const isTimeout = aiRes.status === 408 || aiRes.status === 504 || /timeout/i.test(t);
      return new Response(
        JSON.stringify({
          error: isTimeout
            ? 'This search took too long — try rephrasing or breaking the question into smaller parts.'
            : 'Perplexity error',
          code: isTimeout ? 'timeout' : 'upstream_error',
        }),
        { status: isTimeout ? 504 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    // Headers received — cancel the request-level timeout; streaming has its own lifecycle.
    clearTimeout(aiTimeout);

    // Tee stream: pass through to client, collect for persistence (and append citations at end)
    let assistantText = '';
    let citations: string[] = [];
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
                if (Array.isArray(parsed.citations) && parsed.citations.length) {
                  citations = parsed.citations;
                }
                if (Array.isArray(parsed.search_results) && parsed.search_results.length && !citations.length) {
                  citations = parsed.search_results.map((s: any) => s.url).filter(Boolean);
                }
              } catch { /* ignore */ }
            }
          }
          // Append a citations block as a synthetic SSE delta so the client renders it inline
          if (citations.length) {
            const block = '\n\n---\n**Sources**\n' + citations.map((u, i) => `${i + 1}. ${u}`).join('\n');
            assistantText += block;
            const chunk = `data: ${JSON.stringify({ choices: [{ delta: { content: block } }] })}\n\n`;
            controller.enqueue(encoder.encode(chunk));
          }
        } finally {
          controller.close();
          if (assistantText.trim() && convId) {
            await admin.from('ai_chat_messages').insert({ user_id: uid, role: 'assistant', content: assistantText, conversation_id: convId });
            // Auto-rename on first assistant response
            try {
              const { count } = await admin
                .from('ai_chat_messages')
                .select('id', { count: 'exact', head: true })
                .eq('conversation_id', convId)
                .eq('role', 'assistant');
              if ((count ?? 0) <= 1 && LOVABLE_API_KEY) {
                const firstUser = lastUser?.content?.slice(0, 1200) ?? '';
                const firstAssistant = assistantText.slice(0, 1200);
                const titleRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    model: 'google/gemini-2.5-flash-lite',
                    messages: [
                      { role: 'system', content: 'You write ultra-short conversation titles. Reply with ONLY a 3 to 5 word title in Title Case. No quotes, no punctuation at the end, no prefixes like "Title:".' },
                      { role: 'user', content: `User asked:\n${firstUser}\n\nAssistant replied:\n${firstAssistant}\n\nWrite the title.` },
                    ],
                  }),
                });
                if (titleRes.ok) {
                  const j = await titleRes.json();
                  let title: string = j.choices?.[0]?.message?.content?.trim() ?? '';
                  title = title.replace(/^["'`]+|["'`]+$/g, '').replace(/[.!?]+$/, '').slice(0, 80);
                  if (title) {
                    await admin.from('chat_conversations').update({ title }).eq('id', convId);
                  }
                }
              }
            } catch (e) {
              console.error('auto-title error', e);
            }
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