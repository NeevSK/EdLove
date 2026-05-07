-- Migration to add category and is_geographic columns to map_layers table
-- This is required for compatibility with the mobile app's local SQLite schema.

ALTER TABLE public.map_layers 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS is_geographic BOOLEAN DEFAULT FALSE;

-- Update existing rows if necessary (optional)
-- UPDATE public.map_layers SET category = 'knowledge' WHERE category IS NULL;
