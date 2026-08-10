-- Reconcile schema drift between remote Supabase database and schema.zmodel

BEGIN;

-- 1. CREATE MISSING TABLES

-- classroom_grading_settings
CREATE TABLE IF NOT EXISTS public.classroom_grading_settings (
  classroom_id UUID PRIMARY KEY REFERENCES public.classrooms(id) ON DELETE CASCADE,
  grading_mode TEXT NOT NULL DEFAULT 'both',
  show_ranks BOOLEAN NOT NULL DEFAULT true
);

-- calendar_events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  parent_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  balance DOUBLE PRECISION NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- financial_transactions
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  reference_no TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ledger_entries
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.financial_transactions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  amount DOUBLE PRECISION NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('debit', 'credit')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  amount DOUBLE PRECISION NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  actual_spent DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- pro_gifts
CREATE TABLE IF NOT EXISTS public.pro_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gifter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  gifter_name TEXT,
  recipient_role TEXT,
  gift_message TEXT,
  gift_token TEXT,
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- payment_intents
CREATE TABLE IF NOT EXISTS public.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'LKR',
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT NOT NULL DEFAULT 'stripe',
  client_secret TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'LKR',
  status TEXT NOT NULL DEFAULT 'draft',
  due_date TIMESTAMPTZ NOT NULL,
  items JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- receipts
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'LKR',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_method TEXT NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- sentinel_audit_logs
CREATE TABLE IF NOT EXISTS public.sentinel_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 2. ALTER EXISTING TABLES WITH MISSING COLUMNS
ALTER TABLE public.classroom_students
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.nodes
  ADD COLUMN IF NOT EXISTS file_path TEXT;

ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS topics TEXT[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.thuthimal_gifts
  ADD COLUMN IF NOT EXISTS gift_message TEXT;

ALTER TABLE public.sanctuary_manifestos
  ADD COLUMN IF NOT EXISTS endorsement_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.sections
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.grade_levels
  ADD COLUMN IF NOT EXISTS number INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.student_longitudinal_events
  ADD COLUMN IF NOT EXISTS metadata JSONB,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();


-- 3. ENABLE RLS & DEFINE BASIC SECURITY POLICIES FOR NEW TABLES
ALTER TABLE public.classroom_grading_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentinel_audit_logs ENABLE ROW LEVEL SECURITY;

-- Grant API access (Private by Default architecture rule)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classroom_grading_settings TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_transactions TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ledger_entries TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_gifts TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_intents TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.receipts TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sentinel_audit_logs TO authenticated, anon;

COMMIT;
