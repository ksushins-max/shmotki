-- Create storage bucket for clothing images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('clothing-images', 'clothing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload their own images
CREATE POLICY "Users can upload their own clothing images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'clothing-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow public read access to clothing images
CREATE POLICY "Anyone can view clothing images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'clothing-images');