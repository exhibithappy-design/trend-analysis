
-- Tighten authorized_emails SELECT to admins only
DROP POLICY IF EXISTS "Authenticated can read allowlist" ON public.authorized_emails;
CREATE POLICY "Admins read allowlist"
ON public.authorized_emails FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Restrict deployment_logs SELECT to admins (contains actor_email)
DROP POLICY IF EXISTS "Authed read dep logs" ON public.deployment_logs;
CREATE POLICY "Admins read dep logs"
ON public.deployment_logs FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Restrict hubspot_signals SELECT to admins
DROP POLICY IF EXISTS "Authed read hubspot_signals" ON public.hubspot_signals;
CREATE POLICY "Admins read hubspot_signals"
ON public.hubspot_signals FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Tighten page_events INSERT: require event_type and bounded field lengths
DROP POLICY IF EXISTS "Public can write events" ON public.page_events;
CREATE POLICY "Public can write validated events"
ON public.page_events FOR INSERT TO anon, authenticated
WITH CHECK (
  event_type IS NOT NULL
  AND length(event_type) BETWEEN 1 AND 64
  AND (section IS NULL OR length(section) <= 128)
  AND (card_id IS NULL OR length(card_id) <= 128)
  AND (source IS NULL OR length(source) <= 64)
  AND (source_detail IS NULL OR length(source_detail) <= 256)
  AND (session_id IS NULL OR length(session_id) <= 128)
  AND (viewport_size IS NULL OR length(viewport_size) <= 32)
  AND (user_agent IS NULL OR length(user_agent) <= 512)
);
