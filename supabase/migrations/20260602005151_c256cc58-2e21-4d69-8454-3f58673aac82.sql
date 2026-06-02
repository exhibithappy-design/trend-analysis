CREATE TABLE public.chat_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'New folder',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_folders TO authenticated;
GRANT ALL ON public.chat_folders TO service_role;

ALTER TABLE public.chat_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own folders or admin all"
  ON public.chat_folders FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users insert own folders"
  ON public.chat_folders FOR INSERT TO authenticated
  WITH CHECK ((user_id = auth.uid()) AND is_authorized(auth.uid()));

CREATE POLICY "Users update own folders or admin"
  ON public.chat_folders FOR UPDATE TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users delete own folders or admin"
  ON public.chat_folders FOR DELETE TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER chat_folders_touch_updated_at
  BEFORE UPDATE ON public.chat_folders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX chat_folders_user_idx ON public.chat_folders (user_id, display_order);

ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES public.chat_folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS chat_conversations_folder_idx ON public.chat_conversations (folder_id);