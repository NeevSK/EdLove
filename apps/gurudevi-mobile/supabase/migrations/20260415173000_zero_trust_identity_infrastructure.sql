-- Support Cloud Escrow recovery (Path B)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS escrowed_recovery_key TEXT;

-- Device Registry (To track specific hardware/laptops)
CREATE TABLE IF NOT EXISTS public.device_registry (
    device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT,
    os_version TEXT,
    is_trusted BOOLEAN DEFAULT TRUE,
    last_seen_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Device Accounts Mapping (Authoritative link for multi-account devices)
CREATE TABLE IF NOT EXISTS public.device_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES public.device_registry(device_id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    last_accessed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(device_id, account_id)
);

-- Enhanced Security Audit Trail (Tracks unlocks, wipes, and failed PINs)
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    device_id UUID REFERENCES public.device_registry(device_id) ON DELETE SET NULL,
    action TEXT NOT NULL, 
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own security logs'
    ) THEN
        CREATE POLICY "Users can view their own security logs" ON public.security_audit_logs 
            FOR SELECT USING (auth.uid() = account_id);
    END IF;
END $$;
