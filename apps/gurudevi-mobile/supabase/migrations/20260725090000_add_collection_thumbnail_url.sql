-- Allow user-created library collections to carry a custom thumbnail image.
ALTER TABLE public.collections
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
