-- Growth / Rewards History Bedrock
-- Versioned snapshots for journey-critical profile data.

create table if not exists public.user_rewards_versions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    operation text not null check (operation in ('insert', 'update', 'delete')),
    snapshot jsonb not null,
    recorded_at timestamptz not null default now(),
    recorded_by uuid null references public.users(id) on delete set null
);

create table if not exists public.user_growth_state_versions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    operation text not null check (operation in ('insert', 'update', 'delete')),
    snapshot jsonb not null,
    recorded_at timestamptz not null default now(),
    recorded_by uuid null references public.users(id) on delete set null
);

create index if not exists idx_user_rewards_versions_user_recorded_at
    on public.user_rewards_versions(user_id, recorded_at desc);

create index if not exists idx_user_growth_state_versions_user_recorded_at
    on public.user_growth_state_versions(user_id, recorded_at desc);

alter table public.user_rewards_versions enable row level security;
alter table public.user_growth_state_versions enable row level security;

create or replace function public.capture_user_rewards_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    target public.user_rewards;
begin
    target := case when tg_op = 'DELETE' then old else new end;

    insert into public.user_rewards_versions (
        user_id,
        operation,
        snapshot,
        recorded_at,
        recorded_by
    )
    values (
        target.user_id,
        lower(tg_op),
        jsonb_build_object(
            'id', target.id,
            'user_id', target.user_id,
            'points', target.points,
            'badges', target.badges,
            'created_at', target.created_at
        ),
        coalesce(target.created_at, now()),
        auth.uid()
    );

    return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function public.capture_user_growth_state_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    target public.user_growth_state;
begin
    target := case when tg_op = 'DELETE' then old else new end;

    insert into public.user_growth_state_versions (
        user_id,
        operation,
        snapshot,
        recorded_at,
        recorded_by
    )
    values (
        target.user_id,
        lower(tg_op),
        jsonb_build_object(
            'id', target.id,
            'user_id', target.user_id,
            'bhumi_stage', target.bhumi_stage,
            'presence_signals', target.presence_signals,
            'nourishing_signals', target.nourishing_signals,
            'witnessing_signals', target.witnessing_signals,
            'weaving_signals', target.weaving_signals,
            'blooming_signals', target.blooming_signals,
            'banyan_stage', target.banyan_stage,
            'peer_mentored_count', target.peer_mentored_count,
            'circles_facilitated_count', target.circles_facilitated_count,
            'river_stage', target.river_stage,
            'lessons_completed_count', target.lessons_completed_count,
            'reflections_submitted_count', target.reflections_submitted_count,
            'crystal_tier', target.crystal_tier,
            'crystals_found_count', target.crystals_found_count,
            'fractal_moments_count', target.fractal_moments_count,
            'last_seen_at', target.last_seen_at,
            'created_at', target.created_at,
            'updated_at', target.updated_at
        ),
        coalesce(target.updated_at, target.created_at, now()),
        auth.uid()
    );

    return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists trg_capture_user_rewards_version on public.user_rewards;
create trigger trg_capture_user_rewards_version
after insert or update or delete on public.user_rewards
for each row execute function public.capture_user_rewards_version();

drop trigger if exists trg_capture_user_growth_state_version on public.user_growth_state;
create trigger trg_capture_user_growth_state_version
after insert or update or delete on public.user_growth_state
for each row execute function public.capture_user_growth_state_version();

insert into public.user_rewards_versions (user_id, operation, snapshot, recorded_at, recorded_by)
select
    r.user_id,
    'insert',
    jsonb_build_object(
        'id', r.id,
        'user_id', r.user_id,
        'points', r.points,
        'badges', r.badges,
        'created_at', r.created_at
    ),
    coalesce(r.created_at, now()),
    null
from public.user_rewards r
where not exists (
    select 1 from public.user_rewards_versions rv where rv.user_id = r.user_id
);

insert into public.user_growth_state_versions (user_id, operation, snapshot, recorded_at, recorded_by)
select
    g.user_id,
    'insert',
    jsonb_build_object(
        'id', g.id,
        'user_id', g.user_id,
        'bhumi_stage', g.bhumi_stage,
        'presence_signals', g.presence_signals,
        'nourishing_signals', g.nourishing_signals,
        'witnessing_signals', g.witnessing_signals,
        'weaving_signals', g.weaving_signals,
        'blooming_signals', g.blooming_signals,
        'banyan_stage', g.banyan_stage,
        'peer_mentored_count', g.peer_mentored_count,
        'circles_facilitated_count', g.circles_facilitated_count,
        'river_stage', g.river_stage,
        'lessons_completed_count', g.lessons_completed_count,
        'reflections_submitted_count', g.reflections_submitted_count,
        'crystal_tier', g.crystal_tier,
        'crystals_found_count', g.crystals_found_count,
        'fractal_moments_count', g.fractal_moments_count,
        'last_seen_at', g.last_seen_at,
        'created_at', g.created_at,
        'updated_at', g.updated_at
    ),
    coalesce(g.updated_at, g.created_at, now()),
    null
from public.user_growth_state g
where not exists (
    select 1 from public.user_growth_state_versions gv where gv.user_id = g.user_id
);

create policy "Users can read own rewards history"
on public.user_rewards_versions
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can read own growth history"
on public.user_growth_state_versions
for select
to authenticated
using (user_id = auth.uid());
