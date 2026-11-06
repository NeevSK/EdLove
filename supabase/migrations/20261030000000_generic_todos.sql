-- ==============================================================================
-- Migration: 20261030000000_generic_todos.sql
-- Description: Creates canonical generic lists and todos tables for local-first
-- offline-first synchronization via PowerSync and Supabase Postgres.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  due_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Indexes for high-performance reactive lookups and sync queries
CREATE INDEX IF NOT EXISTS idx_lists_user ON public.lists(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_list_completed ON public.todos(list_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_todos_user ON public.todos(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Canonical identity policy using get_my_id() with fallback to auth.uid()
CREATE POLICY "Users can manage their own lists"
  ON public.lists
  FOR ALL
  USING (
    user_id = public.get_my_id() OR user_id = auth.uid()
  )
  WITH CHECK (
    user_id = public.get_my_id() OR user_id = auth.uid()
  );

CREATE POLICY "Users can manage their own todos"
  ON public.todos
  FOR ALL
  USING (
    user_id = public.get_my_id() OR user_id = auth.uid()
  )
  WITH CHECK (
    user_id = public.get_my_id() OR user_id = auth.uid()
  );

-- Grants
GRANT ALL ON public.lists TO anon, authenticated, service_role;
GRANT ALL ON public.todos TO anon, authenticated, service_role;

