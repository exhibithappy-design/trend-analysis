
DROP POLICY "Users update own conversations or admin" ON public.chat_conversations;
CREATE POLICY "Users update own conversations or admin"
  ON public.chat_conversations FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
