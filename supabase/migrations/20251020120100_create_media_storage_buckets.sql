/*
  # Create Storage Buckets for Camp Media

  ## Overview
  This migration creates Supabase storage buckets for camp videos and images,
  with appropriate access policies for uploads and public viewing.

  ## Buckets Created

  1. `camp-videos` - For storing camp promotional and activity videos
    - Max file size: 100MB
    - Allowed types: video/mp4, video/webm, video/quicktime
    - Public read access
    - Authenticated upload access

  2. `camp-images` - For storing additional camp photos
    - Max file size: 10MB
    - Allowed types: image/jpeg, image/png, image/webp
    - Public read access
    - Authenticated upload access

  ## Security
  - Only authenticated users can upload media
  - All media is publicly readable for display on camp pages
  - File type and size restrictions enforced at bucket level
*/

-- Create camp-videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'camp-videos',
  'camp-videos',
  true,
  104857600,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- Create camp-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'camp-images',
  'camp-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload videos
CREATE POLICY IF NOT EXISTS "Authenticated users can upload camp videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'camp-videos');

-- Allow authenticated users to update their uploaded videos
CREATE POLICY IF NOT EXISTS "Authenticated users can update camp videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'camp-videos');

-- Allow authenticated users to delete videos
CREATE POLICY IF NOT EXISTS "Authenticated users can delete camp videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'camp-videos');

-- Allow public read access to videos
CREATE POLICY IF NOT EXISTS "Public can view camp videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'camp-videos');

-- Allow authenticated users to upload images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload camp images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'camp-images');

-- Allow authenticated users to update their uploaded images
CREATE POLICY IF NOT EXISTS "Authenticated users can update camp images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'camp-images');

-- Allow authenticated users to delete images
CREATE POLICY IF NOT EXISTS "Authenticated users can delete camp images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'camp-images');

-- Allow public read access to images
CREATE POLICY IF NOT EXISTS "Public can view camp images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'camp-images');
