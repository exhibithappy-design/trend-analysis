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

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error } = await userClient.auth.getClaims(token);
    if (error || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const uid = claims.claims.sub;
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', uid);
    if (!roles?.some((r) => r.role === 'admin')) {
      return new Response(JSON.stringify({ error: 'Admins only' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const hasKey = !!Deno.env.get('HUBSPOT_API_KEY');

    if (req.method === 'GET') {
      const { data: row } = await admin.from('app_settings').select('value, updated_at').eq('key', 'hubspot').maybeSingle();
      return new Response(JSON.stringify({
        connected: !!(row?.value as any)?.connected && hasKey,
        has_secret: hasKey,
        last_synced_at: (row?.value as any)?.last_synced_at || null,
        updated_at: row?.updated_at || null,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const action = body.action || 'connect';
      if (action === 'disconnect') {
        await admin.from('app_settings').upsert({ key: 'hubspot', value: { connected: false }, updated_by: uid, updated_at: new Date().toISOString() });
        return new Response(JSON.stringify({ ok: true, connected: false }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (!hasKey) {
        return new Response(JSON.stringify({ error: 'HUBSPOT_API_KEY secret is not configured yet.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      await admin.from('app_settings').upsert({
        key: 'hubspot',
        value: { connected: true, last_synced_at: null },
        updated_by: uid,
        updated_at: new Date().toISOString(),
      });
      return new Response(JSON.stringify({ ok: true, connected: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('hubspot-connect error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});