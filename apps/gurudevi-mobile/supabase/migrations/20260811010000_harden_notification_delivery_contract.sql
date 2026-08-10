-- Notification delivery contract.
-- The live database already contains user_push_tokens, but it was not present
-- in the tracked migration history or ZenStack model. Make that contract
-- reproducible and account-safe for multi-account devices.

CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  push_token   TEXT NOT NULL,
  device_id    TEXT NOT NULL,
  platform     TEXT NOT NULL,
  last_seen_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_push_tokens
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.user_push_tokens
  DROP CONSTRAINT IF EXISTS user_push_tokens_device_id_key;

ALTER TABLE public.user_push_tokens
  ADD CONSTRAINT user_push_tokens_user_device_key UNIQUE (user_id, device_id);

CREATE INDEX IF NOT EXISTS user_push_tokens_user_platform_idx
  ON public.user_push_tokens (user_id, platform);

ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage all push tokens" ON public.user_push_tokens;
CREATE POLICY "Service role can manage all push tokens"
  ON public.user_push_tokens FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

DROP POLICY IF EXISTS "Users can manage their own push tokens" ON public.user_push_tokens;
CREATE POLICY "Users can manage their own push tokens"
  ON public.user_push_tokens FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
