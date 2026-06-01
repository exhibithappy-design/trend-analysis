import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const USERS = [
  "alexl@exhibithappy.com",
  "rhiannona@exhibithappy.com",
  "elizabethm@exhibithappy.com",
];
const TEMP_PASSWORD = "Exhibit!2026";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const results: Array<Record<string, unknown>> = [];

  for (const email of USERS) {
    try {
      // Ensure allowlist entry as admin
      await supabase
        .from("authorized_emails")
        .upsert({ email, role: "admin" }, { onConflict: "email" });

      // Try to find existing user
      const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

      let userId: string;
      let action: string;
      if (existing) {
        userId = existing.id;
        const { error } = await supabase.auth.admin.updateUserById(existing.id, {
          password: TEMP_PASSWORD,
          email_confirm: true,
        });
        if (error) throw error;
        action = "updated";
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password: TEMP_PASSWORD,
          email_confirm: true,
        });
        if (error) throw error;
        userId = data.user!.id;
        action = "created";
      }

      // Ensure admin role
      await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

      results.push({ email, action, user_id: userId });
    } catch (e) {
      results.push({ email, error: (e as Error).message });
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});