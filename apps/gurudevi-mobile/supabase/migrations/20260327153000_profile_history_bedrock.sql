-- Profile History Bedrock
-- Creates versioned snapshot tables for user and community profiles so
-- temporal profile reads can reconstruct "as of" state instead of relying
-- on mutable current rows.

create table if not exists public.user_profile_versions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    school_id uuid null, -- loose reference to avoid orphan school_id issues
    operation text not null check (operation in ('insert', 'update', 'delete')),
    snapshot jsonb not null,
    recorded_at timestamptz not null default now(),
    recorded_by uuid null references public.users(id) on delete set null
);

create table if not exists public.community_profile_versions (
    id uuid primary key default uuid_generate_v4(),
    community_id uuid not null references public.community_groups(id) on delete cascade,
    school_id uuid null, -- loose reference to avoid orphan school_id issues
    creator_id uuid null references public.users(id) on delete set null,
    operation text not null check (operation in ('insert', 'update', 'delete')),
    snapshot jsonb not null,
    recorded_at timestamptz not null default now(),
    recorded_by uuid null references public.users(id) on delete set null
);

create index if not exists idx_user_profile_versions_user_recorded_at
    on public.user_profile_versions(user_id, recorded_at desc);

create index if not exists idx_community_profile_versions_community_recorded_at
    on public.community_profile_versions(community_id, recorded_at desc);

alter table public.user_profile_versions enable row level security;
alter table public.community_profile_versions enable row level security;

create or replace function public.capture_user_profile_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    target public.users;
begin
    target := case when tg_op = 'DELETE' then old else new end;

    insert into public.user_profile_versions (
        user_id,
        school_id,
        operation,
        snapshot,
        recorded_at,
        recorded_by
    )
    values (
        target.id,
        target.school_id,
        lower(tg_op),
        jsonb_build_object(
            'id', target.id,
            'school_id', target.school_id,
            'email', target.email,
            'full_name', target.full_name,
            'avatar_url', target.avatar_url,
            'bio', to_jsonb(target)->'bio',
            'username', target.username,
            'role', target.role,
            'is_anonymous', target.is_anonymous,
            'is_thuthimal', target.is_thuthimal,
            'thuthimal_gifter', target.thuthimal_gifter,
            'thuthimal_gifted_at', target.thuthimal_gifted_at,
            'subjects_taught', to_jsonb(target)->'subjects_taught',
            'qualifications', to_jsonb(target)->'qualifications',
            'experience_years', to_jsonb(target)->'experience_years',
            'updated_at', target.updated_at,
            'created_at', target.created_at
        ),
        coalesce(target.updated_at, target.created_at, now()),
        auth.uid()
    );

    return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function public.capture_community_profile_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    target public.community_groups;
begin
    target := case when tg_op = 'DELETE' then old else new end;

    insert into public.community_profile_versions (
        community_id,
        school_id,
        creator_id,
        operation,
        snapshot,
        recorded_at,
        recorded_by
    )
    values (
        target.id,
        target.school_id,
        target.created_by,
        lower(tg_op),
        jsonb_build_object(
            'id', target.id,
            'school_id', target.school_id,
            'name', target.name,
            'description', target.description,
            'is_public', to_jsonb(target)->'is_public',
            'member_count', to_jsonb(target)->'member_count',
            'created_by', target.created_by,
            'join_policy', to_jsonb(target)->'join_policy',
            'group_type', to_jsonb(target)->'group_type',
            'handle', to_jsonb(target)->'handle',
            'image_url', to_jsonb(target)->'image_url',
            'created_at', target.created_at
        ),
        coalesce(target.created_at, now()),
        auth.uid()
    );

    return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists trg_capture_user_profile_version on public.users;
create trigger trg_capture_user_profile_version
after insert or update or delete on public.users
for each row execute function public.capture_user_profile_version();

drop trigger if exists trg_capture_community_profile_version on public.community_groups;
create trigger trg_capture_community_profile_version
after insert or update or delete on public.community_groups
for each row execute function public.capture_community_profile_version();

insert into public.user_profile_versions (user_id, school_id, operation, snapshot, recorded_at, recorded_by)
select
    u.id,
    u.school_id,
    'insert',
    jsonb_build_object(
        'id', u.id,
        'school_id', u.school_id,
        'email', u.email,
        'full_name', u.full_name,
        'avatar_url', u.avatar_url,
        'bio', to_jsonb(u)->'bio',
        'username', u.username,
        'role', u.role,
        'is_anonymous', u.is_anonymous,
        'is_thuthimal', u.is_thuthimal,
        'thuthimal_gifter', u.thuthimal_gifter,
        'thuthimal_gifted_at', u.thuthimal_gifted_at,
        'subjects_taught', to_jsonb(u)->'subjects_taught',
        'qualifications', to_jsonb(u)->'qualifications',
        'experience_years', to_jsonb(u)->'experience_years',
        'updated_at', u.updated_at,
        'created_at', u.created_at
    ),
    coalesce(u.updated_at, u.created_at, now()),
    null
from public.users u
where not exists (
    select 1 from public.user_profile_versions upv where upv.user_id = u.id
);

insert into public.community_profile_versions (community_id, school_id, creator_id, operation, snapshot, recorded_at, recorded_by)
select
    g.id,
    g.school_id,
    g.created_by,
    'insert',
    jsonb_build_object(
        'id', g.id,
        'school_id', g.school_id,
        'name', g.name,
        'description', g.description,
        'is_public', to_jsonb(g)->'is_public',
        'member_count', to_jsonb(g)->'member_count',
        'created_by', g.created_by,
        'join_policy', to_jsonb(g)->'join_policy',
        'group_type', to_jsonb(g)->'group_type',
        'handle', to_jsonb(g)->'handle',
        'image_url', to_jsonb(g)->'image_url',
        'created_at', g.created_at
    ),
    coalesce(g.created_at, now()),
    null
from public.community_groups g
where not exists (
    select 1 from public.community_profile_versions cpv where cpv.community_id = g.id
);

create policy "Users can read own and elevated user profile history"
on public.user_profile_versions
for select
to authenticated
using (
    user_id = auth.uid()
    or exists (
        select 1
        from public.users viewer
        where viewer.id = auth.uid()
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

create policy "Users can read school-scoped community profile history"
on public.community_profile_versions
for select
to authenticated
using (
    creator_id = auth.uid()
    or exists (
        select 1
        from public.users viewer
        where viewer.id = auth.uid()
          and (
              viewer.school_id = community_profile_versions.school_id
              or coalesce(viewer.role, '') in (
                  'founder',
                  'developer',
                  'admin',
                  'principal',
                  'assistant_principal',
                  'assistantPrincipal'
              )
          )
    )
);
