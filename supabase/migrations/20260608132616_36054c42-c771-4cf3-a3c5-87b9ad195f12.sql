
CREATE POLICY "Public read trend-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'trend-images');

CREATE POLICY "Admins can upload trend-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'trend-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update trend-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'trend-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete trend-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'trend-images' AND public.has_role(auth.uid(), 'admin'));
