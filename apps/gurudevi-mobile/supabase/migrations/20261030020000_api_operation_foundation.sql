-- Extend the existing server-owned receipts and effect intents. Historical
-- receipts retain their unique identity and require explicit recovery, not replay
-- through a newly selected scope.
alter table public.operation_receipts
  add column if not exists scope text not null default 'legacy';

alter table public.external_effect_intents
  add column if not exists account_id uuid references public.users(id) on delete cascade,
  add column if not exists scope text not null default 'legacy',
  add column if not exists max_attempts integer not null default 5
    check (max_attempts between 1 and 25);

create index if not exists idx_external_effect_intents_lease
  on public.external_effect_intents (locked_until, available_at, id)
  where status = 'dispatching';

-- An expired final attempt may have reached a provider before its worker died.
-- It is retained as failed/repair-needed, never silently dispatched again.
comment on column public.external_effect_intents.max_attempts is
  'Bounded delivery attempts; exhausted or uncertain external outcomes require reconciliation.';

alter table public.operation_receipts enable row level security;
alter table public.external_effect_intents enable row level security;
revoke all on table public.operation_receipts from public, anon, authenticated;
revoke all on table public.external_effect_intents from public, anon, authenticated;
grant all on table public.operation_receipts to service_role;
grant all on table public.external_effect_intents to service_role;
