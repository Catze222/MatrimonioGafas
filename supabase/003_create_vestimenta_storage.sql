-- Migration 003: Create vestimenta storage bucket
-- Creates storage bucket for dress code reference images

-- Create vestimenta bucket for dress code reference images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vestimenta',
  'vestimenta',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for vestimenta bucket
-- Public read access - guests can view dress code images
CREATE POLICY "Public read access for vestimenta" ON storage.objects
FOR SELECT USING (bucket_id = 'vestimenta');

-- Authenticated upload - only authenticated users can upload
CREATE POLICY "Authenticated upload for vestimenta" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vestimenta');

-- Authenticated update - only authenticated users can update
CREATE POLICY "Authenticated update for vestimenta" ON storage.objects
FOR UPDATE USING (bucket_id = 'vestimenta');

-- Authenticated delete - only authenticated users can delete
CREATE POLICY "Authenticated delete for vestimenta" ON storage.objects
FOR DELETE USING (bucket_id = 'vestimenta');
