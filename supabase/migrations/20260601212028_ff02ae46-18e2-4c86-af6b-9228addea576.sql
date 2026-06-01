
-- =========================
-- Roles & allowlist
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'viewer');

CREATE TABLE public.authorized_emails (
  email TEXT PRIMARY KEY,
  role public.app_role NOT NULL DEFAULT 'viewer',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  invited_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.authorized_emails TO authenticated;
GRANT ALL ON public.authorized_emails TO service_role;
ALTER TABLE public.authorized_emails ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_authorized(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE POLICY "Authenticated can read allowlist" ON public.authorized_emails
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage allowlist" ON public.authorized_emails
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users see own roles, admins see all" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================
-- Profiles
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  notification_prefs JSONB NOT NULL DEFAULT '{"email_digest":true,"deployment_alerts":true}'::jsonb,
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile, admins read all" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  allowed_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;

  SELECT role INTO allowed_role FROM public.authorized_emails WHERE lower(email) = lower(NEW.email);
  IF allowed_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, allowed_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- Editions
-- =========================
CREATE TYPE public.edition_status AS ENUM ('draft','live','archived');

CREATE TABLE public.editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  edition_label TEXT,
  status public.edition_status NOT NULL DEFAULT 'draft',
  publish_date TIMESTAMPTZ,
  archive_date TIMESTAMPTZ,
  public_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.editions TO authenticated;
GRANT ALL ON public.editions TO service_role;
ALTER TABLE public.editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed read editions" ON public.editions FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admins write editions" ON public.editions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_editions_updated BEFORE UPDATE ON public.editions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- Page events
-- =========================
CREATE TABLE public.page_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES public.editions(id) ON DELETE CASCADE,
  session_id TEXT,
  event_type TEXT NOT NULL,
  section TEXT,
  card_id TEXT,
  source TEXT,
  source_detail TEXT,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  viewport_size TEXT
);
GRANT SELECT, INSERT ON public.page_events TO authenticated;
GRANT INSERT ON public.page_events TO anon;
GRANT ALL ON public.page_events TO service_role;
ALTER TABLE public.page_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can write events" ON public.page_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authed read events" ON public.page_events FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));

CREATE INDEX idx_page_events_edition_ts ON public.page_events(edition_id, ts DESC);

-- =========================
-- Channels & Deployments
-- =========================
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channels TO authenticated;
GRANT ALL ON public.channels TO service_role;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed read channels" ON public.channels FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admins write channels" ON public.channels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TYPE public.deployment_status AS ENUM ('not_deployed','queued','live','completed','failed');

CREATE TABLE public.deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID NOT NULL REFERENCES public.editions(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status public.deployment_status NOT NULL DEFAULT 'not_deployed',
  deployed_at TIMESTAMPTZ,
  deployed_by UUID REFERENCES auth.users(id),
  recipient_count INT NOT NULL DEFAULT 0,
  external_url TEXT,
  notes TEXT,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(edition_id, channel)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deployments TO authenticated;
GRANT ALL ON public.deployments TO service_role;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed read deployments" ON public.deployments FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admins write deployments" ON public.deployments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_deployments_updated BEFORE UPDATE ON public.deployments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- Trend cards
-- =========================
CREATE TABLE public.trend_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES public.editions(id) ON DELETE CASCADE,
  category TEXT,
  title TEXT NOT NULL,
  body TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  cited_shows TEXT[] NOT NULL DEFAULT '{}',
  performance_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trend_cards TO authenticated;
GRANT ALL ON public.trend_cards TO service_role;
ALTER TABLE public.trend_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read trend_cards" ON public.trend_cards FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admins write trend_cards" ON public.trend_cards FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================
-- AI insights
-- =========================
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES public.editions(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_insights TO authenticated;
GRANT ALL ON public.ai_insights TO service_role;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read ai_insights" ON public.ai_insights FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admins write ai_insights" ON public.ai_insights FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================
-- HubSpot signals
-- =========================
CREATE TABLE public.hubspot_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hubspot_contact_id TEXT,
  contact_name TEXT,
  contact_company TEXT,
  signal_type TEXT,
  signal_strength NUMERIC,
  edition_id UUID REFERENCES public.editions(id) ON DELETE SET NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new'
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hubspot_signals TO authenticated;
GRANT ALL ON public.hubspot_signals TO service_role;
ALTER TABLE public.hubspot_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read hubspot_signals" ON public.hubspot_signals FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admins write hubspot_signals" ON public.hubspot_signals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================
-- Notes
-- =========================
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES public.editions(id) ON DELETE CASCADE,
  deployment_id UUID REFERENCES public.deployments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed read notes" ON public.notes FOR SELECT TO authenticated USING (public.is_authorized(auth.uid()));
CREATE POLICY "Authed insert own notes" ON public.notes FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND public.is_authorized(auth.uid()));
CREATE POLICY "Author or admin update" ON public.notes FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Author or admin delete" ON public.notes FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- =========================
-- Realtime
-- =========================
ALTER PUBLICATION supabase_realtime ADD TABLE public.editions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deployments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_insights;

-- =========================
-- Seed allowlist + channels
-- =========================
INSERT INTO public.authorized_emails (email, role) VALUES
  ('alex@steelheaddesign.com','admin'),
  ('liz@exhibithappy.com','admin'),
  ('rhiannon@steelheaddesign.com','admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.channels (name, slug, is_custom, display_order) VALUES
  ('Mailshake','mailshake', false, 1),
  ('HubSpot','hubspot', false, 2),
  ('LinkedIn','linkedin', false, 3)
ON CONFLICT (slug) DO NOTHING;
