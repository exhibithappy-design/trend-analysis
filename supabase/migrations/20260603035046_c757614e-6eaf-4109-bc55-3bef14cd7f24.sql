DROP POLICY IF EXISTS "Authed insert dep logs" ON public.deployment_logs;

CREATE POLICY "Admins or self insert dep logs"
ON public.deployment_logs
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    is_authorized(auth.uid())
    AND actor_id = auth.uid()
    AND actor_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  )
);