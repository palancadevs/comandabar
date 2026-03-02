-- Create storage buckets for ComandaApp

-- Bucket for tenant assets (logos, covers)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-assets', 'tenant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for menu item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
-- Allow public read access to all assets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('tenant-assets', 'menu-items'));

-- Allow authenticated users to upload to their own folders? 
-- For simplicity in MVP, we allow authenticated admins to upload to these buckets.
-- Ideally, we should restrict by tenant_id in the path: `bucket/tenant_id/filename`

CREATE POLICY "Admins can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('tenant-assets', 'menu-items'));

CREATE POLICY "Admins can update own assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('tenant-assets', 'menu-items'));

CREATE POLICY "Admins can delete own assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('tenant-assets', 'menu-items'));
