-- Create storage bucket for products
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for products bucket
CREATE POLICY "Public can view product files"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Admins can upload product files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update product files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete product files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' AND
  has_role(auth.uid(), 'admin'::app_role)
);