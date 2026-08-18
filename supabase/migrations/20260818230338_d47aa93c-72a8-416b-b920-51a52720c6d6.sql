CREATE TABLE public.assessment_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  company text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  answered_count integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  submitted_at timestamp with time zone,
  last_email_sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.assessment_submissions TO service_role;
GRANT SELECT ON public.assessment_submissions TO authenticated;

ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view assessment submissions"
  ON public.assessment_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_assessment_submissions_updated
  BEFORE UPDATE ON public.assessment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();