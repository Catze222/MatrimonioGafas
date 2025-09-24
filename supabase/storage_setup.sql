-- Supabase Storage Setup for Wedding App
-- Create buckets for avatars and product images

-- Create avatars bucket for guest photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create productos bucket for gift images  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'productos',
  'productos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Public read access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated upload for avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars');

-- Storage policies for productos bucket
CREATE POLICY "Public read access for productos" ON storage.objects
FOR SELECT USING (bucket_id = 'productos');

CREATE POLICY "Authenticated upload for productos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'productos');

CREATE POLICY "Users can update productos" ON storage.objects
FOR UPDATE USING (bucket_id = 'productos');

CREATE POLICY "Users can delete productos" ON storage.objects
FOR DELETE USING (bucket_id = 'productos');
