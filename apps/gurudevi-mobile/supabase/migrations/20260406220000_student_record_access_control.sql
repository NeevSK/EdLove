-- ============================================================
-- Student Record Access Control & Auditing
-- Implements a "Grant/Revoke" visibility model for cross-school
-- student records and an audit trail for all sensitive access.
-- Also defines the baseline for Student-Guardian relationships.
-- ============================================================

-- 0. Infrastructure
create schema if not exists audit;

-- 1. Student-Guardian Relationships (Foundation for the upcoming Guardian UI)
create table if not exists public.student_guardian_relationships (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.users(id) on delete cascade,
    guardian_id uuid not null references public.users(id) on delete cascade,
    relationship_type text check (relationship_type in ('parent', 'legal_guardian', 'other')) default 'parent' not null,
    created_at timestamptz not null default now(),
    unique (student_id, guardian_id)
);

alter table public.student_guardian_relationships enable row level security;

create policy "guardians_self_manage" 
on public.student_guardian_relationships for all 
using (auth.uid() = guardian_id);

create policy "students_see_guardians" 
on public.student_guardian_relationships for select 
using (auth.uid() = student_id);

-- 2. Access Grants Table
create table if not exists public.student_record_access_grants (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.users(id) on delete cascade,
    grantee_school_id uuid not null references public.schools(id) on delete cascade,
    granter_id uuid not null references public.users(id) on delete cascade,
    status text not null default 'pending' check (status in ('pending', 'granted', 'revoked', 'expired')),
    created_at timestamptz not null default now(),
    granted_at timestamptz null,
    revoked_at timestamptz null,
    expiry_at timestamptz null,
    unique (student_id, grantee_school_id)
);

-- 3. Access Logs Table
create table if not exists audit.student_record_access_logs (
    id uuid primary key default gen_random_uuid(),
    accessor_id uuid not null references public.users(id),
    student_id uuid not null references public.users(id),
    purpose text not null,
    accessed_at timestamptz not null default now()
);

-- 4. RLS for Grants Table
alter table public.student_record_access_grants enable row level security;

do $$
begin
    if exists (select 1 from pg_policies where policyname = 'manage_grants' and tablename = 'student_record_access_grants') then
        drop policy manage_grants on public.student_record_access_grants;
    end if;
end $$;

create policy "manage_grants"
on public.student_record_access_grants
for all
to authenticated
using (
    -- Original school's Principal/Admin
    exists (
        select 1 from public.users student
        where student.id = student_id
          and student.school_id = (select school_id from public.users where id = auth.uid())
          and (select role from public.users where id = auth.uid()) in ('principal', 'admin')
    )
    or
    -- Guardian
    exists (
        select 1 from public.student_guardian_relationships sgr
        where sgr.student_id = student_record_access_grants.student_id
          and sgr.guardian_id = auth.uid()
    )
    or
    -- Student themselves
    student_id = auth.uid()
);

-- 5. ACCESS GATEWAY (SECURITY DEFINER)
create or replace function public.get_student_longitudinal_history(
    target_student_id uuid,
    access_purpose text default 'Educational review for classroom support'
)
returns table (
    event_id uuid,
    student_id uuid,
    school_id uuid,
    grade_id uuid,
    classroom_id uuid,
    entity_type text,
    entity_id text,
    operation text,
    snapshot jsonb,
    occurred_at timestamptz,
    recorded_at timestamptz,
    effective_from timestamptz,
    effective_to timestamptz,
    recorded_by uuid
)
language plpgsql
security definer
set search_path = public, audit
as $$
declare
    current_accessor_id uuid := auth.uid();
    accessor_school_id uuid;
    is_authorized boolean := false;
begin
    -- Identify the Accessor
    select u.school_id into accessor_school_id 
    from public.users u 
    where u.id = current_accessor_id;

    -- Authorization Check
    if exists (
        select 1 from public.users s
        where s.id = target_student_id
          and s.school_id = accessor_school_id
          and (select role from public.users where id = current_accessor_id) in ('principal', 'admin', 'section_head', 'grade_head', 'teacher')
    ) then
        is_authorized := true;
    elsif exists (
        select 1 from public.student_guardian_relationships sgr
        where sgr.student_id = target_student_id
          and sgr.guardian_id = current_accessor_id
    ) then
        is_authorized := true;
    elsif target_student_id = current_accessor_id then
        is_authorized := true;
    elsif exists (
        select 1 from public.student_record_access_grants sag
        where sag.student_id = target_student_id
          and sag.grantee_school_id = accessor_school_id
          and sag.status = 'granted'
          and (sag.expiry_at is null or sag.expiry_at > now())
    ) then
        is_authorized := true;
    end if;

    if is_authorized then
        insert into audit.student_record_access_logs (accessor_id, student_id, purpose)
        values (current_accessor_id, target_student_id, access_purpose);

        return query
        select 
            sle.id, sle.student_id, sle.school_id, sle.grade_id, sle.classroom_id,
            sle.entity_type, sle.entity_id, sle.operation, sle.snapshot,
            sle.occurred_at, sle.recorded_at, sle.effective_from, sle.effective_to,
            sle.recorded_by
        from public.student_longitudinal_events sle
        where sle.student_id = target_student_id
        order by sle.occurred_at desc, sle.recorded_at desc;
    else
        raise exception 'Insufficient permissions to access Student Record. No active grant found for requested school.';
    end if;
end;
$$;

-- 6. TIGHTEN RLS on student_longitudinal_events
drop policy if exists "Student longitudinal self or elevated read" on public.student_longitudinal_events;

create policy "Student longitudinal self or elevated read"
on public.student_longitudinal_events
for select
to authenticated
using (
    student_id = auth.uid()
    or exists (
        select 1 from public.student_guardian_relationships sgr
        where sgr.student_id = student_longitudinal_events.student_id
          and sgr.guardian_id = auth.uid()
    )
    or
    exists (
        select 1
        from public.users viewer
        where viewer.id = auth.uid()
          and (
              viewer.school_id = student_longitudinal_events.school_id
              or
              exists (
                  select 1 from public.student_record_access_grants sag
                  where sag.student_id = student_longitudinal_events.student_id
                    and sag.grantee_school_id = viewer.school_id
                    and sag.status = 'granted'
                    and (sag.expiry_at is null or sag.expiry_at > now())
              )
          )
          and coalesce(viewer.role, '') in (
              'founder', 'developer', 'admin', 'principal', 
              'section_head', 'grade_head', 'teacher'
          )
    )
);

grant execute on function public.get_student_longitudinal_history(uuid, text) to authenticated;
