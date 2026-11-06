-- Reward balances are server-maintained. A provider-signed callback is the write authority;
-- authenticated Data API clients can read their own balances and receipts only.
CREATE TABLE public.user_energy_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned integer NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_spent integer NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  daily_count integer NOT NULL DEFAULT 0 CHECK (daily_count >= 0),
  last_reset_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ad_reward_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'admob',
  transaction_id text NOT NULL UNIQUE,
  ad_unit_id text,
  reward_amount integer NOT NULL DEFAULT 10 CHECK (reward_amount >= 0),
  verified boolean NOT NULL DEFAULT false,
  signature text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ad_reward_transactions_user_created_at_idx
  ON public.ad_reward_transactions (user_id, created_at DESC);

ALTER TABLE public.user_energy_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_reward_transactions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.user_energy_balances FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.ad_reward_transactions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.user_energy_balances TO authenticated;
GRANT SELECT ON TABLE public.ad_reward_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_energy_balances TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ad_reward_transactions TO service_role;

CREATE POLICY reward_balance_owner_read ON public.user_energy_balances
  FOR SELECT TO authenticated USING (user_id = (SELECT public.get_my_id()));
CREATE POLICY reward_receipt_owner_read ON public.ad_reward_transactions
  FOR SELECT TO authenticated USING (user_id = (SELECT public.get_my_id()));
