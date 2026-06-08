
CREATE TABLE public.trend_image_positions (
  trend_num INT PRIMARY KEY CHECK (trend_num BETWEEN 1 AND 12),
  position NUMERIC NOT NULL DEFAULT 50 CHECK (position >= 0 AND position <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.trend_image_positions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.trend_image_positions TO authenticated;
GRANT ALL ON public.trend_image_positions TO service_role;

ALTER TABLE public.trend_image_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read trend image positions"
  ON public.trend_image_positions FOR SELECT
  USING (true);

CREATE POLICY "Admins can write trend image positions"
  ON public.trend_image_positions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trend_image_positions_touch
  BEFORE UPDATE ON public.trend_image_positions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.trend_image_positions (trend_num, position)
SELECT g, 50 FROM generate_series(1,12) g
ON CONFLICT DO NOTHING;
