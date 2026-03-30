-- Student longitudinal learning flow
-- Extends the shared temporal bedrock so assignment submissions and
-- student-owned study notes become first-class longitudinal records.

alter table public.student_longitudinal_events
    drop constraint if exists student_longitudinal_events_entity_type_check;

alter table public.student_longitudinal_events
    add constraint student_longitudinal_events_entity_type_check
    check (
        entity_type in (
            'enrollment',
            'attendance',
            'grade',
            'guardian_relationship',
            'observation',
            'submission',
            'study_note'
        )
    );

create or replace function public.capture_student_longitudinal_submission_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    target_record record;
    assignment_record record;
    classroom_record record;
    snapshot jsonb;
    occurred_value timestamptz;
begin
    target_record := case when tg_op = 'DELETE' then old else new end;
    snapshot := to_jsonb(target_record);

    select a.id, a.classroom_id, c.school_id
    into assignment_record
    from public.assignments a
    left join public.classrooms c on c.id = a.classroom_id
    where a.id = (snapshot ->> 'assignment_id')::uuid;

    occurred_value := coalesce(
        nullif(snapshot ->> 'submitted_at', '')::timestamptz,
        nullif(snapshot ->> 'graded_at', '')::timestamptz,
        now()
    );

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
    values (
        (snapshot ->> 'student_id')::uuid,
        assignment_record.school_id,
        assignment_record.classroom_id,
        'submission',
        (snapshot ->> 'id')::uuid,
        lower(tg_op),
        tg_table_name,
        snapshot,
        occurred_value,
        now(),
        occurred_value,
        case when tg_op = 'DELETE' then now() else null end,
        auth.uid()
    );

    return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function public.capture_student_longitudinal_study_note_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    target_record record;
    snapshot jsonb;
    operation_kind text;
    classroom_record record;
begin
    if tg_op = 'UPDATE' then
        if old.note_type = 'personal' and new.note_type <> 'personal' then
            target_record := old;
            operation_kind := 'delete';
        elsif old.note_type <> 'personal' and new.note_type = 'personal' then
            target_record := new;
            operation_kind := 'insert';
        elsif new.note_type = 'personal' then
            target_record := new;
            operation_kind := 'update';
        else
            return new;
        end if;
    elsif tg_op = 'DELETE' then
        if old.note_type <> 'personal' then
            return old;
        end if;
        target_record := old;
        operation_kind := 'delete';
    else
        if new.note_type <> 'personal' then
            return new;
        end if;
        target_record := new;
        operation_kind := 'insert';
    end if;

    snapshot := to_jsonb(target_record);

    select c.id, c.school_id
    into classroom_record
    from public.classrooms c
    where c.id = (snapshot ->> 'classroom_id')::uuid;

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
    values (
        (snapshot ->> 'author_id')::uuid,
        classroom_record.school_id,
        classroom_record.id,
        'study_note',
        (snapshot ->> 'id')::uuid,
        operation_kind,
        tg_table_name,
        snapshot,
        coalesce(nullif(snapshot ->> 'updated_at', '')::timestamptz, nullif(snapshot ->> 'created_at', '')::timestamptz, now()),
        now(),
        coalesce(nullif(snapshot ->> 'created_at', '')::timestamptz, now()),
        case when operation_kind = 'delete' then now() else null end,
        auth.uid()
    );

    return case when tg_op = 'DELETE' then old else new end;
end;
$$;

do $$
begin
    if to_regclass('public.submissions') is not null then
        execute 'drop trigger if exists trg_capture_student_longitudinal_submission on public.submissions';
        execute $trigger$
            create trigger trg_capture_student_longitudinal_submission
            after insert or update or delete on public.submissions
            for each row execute function public.capture_student_longitudinal_submission_event()
        $trigger$;
    end if;

    if to_regclass('public.classroom_notes') is not null then
        execute 'drop trigger if exists trg_capture_student_longitudinal_study_note on public.classroom_notes';
        execute $trigger$
            create trigger trg_capture_student_longitudinal_study_note
            after insert or update or delete on public.classroom_notes
            for each row execute function public.capture_student_longitudinal_study_note_event()
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
    s.student_id,
    c.school_id,
    a.classroom_id,
    'submission',
    s.id,
    'insert',
    'submissions',
    to_jsonb(s),
    coalesce(s.submitted_at, s.graded_at, now()),
    now(),
    coalesce(s.submitted_at, s.graded_at, now()),
    null,
    null
from public.submissions s
join public.assignments a on a.id = s.assignment_id
left join public.classrooms c on c.id = a.classroom_id
where not exists (
    select 1
    from public.student_longitudinal_events sle
    where sle.entity_type = 'submission'
      and sle.entity_id = s.id
);

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
    cn.author_id,
    c.school_id,
    cn.classroom_id,
    'study_note',
    cn.id,
    'insert',
    'classroom_notes',
    to_jsonb(cn),
    coalesce(cn.updated_at, cn.created_at, now()),
    now(),
    coalesce(cn.created_at, now()),
    null,
    null
from public.classroom_notes cn
left join public.classrooms c on c.id = cn.classroom_id
where cn.note_type = 'personal'
  and not exists (
      select 1
      from public.student_longitudinal_events sle
      where sle.entity_type = 'study_note'
        and sle.entity_id = cn.id
  );
