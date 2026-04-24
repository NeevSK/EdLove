-- Principal Governance Event Bedrock
-- Official institutional records for principal workflows should be temporally
-- reconstructable without depending on ad hoc dashboard queries.

create table if not exists public.principal_governance_events (
    id uuid primary key default gen_random_uuid(),
    school_id uuid not null references public.schools(id) on delete cascade,
    principal_id uuid not null references public.users(id) on delete cascade,
    entity_type text not null check (entity_type in ('principal_observation', 'school_invite')),
    entity_id text not null,
    event_type text not null check (event_type in ('create', 'read', 'use', 'expire', 'revoke')),
    snapshot jsonb not null,
    occurred_at timestamptz not null,
    recorded_at timestamptz not null default now(),
    effective_from timestamptz null,
    effective_to timestamptz null,
    recorded_by uuid null references public.users(id) on delete set null
);

create index if not exists idx_principal_governance_events_principal_occurred
    on public.principal_governance_events(principal_id, occurred_at desc, recorded_at desc);

create index if not exists idx_principal_governance_events_school_entity
    on public.principal_governance_events(school_id, entity_type, occurred_at desc);

alter table public.principal_governance_events enable row level security;

drop policy if exists "Principal governance same-school read" on public.principal_governance_events;
create policy "Principal governance same-school read"
on public.principal_governance_events
for select
to authenticated
using (
    principal_id = auth.uid()
    or exists (
        select 1
        from public.users viewer
        where viewer.id = auth.uid()
          and viewer.school_id = principal_governance_events.school_id
          and coalesce(viewer.role, '') in (
              'founder',
              'developer',
              'admin',
              'principal',
              'assistant_principal',
              'assistantPrincipal'
          )
    )
);

grant select on public.principal_governance_events to authenticated;
