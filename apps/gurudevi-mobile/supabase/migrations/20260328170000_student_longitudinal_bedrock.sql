-- 1. Student Longitudinal Event Store
-- This table acts as a "Flight Recorder" for the student's entire journey across 13+ years.
-- In our multitenant architecture, we capture 'snapshot' states to preserve history
-- even if a student moves between schools (tenants) or grade levels.
create table if not exists public.student_longitudinal_events (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.users(id) on delete cascade,
    school_id uuid null,
    grade_id uuid null references public.grades(id) on delete set null, -- The "Higher Layer" (Year 1, 2, etc.)
    classroom_id uuid null references public.classrooms(id) on delete set null,
    entity_type text not null check (entity_type in (
        'enrollment',            -- Student joined/left a classroom
        'attendance',            -- Daily presence record
        'grade',                 -- Grade Level change (Promotion/School Change)
        'guardian_relationship', -- Change in care relationships
        'observation'            -- Qualitative teacher insights
    )),
    entity_id text not null,
    operation text not null check (operation in ('insert', 'update', 'delete')),
    source_table text not null,
    snapshot jsonb not null,
    occurred_at timestamptz not null,
    recorded_at timestamptz not null default now(),
    effective_from timestamptz null,
    effective_to timestamptz null,
    recorded_by uuid null references public.users(id) on delete set null
);

create index if not exists idx_student_longitudinal_events_student_occurred_at
    on public.student_longitudinal_events(student_id, occurred_at desc, recorded_at desc);

create index if not exists idx_student_longitudinal_events_school_entity
    on public.student_longitudinal_events(school_id, entity_type, occurred_at desc);

create index if not exists idx_student_longitudinal_events_classroom_occurred_at
    on public.student_longitudinal_events(classroom_id, occurred_at desc);

alter table public.student_longitudinal_events enable row level security;

-- 2. Generic Capture Function
-- Automatically captures snapshots and stamps them with the current context (School/Grade).
create or replace function public.capture_student_longitudinal_event_generic()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    target_record record;
    snapshot jsonb;
    entity_kind text := tg_argv[0];
    student_column text := tg_argv[1];
    classroom_column text := tg_argv[2];
    school_column text := tg_argv[3];
    occurred_column text := tg_argv[4];
    effective_from_column text := tg_argv[5];
    effective_to_column text := tg_argv[6];
    
    student_value uuid;
    classroom_value uuid;
    school_value uuid;
    grade_value uuid; -- Added to capture the "Higher Layer" level
    occurred_value timestamptz;
    effective_from_value timestamptz;
    effective_to_value timestamptz;
begin
    target_record := case when tg_op = 'DELETE' then old else new end;
    snapshot := to_jsonb(target_record);

    -- Identify the student
    if coalesce(student_column, '') = '' or coalesce(snapshot ->> student_column, '') = '' then
        -- For 'grade' events on public.users, the student is the ID of the record itself
        if tg_table_name = 'users' then
            student_value := (snapshot ->> 'id')::uuid;
        else
            return case when tg_op = 'DELETE' then old else new end;
        end if;
    else
        student_value := (snapshot ->> student_column)::uuid;
    end if;

    -- Extract / Lookup context (Classroom)
    if coalesce(classroom_column, '') <> '' and coalesce(snapshot ->> classroom_column, '') <> '' then
        classroom_value := (snapshot ->> classroom_column)::uuid;
    end if;

    -- Extract / Lookup context (School & Grade Level)
    -- We prefer values from the snapshot, but fallback to the student profile (users table)
    if coalesce(school_column, '') <> '' and coalesce(snapshot ->> school_column, '') <> '' then
        school_value := (snapshot ->> school_column)::uuid;
    end if;

    -- Crucial: Capture the "Grade Level" context from the user's current state if not specified
    select s.school_id, s.grade_id into school_value, grade_value
    from public.users s
    where s.id = student_value;

    -- Timing
    if coalesce(occurred_column, '') <> '' and coalesce(snapshot ->> occurred_column, '') <> '' then
        occurred_value := (snapshot ->> occurred_column)::timestamptz;
    else
        occurred_value := now();
    end if;

    if coalesce(effective_from_column, '') <> '' and coalesce(snapshot ->> effective_from_column, '') <> '' then
        effective_from_value := (snapshot ->> effective_from_column)::timestamptz;
    else
        effective_from_value := occurred_value;
    end if;

    if tg_op = 'DELETE' then
        effective_to_value := now();
    elsif coalesce(effective_to_column, '') <> '' and coalesce(snapshot ->> effective_to_column, '') <> '' then
        effective_to_value := (snapshot ->> effective_to_column)::timestamptz;
    else
        effective_to_value := null;
    end if;

    insert into public.student_longitudinal_events (
        student_id,
        school_id,
        grade_id,
        classroom_id,
        entity_type,
        entity_id,
        operation,
        source_table,
        snapshot,
        occurred_at,
        recorded_at,
        effective_from,
        effective_to,
        recorded_by
    )
    values (
        student_value,
        school_value,
        grade_value,
        classroom_value,
        entity_kind,
        case 
            when snapshot ? 'id' then snapshot ->> 'id'
            when tg_table_name = 'attendance' then 
                (snapshot ->> 'classroom_id') || '_' || (snapshot ->> 'student_id') || '_' || (snapshot ->> 'date')
            else md5(snapshot::text) -- Final fallback for tables without 'id'
        end,
        lower(tg_op),
        tg_table_name,
        snapshot,
        occurred_value,
        now(),
        effective_from_value,
        effective_to_value,
        auth.uid()
    );

    return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop policy if exists "Student longitudinal self or elevated read" on public.student_longitudinal_events;
create policy "Student longitudinal self or elevated read"
on public.student_longitudinal_events
for select
to authenticated
using (
    student_id = auth.uid()
    or exists (
        select 1
        from public.users viewer
        where viewer.id = auth.uid()
          and (
              viewer.school_id = student_longitudinal_events.school_id
              or viewer.id = student_longitudinal_events.recorded_by
          )
          and coalesce(viewer.role, '') in (
              'founder',
              'developer',
              'admin',
              'principal',
              'assistant_principal',
              'assistantPrincipal',
              'teacher',
              'section_head',
              'grade_head'
          )
    )
);

do $$
begin
    if to_regclass('public.classroom_students') is not null then
        execute 'drop trigger if exists trg_capture_student_longitudinal_enrollment on public.classroom_students';
        execute $trigger$
            create trigger trg_capture_student_longitudinal_enrollment
            after insert or update or delete on public.classroom_students
            for each row execute function public.capture_student_longitudinal_event_generic(
                'enrollment',
                'student_id',
                'classroom_id',
                '',
                'enrolled_at',
                'enrolled_at',
                'claimed_at'
            )
        $trigger$;
    end if;

    -- 3. Grade Level (The "Higher Layer")
    -- Track when a student moves to a new Grade Level (Promotion/School Change).
    -- This captures the longitudinal journey over 13+ years.
    if to_regclass('public.users') is not null then
        execute 'drop trigger if exists trg_capture_student_longitudinal_grade_level on public.users';
        execute $trigger$
            create trigger trg_capture_student_longitudinal_grade_level
            after insert or update of grade_id, school_id on public.users
            for each row 
            when (new.role = 'student')
            execute function public.capture_student_longitudinal_event_generic(
                'grade', -- entity_type 'grade' = Grade Level / Life Stage
                '',      -- student_column blank (uses record ID for users table)
                '',      -- classroom blank
                'school_id',
                'updated_at',
                'updated_at',
                ''
            )
        $trigger$;
    end if;

    if to_regclass('public.attendance') is not null then
        execute 'drop trigger if exists trg_capture_student_longitudinal_attendance on public.attendance';
        execute $trigger$
            create trigger trg_capture_student_longitudinal_attendance
            after insert or update or delete on public.attendance
            for each row execute function public.capture_student_longitudinal_event_generic(
                'attendance',
                'student_id',
                'classroom_id',
                '',
                'date',
                'date',
                ''
            )
        $trigger$;
    end if;

    if to_regclass('public.student_guardian_relationships') is not null then
        execute 'drop trigger if exists trg_capture_student_longitudinal_guardian_relationship on public.student_guardian_relationships';
        execute $trigger$
            create trigger trg_capture_student_longitudinal_guardian_relationship
            after insert or update or delete on public.student_guardian_relationships
            for each row execute function public.capture_student_longitudinal_event_generic(
                'guardian_relationship',
                'studentId',
                '',
                'schoolId',
                'effectiveDate',
                'effectiveDate',
                'terminationDate'
            )
        $trigger$;
    end if;

    if to_regclass('public.student_observations') is not null then
        execute 'drop trigger if exists trg_capture_student_longitudinal_observation on public.student_observations';
        execute $trigger$
            create trigger trg_capture_student_longitudinal_observation
            after insert or update or delete on public.student_observations
            for each row execute function public.capture_student_longitudinal_event_generic(
                'observation',
                'student_id',
                'classroom_id',
                '',
                'updated_at',
                'created_at',
                ''
            )
        $trigger$;
    end if;
end;
$$;

insert into public.student_longitudinal_events (
    student_id,
    school_id,
    classroom_id,
    entity_type,
    entity_id,
    operation,
    source_table,
    snapshot,
    occurred_at,
    recorded_at,
    effective_from,
    effective_to,
    recorded_by
)
select
    cs.student_id,
    c.school_id,
    cs.classroom_id,
    'enrollment',
    cs.id,
    'insert',
    'classroom_students',
    to_jsonb(cs),
    coalesce(cs.enrolled_at, now()),
    now(),
    coalesce(cs.enrolled_at, now()),
    cs.claimed_at,
    null
from public.classroom_students cs
join public.classrooms c on c.id = cs.classroom_id
where cs.student_id is not null
  and not exists (
      select 1
      from public.student_longitudinal_events sle
      where sle.entity_type = 'enrollment'
        and sle.entity_id = cs.id
  );

-- 5. Backfill Grade Level Context
-- Records the "Initial Point" for every student's current grade level journey.
insert into public.student_longitudinal_events (
    student_id,
    school_id,
    grade_id,
    entity_type,
    entity_id,
    operation,
    source_table,
    snapshot,
    occurred_at,
    recorded_at,
    effective_from,
    effective_to,
    recorded_by
)
select
    u.id,
    u.school_id,
    u.grade_id,
    'grade',
    u.grade_id::text,
    'insert',
    'users',
    to_jsonb(u),
    coalesce(u.updated_at, u.created_at, now()),
    now(),
    coalesce(u.created_at, u.updated_at, now()),
    null,
    null
from public.users u
where u.role = 'student'
  and u.grade_id is not null
  and not exists (
    select 1
    from public.student_longitudinal_events sle
    where sle.entity_type = 'grade'
      and sle.student_id = u.id
      and (sle.snapshot ->> 'grade_id')::uuid = u.grade_id
  );

do $$
begin
    if to_regclass('public.attendance') is not null then
        insert into public.student_longitudinal_events (
            student_id,
            school_id,
            classroom_id,
            entity_type,
            entity_id,
            operation,
            source_table,
            snapshot,
            occurred_at,
            recorded_at,
            effective_from,
            effective_to,
            recorded_by
        )
        select
            a.student_id,
            c.school_id,
            a.classroom_id,
            'attendance',
            a.classroom_id::text || '_' || a.student_id::text || '_' || a.date::text,
            'insert',
            'attendance',
            to_jsonb(a),
            a.date::timestamptz,
            now(),
            a.date::timestamptz,
            null,
            null
        from public.attendance a
        left join public.classrooms c on c.id = a.classroom_id
        where not exists (
            select 1
            from public.student_longitudinal_events sle
            where sle.entity_type = 'attendance'
              and sle.entity_id = a.classroom_id::text || '_' || a.student_id::text || '_' || a.date::text
        );
    end if;
end;
$$;
