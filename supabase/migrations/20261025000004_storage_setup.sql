-- ====================================================================
-- STYLE HUT SUPABASE STORAGE BUCKETS & POLICIES
-- ====================================================================

-- 1. Create storage buckets for public assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('products', 'products', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('categories', 'categories', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('banners', 'banners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('branding', 'branding', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies: Public can read all images in these buckets
CREATE POLICY "Public image read access"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('products', 'categories', 'banners', 'branding'));

-- 3. Storage Policies: Only Admins can upload/modify/delete images
CREATE POLICY "Admins can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id IN ('products', 'categories', 'banners', 'branding')
        AND (public.is_admin())
    );

CREATE POLICY "Admins can update images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id IN ('products', 'categories', 'banners', 'branding')
        AND (public.is_admin())
    );

CREATE POLICY "Admins can delete images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id IN ('products', 'categories', 'banners', 'branding')
        AND (public.is_admin())
    );
