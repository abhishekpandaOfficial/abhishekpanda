-- Create storage bucket for family photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('family-photos', 'family-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for authenticated users to upload their own photos
CREATE POLICY "Users can upload family photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'family-photos' 
  AND auth.uid() IS NOT NULL
);

-- Create policy for authenticated users to update their own photos
CREATE POLICY "Users can update their family photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'family-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for public access to view photos
CREATE POLICY "Anyone can view family photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'family-photos');

-- Create policy for users to delete their own photos
CREATE POLICY "Users can delete their family photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'family-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);