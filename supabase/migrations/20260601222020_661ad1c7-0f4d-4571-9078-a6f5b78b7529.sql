
-- Extend ai_insights
ALTER TABLE public.ai_insights ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'engagement';
ALTER TABLE public.ai_insights ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.ai_insights ADD COLUMN IF NOT EXISTS title text;
CREATE INDEX IF NOT EXISTS idx_ai_insights_generated_at ON public.ai_insights(generated_at DESC);

-- app_settings: integration flags
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed read settings" ON public.app_settings
  FOR SELECT TO authenticated USING (is_authorized(auth.uid()));

CREATE POLICY "Admins write settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ai_chat_messages
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_created ON public.ai_chat_messages(user_id, created_at);

GRANT SELECT, INSERT, DELETE ON public.ai_chat_messages TO authenticated;
GRANT ALL ON public.ai_chat_messages TO service_role;

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own chat or admin all" ON public.ai_chat_messages
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users insert own chat" ON public.ai_chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_authorized(auth.uid()));

CREATE POLICY "Users delete own chat" ON public.ai_chat_messages
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Seed hubspot flag row
INSERT INTO public.app_settings (key, value) VALUES ('hubspot', '{"connected": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;
