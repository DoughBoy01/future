/*
  # Create Storage Buckets and Site Settings

  1. Storage Setup
    - Create 'logos' storage bucket for site and organization logos
    - Configure public access for logo images
    - Set up RLS policies for logo uploads

  2. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - setting identifier
      - `value` (jsonb) - setting value
      - `description` (text) - setting description
      - `updated_by` (uuid) - user who last updated
      - `updated_at` (timestamptz) - last update timestamp
      - `created_at` (timestamptz) - creation timestamp

  3. Security
    - Enable RLS on site_settings table
    - Only super_admins can update site settings
    - All authenticated users can read site settings
    - Storage policies allow authenticated users to upload logos
    - Public read access for all logos

  4. Initial Data
    - Insert default site_logo setting
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb DEFAULT '{}'::jsonb,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "All users can read site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Anonymous users can read site settings"
  ON site_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Super admins can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for logos bucket
CREATE POLICY "Public read access for logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'school_admin')
    )
  );

CREATE POLICY "Authenticated users can update their logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'school_admin')
    )
  );

CREATE POLICY "Authenticated users can delete their logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'school_admin')
    )
  );

-- Insert default site settings
INSERT INTO site_settings (key, value, description)
VALUES (
  'site_logo',
  '{"url": null, "alt": "FutureEdge"}'::jsonb,
  'Main site logo displayed in the header'
)
ON CONFLICT (key) DO NOTHING;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to site_settings
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
