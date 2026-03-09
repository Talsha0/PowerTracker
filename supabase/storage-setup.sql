-- =============================================================================
-- Supabase Storage Buckets Setup
-- Run in Supabase SQL Editor after schema.sql and rls-policies.sql
-- =============================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('exercise-images', 'exercise-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for avatars
CREATE POLICY "Avatar images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS policies for exercise images
CREATE POLICY "Exercise images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'exercise-images');

CREATE POLICY "Users can upload exercise images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'exercise-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own exercise images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'exercise-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
