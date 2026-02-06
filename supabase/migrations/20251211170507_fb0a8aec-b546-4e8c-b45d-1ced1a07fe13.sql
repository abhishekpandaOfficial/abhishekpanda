-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view family photos" ON storage.objects;

-- Create admin-only policy for viewing family photos
CREATE POLICY "Only admins can view family photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'family-photos' AND 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure admins can also upload/update/delete family photos
DROP POLICY IF EXISTS "Admins can upload family photos" ON storage.objects;
CREATE POLICY "Admins can upload family photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'family-photos' AND 
  has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can update family photos" ON storage.objects;
CREATE POLICY "Admins can update family photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'family-photos' AND 
  has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can delete family photos" ON storage.objects;
CREATE POLICY "Admins can delete family photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'family-photos' AND 
  has_role(auth.uid(), 'admin'::app_role)
);