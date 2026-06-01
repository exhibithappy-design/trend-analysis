
-- Deployment activity log
CREATE TABLE public.deployment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL,
  edition_id uuid,
  channel text,
  action text NOT NULL,
  detail text,
  result text,
  actor_id uuid,
  actor_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_deployment_logs_dep ON public.deployment_logs(deployment_id, created_at DESC);
GRANT SELECT, INSERT ON public.deployment_logs TO authenticated;
GRANT ALL ON public.deployment_logs TO service_role;
ALTER TABLE public.deployment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read dep logs" ON public.deployment_logs FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));
CREATE POLICY "Authed insert dep logs" ON public.deployment_logs FOR INSERT TO authenticated WITH CHECK (public.is_authorized(auth.uid()));

-- AEO Lighthouse cache
CREATE TABLE public.aeo_lighthouse (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  run_at timestamptz NOT NULL DEFAULT now(),
  mobile_scores jsonb,
  desktop_scores jsonb,
  run_by uuid
);
CREATE INDEX idx_aeo_lh_url ON public.aeo_lighthouse(url, run_at DESC);
GRANT SELECT, INSERT ON public.aeo_lighthouse TO authenticated;
GRANT ALL ON public.aeo_lighthouse TO service_role;
ALTER TABLE public.aeo_lighthouse ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read lh" ON public.aeo_lighthouse FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admins write lh" ON public.aeo_lighthouse FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- AEO schema checks
CREATE TABLE public.aeo_schema_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  checked_at timestamptz NOT NULL DEFAULT now(),
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  checked_by uuid
);
CREATE INDEX idx_aeo_schema_url ON public.aeo_schema_checks(url, checked_at DESC);
GRANT SELECT, INSERT ON public.aeo_schema_checks TO authenticated;
GRANT ALL ON public.aeo_schema_checks TO service_role;
ALTER TABLE public.aeo_schema_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read schema" ON public.aeo_schema_checks FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admins write schema" ON public.aeo_schema_checks FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- AEO citations (any authed user can log)
CREATE TABLE public.aeo_citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  citation_url text,
  date_seen date NOT NULL DEFAULT current_date,
  snippet text,
  screenshot text,
  logged_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aeo_citations TO authenticated;
GRANT ALL ON public.aeo_citations TO service_role;
ALTER TABLE public.aeo_citations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read citations" ON public.aeo_citations FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));
CREATE POLICY "Authed insert citations" ON public.aeo_citations FOR INSERT TO authenticated WITH CHECK (public.is_authorized(auth.uid()) AND logged_by = auth.uid());
CREATE POLICY "Owner/admin update citations" ON public.aeo_citations FOR UPDATE TO authenticated USING (logged_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owner/admin delete citations" ON public.aeo_citations FOR DELETE TO authenticated USING (logged_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- AEO keywords (admins+viewers can update)
CREATE TABLE public.aeo_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  current_rank integer,
  previous_rank integer,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aeo_keywords TO authenticated;
GRANT ALL ON public.aeo_keywords TO service_role;
ALTER TABLE public.aeo_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read keywords" ON public.aeo_keywords FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));
CREATE POLICY "Authed insert keywords" ON public.aeo_keywords FOR INSERT TO authenticated WITH CHECK (public.is_authorized(auth.uid()));
CREATE POLICY "Authed update keywords" ON public.aeo_keywords FOR UPDATE TO authenticated USING (public.is_authorized(auth.uid())) WITH CHECK (public.is_authorized(auth.uid()));
CREATE POLICY "Admin delete keywords" ON public.aeo_keywords FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.deployment_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aeo_lighthouse;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aeo_schema_checks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aeo_citations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aeo_keywords;
