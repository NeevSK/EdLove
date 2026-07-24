-- Create pricing_manifest table (entitlement source of truth)
-- This table maps pricing tiers to their entitled feature set.
-- Replicated to Zone A (local SQLite) via PowerSync.

CREATE TABLE IF NOT EXISTS public.pricing_manifest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL CHECK (tier IN ('FREE', 'PRO', 'INSTITUTIONAL')),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricing_manifest_tier ON public.pricing_manifest (tier);

-- Seed default rows
INSERT INTO public.pricing_manifest (tier, features) VALUES
  ('FREE', '[]'),
  ('PRO', '["ai_chat", "advanced_analytics", "multi_classroom"]'),
  ('INSTITUTIONAL', '["ai_chat", "advanced_analytics", "multi_classroom", "custom_branding", "api_access", "dedicated_support"]')
ON CONFLICT (tier) DO NOTHING;

-- Enable RLS
ALTER TABLE public.pricing_manifest ENABLE ROW LEVEL SECURITY;

-- Everyone can read pricing manifest (it's public data)
CREATE POLICY "pricing_manifest_select" ON public.pricing_manifest
  FOR SELECT USING (true);

-- Only platform admins can mutate
CREATE POLICY "pricing_manifest_admin_insert" ON public.pricing_manifest
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "pricing_manifest_admin_update" ON public.pricing_manifest
  FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "pricing_manifest_admin_delete" ON public.pricing_manifest
  FOR DELETE USING (auth.role() = 'service_role');
